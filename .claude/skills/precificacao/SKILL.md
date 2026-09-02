---
name: precificacao
description: Atualiza o Painel de Precificação (Administrativo/precificacao/index.html) com dados ao vivo do PriceLabs — posição de mercado, preço recomendado vs praticado, janelas de alta e ocupação vs mercado. Use quando o usuário disser "/precificacao", "atualiza a precificação", "puxa o PriceLabs", "como estão os preços", "quanto cobrar em [mês]", ou pedir análise de diária/ocupação dos imóveis.
---

# Atualizar o Painel de Precificação

Puxa os dados do PriceLabs via MCP, reescreve o bloco `DADOS` do painel e publica.

## Pré-requisitos

- MCP `claude.ai Pricelabs` conectado. Se não estiver, avisar que precisa autorizar em claude.ai → conectores e parar.
- O painel vive em `Administrativo/precificacao/index.html`. Só o bloco `const DADOS = {...}` muda; a estrutura e o CSS ficam.

## Passo 1 — Descobrir os imóveis

```
get_listings()
```

Retorna `listing_id` + `pms_name` de cada imóvel mapeado. **Sempre começar por aqui** — nunca chutar ID.

Se o número de imóveis for menor que a carteira real da Artezian, registrar isso no rodapé do painel (o texto já diz "hoje N, de uma carteira maior") e avisar o usuário de quantos estão de fora.

## Passo 2 — Para cada imóvel, puxar

| Chamada | O que alimenta no painel |
|---|---|
| `get_listing_health_and_recommendations` | flag de cor, texto do diagnóstico, tabela de ocupação vs mercado, datas bloqueadas, `bedroom_count` |
| `get_neighbourhood_data` | percentis P25/P50/P75/P90 por categoria, janelas de surge de preço e de ocupação |
| `get_listing_prices` (60 dias à frente) | série diária de recomendado (`price`) e praticado (`user_price`) |

Notas de campo:
- `bedroom_count` do health é a fonte da verdade pro campo `quartos` — a categoria "Studio" do neighbourhood pode ter amostra minúscula (n=3) e enganar. Comparar sempre contra a categoria que casa com o número de quartos.
- Em `get_listing_prices`: `price` = recomendado PriceLabs, `user_price` = praticado no calendário (`-1` significa sem preço, vira `null`), `uncustomized_price` = base antes de piso/teto. Se `price` ficar travado num valor constante enquanto `uncustomized_price` varia, é o **piso de preço** batendo — vale reportar.
- `booking_status`: `Booked*` → `"R"`, `Blocked` → `"B"`, vazio → `"L"`.
- Cada imóvel tem o **próprio bairro** no PriceLabs; os percentis diferem entre eles. Nunca misturar.

## Passo 3 — Montar o bloco DADOS

Formato (ver o arquivo atual como referência):

```js
{
  atualizado: "DD/MM/AAAA",           // hoje
  sync: "DD/MM/AAAA HH:MM",           // sync_start_date do health
  janela: "DD/MM a DD/MM/AAAA",       // range de get_listing_prices
  imoveis: [{
    id, nome, quartos,
    flag: "azul" | "vermelho",        // color do heading_section
    flagTitulo, flagTexto,
    bloqueios: { qtd, periodo },
    mercado: { categorias: [{ cat, n, p25, p50, p75, p90 }] },
    medias: { rec, praticado },       // média das séries, arredondada
    ocupacao: [{ mes, nossa, mercado, anoPassado, janela }],
    surges: [{ periodo, preco, ocup, ocasiao }],   // % como string com vírgula
    precos: [["MM-DD", rec, praticado|null, "L"|"R"|"B"], ...]
  }]
}
```

Traduzir as ocasiões pro contexto brasileiro (Réveillon, Carnaval, feriado de outubro) em vez de repetir as datas cruas.

## Passo 4 — Atualizar o alerta do topo

O bloco `.alert` é escrito à mão a cada rodada. Escolher **o achado mais caro do momento** — não repetir o anterior por inércia. Candidatos típicos:
- calendário bloqueado numa janela de surge
- preço médio abaixo do P25 do mercado
- piso de preço travando o algoritmo abaixo do mercado
- ocupação bem abaixo do mercado num mês com antecedência curta de reserva

Se nada relevante aparecer, remover o bloco `.alert` em vez de inventar urgência.

## Passo 5 — Validar antes de publicar

Obrigatório, nessa ordem:

```bash
# 1. sintaxe do JS
python -c "import io,re; s=io.open('Administrativo/precificacao/index.html',encoding='utf-8').read(); io.open('/tmp/c.js','w',encoding='utf-8').write(re.findall(r'<script>(.*?)</script>',s,re.S)[-1])"
node --check /tmp/c.js

# 2. médias conferem com as séries (recalcular e comparar com medias.rec / medias.praticado)
```

Se as médias divergirem do que está em `medias`, corrigir `medias` — não a série.

## Passo 6 — Commit e deploy

```bash
git add Administrativo/precificacao/index.html
git commit -m "Atualiza precificação com dados do PriceLabs (DD/MM)"
git push origin main
```

O push dispara `.github/workflows/deploy-precificacao.yml`.

> **Atenção:** esse workflow está quebrado desde junho de 2026 — usa os secrets `FTP_HOST`/`FTP_USER`/`FTP_PASS`, que não existem no repositório. Os outros deploys usam `72.60.153.200` + `u432659370` + `secrets.FTP_PASSWORD`. Enquanto não for alinhado, o commit entra mas **a página no ar não muda**. Avisar o usuário.

## Passo 7 — Reportar

Resumo curto no terminal com: o achado do alerta, quantos imóveis foram cobertos vs a carteira real, e qualquer imóvel com flag vermelha. Sem repetir a tabela inteira — ela está no painel.
