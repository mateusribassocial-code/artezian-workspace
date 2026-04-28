# Artezian Real Estate Atelie — Claude Code OS

## O que é esse workspace

Workspace de operações da Artezian. Aqui ficam as três linhas de negócio: venda de studios para investidores, gestão de locação por temporada e consultoria de CRM para equipes comerciais.

**Estrutura de pastas:**
- `_contexto/` — memória do sistema (não apagar)
- `investidores/` — leads, propostas de studios, simulações de ROI
- `locacao/` — imóveis cadastrados, atendimento, temporadas
- `consultoria/` — clientes de CRM, propostas, materiais de treinamento
- `conteudo/` — posts, carrosseis, roteiros, anúncios
- `operacoes/` — relatórios internos, análises, processos
- `operacoes/CRM_datacrazy/` — integração com o CRM Datacrazy (investidores e locação)
- `dados/` — arquivos para análise (CSV, PDF, planilhas)
- `tarefas.md` — lista de tarefas corrente
- `templates/skills/` — templates de skills prontos pra personalizar com /mapear
- `templates/ferramentas/catalogo.md` — APIs e ferramentas disponíveis pra usar em skills

## Sobre o negócio

Artezian Real Estate Atelie — operação imobiliária em Porto Seguro e região (Coroa Vermelha, Arraial D'Ajuda, Taperapuan).
Equipe: Mateus (responsável técnico) e João (criação de conteúdo, Superhost Airbnb, 95k seguidores).

## Três linhas de negócio

1. **Venda de studios** — para investidores de BH, ES e brasileiros nos EUA. Foco em ROI, renda passiva e gestão completa pela Artezian.
2. **Locação por temporada** — via site artezian.com.br e atendimento direto no WhatsApp. Alta demanda orgânica pelo Instagram (@ojoaomendonca).
3. **Consultoria de CRM** — implantação e treinamento comercial para equipes de empresas da região.

## Clientes e contexto

- Investidores: perfil financeiro, buscam retorno mensal e operação sem trabalho
- Hóspedes: demandam agilidade no atendimento via WhatsApp e Instagram
- Empresas (consultoria): PMEs da região buscando organizar processo comercial

## Tom de voz — duas linhas

**Linha 1 — Comunicação externa** (copies, anúncios, redes sociais, propostas de investimento):
Descontraída, direta, provocadora, focada em ROI. Estilo João Mendonça — fala como parceiro, não como vendedor. Usa gírias com moderação ("papo reto" apenas quando natural), emojis estratégicos. Nunca usa "cabeça de bagre".

**Linha 2 — Comunicação interna / consultoria** (relatórios, análises, planilhas, apresentações de CRM):
Consultiva, analítica, profissional. Organizada, com dados e raciocínio claro. Sem informalidade excessiva.

## Ferramentas conectadas

- [x] Datacrazy (CRM principal)
- [x] Stays (PMS — gestão de reservas, API aberta)
- [x] WhatsApp API Oficial
- [x] Meta Ads
- [x] Google Drive + Google Sheets
- [ ] Gmail MCP
- [ ] Google Calendar MCP
- [ ] Facebook Ads MCP
- [ ] N8N (automações)

---

## Contexto do negócio

No início de toda conversa, ler os seguintes arquivos (se existirem e estiverem configurados):

1. `_contexto/empresa.md` — quem é o usuário, o que faz, como funciona o negócio
2. `_contexto/preferencias.md` — tom de voz, estilo de escrita, o que evitar
3. `_contexto/estrategia.md` — foco atual, prioridades, o que pode esperar

Usar essas informações como base pra qualquer resposta ou decisão. Ao sugerir prioridades, formatos ou abordagens, considerar o foco atual descrito em `estrategia.md`.

Para qualquer tarefa visual (carrossel, proposta, slide, landing page), consultar `marca/design-guide.md` como referência de estilo.

Não é necessário listar o que foi lido nem confirmar a leitura. Apenas usar o contexto naturalmente.

---

## Fluxo de trabalho

Antes de executar qualquer tarefa, verificar se existe uma skill relevante em `.claude/skills/` ou `.claude/commands/`.
Se encontrar, seguir as instruções da skill.
Se não encontrar, executar a tarefa normalmente.

Ao concluir uma tarefa que não tinha skill mas parece repetível (o usuário provavelmente vai pedir de novo no futuro), perguntar:

> "Isso pode virar uma skill pra próxima vez. Quer que eu crie?"

Não perguntar pra tarefas pontuais ou perguntas simples. Só quando o padrão de repetição for claro.

---

## Aprender com correções

Quando o usuário corrigir algo, melhorar uma resposta ou dar uma instrução que parece permanente (frases como "na verdade é assim", "não faça mais isso", "prefiro assim", "sempre que...", "evita...", "da próxima vez..."), perguntar:

> "Quer que eu salve isso pra não precisar repetir?"

Se sim, identificar onde faz mais sentido salvar:

- **Sobre o negócio** → `_contexto/empresa.md`
- **Sobre preferências e estilo** → `_contexto/preferencias.md`
- **Sobre prioridades e foco atual** → `_contexto/estrategia.md`
- **Regra de comportamento nessa pasta** → `CLAUDE.md`

Salvar com uma linha nova clara, sem reformatar o arquivo inteiro. Confirmar o que foi salvo mostrando a linha adicionada.

---

## Manter contexto atualizado

Ao terminar uma tarefa que mudou algo relevante no projeto (novo cliente, nova skill, mudança de foco, novo processo, ferramenta instalada, estrutura de pastas alterada), perguntar:

> "Isso mudou algo no teu contexto. Quer que eu atualize os arquivos de memória?"

---

## Criação de skills

Quando o usuário pedir pra criar uma nova skill:

1. Verificar se existe um template relevante em `templates/skills/`
2. Perguntar: "Essa skill é específica pra esse projeto ou vai ser útil em qualquer projeto?"
   - Específica → `.claude/skills/nome-da-skill/SKILL.md`
   - Global → `~/.claude/skills/nome-da-skill/SKILL.md`
3. Ler `_contexto/empresa.md` e `_contexto/preferencias.md` pra calibrar ao contexto
4. Seguir o fluxo da skill-creator nativa do Claude Code
