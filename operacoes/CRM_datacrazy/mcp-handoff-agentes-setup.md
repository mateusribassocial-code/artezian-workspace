# MCP Server Tool — Handoff entre Agentes (Art Mendonça 01 → 02 → 03)

## O que é

Cadeia de automações que encadeia os 3 Agentes de IA do funil de locação por temporada. Cada agente, ao concluir sua parte do atendimento, invoca automaticamente o próximo via o bloco nativo **IA - Invocar Agente** do Datacrazy — sem depender do lead escrever algo que "acorde" o próximo agente.

## Os 3 agentes

| Agente | Função | Quando passa a bola |
|---|---|---|
| Art Mendonça 1 | Primeiro atendimento — cumprimenta o lead, extrai check-in, check-out, nº de hóspedes | Assim que as 3 informações estiverem confirmadas |
| Art Mendonça 2 | Apresenta pelo menos 3 unidades disponíveis com base nos dados do Agente 1, responde perguntas | Assim que tiver apresentado ≥3 unidades e coletado o feedback/preferência do lead |
| Art Mendonça 3 | Monta orçamento real usando 2 MCP tools (escopo futuro, não coberto aqui) | — (agente terminal por enquanto) |

## Bloco usado para o handoff

**IA - Invocar Agente** — ação nativa do Datacrazy que ativa um Agente de IA específico na conversa do lead. É esse bloco que substitui o agente atual pelo próximo na cadeia.

Existe também um bloco **Ação Transferir conversa**, mas esse é pra transferência pra atendimento humano — não usar aqui.

---

## Handoff 1 — Agente 01 → Agente 02

Reaproveita a automação `salvar_dados_reserva` já documentada em `mcp-reserva-tool-setup.md`. O próprio ato de chamar essa tool já é o sinal de "Agente 1 terminou" (só é chamada quando check-in, check-out e hóspedes estão confirmados) — não precisa criar uma tool nova só pra avisar. Basta adicionar mais um passo ao final do fluxo existente.

### Passo novo — Invocar o Agente 02 (depois do Passo 4 — rastreabilidade, do documento original)

Depois do bloco `add-lead-comment-action`, adicionar:

| Bloco | Configuração |
|---|---|
| IA - Invocar Agente | Agente alvo: **Art Mendonça 2** |

O trigger já usa parâmetro de sessão **Lead**, então o bloco de invocação deve herdar o mesmo lead/conversa automaticamente — confirmar isso no teste (ver Pendências).

---

## Handoff 2 — Agente 02 → Agente 03 (nova MCP Server Tool)

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

Pré-requisito: criar (se não existirem) os campos adicionais `Unidades Apresentadas` e `Unidade de Interesse` em Configurações → Campos Adicionais.

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

Mesma lógica do `salvar_dados_reserva`: salvar sem ativar em produção, simular a chamada com um lead de teste, conferir se os campos foram gravados e se o Agente 3 assume a conversa corretamente. Só ativar depois de confirmar.

---

## Pendências a validar durante a configuração real

- Confirmar se o bloco **IA - Invocar Agente** herda automaticamente o lead/sessão do trigger MCP, ou se pede `leadId`/conversationId como parâmetro separado.
- Confirmar se, ao invocar o próximo agente, o agente anterior é desativado automaticamente da conversa (evitar os dois responderem em paralelo pro mesmo lead).
- Confirmar o formato aceito pro parâmetro `Array` (`unidades_apresentadas`) — JSON array, string separada por vírgula, etc.
- Agente 03 (orçamento com 2 MCP tools) é escopo futuro — não coberto neste documento.
