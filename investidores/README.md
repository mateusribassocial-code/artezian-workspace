# Investidores — Estrutura

Base de conhecimento da linha de negócio "venda de studios para investidores". Público: investidores de BH, ES e brasileiros nos EUA. Ver `_contexto/empresa.md` pra visão geral e `_contexto/preferencias.md` (Linha 1) pro tom de voz em propostas e copies.

## Estrutura

- `produto/` — ficha técnica dos empreendimentos à venda (specs, preço, ROI projetado, diferenciais). Fonte única de verdade pra qualquer proposta ou simulação.
- `leads/` — perfil individual de cada lead/investidor em negociação (um arquivo por lead).
- `propostas/` — propostas comerciais geradas, organizadas por lead ou por empreendimento.
- `simulacoes-roi/` — simulações de retorno enviadas a leads.
- `pipeline.md` — visão consolidada do funil de vendas.
- `chatbot/` — material de apoio para o futuro agente de qualificação de leads de investimento (ver `tarefas.md`).

## Fluxo sugerido

1. Produto novo entra → cria ficha em `produto/`
2. Lead chega → cria perfil em `leads/` a partir do template
3. Simulação de ROI → gera a partir do template em `simulacoes-roi/`, usando dados de `produto/`
4. Proposta formal → gera a partir do template em `propostas/`
5. Atualiza `pipeline.md` com status e temperatura do lead
