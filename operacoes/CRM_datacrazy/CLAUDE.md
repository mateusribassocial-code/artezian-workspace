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
- `diarias-casas.gs` / `diarias-casas-setup.md` — Apps Script que calcula diária (média e total) das casas do catálogo (Tremura, Laureana, Moana, John, Euller) por período, lendo a planilha "Casas — Calendário de Diárias (numérico)" no Sheets (calendário contínuo por dia, sem casar mês/dia como no Vila do Mundaí)
- `mcp-reserva-tool-setup.md` — automação nativa do Datacrazy (trigger MCP Server Tool) que grava check-in, check-out e nº de hóspedes nos campos adicionais do lead

## Regras específicas
- Integrações com sistemas externos (Stays, Sheets) continuam via "Ferramenta HTTP" chamando um Web App do Google Apps Script (doGet com `action`, resposta JSON via `jsonOk`)
- Desde a atualização de 2026, o Datacrazy suporta MCP nativamente pelo trigger **MCP Server Tool**: o próprio Datacrazy age como servidor MCP (não precisa hospedar servidor externo). Um agente de IA chama a tool definida no trigger (nome, descrição, parâmetro de sessão — Conversa/Negócio/Lead — e parâmetros tipados: String/Number/Boolean/Date/Array/Object); o fluxo downstream trata os dados recebidos normalmente (field-operation, action etc). Ver `mcp-reserva-tool-setup.md` como referência de configuração.
- Apps Script aberto/vinculado à própria conta dona da planilha não precisa de Service Account — só usar `SpreadsheetApp.openById()`
