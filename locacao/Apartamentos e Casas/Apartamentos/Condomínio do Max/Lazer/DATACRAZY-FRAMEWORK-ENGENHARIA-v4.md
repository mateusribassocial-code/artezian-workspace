# ⚙️ DATACRAZY AUTOMATION FRAMEWORK
## Base de Engenharia Universal — Arquiteto de Automações
> **Versão 4.0** — Baseada em engenharia reversa de 12 fluxos reais de produção  
> AD PRO Marketing & Automações — Fevereiro 2026  
> **Novidades v4.0:** Sistema de layout com grade obrigatória · Guia completo de importação e configuração · Ajustes de lógica estrutural

---

# ÍNDICE

| Parte | Conteúdo |
|-------|----------|
| [I](#parte-i) | Anatomia Completa da Plataforma |
| [II](#parte-ii) | Arquitetura Universal de Fluxos |
| [III](#parte-iii) | Módulos Reutilizáveis — 18 Padrões |
| [IV](#parte-iv) | Gerenciamento de Estado e Resiliência |
| [V](#parte-v) | Observabilidade e Debug |
| [VI](#parte-vi) | **GUIA DE IMPORTAÇÃO E CONFIGURAÇÃO** ← NOVO |
| [VII](#parte-vii) | Templates JSON Universais |
| [VIII](#parte-viii) | Referência Rápida |

---

# PARTE I — ANATOMIA COMPLETA DA PLATAFORMA

## 1.1 TODOS OS TIPOS DE BLOCO (11 confirmados)

| Tipo | Categoria | Propósito |
|------|-----------|-----------| 
| `trigger` | Entrada | Dispara o fluxo |
| `condition` | Lógica | Bifurcação TRUE/FALSE |
| `action` | CRM | Mutações no CRM |
| `chat` | Mensageria | Envia/recebe mensagens |
| `field-operation` | Dados | Lê/escreve campos |
| `delay` | Tempo | Pausa temporal |
| `randomizer` | Distribuição | Split probabilístico |
| `api` | HTTP | Integração externa |
| `ai` | Inteligência | IA nativa |
| `javascript` | Computação | Lógica customizada com acesso à sessão |
| *(implicit)* | Terminação | `nextBlockId: ""` = fim do fluxo |

---

## 1.2 CATÁLOGO COMPLETO DE TRIGGERS (21 confirmados)

### GRUPO: `messages`
```
message-received-trigger     → Mensagem recebida do lead
message-sended-trigger       → Mensagem enviada pelo atendente/bot
thread-finished-trigger      → Atendimento encerrado
thread-initialized-trigger   → Atendimento iniciado
department-changed-trigger   → Departamento alterado
```

**Opções críticas de `message-received-trigger` / `message-sended-trigger`:**
```json
{
  "type": "contains",
  "keywords": [],
  "instanceId": "ID_INSTANCIA",
  "listenGroup": false,
  "receiveJson": true,
  "datasourceName": "Message-1",
  "datasourceColor": "#3b82f6",
  "initializeSession": "only-if-finished-service"
}
```

**Valores de `initializeSession`:**
| Valor | Comportamento | Quando usar |
|-------|--------------|-------------|
| `"only-if-finished-service"` | Só se atendimento encerrado com serviço finalizado | **Padrão seguro** para todos os fluxos |
| `"only-if-finished"` | Só se conversa encerrada | Fluxos de atendimento com encerramento manual |
| `"once"` | Apenas na primeira mensagem do lead | Anti-loop em fluxos com múltiplas instâncias |
| `"always"` | Cria sessão sempre | ⚠️ Risco de loop — evitar em produção |

> **`receiveJson: true`** expõe estrutura interna completa da mensagem como datasource:  
> `[Message-1]attendant.id` — ID do atendente que enviou  
> `[Message-1]rawProviderMessage.fromMe` — boolean: enviado pelo bot/atendente  
> `[Message-1]referral.ctwa_clid` — Click-to-WhatsApp ID para rastreamento de anúncios Meta  
> `[Message-1]timestamp` — timestamp da mensagem

---

### GRUPO: `business`
```
business-entered-trigger            → stageId
business-created-trigger            → stageId (pode vazio)
business-attendant-included-trigger → attendantId
business-attendant-removed-trigger  → attendantId
business-won-trigger                → type, stageId, pipelineId
business-lost-trigger               → type, stageId, pipelineId, receiveJson
business-restore-status-trigger     → type, stageId, pipelineId
```

### GRUPO: `lead`
```
lead-created-trigger                → {}
manually-lead-trigger               → {} (execução manual/em massa)
lead-tag-added-trigger              → tagIds: []
lead-tag-removed-trigger            → tagIds: []
lead-without-buying-trigger         → days: N (sem compra há N dias)
lead-won-businesses-count-trigger   → count: N
lead-won-businesses-value-trigger   → value: N
```

### GRUPOS: `instagram` / `facebook` / `http` / `system` / `activities`
```
instagram-comment-received-trigger       → comentário no post do Instagram
live-instagram-comment-received-trigger  → comentário em live do Instagram
facebook-comment-received-trigger        → comentário no post do Facebook
live-facebook-comment-received-trigger   → comentário em live do Facebook
json-http-request-trigger                → webhook HTTP — gera URL para sistemas externos
initiated-by-another-automation-trigger  → acionado via start-another-automation-action
activity-executed-trigger                → quando atividade é executada
```

**Múltiplos triggers no mesmo bloco = lógica OR:**  
Qualquer um dos triggers dispara o fluxo. Usado no padrão Pausa-Turbinado com 4 instâncias diferentes.

---

## 1.3 CATÁLOGO COMPLETO DE CONDITIONS (22 confirmadas)

### GRUPO: `business`
| Condition | Opções |
|-----------|--------|
| `business-has-attendants-condition` | `attendantsIds: []` ⚠️ note: `attendantsIds` não `attendantIds` |
| `business-attendant-empty-condition` | `{}` |
| `business-is-won-condition` | `{}` |
| `business-is-lost-condition` | `{}` |
| `business-is-pending-condition` | `{}` |
| `business-has-product-condition` | `productId, productSku` |
| `business-with-external-id-exists-condition` | `externalId` |
| `business-with-additional-field-exists-condition` | `type, value, additionalFieldId` |

### GRUPO: `lead`
| Condition | Opções |
|-----------|--------|
| `lead-exists-condition` | `{}` |
| `lead-has-tag-condition` | `tagIds: []` |
| `lead-has-attendant-condition` | `attendantIds: []` |
| `lead-has-business-on-pipeline-condition` | `pipelineId` |
| `lead-has-business-on-stage-condition` | `stageId` |
| `lead-with-email-exists-condition` | `email` |
| `lead-with-name-exists-condition` | `name` |
| `lead-with-phone-exists-condition` | `phone` |
| `lead-with-taxid-exists-condition` | `taxId` |
| `lead-with-additional-field-exists-condition` | `type, value, additionalFieldId` |

### GRUPO: `messages`
| Condition | Opções |
|-----------|--------|
| `conversation-has-attendant-condition` | `attendantIds: []` |
| `conversation-has-finalized-condition` | `{}` |
| `conversation-automation-is-enabled` | `{}` — verifica se bot ativo |
| `conversation-has-department-condition` | `departmentId` |

### GRUPO: `field`
| Condition | Opções |
|-----------|--------|
| `field-is-equal-condition` | `equalsTo, parameter` |
| `field-contains-condition` | `contains, parameter` |
| `field-has-value-condition` | `parameter` |
| `between-condition` | `parameter, greaterOrEqualsTo, lessOrEqualsTo` |

### GRUPO: `time` / `instagram`
| Condition | Opções |
|-----------|--------|
| `current-time-interval-condition` | `startTime, endTime, timezone, daysOfWeek` |
| `instagram-follower` | `{}` |

---

## 1.4 CATÁLOGO COMPLETO DE ACTIONS (30 confirmadas)

### GRUPO: `business`
| Action | Opções Principais |
|--------|-------------------|
| `create-business-action` | `stageId` |
| `move-business-action` | `stageId` |
| `win-business-action` | `{}` |
| `lose-business-action` | `lossReasonId, justification` |
| `restore-business-action` | `{}` |
| `clone-business-action` | `stageId destino` |
| `remove-business-action` | `{}` |
| `add-attendant-on-business-action` | `attendantId, addSameAttendantToLead: true/false` |
| `clean-attendant-on-business-action` | `cleanAttendantOnLead` |
| `add-product-on-business-action` | `productId, productSku, price, quantity` |
| `remove-product-on-business-action` | `productId, productSku, quantity` |
| `add-discount-shipping-action` | `coupon, discount, shipping, shippingType, addition` |

> ⚠️ **REGRA CRÍTICA — Troca de atendente exige SEMPRE as duas actions juntas:**
> 1. `add-attendant-on-business-action` → atualiza o negócio no CRM
> 2. `change-conversation-attendant-action` → atualiza o chat ativo
> 
> Usar apenas uma das duas cria inconsistência entre CRM e chat.

### GRUPO: `lead`
| Action | Opções Principais |
|--------|-------------------|
| `create-lead-action` | `{}` — atualiza se já existe |
| `delete-lead-action` | `{}` |
| `add-tag-action` | `tagIds: [], tagName (para criar nova)` |
| `remove-tag-action` | `tagIds: [], tagName` |
| `create-tag-action` | `name, color, description, useRandomColor` |
| `add-list-action` | `listIds: [], listName` |
| `create-list-action` | `name, description` |
| `add-lead-comment-action` | `comment` — aceita variáveis `{leadName}` |
| `add-attendant-on-lead-action` | `attendantId` |
| `clean-attendant-on-lead-action` | `attendantId` |

### GRUPO: `messages`
| Action | Opções |
|--------|--------|
| `change-conversation-attendant-action` | `type: "current-conversation", instanceId, attendantId` |
| `change-conversation-department-action` | `type, instanceId, departmentId` |
| `change-conversation-suggestion-action` | `type, instanceId, suggestion` |
| `start-conversation-action` | `type, instanceId` |
| `finish-conversation-action` | `type, instanceId` |
| `stop-chat-automations-action` | `type, instanceId` — pausa bot para humano assumir |
| `start-chat-automations-action` | `type, instanceId` — retoma bot |

### GRUPO: `system` / `product` / `activities`
| Action | Opções |
|--------|--------|
| `send-notification-action` | `notification, attendantsIds: [], url` |
| `start-another-automation-action` | `automationId, parameters: []` |
| `create-product-action` | `sku, name, price` |
| `create-activity-action` | `title, typeId, durationMs, attendantId, required` |

---

## 1.5 CATÁLOGO COMPLETO DE DELAYS (7 tipos)

| Tipo | Opções | Uso Ideal |
|------|--------|-----------|
| `seconds-delay` | `seconds: N` | Anti-spam, espaçamento entre mensagens (2–30s) |
| `minutes-delay` | `minutes: N` | Redistribuição por inatividade (5–60min) |
| `hours-delay` | `hours: N` | Follow-ups do mesmo dia (1–12h) |
| `days-delay` | `days: N` | Sequências de onboarding e pós-venda (1–30 dias) |
| `until-date-delay` | `date, startTime, endTime, timezone, invalidDateNextBlock` | Campanhas com data específica |
| `time-interval-delay` | `startTime, endTime, timezone, daysOfWeek` | Aguarda próximo horário comercial |
| `user-stop-chatting-delay` | `timeInSeconds: N` | Debounce — espera lead parar de digitar |

> **`user-stop-chatting-delay` é único:** não conta tempo fixo. Detecta inatividade do lead por N segundos.  
> Não é um delay de espera passivo — ele recomeça a contagem sempre que o lead envia algo.  
> Áudios em série → 30–120s | Conversas longas → 3600–10800s (1h–3h)

---

## 1.6 MENSAGENS — TODOS OS TIPOS (chat block)

| Tipo | Opções Principais |
|------|-------------------|
| `send-text-message` | `text, buttons[], breakMessages, breakMessagesIntervalInSeconds` |
| `text-input-message` | `text, parameter, acceptMediaUrl, timeoutWaitType, timeoutInSeconds, timeoutNextBlockId, invalidResponseMessage` |
| `send-audio-message` | `audios[]: {url, size, format, mimeType}` |
| `send-file-message` | `url, size, filename, mimeType, text, platforms[]` |
| `send-url-file-message` | `url` — aceita variável dinâmica `{url|campo}` |
| `delay-message` | `seconds` — simula digitação dentro do bloco chat |
| `send-comment-instagram` | `text, privateReply` |
| `whatsapp-send-template-message` | `template{id, name, language, body, header, buttons[]}` |

**Opções raiz do bloco `chat`:**
- `platform`: `"WHATSAPP"` / `"INSTAGRAM"` / `"FACEBOOK"`
- `provider`: `"EVOLUTION_API"` / `"INSTAGRAM_API"` / `"WHATSAPP_CLOUD_API"`
- `instanceId`: ID da instância conectada
- `errorNextBlockId`: rota alternativa se falhar o envio — **obrigatório em produção**
- `scheduledDate`: agendamento para data/hora futura

---

## 1.7 FIELD OPERATIONS — TODOS OS TIPOS

| Tipo | Opções | Resultado |
|------|--------|-----------|
| `set-field-operation` | `value, parameter` | Grava valor em campo |
| `parse-phone-field-operation` | `phone, defaultCountry, datasourceName` | Normaliza para E.164, cria datasource |
| `parse-date-field-operation` | `date, add, addType, timezone, datasourceName` | Manipula datas, cria datasource |
| `loop-array-field-operation` | `parameter, nextBlockId, datasourceName` | Itera sobre array, executa bloco por item |

`addType` para `parse-date`: `"days"` / `"hours"` / `"minutes"` / `"months"`

---

## 1.8 IA NATIVA — 6 TIPOS

| Tipo | Uso | Saída |
|------|-----|-------|
| `chat-assistant-ai` | Responde ao lead como assistente | Mensagem enviada ao lead |
| `chat-completion-llm-ai` | Processa texto internamente sem responder | Datasource com resultado |
| `chat-sentiment-ai` | Detecta sentimento da(s) última(s) mensagem(ns) | Rota por sentimento + `neutralNextBlockId` |
| `audio-transcription-ai` | Transcreve áudio para texto | Datasource com texto |
| `chat-intent-ai` | Detecta intenção dentre N opções | Rota por intenção + `noneNextBlockId` |
| `chat-parameters-ai` | Extrai parâmetros estruturados | Datasource por parâmetro + `emptyBlockId` |

Modelos: `"Basic"` (padrão) · `"Transcription"` (só para áudio)

**Regras de uso seguro de IA:**
- Sempre definir `emptyBlockId` em cada parâmetro do `chat-parameters-ai`
- Sempre definir `noneNextBlockId` e `neutralNextBlockId` — fallbacks obrigatórios
- Usar `chat-intent-ai` para routing (mais determinístico que `chat-assistant-ai`)
- Limitar `messagesQtd` ao mínimo necessário (3–10 mensagens de contexto)
- Nunca usar IA para ações irreversíveis (`win-business`, `lose-business`) sem validação humana posterior
- Sempre validar output com `condition(field-has-value)` antes de usar em ação crítica

---

## 1.9 JAVASCRIPT — API INTERNA DE SESSÃO

```javascript
// LEITURA DE CAMPOS DO LEAD
const telefone = await session.getValue('leadPhone');
const email    = await session.getValue('leadEmail');
const nome     = await session.getValue('leadName');
const campo    = await session.getValue('additional-field[NOME_DO_CAMPO]');

// RETORNO → exposto como datasource (configurado em datasourceName)
return {
  campo_calculado: valor,
  hash: sha256(telefone),
  array_resultado: [1, 2, 3]
};
// Acesso: {label|[Javascript-1]campo_calculado}
```

---

## 1.10 TODOS OS CAMPOS NATIVOS DO LEAD

| Campo (`parameter`) | Descrição |
|---------------------|-----------|
| `leadName` | Nome completo |
| `leadPhone` | Telefone em formato E.164 — ex: `5511999999999` |
| `leadEmail` | E-mail |
| `leadTaxId` | CPF ou CNPJ |
| `leadNotes` | Anotações e resumo do lead |
| `leadCtwaId` | Click-to-WhatsApp ID (Meta Ads) |
| `leadSourceId` | Source ID de rastreamento de origem |
| `productPrice` | Preço do produto associado ao negócio |

---

## 1.11 VARIÁVEIS EM TEXTOS DE MENSAGEM

| Variável | Sintaxe |
|----------|---------|
| Nome do lead | `{Nome do lead\|leadName}` |
| Telefone | `{Telefone do lead\|leadPhone}` |
| E-mail | `{Email do lead\|leadEmail}` |
| CPF/CNPJ | `{CPF\|leadTaxId}` |
| ID da conversa | `{ID da conversa\|conversationId}` |
| **Atendente ativo** | `{Atendente da conversa\|chatAttendant}` — variável nativa |
| Campo customizado | `{Label\|additional-field[NOME]}` |
| Datasource externo | `{label\|[datasourceName]caminho.aninhado}` |
| Array de datasource | `{texto\|[Api-request-1][0].output}` — padrão N8N |

---

# PARTE II — ARQUITETURA UNIVERSAL DE FLUXOS

## 2.1 AS 10 CAMADAS OBRIGATÓRIAS

Todo fluxo de produção deve respeitar esta sequência de responsabilidades. Cada camada tem responsabilidade única e bem definida.

```
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 0 — GATE DE ENTRADA (Anti-Loop / Anti-Duplicata)    │
├─────────────────────────────────────────────────────────────┤
│  CAMADA 1 — TRIGGER (Gatilho com escopo mínimo)             │
├─────────────────────────────────────────────────────────────┤
│  CAMADA 2 — VALIDAÇÃO (Pré-condições críticas)              │
├─────────────────────────────────────────────────────────────┤
│  CAMADA 3 — ENRIQUECIMENTO (Normalização e dados externos)  │
├─────────────────────────────────────────────────────────────┤
│  CAMADA 4 — DECISÃO (Routing baseado em estado)             │
├─────────────────────────────────────────────────────────────┤
│  CAMADA 5 — EXECUÇÃO (Ações e mensagens principais)         │
├─────────────────────────────────────────────────────────────┤
│  CAMADA 6 — PERSISTÊNCIA (Gravação de estado e contexto)    │
├─────────────────────────────────────────────────────────────┤
│  CAMADA 7 — OBSERVABILIDADE (Tags, logs, checkpoints)       │
├─────────────────────────────────────────────────────────────┤
│  CAMADA 8 — FALLBACK (Tratamento de erros e exceções)       │
├─────────────────────────────────────────────────────────────┤
│  CAMADA 9 — FINALIZAÇÃO (Estado final + próximo ciclo)      │
└─────────────────────────────────────────────────────────────┘
```

**Regras de transição entre camadas:**
- Camada 0 SEMPRE antes de qualquer `action` — sem exceção
- Camada 3 SEMPRE antes de Camada 4 quando há dados externos
- Camada 9 deve aparecer em **todos** os caminhos de saída (incluindo fallbacks e erros)

---

### CAMADA 0 — GATE DE ENTRADA

**Responsabilidade:** Evitar execução duplicada, loop e concorrência  
**Blocos:** `condition`  
**Regra:** Todo fluxo com `message-received` ou `manually-lead-trigger` DEVE ter gate

```
trigger
  ↓
condition(lead-has-tag "em-processamento")
    TRUE  → STOP (já está em execução)
    FALSE →
condition(lead-has-tag "opt-out")
    TRUE  → STOP (não perturbar)
    FALSE →
condition(conversation-automation-is-enabled)
    FALSE → STOP (humano no controle)
    TRUE  → [adquire lock] → Camada 2
```

---

### CAMADA 1 — TRIGGER

**Responsabilidade:** Definir o evento de entrada com o mínimo escopo possível  
**Regras:**
- Sempre definir `instanceId` quando possível
- Preferir `initializeSession: "only-if-finished-service"` como padrão
- Usar `receiveJson: true` apenas quando precisar de metadados da mensagem
- Múltiplos triggers no mesmo bloco = lógica OR (qualquer um dispara)

---

### CAMADA 2 — VALIDAÇÃO

**Responsabilidade:** Garantir pré-condições antes de qualquer ação destrutiva

```
condition(lead-exists)
    FALSE → action(create-lead)
    TRUE  →
condition(lead-has-business-on-pipeline)
    FALSE → action(create-business)
    TRUE  →
condition(current-time-interval 08h–18h seg–sex)
    FALSE → delay(time-interval) → continua para Camada 3
    TRUE  → continua para Camada 3
```

---

### CAMADA 3 — ENRIQUECIMENTO

**Responsabilidade:** Normalizar e enriquecer dados antes de usar

```
field-op(parse-phone "55{phone|[ds]phone}" → phone-1)
field-op(set leadPhone = {phone|[phone-1]phone})
field-op(set leadName  = {nome|[ds]nome})
field-op(set additional-field[ts_entrada] = {timestamp})
```

---

### CAMADA 4 — DECISÃO

**Responsabilidade:** Routing baseado em estado atual

```
condition(field-is-equal "tipo-A")
    TRUE  → [Módulo A]
    FALSE →
condition(field-is-equal "tipo-B")
    TRUE  → [Módulo B]
    FALSE → [fallback default]
```

**Regras:**
- Nunca mais de 3 níveis de condição aninhada sem estado intermediário
- Randomizer SEMPRE com soma de `perc` = 100 (verificar com calculadora)
- Toda condition deve ter tratamento para AMBOS os caminhos

---

### CAMADA 5 — EXECUÇÃO

**Responsabilidade:** Ações principais e mensagens ao lead  
**Regras:**
- Agrupar ações correlatas no mesmo bloco `action`
- `errorNextBlockId` em todo `chat` e `api` crítico
- Usar `delay-message` entre mensagens para simular humanidade
- Nunca enviar mais de 3 mensagens seguidas sem `delay-message`

---

### CAMADA 6+7 — PERSISTÊNCIA E OBSERVABILIDADE

```
action(add-tag "etapa-03-proposta-enviada")
field-op(set additional-field[ts_proposta] = {timestamp})
action(add-lead-comment "[2026-02-21 10:30] Proposta enviada | atendente: {chatAttendant}")
```

---

### CAMADA 8 — FALLBACK

**Responsabilidade:** Tratar todas as falhas previstas  
- Todo `api` block **deve** ter `errorNextBlockId` em produção  
- Todo `chat` com `text-input-message` **deve** ter `timeoutNextBlockId`

---

### CAMADA 9 — FINALIZAÇÃO

**Responsabilidade:** Estado limpo ao encerrar  
**Checklist obrigatório em todos os caminhos de saída:**
```
action(remove-tag "em-processamento")   ← libera lock SEMPRE
action(move-business → etapa correta)
action(add-tag "etapa-99-concluido")
```

---

## 2.2 SISTEMA DE LAYOUT — GRADE OBRIGATÓRIA DE ESPAÇAMENTO ← NOVO v4.0

O DataCrazy renderiza blocos com largura aproximada de **340px**. Usar espaçamento incorreto causa sobreposição visual no canvas, conexões cruzadas e blocos impossíveis de editar.

### Fórmula padrão de posicionamento

```
BLOCK_W = 340px   (largura estimada de um bloco)
GAP_X   = 180px   (gap mínimo horizontal)
STEP_X  = 520px   (passo por coluna = BLOCK_W + GAP_X)
GAP_Y   = 420px   (gap vertical entre branches paralelas)

x = número_da_coluna × 520
y = posição_vertical conforme tabela abaixo
```

### Grade vertical padrão

| Posição no fluxo | Coordenada Y | Uso |
|------------------|-------------|-----|
| Caminho principal (happy path) | `Y = 0` | Linha central — fluxo feliz |
| Branch positiva 1 (sim / aceito / promotor) | `Y = -500` ou `-600` | Acima do caminho principal |
| Branch positiva 2 (extra) | `Y = -1000` | Branches adicionais para cima |
| Branch negativa 1 (não / recusou / detrator) | `Y = +500` ou `+600` | Abaixo do caminho principal |
| Branch negativa 2 (erro crítico) | `Y = +1000` | Branches adicionais para baixo |
| Fallback / Unlock geral | `Y = +900` | Isolado ao final — não cruza o fluxo |
| Delay de horário comercial | `Y = +600` (mesma coluna da condition) | Adjacente à condição de horário |

### Regras visuais obrigatórias

1. **Branches positivas** (SIM, aceito, promotor) → sempre **acima** do caminho principal (Y negativo)
2. **Branches negativas** (NÃO, recusou, erro) → sempre **abaixo** (Y positivo)
3. **Blocos de merge** (onde branches se reconectam) → voltam para `Y = 0`
4. **Nunca** dois blocos com mesmo X e mesmo Y na mesma coluna
5. **Delay de horário** → mesma coluna da condition de horário, `Y = +600`
6. **Fallback/unlock** → coluna final, Y extremo (`+900` ou mais) — fora do fluxo principal

### Exemplo visual de posicionamento

```
COL:  0      1      2      3       4       5       6
Y=-600                    [ASSIGN A]
Y=-500         [opt-out]
Y= 0    [TRG]-[GATE]-[LOCK]-[RAND]--[MSG]-[AÇÃO1]-[FIM]
Y=+500               [HORS]
Y=+600               [DLY]         [ASSIGN C]
Y=+900                                     [FALLBACK]

X:     0    520   1040  1560    2080    2600   3120
```

### Erros comuns de layout e como corrigir

| Sintoma | Causa | Solução |
|---------|-------|---------|
| Blocos sobrepostos | X diferença < 520px | Usar exatamente `coluna × 520` |
| Conexões cruzadas | Branches em Y próximos | Afastar branches para `±500` ou `±600` |
| Canvas enorme sem necessidade | Blocos muito espalhados | Máximo de `±1000` para Y, branches compactas |
| Delay de horário sobreposto | Mesmo Y da condition | Mover delay para `Y = condição_Y + 600` |

---

# PARTE III — MÓDULOS REUTILIZÁVEIS (DESIGN PATTERNS)

## MODULE 01 — ANTI-LOOP GATE

**Objetivo:** Impedir que a automação execute múltiplas vezes no mesmo lead  
**Quando usar:** Todo fluxo com `message-received` ou `manually-lead-trigger`  
**Risco evitado:** Lead envia duas mensagens → dois fluxos paralelos → inconsistência

```
trigger
  ↓
condition(lead-has-tag "em-automacao-X")
    TRUE  → STOP
    FALSE →
action(add-tag "em-automacao-X")     ← adquire lock
  ↓
[FLUXO PRINCIPAL]
  ↓
action(remove-tag "em-automacao-X")  ← libera lock em TODOS os caminhos de saída
```

> **CRÍTICO:** O `remove-tag` DEVE aparecer em **TODOS** os caminhos, incluindo fallbacks e erros.

---

## MODULE 02 — ANTI-CONVERSÃO / BAIL-OUT CHECK

**Objetivo:** Interromper disparo quando lead já converteu  
**Quando usar:** Campanhas com múltiplos contatos ao longo do tempo

```
delay(variado — anti-spam)
  ↓
condition(lead-has-tag "convertido")
    TRUE  → STOP
    FALSE → api/chat(disparo)
              ↓
           delay(próximo intervalo)
              ↓
           condition(lead-has-tag "convertido")
               TRUE  → STOP
               FALSE → api/chat(segundo contato)
               ... repete até N contatos
```

---

## MODULE 03 — DEBOUNCE DE MENSAGENS

**Objetivo:** Esperar lead terminar de enviar antes de processar  
**Bloco:** `user-stop-chatting-delay`

```
trigger(message-received)
  ↓
delay(user-stop-chatting, timeInSeconds: 30–10800)
  ↓
[PROCESSA TODAS AS MENSAGENS ACUMULADAS]
```

---

## MODULE 04 — NORMALIZAÇÃO DE TELEFONE

**Objetivo:** Garantir formato E.164 antes de qualquer API  
**Quando usar:** Sempre que telefone vier de webhook externo, formulário ou importação

```
field-op(parse-phone: "55{phone|[datasource]phone}", defaultCountry: "BR", ds: "phone-1")
field-op(set leadPhone = {phone|[phone-1]phone})

// Normaliza qualquer formato de entrada:
// (11) 99999-9999  →  5511999999999
// 11999999999      →  5511999999999
// +55 11 99999-9999 → 5511999999999
```

---

## MODULE 05 — HASHING SHA256 (META CAPI)

**Objetivo:** Enviar dados para Meta Conversions API com hash SHA256  
**Pipeline completo:**

```
trigger(business-won / business-entered stageId: ganho)
  ↓
condition(field-has-value leadCtwaId)
    FALSE → STOP (não veio de anúncio)
    TRUE  →
delay(5s)
  ↓
javascript(sha256 de phone + email + nome → datasource: Javascript-1)
  ↓
field-op(set additional-field[Phone_Hash] = {hash|[Javascript-1]phone_hash})
  ↓
api(POST graph.facebook.com/PIXEL_ID/events)
  ↓
field-op(set additional-field[fbtrace_id] = {id|[Api-request-1]fbtrace_id})
```

---

## MODULE 06 — BRIDGE N8N / IA EXTERNA

**Objetivo:** Usar N8N como motor de IA ou lógica de processamento externo  
**Estrutura da resposta N8N:** `[{"output": "Texto gerado"}]`

```
api(POST https://n8n.dominio.com/webhook/ID, body: vazio, ds: "Api-request-1")
  ↓
chat(send-text: "{mensagem|[Api-request-1][0].output}")
  ↓
chat(text-input → salva resposta do lead)
```

---

## MODULE 07 — FORMULÁRIO DO VENDEDOR EXTERNO

**Objetivo:** Coletar dados de vendedores em campo com roteamento por resposta numérica

```
trigger(json-http-request, ds: "Api-request-1")
  ↓
field-op(set leadPhone = {Telefone|[Api-request-1]Telefone})
  ↓
delay(20s)    ← garante que lead está no sistema
  ↓
chat("Olá {Atendente da conversa|chatAttendant}..." + botões)
  ↓
condition(field-is-equal "[Api-request-1]Resposta" "1") → TRUE: action A
condition(field-is-equal "[Api-request-1]Resposta" "2") → TRUE: action B
... até N opções
```

---

## MODULE 08 — DETECÇÃO DE PAUSA DO ATENDENTE

**Objetivo:** Detectar quando atendente não responde e acionar redistribuição

```
trigger(message-sended, receiveJson: true, ds: "Message-1")
  ↓
delay(3s)
  ↓
condition(field-has-value "[Message-1]rawProviderMessage.fromMe")
    TRUE  → mensagem foi do atendente/bot
    FALSE → STOP (lead enviou — não é pausa do atendente)
  ↓
condition(field-has-value "[Message-1]attendant.id")
    TRUE  → atendente identificado
  ↓
condition(lead-has-business-on-pipeline "PIPELINE_ID")
    TRUE  → action(move-business + add-tag "atendido")
```

---

## MODULE 09 — DISTRIBUIÇÃO INTELIGENTE ENTRE ATENDENTES

Fórmulas de percentual (soma deve ser exatamente 100):

| N | Percentuais |
|---|-------------|
| 2 | 50/50 |
| 3 | 34/33/33 |
| 4 | 25/25/25/25 |
| 5 | 20/20/20/20/20 |
| 6 | 17/17/17/17/16/16 |
| 7 | 15/15/14/14/14/14/14 |
| 8 | 13/13/13/13/12/12/12/12 |
| 10 | 10×10 |
| 12 | 9/9/9/9/8/8/8/8/8/8/8/8 |

**Cada saída do randomizer deve SEMPRE ter as duas actions:**
```
action(add-attendant-on-business-action, attendantId: ID, addSameAttendantToLead: true)
action(change-conversation-attendant-action, attendantId: ID)
```

**Layout:** Branches do randomizer posicionadas verticalmente com `GAP_Y = 500–600px` entre cada uma.

---

## MODULE 10 — REDISTRIBUIÇÃO POR INATIVIDADE DO VENDEDOR

```
trigger(message-received)
  ↓
delay(15min)
  ↓
condition(lead-has-tag "ja-respondeu")
    TRUE  → STOP
    FALSE →
condition(conversation-has-attendant ATEND_1)
    TRUE  → randomizer(6 outros, 17/17/17/17/16/16) → action(change-attendant)
    FALSE →
condition(conversation-has-attendant ATEND_2)
    TRUE  → randomizer(6 outros)
... repete para cada atendente
```

---

## MODULE 11 — FOLLOW-UP INTELIGENTE COM ESTADO

```
trigger(message-sended)
  ↓
delay(user-stop-chatting, timeInSeconds: 10800)    ← 3h de inatividade
  ↓
condition(lead-has-tag "respondeu|convertido|perdido")
    TRUE  → STOP (bail-out)
    FALSE →
condition(lead-has-business-on-stage "etapa-alvo")
    TRUE  →
        action(move-business → follow-up-1 + add-tag "follow-up-ativo")
        api(N8N → gera mensagem contextual)
        chat(mensagem da IA + input, timeout: 48h → timeoutNextBlockId)
    FALSE →
condition(lead-has-business-on-stage "outra-etapa")
    TRUE  → [variante do follow-up]
```

---

## MODULE 12 — CHECKPOINT DE ESTADO COM TAGS

**Convenção de nomenclatura:**

```
// ETAPAS DE PROGRESSO
"etapa-01-recebido"          → lead entrou no fluxo
"etapa-02-qualificado"       → passou qualificação
"etapa-03-proposta-enviada"  → recebeu proposta
"etapa-99-convertido"        → comprou
"etapa-99-perdeu"            → foi perdido

// FLAGS OPERACIONAIS
"em-automacao"               → lock de concorrência
"humano-ativo"               → atendente assumiu
"opt-out"                    → não perturbar
"convertido"                 → usado em bail-out de disparos
"follow-up-ativo"            → em ciclo de follow-up

// RASTREAMENTO DE ORIGEM
"fonte-meta-ads"             → veio de anúncio pago
"fonte-organico"             → tráfego orgânico
"fonte-indicacao"            → indicação de cliente
```

---

## MODULE 13 — RETRY DE API COM FALLBACK

O DataCrazy não tem retry nativo — implementar manualmente:

```
api(chamada-principal)
  →next: bloco-sucesso
  →errorNextBlockId: bloco-retry-delay
                ↓
          delay(30s)
          api(segunda tentativa)
            →next: bloco-sucesso
            →errorNextBlockId: bloco-fallback
                        ↓
                  action(add-tag "api-falhou")
                  action(add-lead-comment "Integração falhou — revisão manual")
                  action(send-notification "API falhou para {leadName}" → GESTOR)
                  [continua com dados parciais]
```

**Layout:** Retry e fallback posicionados em `Y = +500 a +600`, na mesma ou próxima coluna.

---

## MODULE 14 — LOCK DE ATENDIMENTO HUMANO

```
// NO INÍCIO DE CADA BLOCO CRÍTICO DE ENVIO
condition(conversation-automation-is-enabled)
    TRUE  → continua automação
    FALSE → STOP (humano assumiu — não interferir)

// DETECÇÃO AUTOMÁTICA DE HUMANO ASSUMINDO
trigger(message-sended, receiveJson: true)
  ↓
condition(field-has-value "[Message-1]attendant.id")
    TRUE → action(stop-chat-automations) + action(add-tag "humano-ativo")
```

---

## MODULE 15 — QUALIFICAÇÃO VIA IA COM FALLBACK MANUAL

```
ai(chat-parameters-ai)
    parameter "interesse",  emptyBlockId → fallback-manual
    parameter "orcamento",  emptyBlockId → fallback-parcial
  ↓ (extraiu tudo)
ai(chat-intent-ai)
    "Comprar"  → action(move-business etapa Quente + add-tag "qualificado")
    "Suporte"  → action(change-department suporte)
    "Nenhum"   → ai(chat-assistant → resposta educada)
    none       →
// FALLBACK MANUAL
action(send-notification "Lead precisa qualificação manual" → GESTOR)
action(add-tag "qualificacao-manual-pendente")
action(add-lead-comment "IA não conseguiu qualificar — verificar manualmente")
```

---

## MODULE 16 — SINCRONIZAÇÃO COM CRM EXTERNO

```
trigger(json-http-request, ds: "Api-request-1")
  ↓
condition(field-is-equal "order_approved" "[Api-request-1]webhook_event_type")
    TRUE  → [fluxo compra aprovada]
    FALSE →
condition(field-is-equal "abandoned"      "[Api-request-1]status")
    TRUE  → [fluxo carrinho abandonado]
    FALSE → STOP

// POR EVENTO:
// parse-phone → set campos nativos → condition(lead-exists)
// → create-lead/create-business → chat(notificação ao lead)
```

---

## MODULE 17 — DISPARO EM MASSA HUMANIZADO

**Delays variados — valores observados em produção:**

| Sequência | Delays em segundos |
|-----------|--------------------|
| 1ª rodada | 206, 238, 256, 301, 395, 407, 457, 471 |
| 2ª rodada | 533, 630, 847, 1008, 1399, 1940 |
| 3ª rodada | 2630, 3000, 4069 |
| Entre lotes | 3600s (1 hora) |

**Estrutura base:**
```
trigger(manually-lead-trigger)
  ↓
randomizer(N atendentes)
  ↓ [por ramo]
action(add-attendant-on-business + add-list "em-disparo")
  ↓
delay(variado — diferente por ramo para não disparar em sincronia)
  ↓
condition(lead-has-tag "convertido") → TRUE: STOP
  ↓
api/chat(disparo)
  ↓
[repete delay + check + disparo para cada contato]
```

**Layout:** Cada ramo do randomizer em linha vertical separada (GAP_Y = 500px entre ramos).

---

## MODULE 18 — FEATURE FLAGS POR CAMPO ADICIONAL

**Objetivo:** Ativar/desativar comportamentos sem editar o fluxo

```
// DEFINIÇÃO — setar via API ou manualmente no lead
additional-field[flag_followup_ativo] = "true" | "false"

// USO NO FLUXO
condition(field-is-equal "true" "additional-field[flag_followup_ativo]")
    TRUE  → executa follow-up
    FALSE → STOP (desabilitado para este lead)
```

---

# PARTE IV — GERENCIAMENTO DE ESTADO E RESILIÊNCIA

## 4.1 ESTRATÉGIAS DE ESTADO

| Estratégia | Vantagens | Desvantagens | Uso |
|------------|-----------|--------------|-----|
| **Tags** | Busca rápida, condição nativa, múltiplas por lead | Sem valor — só booleano | Etapas, flags operacionais, routing |
| **Campo adicional** | Armazena valores, strings, timestamps, contadores | Comparação só por `field-is-equal` | Dados de terceiros, configurações, NPS |
| **Etapa do negócio** | Visível no Kanban, relatórios nativos | Uma etapa por vez | Progresso comercial principal |
| **Lista** | Agrupa para ações em massa | Não consultável em `condition` | Disparos — não para routing |

---

## 4.2 ANTI-DUPLICAÇÃO — CHECKLIST

| Cenário | Solução |
|---------|---------|
| Lead manda 2 mensagens rápidas | `initializeSession: "only-if-finished-service"` + anti-loop gate |
| Dois fluxos criam lead simultâneo | `lead-exists-condition` → `create-lead` só no FALSE |
| Dois fluxos criam negócio simultâneo | `lead-has-business-on-pipeline` antes de criar |
| Disparo manual acionado duas vezes | Tag `"em-disparo"` + verificação no início |
| Webhook recebe mesmo evento duas vezes | Salvar `event_id` em campo → verificar `field-has-value` antes |
| Fluxo executa N vezes no mesmo lead | `between-condition` no contador `exec_count` (ex: 0 a 10) |

---

## 4.3 SISTEMA DE RESILIÊNCIA — MAPA COMPLETO

```
FALHA: API externa não responde
  → errorNextBlockId: delay(30s) + retry
  → após 2 falhas: notificação gestor + continua sem o dado

FALHA: Timeout de input do lead
  → timeoutNextBlockId: action(add-tag "sem-resposta")
  → delay(24h) → nova tentativa OU encerramento

FALHA: Dados incompletos do webhook
  → condition(field-has-value campo_critico)
      FALSE → add-tag "webhook-dados-incompletos"
              send-notification gestor
              STOP

FALHA: Atendimento humano ativo durante automação
  → condition(conversation-automation-is-enabled) FALSE → STOP

FALHA: Loop infinito
  → Prevenção: initializeSession "once" ou "only-if-finished-service"
  → Detecção: field-op(set exec_count + 1) → between(0, 10) FALSE → STOP + notificação

FALHA: Atendente inválido/inativo
  → Após change-conversation-attendant:
    condition(conversation-has-attendant) FALSE → fallback para randomizer

FALHA: Etapa inexistente no pipeline
  → Após move-business:
    condition(lead-has-business-on-stage) FALSE → send-notification + STOP

FALHA: Fluxo interrompido por servidor
  → Tags de checkpoint permitem auditoria
  → Rotina diária: lead-without-buying-trigger → limpa locks órfãos

FALHA: IA sem resposta útil
  → emptyBlockId / noneNextBlockId / neutralNextBlockId → fallback manual obrigatório

FALHA: Layout com blocos sobrepostos no canvas
  → Checar posicionamento: toda coluna deve usar x = coluna × 520
```

---

## 4.4 DEAD-LETTER FLOW

Para capturar leads em estados inconsistentes:

```
trigger(lead-tag-added "dead-letter")
  ↓
action(add-lead-comment "Estado inconsistente — revisão manual")
action(send-notification "Lead {leadName} ({leadPhone}) precisa revisão" → GESTOR)
action(remove-tag "em-automacao")    ← limpa todos os locks
action(remove-tag "em-disparo")
action(move-business → "Revisão Manual")
```

---

## 4.5 CAMPOS DE AUDITORIA RECOMENDADOS

```
additional-field[ts_primeiro_contato]   → timestamp da primeira mensagem
additional-field[ts_qualificacao]       → quando foi qualificado
additional-field[ts_proposta]           → quando proposta foi enviada
additional-field[ts_conversao]          → quando converteu
additional-field[automacao_id]          → ID da automação que processou
additional-field[fbtrace_id]            → ID de rastreamento Meta CAPI
additional-field[exec_count]            → contador de execuções do fluxo
additional-field[nps_score]             → nota NPS coletada (0–10)
additional-field[utm_source]            → origem do lead (meta_ads, organico)
additional-field[status_posvendas]      → estado atual no ciclo pós-venda
```

---

# PARTE V — OBSERVABILIDADE E DEBUG

## 5.1 SISTEMA DE LOGGING VIA COMENTÁRIOS

```
action(add-lead-comment "[2026-02-21 10:30] Fluxo X iniciado | etapa: recepção | trigger: msg-received")
action(add-lead-comment "[2026-02-21 10:31] IA qualificou como: {interesse|additional-field[interesse]}")
action(add-lead-comment "[2026-02-21 10:32] Proposta enviada | atendente: {chatAttendant}")
action(add-lead-comment "[2026-02-21 10:35] ERRO: API Meta falhou | tentativa: 2")
```

## 5.2 TAGS DE RASTREAMENTO DE AUTOMAÇÃO

```
"auto-{nome-fluxo}-inicio"     → quando entra no fluxo
"auto-{nome-fluxo}-completo"   → quando finaliza com sucesso
"auto-{nome-fluxo}-erro"       → quando tem falha crítica
"auto-{nome-fluxo}-timeout"    → quando lead não responde
```

## 5.3 CAMPOS DE AUDITORIA

```
additional-field[ts_primeiro_contato]   → timestamp da primeira mensagem
additional-field[ts_qualificacao]       → quando foi qualificado
additional-field[ts_proposta]           → quando proposta foi enviada
additional-field[ts_conversao]          → quando converteu
additional-field[automacao_id]          → ID da automação que processou
additional-field[fbtrace_id]            → ID de rastreamento Meta CAPI
additional-field[exec_count]            → contador de execuções do fluxo
```

---

# PARTE VI — GUIA DE IMPORTAÇÃO E CONFIGURAÇÃO ← NOVO v4.0

Este guia deve ser entregue junto com qualquer arquivo `.dc`. Seguir todas as etapas garante que o fluxo funcione corretamente na primeira ativação.

> ⚠️ **NUNCA ative um fluxo antes de completar todas as etapas.** Fluxos com placeholders não substituídos disparam com IDs inexistentes e causam comportamentos imprevisíveis que podem danificar dados de produção.

---

## 6.1 PASSO 1 — COLETAR TODOS OS IDs ANTES DE ABRIR O ARQUIVO

Antes de abrir o `.dc` em qualquer editor, colete todos os IDs necessários no DataCrazy. Nenhuma configuração pode ser feita sem eles.

| Dado necessário | Onde encontrar no DataCrazy |
|----------------|-----------------------------|
| `tenantId` | Configurações da conta → URL do navegador ou via `GET /api/v1/tenants` |
| `instanceId` | Configurações → Conexões → clique na instância → ID na URL |
| `pipelineId` | Pipelines → clique no pipeline → ID na URL |
| `stageId` | Pipelines → clique na etapa → ID na URL ou via `GET /api/v1/pipelines` |
| `attendantId` | Configurações → Atendentes → clique no atendente → ID na URL |
| `tagId` | Leads → Tags → clique na tag → ID na URL ou via `GET /api/v1/tags` |
| `productId` | Produtos → clique no produto → ID na URL |
| `automationId` | Automações → clique na automação → ID na URL (**só após importar**) |

**Dica:** Use a API REST do DataCrazy para listar tudo de uma vez:
```
GET https://api.g1.datacrazy.io/api/v1/attendants
GET https://api.g1.datacrazy.io/api/v1/pipelines
GET https://api.g1.datacrazy.io/api/v1/tags
Authorization: Bearer SEU_TOKEN_DE_API
```

---

## 6.2 PASSO 2 — CRIAR TAGS E ETAPAS ANTES DE IMPORTAR

Toda tag referenciada no fluxo deve existir **antes** da importação. O DataCrazy não cria tags automaticamente — referências a IDs inexistentes causam falha silenciosa.

**Onde criar tags:** Leads → Tags → Nova Tag

**Tags padrão a criar para qualquer fluxo:**
```
"em-processamento"   (ou "em-[nome-fluxo]")  → lock de concorrência
"opt-out"                                     → não perturbar
"convertido"                                  → usado em bail-out de disparos
"humano-ativo"                                → bot pausado
"sem-resposta"                                → lead não respondeu ao input
"dead-letter"                                 → estado inconsistente
```

**Tags específicas de pós-venda (exemplo):**
```
"em-posvendas"           → lock específico do ciclo
"upsell-aceito"          → cliente aceitou upsell
"upsell-recusou"         → cliente recusou upsell
"insatisfeito"           → NPS ou sentimento negativo
"promotor-nps"           → NPS 9-10
"renovacao-interesse"    → quer renovação
"posvendas-completo"     → ciclo encerrado
```

**Etapas de pipeline a criar antes de importar:**
- Criar todas as etapas referenciadas no fluxo
- Anotar o `stageId` de cada uma imediatamente após criar
- Usar nomes descritivos que reflitam o fluxo de negócio

---

## 6.3 PASSO 3 — SUBSTITUIR PLACEHOLDERS NO ARQUIVO .dc

Abra o arquivo `.dc` em um editor de texto com **Localizar e Substituir** (`Ctrl+H` no VS Code ou Notepad++). Use "Substituir Tudo" — nunca substitua um a um.

| Placeholder no arquivo | Substitua por | Observação |
|-----------------------|--------------|------------|
| `TENANT_ID` | ID real do tenant | **Obrigatório** — importação falha sem isso |
| `INSTANCE_ID_WHATSAPP` | ID da instância WhatsApp ativa | Mesmo ID em trigger e todos os chats |
| `PIPELINE_ID_*` | ID de cada pipeline | Pode haver múltiplos no arquivo |
| `STAGE_ID_*` | ID de cada etapa | Verificar cada `STAGE_` individualmente |
| `ATEND_*_ID` / `ATTENDANT_ID_*` | ID de cada atendente | Verificar por atendente — IDs únicos |
| `TAG_*` | ID de cada tag criada no Passo 2 | Substituir pela tag já criada |
| `PRODUCT_ID_*` | ID de cada produto no catálogo | Criar produto antes se não existir |
| `GESTOR_ID` / `GESTOR_RESPONSAVEL_ID` | ID do atendente gestor | Atendente que receberá notificações críticas |
| `AUTOMATION_ID` | ID gerado após primeira importação | Ver processo em dois estágios abaixo |
| `[LINK_*]` / `URL_*` | URLs reais do cliente | Substituir nos textos das mensagens |

**Após substituir:**
1. Busca por `_ID"` no arquivo — deve retornar vazio
2. Busca por `TENANT` — deve retornar vazio
3. Busca por `STAGE_ID` — deve retornar vazio
4. Salve o arquivo com novo nome antes de importar

**Processo em dois estágios para `AUTOMATION_ID`:**
```
1. Importe o arquivo sem preencher AUTOMATION_ID (deixe vazio)
2. Após importar, abra a automação e copie o ID da URL do navegador
3. Edite o arquivo .dc substituindo AUTOMATION_ID pelo ID real
4. Reimporte — o DataCrazy sobrescreve o fluxo anterior
```

---

## 6.4 PASSO 4 — IMPORTAR O ARQUIVO

1. Acesse **Automações** no menu lateral
2. Clique no ícone de **upload / importação** no topo
3. Selecione o arquivo `.dc` com todos os placeholders substituídos
4. Confirme a importação na janela de diálogo
5. O fluxo aparecerá com status **INATIVO** — **não ative ainda**

---

## 6.5 PASSO 5 — VERIFICAÇÃO VISUAL OBRIGATÓRIA

Após importar, abra o editor do fluxo e verifique:

**Verificações de layout:**
- [ ] Todos os blocos visíveis sem sobreposição
- [ ] Conexões entre blocos desenhadas corretamente
- [ ] Nenhum bloco "órfão" (sem conexão de entrada)
- [ ] Branches positivas acima da linha central (Y negativo)
- [ ] Branches negativas e fallback abaixo (Y positivo)

**Verificações por tipo de bloco:**

| Tipo | O que verificar |
|------|-----------------|
| `trigger` | `instanceId` preenchido · `initializeSession` correto |
| `condition` | `trueNextBlockId` E `falseNextBlockId` preenchidos |
| `chat` | `instanceId` · `platform` · `provider` · `errorNextBlockId` |
| `text-input-message` | `timeoutNextBlockId` configurado — o que fazer quando lead não responde |
| `randomizer` | Soma dos percentuais = 100 exatamente |
| `api` | URL · method · headers · `errorNextBlockId` para retry/fallback |
| `ai` | `emptyBlockId` e `noneNextBlockId` em todos os parâmetros e intenções |
| `delay` de horário | Horários em UTC (somar 3h do BRT) · `daysOfWeek` correto |
| `action` de atendente | `add-attendant-on-business` E `change-conversation-attendant` juntas |

---

## 6.6 PASSO 6 — CHECKLIST DE DEPLOY (20 pontos)

```
ESTRUTURA
□ tenantId preenchido e correto para o cliente
□ instanceId em todos os triggers e blocos chat
□ Nenhum placeholder pendente — busca por "_ID" e "TENANT" retornou vazio

LÓGICA
□ nextBlockId correto em todos os blocos
□ trueNextBlockId E falseNextBlockId em todas as conditions
□ errorNextBlockId em todos os blocos api e chat críticos
□ timeoutNextBlockId em todos os text-input-message
□ Soma de perc = 100 em todos os randomizers

SEGURANÇA
□ Anti-loop gate no início do fluxo
□ Lock (add-tag) E unlock (remove-tag) em todos os caminhos de saída
□ Horário comercial verificado antes de todo bloco chat
□ Parse de telefone antes de usar em API ou comparação
□ conversation-automation-is-enabled verificado em fluxos com humano

DADOS
□ stepId único em cada mensagem dentro de bloco chat
□ stepId único em cada operação dentro de field-operation
□ Campos nativos (leadName, leadPhone) preenchidos antes de create-lead

LAYOUT
□ Nenhum bloco com x e y iguais a outro (sem sobreposição)
□ Blocos de fallback em Y extremo (+900 ou mais), fora do fluxo principal
□ Delay de horário na mesma coluna da condition de horário, Y+600
```

---

## 6.7 PASSO 7 — ATIVAR E TESTAR

1. Clique no ícone de power `⏻` ao lado do nome do fluxo
2. Status muda de **INATIVO** para **ATIVO**
3. Faça um **teste manual** com número de telefone de teste (nunca cliente real)
4. Verifique nos comentários do lead se as ações foram executadas
5. Confirme que o negócio foi criado/movido para a etapa correta
6. Confirme que o atendente foi atribuído em ambos: CRM e chat
7. Teste o caminho de fallback **deliberadamente** para validar que o lock é liberado
8. Aguarde 5 minutos e verifique se não há loop em execução

---

## 6.8 CONFIGURAÇÃO POR TIPO DE FLUXO

### FLUXO DE RECEPÇÃO (`message-received`)
```
□ instanceId no trigger → ID da instância WhatsApp
□ initializeSession → "only-if-finished-service"
□ Tag de lock → criar e substituir TAG_EM_PROCESSAMENTO
□ Pipeline e stages → criar etapas "Novo Lead", "Em Atendimento"
□ Atendentes no randomizer → substituir cada ATTENDANT_ID
□ instanceId em todos os blocos chat → mesmo ID do trigger
□ Horário comercial → startTime/endTime em UTC (BRT + 3h)
```

### FLUXO DE DISPARO (`manually-lead-trigger`)
```
□ Nenhum instanceId no trigger (é manual — não precisa)
□ URL do N8N ou sistema de disparo na api
□ Tag de bail-out → criar e substituir TAG_CONVERTIDO
□ Atendentes no randomizer → substituir por IDs reais
□ Lista de disparo → substituir LIST_ID
□ Delays variados por ramo (não usar mesmos valores em todos)
```

### FLUXO DE WEBHOOK (`json-http-request-trigger`)
```
□ Após importar: copiar URL do webhook gerada (fica no bloco trigger)
□ Configurar essa URL no sistema externo como destino
□ Mapear os campos do payload nos set-field-operation
□ Testar com payload de exemplo ANTES de ativar
□ Verificar se event_id é salvo para evitar processamento duplo
```

### FLUXO DE PÓS-VENDA (`business-won-trigger`)
```
□ pipelineId e stageId no trigger → pipeline específico de pós-venda
□ Atendente de pós-venda → ATEND_POSVENDAS_ID
□ Stages de progressão → criar no pipeline e substituir IDs
□ Tags de ciclo → criar e substituir todos os TAG_*
□ GESTOR_ID → ID do atendente para notificações de alerta
□ Verificar delays em dias → usar "days-delay" (não "hours-delay")
```

---

## 6.9 ERROS MAIS COMUNS NA IMPORTAÇÃO E CONFIGURAÇÃO

| Sintoma | Causa provável | Solução |
|---------|---------------|---------|
| Importação falha silenciosamente | `tenantId` ausente ou errado | Verificar e corrigir tenantId |
| Fluxo dispara mas não executa | Placeholder `"STAGE_ID"` não substituído | Buscar `_ID` no arquivo |
| Condition nunca ativa | Typo: `attendantsIds` vs `attendantIds` | Usar campo exato da spec |
| Loop infinito | `initializeSession: "always"` | Mudar para `"only-if-finished-service"` |
| Atendente não é trocado | Só usou `add-attendant-on-business` | Adicionar `change-conversation-attendant` |
| Telefone rejeitado pela API | Número sem DDI ou com formatação | Sempre usar `parse-phone` antes |
| IA responde ao lead sem querer | Usou `chat-assistant-ai` para extrair | Usar `chat-completion-llm-ai` |
| Randomizer não funciona | Soma != 100 | Recalcular — verificar com calculadora |
| Dados de datasource vazios | `receiveJson: false` no trigger | Mudar para `receiveJson: true` |
| Fluxo trava após falha de API | Sem `errorNextBlockId` | Adicionar fallback obrigatório |
| Lead duplicado criado | `create-lead` sem verificar existência | Verificar `lead-exists-condition` antes |
| Blocos sobrepostos no canvas | Espaçamento X < 520px | Usar grade: `coluna × 520px` |
| Mensagem enviada fora do horário | `time-interval-delay` não configurado | Adicionar verificação de horário |
| Horário comercial errado | Esqueceu somar +3h para UTC | UTC = BRT + 3h |
| Notificação não chega | `attendantsIds` vazio ou ID errado | Verificar ID do atendente gestor |
| Lock não liberado após erro | `remove-tag` ausente no caminho de erro | Adicionar em todos os caminhos de saída |

---

# PARTE VII — TEMPLATES JSON UNIVERSAIS

## TEMPLATE 01 — ESTRUTURA BASE DO ARQUIVO .DC

```json
{
  "id": "UUID_v4",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "name": "[CLIENTE] Nome Descritivo do Fluxo",
  "version": 1,
  "active": true,
  "notes": [],
  "tenantId": "TENANT_ID",
  "blocks": [...]
}
```

## TEMPLATE 02 — TRIGGER PADRÃO SEGURO

```json
{
  "id": "UUID",
  "type": "trigger",
  "sourceBlockId": null,
  "options": {
    "triggers": [{
      "name": "message-received-trigger",
      "group": "messages",
      "options": {
        "type": "contains",
        "keywords": [],
        "instanceId": "INSTANCE_ID",
        "listenGroup": false,
        "receiveJson": false,
        "datasourceName": "Message-1",
        "datasourceColor": "#3b82f6",
        "initializeSession": "only-if-finished-service"
      }
    }],
    "nextBlockId": "UUID_GATE"
  },
  "presentation": {"x": 0.0, "y": 0.0}
}
```

## TEMPLATE 03 — GATE ANTI-LOOP (coluna 1)

```json
{
  "id": "UUID_GATE",
  "type": "condition",
  "sourceBlockId": null,
  "options": {
    "conditions": [{
      "name": "lead-has-tag-condition",
      "group": "lead",
      "options": {"tagIds": ["TAG_ID_LOCK"]}
    }],
    "trueNextBlockId": "",
    "falseNextBlockId": "UUID_CHECK_OPTOUT"
  },
  "presentation": {"x": 520.0, "y": 0.0}
}
```

## TEMPLATE 04 — VALIDAÇÃO DE HORÁRIO COM DELAY REATIVO

```json
{
  "id": "UUID_COND_HORARIO",
  "type": "condition",
  "sourceBlockId": null,
  "options": {
    "conditions": [{
      "name": "current-time-interval-condition",
      "group": "time",
      "options": {
        "startTime": "1970-01-01T11:00:00.000Z",
        "endTime":   "1970-01-01T21:00:00.000Z",
        "timezone": "America/Sao_Paulo",
        "daysOfWeek": [1, 2, 3, 4, 5]
      }
    }],
    "trueNextBlockId":  "UUID_DENTRO_HORARIO",
    "falseNextBlockId": "UUID_DELAY_HORARIO"
  },
  "presentation": {"x": 2600.0, "y": 0.0}
},
{
  "id": "UUID_DELAY_HORARIO",
  "type": "delay",
  "sourceBlockId": null,
  "options": {
    "delay": {
      "name": "time-interval-delay",
      "options": {
        "startTime": "1970-01-01T11:00:00.000Z",
        "endTime":   "1970-01-01T21:00:00.000Z",
        "timezone": "America/Sao_Paulo",
        "daysOfWeek": [1, 2, 3, 4, 5]
      }
    },
    "nextBlockId": "UUID_DENTRO_HORARIO"
  },
  "presentation": {"x": 2600.0, "y": 600.0}
}
```

> **Layout:** Delay de horário na **mesma coluna** da condition (`x` idêntico), deslocado em `y+600`.

## TEMPLATE 05 — CRIAÇÃO SEGURA DE LEAD E NEGÓCIO

```json
{
  "id": "UUID_CHECK_LEAD",
  "type": "condition",
  "options": {
    "conditions": [{"name": "lead-exists-condition", "group": "lead", "options": {}}],
    "trueNextBlockId": "UUID_CHECK_NEGOCIO",
    "falseNextBlockId": "UUID_CRIA_TUDO"
  },
  "presentation": {"x": 3120.0, "y": 0.0}
},
{
  "id": "UUID_CRIA_TUDO",
  "type": "action",
  "options": {
    "actions": [
      {"name": "create-lead-action",    "group": "lead",     "stepId": "UUID", "options": {}},
      {"name": "create-business-action","group": "business", "stepId": "UUID", "options": {"stageId": "STAGE_ID"}},
      {"name": "add-tag-action",        "group": "lead",     "stepId": "UUID", "options": {"tagIds": ["TAG_NOVO_LEAD"]}}
    ],
    "nextBlockId": "UUID_DISTRIBUICAO"
  },
  "presentation": {"x": 3640.0, "y": -500.0}
},
{
  "id": "UUID_CHECK_NEGOCIO",
  "type": "condition",
  "options": {
    "conditions": [{"name": "lead-has-business-on-pipeline-condition", "group": "lead",
                    "options": {"pipelineId": "PIPELINE_ID"}}],
    "trueNextBlockId":  "UUID_DISTRIBUICAO",
    "falseNextBlockId": "UUID_CRIA_NEGOCIO"
  },
  "presentation": {"x": 3640.0, "y": 0.0}
}
```

## TEMPLATE 06 — RANDOMIZER COM ASSIGN DUPLO OBRIGATÓRIO

```json
{
  "id": "UUID_RAND",
  "type": "randomizer",
  "options": {
    "randomizers": [
      {"id": "UUID", "name": "A", "perc": 34, "nextBlockId": "UUID_ASSIGN_A"},
      {"id": "UUID", "name": "B", "perc": 33, "nextBlockId": "UUID_ASSIGN_B"},
      {"id": "UUID", "name": "C", "perc": 33, "nextBlockId": "UUID_ASSIGN_C"}
    ]
  },
  "presentation": {"x": 4160.0, "y": 0.0}
},
{
  "id": "UUID_ASSIGN_A",
  "type": "action",
  "options": {
    "actions": [
      {"name": "add-attendant-on-business-action", "group": "business", "stepId": "UUID",
       "options": {"attendantId": "ATEND_A_ID", "addSameAttendantToLead": true}},
      {"name": "change-conversation-attendant-action", "group": "messages", "stepId": "UUID",
       "options": {"type": "current-conversation", "instanceId": "", "attendantId": "ATEND_A_ID"}},
      {"name": "remove-tag-action", "group": "lead", "stepId": "UUID",
       "options": {"tagIds": ["TAG_LOCK"]}}
    ],
    "nextBlockId": "UUID_BOAS_VINDAS"
  },
  "presentation": {"x": 4680.0, "y": -600.0}
}
```

## TEMPLATE 07 — API COM RETRY E FALLBACK

```json
{
  "id": "UUID_API_1",
  "type": "api",
  "options": {
    "apis": [{"name": "json-http-request-api", "group": "http", "options": {
      "method": "POST",
      "url": "https://API_URL",
      "headers": [{"key": "Content-Type", "value": "application/json"}],
      "body": "{\"nome\": \"{Nome do lead|leadName}\"}",
      "datasourceName": "Api-request-1",
      "datasourceColor": "#22c55e"
    }}],
    "nextBlockId":      "UUID_SUCESSO",
    "errorNextBlockId": "UUID_RETRY_DELAY"
  },
  "presentation": {"x": 5200.0, "y": 0.0}
},
{
  "id": "UUID_RETRY_DELAY",
  "type": "delay",
  "options": {
    "delay": {"name": "seconds-delay", "options": {"seconds": 30}},
    "nextBlockId": "UUID_API_2"
  },
  "presentation": {"x": 5200.0, "y": 600.0}
},
{
  "id": "UUID_API_2",
  "type": "api",
  "options": {
    "apis": [{"name": "json-http-request-api", "group": "http", "options": {
      "method": "POST", "url": "https://API_URL",
      "headers": [{"key": "Content-Type", "value": "application/json"}],
      "body": "{}", "datasourceName": "Api-request-2", "datasourceColor": "#f97316"
    }}],
    "nextBlockId":      "UUID_SUCESSO",
    "errorNextBlockId": "UUID_FALLBACK_API"
  },
  "presentation": {"x": 5720.0, "y": 600.0}
},
{
  "id": "UUID_FALLBACK_API",
  "type": "action",
  "options": {
    "actions": [
      {"name": "add-tag-action", "group": "lead", "stepId": "UUID",
       "options": {"tagIds": ["TAG_API_FALHOU"]}},
      {"name": "add-lead-comment-action", "group": "lead", "stepId": "UUID",
       "options": {"comment": "ERRO: API falhou após 2 tentativas — verificar manualmente"}},
      {"name": "send-notification-action", "group": "system", "stepId": "UUID",
       "options": {"notification": "API falhou para {leadName} ({leadPhone})", "attendantsIds": ["GESTOR_ID"]}}
    ],
    "nextBlockId": "UUID_CONTINUA"
  },
  "presentation": {"x": 6240.0, "y": 600.0}
}
```

## TEMPLATE 08 — INPUT COM TIMEOUT

```json
{
  "id": "UUID_CHAT_INPUT",
  "type": "chat",
  "options": {
    "messages": [
      {"name": "delay-message", "group": "time", "stepId": "UUID", "options": {"seconds": 2}},
      {"name": "send-text-message", "group": "messages", "stepId": "UUID",
       "options": {"text": "Pergunta ao lead?", "buttons": [], "breakMessages": false}},
      {"name": "text-input-message", "group": "messages", "stepId": "UUID",
       "options": {
         "text": "",
         "parameter": "additional-field[resposta_lead]",
         "acceptMediaUrl": true,
         "timeoutWaitType": "hours",
         "timeoutInSeconds": 14400,
         "timeoutNextBlockId": "UUID_TIMEOUT_ACTION",
         "invalidResponseMessage": "Poderia repetir, por favor? 😊"
       }}
    ],
    "platform": "WHATSAPP",
    "provider": "EVOLUTION_API",
    "instanceId": "INSTANCE_ID",
    "nextBlockId":      "UUID_PROCESSA_RESPOSTA",
    "errorNextBlockId": "UUID_FALLBACK_UNLOCK"
  },
  "presentation": {"x": 5200.0, "y": 0.0}
},
{
  "id": "UUID_TIMEOUT_ACTION",
  "type": "action",
  "options": {
    "actions": [
      {"name": "add-tag-action", "group": "lead", "stepId": "UUID",
       "options": {"tagIds": ["TAG_SEM_RESPOSTA"]}},
      {"name": "add-lead-comment-action", "group": "lead", "stepId": "UUID",
       "options": {"comment": "Lead não respondeu — timeout de 4h"}}
    ],
    "nextBlockId": "UUID_RETOMADA_FUTURA"
  },
  "presentation": {"x": 5200.0, "y": 600.0}
}
```

## TEMPLATE 09 — BLOCO AI COMPLETO COM TODOS OS FALLBACKS

```json
{
  "id": "UUID_AI_PARAMS",
  "type": "ai",
  "options": {
    "ais": [{"name": "chat-parameters-ai", "group": "messages", "stepId": "UUID",
      "options": {
        "model": "Basic",
        "messagesQtd": 5,
        "datasourceName": "AI-params",
        "datasourceColor": "#f97316",
        "parameters": [
          {"id": "UUID", "parameter": "interesse", "type": "text",
           "description": "O que o lead quer comprar ou contratar",
           "example": "Automação de WhatsApp para imobiliária",
           "emptyBlockId": "UUID_FALLBACK_MANUAL"},
          {"id": "UUID", "parameter": "orcamento", "type": "text",
           "description": "Quanto o lead pode investir",
           "example": "Até R$ 1.000 por mês",
           "emptyBlockId": "UUID_FALLBACK_PARCIAL"}
        ]
      }
    }],
    "nextBlockId":      "UUID_AI_INTENT",
    "errorNextBlockId": "UUID_FALLBACK_MANUAL"
  },
  "presentation": {"x": 6240.0, "y": 0.0}
},
{
  "id": "UUID_AI_INTENT",
  "type": "ai",
  "options": {
    "ais": [{"name": "chat-intent-ai", "group": "messages", "stepId": "UUID",
      "options": {
        "model": "Basic",
        "messagesQtd": 5,
        "intentions": [
          {"id": "UUID", "intention": "Comprar",  "description": "...", "example": "...", "nextBlockId": "UUID_QUENTE"},
          {"id": "UUID", "intention": "Suporte",  "description": "...", "example": "...", "nextBlockId": "UUID_SUPORTE"},
          {"id": "UUID", "intention": "Orçamento","description": "...", "example": "...", "nextBlockId": "UUID_ORCAMENTO"}
        ],
        "noneNextBlockId": "UUID_FALLBACK_MANUAL"
      }
    }],
    "nextBlockId":      "UUID_FALLBACK_MANUAL",
    "errorNextBlockId": "UUID_FALLBACK_MANUAL"
  },
  "presentation": {"x": 6760.0, "y": 0.0}
}
```

## TEMPLATE 10 — BLOCO DE FINALIZAÇÃO / UNLOCK PADRÃO

```json
{
  "id": "UUID_FINALIZA",
  "type": "action",
  "options": {
    "actions": [
      {"name": "remove-tag-action", "group": "lead", "stepId": "UUID",
       "options": {"tagIds": ["TAG_LOCK"], "tagName": ""}},
      {"name": "add-tag-action", "group": "lead", "stepId": "UUID",
       "options": {"tagIds": ["TAG_CONCLUIDO"], "tagName": ""}},
      {"name": "add-lead-comment-action", "group": "lead", "stepId": "UUID",
       "options": {"comment": "✅ Fluxo concluído com sucesso"}}
    ],
    "nextBlockId": ""
  },
  "presentation": {"x": 9360.0, "y": 0.0}
},
{
  "id": "UUID_FALLBACK_UNLOCK",
  "type": "action",
  "options": {
    "actions": [
      {"name": "remove-tag-action", "group": "lead", "stepId": "UUID",
       "options": {"tagIds": ["TAG_LOCK"], "tagName": ""}},
      {"name": "add-lead-comment-action", "group": "lead", "stepId": "UUID",
       "options": {"comment": "⚠️ Fluxo encerrado via fallback — verificar"}}
    ],
    "nextBlockId": ""
  },
  "presentation": {"x": 9360.0, "y": 900.0}
}
```

---

# PARTE VIII — REFERÊNCIA RÁPIDA

## FÓRMULAS DE PERCENTUAL PARA RANDOMIZER

| N atend. | Percentuais | Soma |
|----------|-------------|------|
| 2 | 50/50 | 100 ✓ |
| 3 | 34/33/33 | 100 ✓ |
| 4 | 25/25/25/25 | 100 ✓ |
| 5 | 20/20/20/20/20 | 100 ✓ |
| 6 | 17/17/17/17/16/16 | 100 ✓ |
| 7 | 15/15/14/14/14/14/14 | 100 ✓ |
| 8 | 13/13/13/13/12/12/12/12 | 100 ✓ |
| 10 | 10×10 | 100 ✓ |
| 12 | 9/9/9/9/8/8/8/8/8/8/8/8 | 100 ✓ |

## HORÁRIOS UTC — FUSO BRASIL (UTC-3)

| Horário BRT | Horário UTC | Campo no bloco |
|-------------|-------------|----------------|
| 07:00 | 10:00 | `1970-01-01T10:00:00.000Z` |
| 08:00 | 11:00 | `1970-01-01T11:00:00.000Z` |
| 09:00 | 12:00 | `1970-01-01T12:00:00.000Z` |
| 12:00 | 15:00 | `1970-01-01T15:00:00.000Z` |
| 17:00 | 20:00 | `1970-01-01T20:00:00.000Z` |
| 18:00 | 21:00 | `1970-01-01T21:00:00.000Z` |
| 20:00 | 23:00 | `1970-01-01T23:00:00.000Z` |

`daysOfWeek`: 0=Dom · 1=Seg · 2=Ter · 3=Qua · 4=Qui · 5=Sex · 6=Sáb

## GRADE DE POSICIONAMENTO — RESUMO

```
STEP_X = 520px  (coluna × 520)
GAP_Y  = 500–600px (entre branches paralelas)

Y = 0      → caminho principal (happy path)
Y = -500   → branch positiva (SIM, aceito, promotor)
Y = -1000  → branch positiva extra
Y = +500   → branch negativa (NÃO, recusou, detrator)
Y = +1000  → branch negativa extra
Y = +900   → fallback/unlock — isolado ao final
```

## CHECKLIST PRÉ-DEPLOY (20 pontos)

```
ESTRUTURA
□ tenantId preenchido
□ instanceId em todos os triggers e chats
□ Nenhum placeholder — busca "_ID" retornou vazio

LÓGICA
□ nextBlockId correto em todos os blocos
□ trueNextBlockId E falseNextBlockId em todas as conditions
□ errorNextBlockId em todos os api e chat críticos
□ timeoutNextBlockId em todos os text-input-message
□ Soma perc = 100 em todos os randomizers

SEGURANÇA
□ Anti-loop gate no início
□ Lock (add-tag) E unlock (remove-tag) em todos os caminhos de saída
□ Horário comercial verificado antes de enviar mensagens
□ Parse de telefone antes de usar em API
□ conversation-automation-is-enabled verificado onde necessário

DADOS
□ stepId único em cada mensagem dentro de bloco chat
□ stepId único em cada operação dentro de field-operation
□ Campos nativos preenchidos antes de create-lead

LAYOUT
□ Blocos sem sobreposição — x = coluna × 520
□ Fallback em Y ≥ +900, fora do fluxo principal
□ Delay de horário: mesma coluna da condition, y+600
```

## ERROS MAIS COMUNS EM PRODUÇÃO

| Erro | Causa | Solução |
|------|-------|---------|
| Importação falha silenciosamente | `tenantId` ausente | Sempre verificar tenantId |
| Condition nunca ativa | `attendantsIds` vs `attendantIds` (typo) | Usar campo exato da spec |
| Loop infinito | `initializeSession: "always"` | Usar `"only-if-finished-service"` |
| Atendente não é alterado no chat | Só usou `add-attendant-on-business` | Usar ambas as actions |
| Telefone rejeitado pela API | Número sem DDI ou com formatação | Sempre usar `parse-phone` |
| IA responde ao lead indesejadamente | Usou `chat-assistant-ai` para extrair dado | Usar `chat-completion-llm-ai` |
| Randomizer não funciona | Soma != 100 | Verificar com calculadora |
| Dados de datasource vazios | `receiveJson: false` no trigger | Mudar para `true` |
| Fluxo trava após falha de API | Sem `errorNextBlockId` | Sempre configurar fallback |
| Lead duplicado | `create-lead` sem verificar existência | Verificar `lead-exists-condition` antes |
| Blocos sobrepostos no canvas | Espaçamento X < 520px | `x = coluna × 520` |
| Mensagem enviada fora do horário | `time-interval-delay` ausente | Adicionar verificação de horário |
| Horário comercial errado no delay | Esqueceu UTC = BRT + 3h | Somar 3h nos campos de horário |
| Lock não liberado após erro | `remove-tag` ausente no caminho de erro | Adicionar em **todos** os caminhos |
| `AUTOMATION_ID` inválido | Substituído antes de importar | Importar primeiro, depois substituir o ID |

---

*DATACRAZY AUTOMATION FRAMEWORK v4.0 — AD PRO Marketing & Automações*  
*Baseado em análise de 12 fluxos reais de produção — Fevereiro 2026*  
*Novidades: Sistema de layout com grade obrigatória · Guia de importação e configuração · Templates de fallback completos*
