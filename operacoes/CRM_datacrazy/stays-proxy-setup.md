# Stays Proxy — Setup e Configuração no Datacrazy

## 1. Deploy do Google Apps Script

1. Acesse [script.google.com](https://script.google.com) → **Novo projeto**
2. Apague o código padrão e cole o conteúdo de `stays-proxy.gs`
3. Salve o projeto (ex.: "Stays Proxy Artezian")
4. Clique em **Implantar** → **Nova implantação**
   - Tipo: **App da Web**
   - Executar como: **Eu (minha conta Google)**
   - Quem tem acesso: **Qualquer pessoa**
5. Clique em **Implantar** → Copie a **URL do app da web**

A URL terá o formato:
```
https://script.google.com/macros/s/AKfycb.../exec
```

---

## 2. Endpoints disponíveis

Base: `{URL_DO_SCRIPT}?action=...`

### Calcular preço
```
GET ?action=preco&imovel=DS03J&checkin=2026-07-10&checkout=2026-07-14&hospedes=4
```
**Resposta:**
```json
{
  "disponivel": true,
  "imovel": "DS03J",
  "checkin": "2026-07-10",
  "checkout": "2026-07-14",
  "noites": 4,
  "hospedes": 4,
  "diaria": 450,
  "valor_hospedagem": 1800,
  "taxa_limpeza": 200,
  "total": 2000,
  "moeda": "BRL",
  "resumo": "R$450/noite · 4 noites · total R$2000"
}
```

### Verificar disponibilidade (resposta simplificada)
```
GET ?action=disponibilidade&imovel=DS03J&checkin=2026-07-10&checkout=2026-07-14&hospedes=2
```
**Resposta:**
```json
{
  "disponivel": true,
  "imovel": "DS03J",
  "checkin": "2026-07-10",
  "checkout": "2026-07-14",
  "noites": 4,
  "mensagem": "Disponível · R$450/noite · 4 noites · total R$2000"
}
```

### Listar imóveis disponíveis (com filtro por capacidade)
```
GET ?action=imoveis&hospedes=6
```
**Resposta:**
```json
{
  "total": 8,
  "imoveis": [
    {
      "id": "GF02J",
      "nome": "Casa do Tremura 012",
      "regiao": "Porto Seguro",
      "max_hospedes": 10,
      "quartos": 4,
      "link": "https://www.artezian.com.br/pt/apartment/GF02J"
    }
  ]
}
```

### Detalhe de um imóvel
```
GET ?action=imovel&imovel=GF02J
```

---

## 3. Configuração no Datacrazy

Na seção de **Ferramentas HTTP** (ou similar) da IA do Datacrazy, cadastrar as ferramentas:

### Ferramenta 1 — Calcular Preço / Verificar Disponibilidade
- **Nome:** `consultar_stays`
- **URL:** `{URL_DO_SCRIPT}`
- **Método:** GET
- **Parâmetros:**
  | Nome | Tipo | Descrição |
  |------|------|-----------|
  | `action` | string fixo | `preco` |
  | `imovel` | string | ID do imóvel (ex: DS03J) |
  | `checkin` | string | Data de entrada (YYYY-MM-DD) |
  | `checkout` | string | Data de saída (YYYY-MM-DD) |
  | `hospedes` | number | Número de hóspedes |

### Ferramenta 2 — Listar Imóveis
- **Nome:** `listar_imoveis_stays`
- **URL:** `{URL_DO_SCRIPT}`
- **Método:** GET
- **Parâmetros:**
  | Nome | Tipo | Descrição |
  |------|------|-----------|
  | `action` | string fixo | `imoveis` |
  | `hospedes` | number | Capacidade mínima desejada |

---

## 4. IDs dos imóveis (referência rápida)

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
| JR01J | VP-01 | — | — |
| JR03J | VP-03 | — | — |
| JR04J | VP-04 | — | — |
| JR05J | VP-05 | — | — |
| JR07J | VP-07 | — | — |
