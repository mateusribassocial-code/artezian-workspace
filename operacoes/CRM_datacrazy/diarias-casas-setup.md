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

Cadastrar na seção de Ferramentas HTTP:

### Ferramenta 1 — Diária de todas as casas no período
- **Nome:** `diarias_casas`
- **Método:** GET
- **URL:** `{URL_DO_SCRIPT}`
- **Params:** `action=diarias_periodo`, `checkin`, `checkout`, `hospedes`

### Ferramenta 2 — Diária de uma casa específica
- **Nome:** `diaria_casa_especifica`
- **Método:** GET
- **URL:** `{URL_DO_SCRIPT}`
- **Params:** `action=diaria_casa`, `casa`, `checkin`, `checkout`, `hospedes`

---

## Testado e validado (2026-07-14)

Deploy confirmado e os 3 endpoints testados direto na URL implantada — retornaram as 5 casas
corretas (nome, código, capacidade) e diárias batendo com a planilha, incluindo o aviso de
capacidade excedida.

Se a planilha for reestruturada (linhas/colunas movidas, aba adicional antes da atual), ajustar as
constantes `LINHA_DADOS_INICIO`, `COL_PRECO_INICIO` e `DATA_INICIO` no topo do `.gs`, e trocar
`getSheets()[0]` por `getSheetByName("nome da aba")` se deixar de ser a primeira aba.
