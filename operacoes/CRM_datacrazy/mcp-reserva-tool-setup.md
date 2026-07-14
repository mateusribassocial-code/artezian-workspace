# MCP Server Tool — Captura de Dados de Reserva

## O que é

Automação no Datacrazy que expõe uma **tool via MCP** (`MCP Server Tool` — trigger nativo, disponível a partir da atualização de 2026 do Datacrazy). Um agente de IA — o assistente de conversa do Datacrazy ou qualquer cliente MCP externo conectado à conta — chama essa tool quando tiver coletado do hóspede/lead as três informações da reserva. A automação recebe os parâmetros e grava nos campos adicionais do lead.

Diferente das integrações existentes (`stays-proxy.gs`, `midia-sheets.gs`), aqui **não há servidor externo** — o Datacrazy é o próprio MCP server. Tudo é configurado dentro do editor visual de automações.

---

## Pré-requisito

Os 3 campos adicionais já devem existir em **Configurações → Campos Adicionais**:
- `Data de Check-in`
- `Data de Check-Out`
- `Hospedes Total`

---

## Passo 1 — Criar a automação com o trigger MCP Server Tool

1. **Automações → Nova automação**
2. Adicionar gatilho → **MCP Server Tool**
3. Preencher:

| Campo | Valor |
|-------|-------|
| Nome da tool | `salvar_dados_reserva` |
| Descrição da tool | `Salva a data de check-in, data de check-out e a quantidade total de hóspedes informadas pelo lead durante a conversa. Chame assim que as três informações estiverem confirmadas.` |
| Parâmetro de sessão | **Lead** — o MCP client passa `leadId` como parâmetro obrigatório, identificando automaticamente qual lead a automação deve atualizar |

> A descrição da tool é o que o agente de IA lê pra decidir quando chamar — quanto mais específica, menor a chance de chamada fora de hora ou com dado incompleto.

---

## Passo 2 — Adicionar os 3 parâmetros da tool

Clicar em **Adicionar parâmetro** três vezes:

| Nome do parâmetro | Descrição do parâmetro | Tipo | Obrigatório |
|--------------------|------------------------|------|-------------|
| `checkin` | Data de check-in desejada pelo hóspede | Date | ✅ |
| `checkout` | Data de check-out desejada pelo hóspede | Date | ✅ |
| `hospedes` | Quantidade total de hóspedes da reserva (adultos + crianças) | Number | ✅ |

Esses valores ficam disponíveis no fluxo pela fonte de dados de entrada (`Api-request-1`, ou o nome que aparecer no bloco).

---

## Passo 3 — Gravar nos campos adicionais

Depois do trigger, adicionar um bloco **field-operation** com 3 operações `set-field-operation`, uma por campo:

| Campo de destino (dropdown) | Valor |
|------------------------------|-------|
| `Data de Check-in` | `{checkin\|[Api-request-1]checkin}` |
| `Data de Check-Out` | `{checkout\|[Api-request-1]checkout}` |
| `Hospedes Total` | `{hospedes\|[Api-request-1]hospedes}` |

> Selecionar o campo pelo nome no dropdown do bloco (não digitar manualmente) — evita erro de digitação/acentuação divergente do campo cadastrado.

---

## Passo 4 — Rastreabilidade (recomendado)

Seguindo o padrão de observabilidade do restante das automações da Artezian, adicionar uma `action` → `add-lead-comment-action` logo depois da gravação:

```
"[timestamp] Dados de reserva capturados via MCP — checkin: {checkin}, checkout: {checkout}, hóspedes: {hospedes}"
```

Isso cria histórico no lead e facilita debug se algum dado vier errado.

---

## Passo 5 — Testar

1. Salvar o fluxo, mas **não ativar direto em produção** — testar antes.
2. Simular a chamada da tool (via um lead de teste) e conferir:
   - Se os 3 campos adicionais foram preenchidos corretamente no lead
   - Se o formato da data gravada é o esperado (o tipo `Date` do parâmetro deve vir formatado — validar no teste, já que não há documentação prévia de como o Datacrazy serializa esse tipo antes da v-MCP)
3. Ativar só depois de confirmar.

---

## Pendências a validar durante a configuração real

Duas coisas que não dá pra confirmar sem estar dentro do editor Datacrazy — ajustar este guia depois de testar:

- **Resposta ao agente de IA:** não está claro se o fluxo precisa de um bloco de retorno explícito pra avisar sucesso à tool MCP, ou se terminar o fluxo (`nextBlockId` vazio) já responde sucesso automaticamente. Se aparecer algum bloco de "resposta"/"retorno" ao montar o fluxo, documentar aqui.
- **Formato da data recebida:** confirmar se o tipo `Date` do parâmetro chega como `AAAA-MM-DD`, ISO 8601 completo, ou timestamp — pode ser necessário um `parse-date-field-operation` antes de gravar, caso o campo adicional espere um formato específico.
