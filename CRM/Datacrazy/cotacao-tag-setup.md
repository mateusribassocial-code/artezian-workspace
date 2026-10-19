# Automação — Cotação por tag COTAÇÃO

## O que é

Substitui o **Art Mendonça 3** ("Art Pro Max"), o agente de IA que consultava vaga e preço na Stays. A cotação passa a ser uma automação sem LLM:

```
Art Pré-Atendimento (prompt v11)
  └─ lead escolheu imóvel + datas preenchidas
       ├─ grava Imovel-Cotacao, Data de Check-in, Data de Check-Out, Hospede-Total
       └─ adiciona a tag COTAÇÃO
            ↓
Automação "Cotação por tag" (este documento)
  tag COTAÇÃO → espera 10s → JavaScript (Stays) → Mensagem pro lead
  → remove tag → anotação → transfere pro Mateus
```

**Por que sem agente:** nenhum valor passa por IA. Diária e total saem da Stays direto pro WhatsApp, então não tem como sair valor inventado, resumido errado ou cotação de imóvel que não foi escolhido. Também acaba o timeout que o agente tinha em janela cheia (Réveillon).

| Arquivo | Papel |
|---|---|
| `cotacao-tag-stays.js` | Bloco JavaScript da automação |
| `../Atendimento IA/agentes/Agente 2 - Produtos/PROMPT-ART2-apresentacao-v11.md` | Prompt do Art Pré com coleta de datas e tag |
| `mcp-consulta-disp-stays-setup.md` | Referência das regras de disponibilidade da Stays (as mesmas usadas aqui) |

---

## Passo 0 — Pré-requisitos (Configurações)

1. **Tag** `COTAÇÃO` (Configurações → Tags).
2. **Campos adicionais** (Configurações → Campos Adicionais), escopo **Lead**:

| Campo | Tipo | Quem preenche |
|---|---|---|
| `Imovel-Cotacao` | Texto | Art Pré (código da TABELA, ex.: `DS04J` ou `DS04J, JR05J`) |
| `resposta_cotacao` | Texto | Bloco JS (mensagem que vai pro lead) |
| `erro_stays` | Texto | Bloco JS (detalhe técnico, nunca enviado). Já existe por causa do MCP1-Stays. Se ele estiver com escopo Conversa, criar um com escopo Lead. |

3. **Conferir os nomes dos campos de data e hóspedes.** O JS tenta os dois nomes que aparecem no projeto, nesta ordem:
   - check-in: `Data de Check-in` → `Data-Check-in`
   - check-out: `Data de Check-Out` → `Data-Check-out`
   - hóspedes: `Hospedes Total` → `Hospede-Total`

   Se o nome real na conta for outro, ajustar a constante `CAMPOS` no topo do JS **e** o texto do prompt v11.

---

## Passo 1 — Criar a automação

Automações → Nova automação → nome **"Cotação por tag"**.

| # | Bloco | Configuração |
|---|---|---|
| 1 | Gatilho **Tag adicionada** (`lead-tag-added-trigger`) | Tag: `COTAÇÃO` |
| 2 | Delay **Segundos** (`seconds-delay`) | `10`. Dá tempo do Art Pré terminar de gravar os campos: ele grava tudo e põe a tag por último, mas as ações do agente não têm garantia de ordem. |
| 3 | **JavaScript** | Colar o conteúdo de `cotacao-tag-stays.js` inteiro. Datasource: `Javascript-1`. |
| 4 | **Mensagem** (texto) | `{resposta_cotacao}`, ou selecionar o campo adicional pelo dropdown. **Rota de erro** (`errorNextBlockId`) → bloco 4b. |
| 4b | Notificação (`send-notification-action`) | Pra Mateus: "Cotação de {leadName} não foi enviada pelo WhatsApp. Ver erro_stays." Depois segue pro bloco 5. |
| 5 | **Remover tag** (`remove-tag-action`) | `COTAÇÃO`. Remover em **todos** os caminhos, senão uma nova cotação pro mesmo lead não dispara. |
| 6 | **Anotação** (`add-lead-comment-action`) | `Cotação automática: {status\|[Javascript-1]status} — Imóvel: {imovel\|[Javascript-1]imovel} — Erro: {erro_stays}`. O imóvel vem do datasource, não do campo: o JS limpa `Imovel-Cotacao` depois de cada cotação. |
| 7 | **Adicionar atendente no negócio** (`add-attendant-on-business-action`) | Mateus Ribas |
| 8 | **Trocar atendente da conversa** (`change-conversation-attendant-action`) | Mateus Ribas. Os blocos 7 e 8 vão **sempre juntos** (regra do framework): só um deles deixa CRM e chat inconsistentes. |

O JS devolve `status` no datasource `Javascript-1`:

| status | O que o lead recebe |
|---|---|
| `cotado` | Período, e pra cada imóvel livre: nome, diária e total. Se algum dos escolhidos estiver ocupado, uma linha avisando. Fecha com "O Mateus segue com vc daqui pra fechar 💙". |
| `alternativas` | O imóvel escolhido está ocupado: "Poxa, [imóvel] já tá reservado nessas datas 😕", o período, "Mas essas tão livres:" e até 3 outros imóveis livres pro mesmo nº de pessoas (ver seção abaixo), com diária e total. Fecha com a passagem pro Mateus. |
| `indisponivel` | "Poxa, [imóvel] já tá reservado de DD/MM a DD/MM 😕 O Mateus vai ver com vc outras opções pra essas datas 💙". Sai quando **todos** os escolhidos estão ocupados e não há nenhum outro imóvel livre pro grupo, ou quando `Hospede-Total` está vazio e não dá pra buscar alternativas. |
| `falha` | "Vou pedir pro Mateus te passar os valores certinhos dessas datas, ele já segue com vc por aqui 💙". Cobre API fora, data faltando ou no passado, imóvel fora da Stays (HA02J, GF04J, GF06J) e regra de preço que não cobre o período. O motivo fica em `erro_stays`. |

### Sem imóvel escolhido, ou escolhido ocupado: cotação por hóspedes e datas

A mesma busca roda em dois casos:
- `Imovel-Cotacao` chegou vazio (status `cotado`).
- Todos os imóveis escolhidos estão ocupados nas datas (status `alternativas`). A busca deixa de fora os escolhidos. Se um escolhido estiver livre e outro ocupado, cota só o livre e não busca alternativas.

Como funciona: Ele percorre a `TABELA` (mesma ordem de prioridade e capacidade da tabela do Art Pré), pega só os imóveis que comportam o grupo e cota os **3 primeiros livres** nas datas. Evita repetir condomínio enquanto houver opção de outro, a mesma regra da apresentação.

- Mensagem: período, "Essas tão livres nessas datas:", os blocos com diária e total, e a passagem pro Mateus. Imóvel ocupado não aparece.
- Nenhum livre: "Poxa, de DD/MM a DD/MM não tenho vaga pra N pessoas 😕 O Mateus vai ver com vc outras possibilidades 💙" (`indisponivel`).
- Sem `Hospede-Total`, ou grupo maior que todos os imóveis (hoje, mais de 28): `falha`. Não dá pra chutar a capacidade.
- Custo: cada imóvel conferido gera 1 chamada de listing, mais 1 de preço se estiver livre. No pior caso (tudo ocupado pra 2 pessoas) são 12 imóveis, então 13 chamadas com a de ocupação.

`TABELA`, `CODIGOS`, `APELIDOS` e `NOMES` no topo do JS precisam acompanhar a TABELA do prompt.

Falha técnica **nunca** vira "sem vaga": uma queda da API faria o lead desistir de uma data que pode estar livre.

---

## Passo 2 — Trocar o prompt do Art Pré

Colar o `PROMPT-ART2-apresentacao-v11.md` no agente Art Pré-Atendimento. O que mudou em relação ao v10:

- Depois que o lead escolhe o imóvel, pergunta as datas (se não estiverem nos campos).
- Em vez de transferir pro Art Mendonça 3, grava `Imovel-Cotacao` e as datas, adiciona ao carrinho, anota e por último adiciona a tag `COTAÇÃO`.
- Depois da tag ele não escreve mais nada.
- Conferir no editor do agente se ele tem permissão pra **adicionar tag** e **preencher campo adicional** (ele já preenche `Hospede-Total`).

---

## Passo 3 — Desligar o Art Mendonça 3

Só depois do teste do Passo 4 passar:

1. Na automação que invoca o Art Mendonça 3 (`unidades_apresentadas` → **IA - Invocar Agente**), remover o bloco de invocação ou desativar a automação.
2. Desativar o agente **Art Mendonça 3**.
3. Desativar a automação **MCP1-Stays** (`Consultar_disp_stays`). Ninguém mais chama essa tool. Manter `mcp-consulta-disp-stays.js` no repositório como referência.

---

## Passo 4 — Testar antes de ativar

Com um lead de teste (o próprio WhatsApp do Mateus):

1. Preencher na mão: `Imovel-Cotacao` = `DS04J`, check-in e check-out daqui a 2 meses, hóspedes = 2.
2. Adicionar a tag `COTAÇÃO` manualmente.
3. Conferir:
   - [ ] A mensagem chegou no WhatsApp, com valor igual ao do painel da Stays pra mesma data.
   - [ ] A tag saiu do lead.
   - [ ] A anotação foi criada com `status`.
   - [ ] A conversa e o negócio ficaram com o Mateus, e o Art Pré parou de responder.
4. Repetir com uma data em que o imóvel está reservado (deve sair a mensagem de "já tá reservado").
5. Repetir com `Imovel-Cotacao` = `GF04J` (deve sair a mensagem de falha e `erro_stays` preenchido).
6. Repetir com `Imovel-Cotacao` **vazio** e hóspedes = 2: devem vir até 3 imóveis livres de condomínios diferentes. Conferir os valores no painel da Stays.
7. Repetir com um imóvel **ocupado** nas datas e hóspedes preenchido: deve vir o aviso de reservado e outros imóveis livres pro grupo, sem o escolhido.
8. Teste ponta a ponta: conversar com o Art Pré do zero até escolher um imóvel, e conferir se ele pergunta as datas e põe a tag sozinho.

---

## Pendências a validar na configuração real

- **`await` nos campos:** o JS lê os campos com `.then()`, porque `await session.getAdditionalValue` quebrou no `resumo_lead_site`. Se der erro no bloco, ver o histórico em `mcp-resumo-lead-setup.md`.
- **Escopo do `setAdditionalValue` com gatilho de tag:** no MCP1-Stays a sessão era a Conversa. Com gatilho de tag a sessão é o Lead. Confirmar que `resposta_cotacao` grava e que o bloco de Mensagem acha a conversa do lead pra enviar.
- **Troca de atendente desliga o agente?** Confirmar que, com a conversa transferida pro Mateus, o Art Pré para de responder. Se não parar, adicionar a ação de desativar a IA na conversa antes do bloco 7.
- **Mapa de imóveis manual:** `TABELA`, `CODIGOS`, `APELIDOS` e `NOMES` no JS precisam acompanhar a TABELA do prompt. Imóvel novo na Stays = adicionar nos quatro.
- **`setAdditionalValue("Imovel-Cotacao", "")` limpa o campo?** Confirmar no teste que o campo fica vazio depois da cotação (e não com o texto antigo).
