# Diárias das Casas — Setup e Referência

## O que é

Google Apps Script que calcula a diária (média e total) das casas do catálogo — Tremura, Laureana,
Moana, John e Euller — num período de check-in/check-out, lendo direto a planilha
"Casas — Calendário de Diárias (numérico)" no Google Sheets.
Não depende de credencial/Service Account do Google — o Apps Script acessa a planilha
nativamente porque roda sob a conta dona do arquivo.

Planilha fonte: [Casas — Calendário de Diárias](https://docs.google.com/spreadsheets/d/1DkfupmGIU3bN5iHa2Ig1xzMo4L6OfbiI7k_MBpmJRxk/edit)
— uma linha por casa, com nome+código na coluna A, capacidade máxima na coluna B, e o preço de
cada dia específico do calendário (01/07/2026 a 04/01/2028, sem lacunas) nas colunas seguintes.

Diferente do `diarias-vila-mundai.gs` (mês/dia sem ano, casado por padrão), aqui a data é
resolvida direto por diferença de dias a partir da primeira coluna de preço — funciona porque o
calendário da planilha é contínuo (sem lacunas de dias) e cobre datas reais com ano.

---

## Deploy

1. Acessa [script.google.com](https://script.google.com) → Novo projeto
2. Renomeia o projeto pra algo como "Diárias Casas Artezian"
3. Cola o conteúdo de `diarias-casas.gs`
4. Salva (Ctrl+S)
5. **Implantar → Nova implantação → tipo: Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copia a URL gerada (termina em `/exec`) — essa é a `{URL_DO_SCRIPT}` usada abaixo

Se editar o código depois, usa **Implantar → Gerenciar implantações → editar → Nova versão → Implantar**
(senão a URL antiga continua servindo a versão velha).

URL implantada (`{URL_DO_SCRIPT}` nos exemplos abaixo):
```
https://script.google.com/macros/s/AKfycbzVrdsitqZ2B527x9_L0GSOluyb1EICDwpXQZe2Kx2XEasMENAg3M5cyRx7FxoeknYv/exec
```

---

## Endpoints disponíveis

### 1. Diária de todas as casas num período (recomendado — uma chamada só)
```
GET ?action=diarias_periodo&checkin=2026-09-10&checkout=2026-09-14
GET ?action=diarias_periodo&checkin=2026-09-10&checkout=2026-09-14&hospedes=20
```
Retorna a diária média e total de cada casa do catálogo pro período, ordenado da mais barata
pra mais cara — sem o agente precisar saber o código de cada uma.

**Resposta:**
```json
{
  "checkin": "2026-09-10",
  "checkout": "2026-09-14",
  "total_casas": 5,
  "casas": [
    {
      "nome": "Casa da Moana",
      "codigo": "GF06J",
      "max_hospedes": 16,
      "noites": 4,
      "valor_medio_diaria": 1500,
      "valor_total_estimado": 6000,
      "resumo": "R$1500/noite (média) · 4 noite(s) · total estimado R$6000"
    }
  ]
}
```

---

### 2. Diária de UMA casa específica
```
GET ?action=diaria_casa&casa=GF02J&checkin=2026-09-10&checkout=2026-09-14
GET ?action=diaria_casa&casa=Tremura&checkin=2026-09-10&checkout=2026-09-14&hospedes=25
```

**Parâmetros:**
| Param | Valores | Obrigatório |
|-------|---------|--------------|
| `casa` | código (ex: `GF02J`) ou parte do nome (ex: `Tremura`) | sim |
| `checkin` | AAAA-MM-DD | sim |
| `checkout` | AAAA-MM-DD | sim |
| `hospedes` | número de pessoas | não |

---

### 3. Listar casas do catálogo (código + capacidade)
```
GET ?action=listar_casas
```

---

## Regras de cálculo

- A média é calculada dia a dia dentro do período (checkout não conta como noite).
- Se `hospedes` for informado e exceder a capacidade máxima da casa, a resposta inclui
  `capacidade_excedida: true` e um `aviso_capacidade`.
- O preço é fixo por casa/dia (aluguel da casa inteira) — não varia por número de hóspedes.
- Datas fora do calendário cadastrado (antes de 01/07/2026 ou depois do fim da planilha) ou sem
  tarifa lançada entram em `dias_sem_preco` com um `aviso`, e são excluídas da média.
- Casas identificadas: Tremura (GF02J), Laureana (GF04J), Moana (GF06J), John (GG08J), Euller (GG06J).

---

## Configuração no Datacrazy

Essa versão do Datacrazy não tem mais uma seção separada de "Ferramenta HTTP" pro agente de IA —
tools chamáveis pela IA só se criam via automação com o trigger **MCP Server Tool**. O padrão
usado (validado na automação já em produção "MCP1-Stays"): trigger MCP → bloco de requisição HTTP
→ bloco JavaScript formata o texto de resposta → bloco de Mensagem envia direto pro WhatsApp do
lead. Não existe um "retorno" estruturado pro agente que chamou — a automação responde a
conversa diretamente.

### Automação 1 — Diária de todas as casas no período

**Trigger → MCP Server Tool**
| Campo | Valor |
|-------|-------|
| Nome da tool | `diarias_casas` |
| Descrição da tool | `Consulta a diária média e o total de todas as casas do catálogo (Tremura, Laureana, Moana, John, Euller) num período de check-in/check-out. Chame quando o hóspede perguntar preço de casa sem especificar qual, ou pedir opções.` |
| Parâmetro de sessão | Lead (ou o mesmo usado na automação de reserva, pra identificar o WhatsApp de destino) |

**Parâmetros da tool:**
| Nome | Descrição | Tipo | Obrigatório |
|------|-----------|------|-------------|
| `checkin` | Data de check-in desejada pelo hóspede | Date | ✅ |
| `checkout` | Data de check-out desejada pelo hóspede | Date | ✅ |
| `hospedes` | Quantidade total de hóspedes, se o hóspede informar | Number | não |

**Bloco HTTP Request** (depois do trigger):
```
GET https://script.google.com/macros/s/AKfycbzVrdsitqZ2B527x9_L0GSOluyb1EICDwpXQZe2Kx2XEasMENAg3M5cyRx7FxoeknYv/exec?action=diarias_periodo&checkin={checkin|[Api-request-1]checkin}&checkout={checkout|[Api-request-1]checkout}&hospedes={hospedes|[Api-request-1]hospedes}
```

**Bloco JavaScript** (formata a resposta — ajustar o nome da variável de entrada pro nome real
que o bloco HTTP expuser no editor, ex: `[Api-request-2]body` ou similar):
```js
const resposta = JSON.parse(corpoDaRequisicaoHttp); // trocar pela referência real do bloco HTTP

let resposta_casas;
if (resposta.erro) {
  resposta_casas = "Não consegui consultar a diária agora, pode tentar de novo?";
} else {
  const disponiveis = resposta.casas.filter(c => !c.erro);
  const linhas = disponiveis.map(c =>
    `🏠 *${c.nome}* (até ${c.max_hospedes} pessoas)\nR$${c.valor_medio_diaria}/noite · ${c.noites} noites · total R$${c.valor_total_estimado}`
  ).join("\n\n");
  resposta_casas = `Diária das casas de ${resposta.checkin} a ${resposta.checkout}:\n\n${linhas}`;
}

return { resposta_casas };
```

**Bloco Mensagem → Mensagem de texto**: usar a variável `{resposta_casas}` como conteúdo.

### Automação 2 — Diária de uma casa específica

Mesmo padrão da Automação 1, com estas diferenças:

**Trigger → MCP Server Tool**
| Campo | Valor |
|-------|-------|
| Nome da tool | `diaria_casa_especifica` |
| Descrição da tool | `Consulta a diária média e o total de UMA casa específica do catálogo num período. Chame quando o hóspede mencionar uma casa por nome ou código.` |

**Parâmetros:** os mesmos de cima, mais `casa` (String, obrigatório — "Nome ou código da casa que o hóspede quer consultar, ex: Tremura ou GF02J").

**HTTP Request:** troca `action=diarias_periodo` por `action=diaria_casa&casa={casa|[Api-request-1]casa}`.

**JavaScript:**
```js
const resposta = JSON.parse(corpoDaRequisicaoHttp); // trocar pela referência real do bloco HTTP

let resposta_casas;
if (resposta.erro) {
  resposta_casas = resposta.erro + (resposta.casas_disponiveis ? "\nCasas do catálogo: " + resposta.casas_disponiveis.join(", ") : "");
} else {
  resposta_casas = `🏠 *${resposta.nome}* (até ${resposta.max_hospedes} pessoas)\n${resposta.resumo}`;
  if (resposta.aviso_capacidade) resposta_casas += `\n\n⚠️ ${resposta.aviso_capacidade}`;
}

return { resposta_casas };
```

> **Pendência a validar no editor:** confirmar (a) o nome exato da variável de saída do bloco
> HTTP Request pra referenciar no JavaScript, e (b) se o `JSON.parse` é necessário ou se o bloco
> HTTP já entrega objeto parseado.

---

## Testado e validado (2026-07-14)

Deploy confirmado e os 3 endpoints testados direto na URL implantada — retornaram as 5 casas
corretas (nome, código, capacidade) e diárias batendo com a planilha, incluindo o aviso de
capacidade excedida.

Se a planilha for reestruturada (linhas/colunas movidas, aba adicional antes da atual), ajustar as
constantes `LINHA_DADOS_INICIO`, `COL_PRECO_INICIO` e `DATA_INICIO` no topo do `.gs`, e trocar
`getSheets()[0]` por `getSheetByName("nome da aba")` se deixar de ser a primeira aba.
