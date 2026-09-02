# MCP Server Tool — Handoff entre Agentes (Art Mendonça 2 → 3)

## O que é

Automação que encadeia os 2 Agentes de IA que hoje compõem o funil de locação por temporada. O
**Art Mendonça 2**, ao concluir a apresentação de unidades, invoca automaticamente o **Art
Mendonça 3** via bloco nativo **IA - Invocar Agente** do Datacrazy — sem depender do lead escrever
algo que "acorde" o próximo agente.

> **Histórico:** o funil tinha originalmente um terceiro agente, o Art Mendonça 1, dedicado só à
> coleta inicial de dados (check-in, check-out, hóspedes), que ao terminar invocava o Art Mendonça
> 2. **O Art Mendonça 1 foi removido do funil.** O Art Mendonça 2 assumiu a coleta de dados
> diretamente — ele chama `resumo_lead_site` (ver `mcp-resumo-lead-setup.md`) como primeira ação de
> toda conversa nova pra aproveitar dados que já vieram do site, e `salvar_dados_reserva` (ver
> `mcp-reserva-tool-setup.md`) quando precisa coletar/confirmar check-in, check-out e hóspedes
> durante a própria conversa. Não existe mais handoff nesse primeiro ponto — é o mesmo agente do
> início ao fim da apresentação de produtos.

---

## Os agentes atuais

| Agente | Função | Quando passa a bola |
|---|---|---|
| Art Mendonça 2 | Primeiro contato: chama `resumo_lead_site` no início; coleta/confirma check-in, check-out e hóspedes (via `salvar_dados_reserva`) quando não vêm prontos do site; apresenta pelo menos 3 unidades disponíveis e responde perguntas | Assim que tiver apresentado ≥3 unidades e coletado o feedback/preferência do lead |
| Art Mendonça 3 | Monta orçamento real usando 2 MCP tools (escopo futuro, não coberto aqui) | — (agente terminal por enquanto) |

---

## Bloco usado para o handoff

**IA - Invocar Agente** — ação nativa do Datacrazy que ativa um Agente de IA específico na
conversa do lead. É esse bloco que substitui o agente atual pelo próximo na cadeia.

Existe também um bloco **Ação Transferir conversa**, mas esse é pra transferência pra atendimento
humano — não usar aqui.

---

## Handoff — Agente 02 → Agente 03 (MCP Server Tool `unidades_apresentadas`)

### Passo 1 — Criar a automação

1. Automações → Nova automação
2. Adicionar gatilho → **MCP Server Tool**
3. Preencher:

| Campo | Valor |
|---|---|
| Nome da tool | `unidades_apresentadas` |
| Descrição da tool | `Chame assim que tiver apresentado pelo menos 3 unidades disponíveis ao lead e tiver coletado o feedback dele sobre qual(is) despertaram interesse. Isso inicia a etapa de orçamento.` |
| Parâmetro de sessão | **Lead** |

### Passo 2 — Parâmetros da tool

| Nome do parâmetro | Descrição | Tipo | Obrigatório |
|---|---|---|---|
| `unidades_apresentadas` | Lista das unidades apresentadas ao lead (mínimo 3) | Array | ✅ |
| `unidade_interesse` | Unidade(s) que o lead demonstrou mais interesse | String | ✅ |
| `observacoes` | Feedback adicional do lead sobre as unidades | String | ❌ |

### Passo 3 — Gravar nos campos adicionais

Pré-requisito: criar (se não existirem) os campos adicionais `Unidades Apresentadas` e `Unidade de
Interesse` em Configurações → Campos Adicionais.

Bloco `field-operation` com `set-field-operation`:

| Campo de destino | Valor |
|---|---|
| `Unidades Apresentadas` | `{unidades_apresentadas\|[Api-request-1]unidades_apresentadas}` |
| `Unidade de Interesse` | `{unidade_interesse\|[Api-request-1]unidade_interesse}` |

### Passo 4 — Rastreabilidade

`add-lead-comment-action`:

```
"[timestamp] Unidades apresentadas via MCP — apresentadas: {unidades_apresentadas}, interesse: {unidade_interesse}, obs: {observacoes}"
```

### Passo 5 — Invocar o Agente 03

| Bloco | Configuração |
|---|---|
| IA - Invocar Agente | Agente alvo: **Art Mendonça 3** |

### Passo 6 — Testar

Mesma lógica das outras tools MCP deste projeto: salvar sem ativar em produção, simular a chamada
com um lead de teste, conferir se os campos foram gravados e se o Agente 3 assume a conversa
corretamente. Só ativar depois de confirmar.

---

## Pendências a validar durante a configuração real

- Confirmar se o bloco **IA - Invocar Agente** herda automaticamente o lead/sessão do trigger MCP,
  ou se pede `leadId`/conversationId como parâmetro separado.
- Confirmar se, ao invocar o próximo agente, o agente anterior é desativado automaticamente da
  conversa (evitar os dois responderem em paralelo pro mesmo lead).
- Confirmar o formato aceito pro parâmetro `Array` (`unidades_apresentadas`) — JSON array, string
  separada por vírgula, etc.
- Confirmar que as automações de `salvar_dados_reserva` e `resumo_lead_site` (antes associadas/
  testadas pensando no Art Mendonça 1) estão de fato acessíveis e sendo chamadas pelo Art Mendonça
  2 agora que ele é quem inicia a conversa — se o Datacrazy associar tools MCP a um agente
  específico (e não à conta toda), pode ser necessário reapontar isso no editor.
- Agente 03 (orçamento com 2 MCP tools) é escopo futuro — não coberto neste documento.
