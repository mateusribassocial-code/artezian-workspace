# Stays Proxy — Setup e Referência

## O que é

Google Apps Script que serve como proxy entre a IA do Datacrazy e a API do Stays.
A API externa v1 do Stays é **somente leitura** — alteração de tarifas e taxas só pelo painel `artezian.stays.net`.

---

## Deploy

1. Acessa [script.google.com](https://script.google.com) → abre o projeto "Stays Proxy Artezian"
2. Cola o conteúdo de `stays-proxy.gs` (substitui tudo)
3. Salva (Ctrl+S)
4. **Implantar → Gerenciar implantações → edita → Nova versão → Implantar**

URL base:
```
https://script.google.com/macros/s/AKfycbwEwufr9vrzGXYt4GTs1cY317F49v2yvXDerRmjQhqRRIc27d5AgXpFkdmefUAYK-r4Qw/exec
```

---

## O que a API do Stays suporta

| Categoria | Suporte |
|-----------|---------|
| Listar imóveis | ✅ |
| Detalhe de imóvel | ✅ |
| Calcular preço / disponibilidade | ✅ |
| Listar reservas por período | ✅ |
| Detalhe de reserva (hóspedes, valores, taxas) | ✅ |
| Mapa de ocupação | ✅ (construído via reservas) |
| Resumo financeiro | ✅ (construído via reservas) |
| Alterar tarifas / diárias | ❌ (só pelo painel) |
| Remover taxa de limpeza | ❌ (só pelo painel) |
| Calendário de disponibilidade isolado | ❌ endpoint não existe |
| Avaliações / reviews | ❌ endpoint não existe |

---

## Endpoints disponíveis

### 1. Calcular preço e disponibilidade
```
GET ?action=preco&imovel=DS03J&checkin=2026-09-10&checkout=2026-09-14&hospedes=2
```
**Resposta:**
```json
{
  "disponivel": true,
  "imovel": "DS03J",
  "checkin": "2026-09-10",
  "checkout": "2026-09-14",
  "noites": 4,
  "diaria": 250,
  "valor_hospedagem": 1000,
  "taxa_limpeza": 0,
  "total": 1000,
  "taxas": [],
  "resumo": "R$250/noite · 4 noites · total R$1000"
}
```

---

### 2. Verificar disponibilidade (resposta simplificada)
```
GET ?action=disponibilidade&imovel=DS03J&checkin=2026-09-10&checkout=2026-09-14
```

---

### 3. Listar imóveis ativos
```
GET ?action=imoveis
GET ?action=imoveis&hospedes=6
```
Retorna: id, nome, região, capacidade, quartos, camas, banheiros, área, link.

---

### 4. Detalhe de imóvel
```
GET ?action=imovel&imovel=GF02J
```
Retorna: todos os dados do imóvel — título em PT e EN, tipo, subtipo, endereço, capacidade, descrição, foto.

---

### 5. Listar reservas por período
```
GET ?action=reservas&from=2026-07-01&to=2026-07-31
GET ?action=reservas&from=2026-07-01&to=2026-07-31&tipo_data=departure
GET ?action=reservas&from=2026-07-01&to=2026-07-31&imovel=DS03J
GET ?action=reservas&from=2026-07-01&to=2026-07-31&status=booked
```

**Parâmetros:**
| Param | Valores | Default |
|-------|---------|---------|
| `from` | YYYY-MM-DD | obrigatório |
| `to` | YYYY-MM-DD | obrigatório |
| `tipo_data` | `arrival` · `departure` · `creation` · `included` | `arrival` |
| `imovel` | ID do imóvel | todos |
| `status` | `booked` · `reserved` | todos |

**Resposta por reserva:** id, checkin, checkout, noites, hóspedes, total, total pago, taxa limpeza, status, data criação.

---

### 6. Detalhe de uma reserva
```
GET ?action=reserva&id=6a3bc959fd6c75dc2e7d09ad
```
Usa o `_id` (hex) retornado em `reservas`. Retorna todos os dados: hóspedes com nomes, valores detalhados, taxas com IDs, horários de check-in/out.

---

### 7. Mapa de ocupação do período
```
GET ?action=ocupacao&from=2026-07-01&to=2026-07-31
```
Retorna quais imóveis têm reservas no período, agrupados por imóvel. Útil para visão geral da operação.

---

### 8. Resumo financeiro do período
```
GET ?action=financeiro&from=2026-07-01&to=2026-07-31
GET ?action=financeiro&from=2026-07-01&to=2026-07-31&tipo_data=arrival
```
**Resposta:**
```json
{
  "periodo": "2026-07-01 → 2026-07-31",
  "total_reservas": 12,
  "receita_total": 48500,
  "recebido_total": 22000,
  "a_receber": 26500,
  "taxa_limpeza_total": 1800,
  "receita_hospedagem": 46700,
  "por_imovel": [
    { "nome": "Casa do Tremura 012", "reservas": 2, "receita": 9600, "recebido": 4800 }
  ]
}
```

---

### 9. Lista de hóspedes com check-in no período
```
GET ?action=hospedes&from=2026-07-01&to=2026-07-31
```
Retorna: nome do titular, imóvel, datas, total de hóspedes, link da reserva. Ordenado por data de check-in.

---

## IDs dos imóveis (referência)

| ID | Nome | Região | Max |
|----|------|--------|-----|
| DS03J | Studio do João 001 | Taperapuã | 5 |
| DS04J | Flat da Mari 002 | Taperapuã | 5 |
| DS05J | Apartamento do Emanoel 005 | Taperapuã | 5 |
| DS06J | Apto da Isa 004 | Taperapuã | 5 |
| FL10J | Apto do Reinaldo MI 006 | Taperapuã | — |
| GC01J | Apartamento do Reinaldo JI 007 | Arraial D'Ajuda | — |
| GF02J | Casa do Tremura 012 | Porto Seguro | — |
| GF04J | Casa Laureana 009 | Porto Seguro | — |
| GF06J | Casa da Moana 011 | Porto Seguro | — |
| GG06J | Casa do Euller #013 | Porto Seguro | — |
| GG08J | Casa do John 014 | Porto Seguro | — |
| HA02J | Apto da Jessilene | Arraial D'Ajuda | — |
| HA03J | Flat da Joyce | Taperapuã | — |
| JR01J | VP-01 | Varandas de Porto | — |
| JR03J | VP-03 | Varandas de Porto | — |
| JR04J | VP-04 | Varandas de Porto | — |
| JR05J | VP-05 | Varandas de Porto | — |
| JR07J | VP-07 | Varandas de Porto | — |

---

## Configuração no Datacrazy

Cadastrar na seção de Ferramentas HTTP:

### Ferramenta 1 — Consultar preço / disponibilidade
- **Nome:** `consultar_stays`
- **Método:** GET
- **URL:** `{URL_DO_SCRIPT}`
- **Params:** `action=preco`, `imovel`, `checkin`, `checkout`, `hospedes`

### Ferramenta 2 — Listar imóveis disponíveis
- **Nome:** `listar_imoveis_stays`
- **Método:** GET
- **URL:** `{URL_DO_SCRIPT}`
- **Params:** `action=imoveis`, `hospedes`

### Ferramenta 3 — Reservas do período
- **Nome:** `reservas_stays`
- **Método:** GET
- **URL:** `{URL_DO_SCRIPT}`
- **Params:** `action=reservas`, `from`, `to`, `tipo_data`, `imovel`, `status`

### Ferramenta 4 — Financeiro do período
- **Nome:** `financeiro_stays`
- **Método:** GET
- **URL:** `{URL_DO_SCRIPT}`
- **Params:** `action=financeiro`, `from`, `to`

### Ferramenta 5 — Hóspedes com check-in
- **Nome:** `hospedes_stays`
- **Método:** GET
- **URL:** `{URL_DO_SCRIPT}`
- **Params:** `action=hospedes`, `from`, `to`
