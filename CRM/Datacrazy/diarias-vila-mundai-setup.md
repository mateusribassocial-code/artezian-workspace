# Diárias Vila do Mundaí — Setup e Referência

## O que é

Google Apps Script que calcula a diária média por quantidade de hóspedes, num período de
check-in/check-out, lendo direto a planilha "Diárias_Vila do Mundaí" no Google Sheets.
Não depende de credencial/Service Account do Google — o Apps Script acessa a planilha
nativamente porque roda sob a conta dona do arquivo.

Usado pelo agente de WhatsApp (Max-Vila Mundaí) pra responder perguntas de preço.

Planilha fonte: [Diárias_Vila do Mundaí](https://docs.google.com/spreadsheets/d/193zIatG_duMz2R-tsZhl8907XLRLLs10UM0-wUX43YY/edit)
(tabelas "Apartamentos 01 Quarto" e "Apartamentos 02 Quartos" empilhadas na aba "Página1").

---

## Deploy

1. Acessa [script.google.com](https://script.google.com) → Novo projeto
2. Renomeia o projeto pra algo como "Diárias Vila do Mundaí"
3. Cola o conteúdo de `diarias-vila-mundai.gs`
4. Salva (Ctrl+S)
5. **Implantar → Nova implantação → tipo: Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copia a URL gerada (termina em `/exec`) — essa é a `{URL_DO_SCRIPT}` usada abaixo

Se editar o código depois, usa **Implantar → Gerenciar implantações → editar → Nova versão → Implantar**
(senão a URL antiga continua servindo a versão velha).

---

## Endpoint disponível

### Diária média por período e número de hóspedes

```
GET ?action=diaria_media&tipo=1quarto&hospedes=4&checkin=2026-07-10&checkout=2026-07-15
```

**Parâmetros:**
| Param | Valores | Obrigatório |
|-------|---------|--------------|
| `tipo` | `1quarto` · `2quartos` | sim |
| `hospedes` | número de pessoas | sim |
| `checkin` | AAAA-MM-DD | sim |
| `checkout` | AAAA-MM-DD | sim |

**Resposta:**
```json
{
  "tipo": "1quarto",
  "hospedes_solicitados": 4,
  "faixa_aplicada": "4 Pessoas",
  "checkin": "2026-07-10",
  "checkout": "2026-07-15",
  "noites": 5,
  "valor_medio_diaria": 280,
  "valor_total_estimado": 1400,
  "resumo": "R$280/noite (média) · 5 noite(s) · total estimado R$1400"
}
```

**Regras de cálculo:**
- A média é calculada noite a noite dentro do período (checkout não conta como noite).
- Se `hospedes` não bate exatamente com nenhuma faixa cadastrada, usa a próxima faixa
  acima (ex.: 3 pessoas num imóvel de 2 quartos, que começa em "4 Pessoas", usa "4 Pessoas").
  Se exceder a maior faixa, usa a maior disponível.
- A planilha cobre Junho a Dezembro (sem ano) — datas são casadas só por mês/dia.
- Noites sem tarifa cadastrada (ex.: "5 Pessoas" em Junho no 1 Quarto) são excluídas da
  média e relatadas em `dias_sem_preco` com um `aviso`.

---

## Configuração no Datacrazy

Cadastrar na seção de Ferramentas HTTP:

### Ferramenta — Diária média Vila do Mundaí
- **Nome:** `diaria_media_vila_mundai`
- **Método:** GET
- **URL:** `{URL_DO_SCRIPT}`
- **Params:** `action=diaria_media`, `tipo`, `hospedes`, `checkin`, `checkout`
