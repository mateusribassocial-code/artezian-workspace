# CRM Datacrazy — Integração

## O que é
Pasta de trabalho para a integração com o CRM Datacrazy, cobrindo os setores de investimento e locação por temporada.

## Tipo
Interno — integração de ferramenta

## Escopo
- Conexão com a API do Datacrazy
- Mapeamento dos setores: investidores e locação
- Automações e consultas via CRM

## Contexto
CRM principal da Artezian. Usado pra gestão de leads de investimento e atendimento de locação.

## Arquivos importantes
- `stays-proxy.gs` / `stays-proxy-setup.md` — Apps Script proxy entre Datacrazy e a API do Stays (preço, disponibilidade, reservas, financeiro)
- `midia-sheets.gs` — Apps Script que retorna links de mídia (Instagram, YouTube, fotos) por código do imóvel
- `diarias-vila-mundai.gs` / `diarias-vila-mundai-setup.md` — Apps Script que calcula diária média por nº de hóspedes e período, lendo a planilha "Diárias_Vila do Mundaí" no Sheets

## Regras específicas
- Datacrazy não suporta MCP — toda integração é via "Ferramenta HTTP" chamando um Web App do Google Apps Script (doGet com `action`, resposta JSON via `jsonOk`)
- Apps Script aberto/vinculado à própria conta dona da planilha não precisa de Service Account — só usar `SpreadsheetApp.openById()`
