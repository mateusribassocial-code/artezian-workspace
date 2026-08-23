# MCP Server Tool — Resumo do Lead (dados do site)

## O que é

Tool nativa do Datacrazy (trigger **MCP Server Tool**) que o **Art Mendonça 2** — hoje o primeiro
agente do funil, já que o Art Mendonça 1 foi removido — chama assim que uma conversa começa, antes
de perguntar qualquer coisa ao lead. Ela lê os dados que o site já entregou via HTTP Request (nome,
e-mail, telefone, check-in, check-out, hóspedes — hoje já gravados nos campos do lead, conforme
confirmado) e devolve um resumo pronto. Objetivo: parar de repetir pro lead perguntas que ele já
respondeu no formulário do site, e deixar o próprio Art Mendonça 2 seguir direto pra apresentação
de produtos (ele já tem a lógica de encaixe — essa tool só evita repetir a coleta de dados).

Como o Art Mendonça 1 foi removido, **não há mais handoff entre agentes nesse ponto** — é o mesmo
agente que chama a tool, recebe o resumo e continua a conversa. `mcp-handoff-agentes-setup.md`
ficou desatualizado nesse trecho (a cadeia de 3 agentes não reflete mais a estrutura atual) e
precisa de revisão à parte.

Segue o mesmo padrão das outras tools deste projeto: **não existe retorno estruturado pro agente
que chamou** (confirmado em `mcp-reserva-tool-setup.md` e `mcp-consulta-disp-stays-setup.md`) — a
automação responde a conversa diretamente via bloco de Mensagem. Por isso o fluxo abaixo trata os
dois cenários (dados completos / incompletos) dentro da própria automação, garantindo que o lead
sempre recebe uma resposta nesse primeiro turno.

---

## Pré-requisito

Os campos abaixo já devem existir no lead:
- **Nativos:** Nome, E-mail, Telefone (campos padrão do Datacrazy, preenchidos pelo HTTP Request do site)
- **Adicionais** (mesmos de `mcp-reserva-tool-setup.md`): `Data de Check-in`, `Data de Check-Out`, `Hospedes Total`

Se o site também grava esses três campos adicionais direto (e não só via conversa com o Art), ótimo — é exatamente esse cenário que essa tool foi pensada pra aproveitar.

---

## Passo 1 — Criar a automação com o trigger MCP Server Tool

1. **Automações → Nova automação**
2. Adicionar gatilho → **MCP Server Tool**
3. Preencher:

| Campo | Valor |
|-------|-------|
| Nome da tool | `resumo_lead_site` |
| Descrição da tool | `Chame essa tool como primeira ação de toda conversa nova, antes de escrever qualquer mensagem. Ela verifica se o lead já chegou com dados do site (nome, e-mail, telefone, check-in, check-out, hóspedes) e responde ao lead diretamente — com o resumo e a próxima etapa, se os dados já estiverem completos, ou com a saudação padrão pedindo o que falta, se não estiverem. Não escreva uma mensagem sua nesse turno depois de chamar essa tool.` |
| Parâmetro de sessão | **Lead** |

> A tool não precisa de nenhum dado que o Art extraia da conversa — ela só lê o que já está gravado no lead. Se o editor do Datacrazy exigir pelo menos um parâmetro, criar um opcional `origem` (String, não obrigatório, "de onde a conversa começou, se o Art souber") só pra satisfazer a exigência — sem uso real no bloco JS abaixo.

---

## Passo 2 — Bloco JavaScript (lê o lead e monta o resumo)

> **Acessor confirmado:** o editor do Datacrazy expõe uma API assíncrona nativa em `session`
> (ver caixa "Documentação & Exemplos" do bloco JS): `await session.getValue(name)` pra campos
> nativos do lead e `await session.getAdditionalValue(name)` pra campos adicionais. Os nomes
> padrão de campos nativos são `leadName`, `leadEmail`, `leadPhone`, `leadCompany` (ver
> "Parâmetros Comuns" na mesma caixa). `session.lead` (usado nas duas tentativas anteriores) não
> existe — por isso os testes anteriores falhavam.

```js
function formatarData(iso) {
  if (!iso) return "";
  var partes = String(iso).split("T")[0].split("-"); // "2026-12-30T12:00:00.000Z" -> ["2026","12","30"]
  if (partes.length !== 3) return String(iso);
  return partes[2] + "-" + partes[1] + "-" + partes[0]; // "30-12-2026"
}

return Promise.all([
  session.getValue("leadName"),
  session.getValue("leadEmail"),
  session.getValue("leadPhone"),
  session.getAdditionalValue("Data de Check-in"),
  session.getAdditionalValue("Data de Check-Out"),
  session.getAdditionalValue("Hospedes Total")
]).then(function (results) {
  var leadName  = results[0] || "";
  var leadEmail = results[1] || "";
  var leadPhone = results[2] || "";
  var checkin   = results[3] || "";
  var checkout  = results[4] || "";
  var hospedes  = results[5] || "";

  var checkinFmt  = formatarData(checkin);
  var checkoutFmt = formatarData(checkout);

  var dadosCompletos = !!(checkin && checkout && hospedes);

  var noitesTexto = "";
  if (checkin && checkout) {
    var d = Math.round((new Date(checkout) - new Date(checkin)) / 86400000);
    if (d > 0) {
      noitesTexto = " (" + d + " noites)";
    }
  }

  var saudacaoNome = leadName ? (", " + leadName) : "";

  var resumo_lead = "";
  if (dadosCompletos) {
    resumo_lead =
      (leadName || "Lead") + " · " +
      (leadEmail || "sem e-mail") + " · " +
      (leadPhone || "sem telefone") + "\n" +
      "Check-in: " + checkinFmt + " -> Check-out: " + checkoutFmt + noitesTexto + "\n" +
      "Hospedes: " + hospedes;
  }

  // Mensagem que o Art "manda" no lugar da automação (ver nota sobre retorno não-estruturado)
  var mensagem_resposta = "";
  if (dadosCompletos) {
    mensagem_resposta =
      "Oi" + saudacaoNome + "! Eu sou o Art vi aqui que vc ja deixou os dados no site - " +
      hospedes + " pessoa(s), de " + checkinFmt + " a " + checkoutFmt + ". Vou ja separar as opcoes que encaixam pra vc!";
  } else {
    mensagem_resposta = "Oi! Eu sou o Art me fala: quando vc pretende vir e com quantas pessoas?";
  }

  return { resumo_lead: resumo_lead, mensagem_resposta: mensagem_resposta, dados_completos: dadosCompletos };
});
```

> **Histórico dos bugs anteriores:** a v1 usava `session.lead` (inexistente) com template literals
> aninhados e optional chaining, e quebrava com `Unexpected identifier '$'`. A v2 trocou pra
> concatenação com `+` (removendo crase e `?.`), mas manteve `session.lead` — daí o erro virou
> `"" is not a function`. A v3 trocou pra API documentada (`session.getValue` / `getAdditionalValue`)
> com `await`, e voltou a dar `"" is not a function"` — indício de bug no engine ao resolver `await`
> nessas chamadas específicas. Um diagnóstico confirmou que `getValue`/`getAdditionalValue` **existem**
> e retornam Promise de verdade (testado sem `await`: rodou sem erro). A v4 (sem `await`, chamando
> as funções cru) rodou sem erro mas devolveu `[object Promise]` na mensagem final — confirmando que
> as Promises nunca eram resolvidas. A v5 (`.then()` puro em vez de `await`) **funcionou de ponta a
> ponta** — testado com o lead "Gabriela Cunha Melo de Souza", tool disparou, mensagem chegou certa
> com nome/hóspedes/datas, só faltava formatar a data. A v6 adicionava `formatarData()` pra extrair
> dia/mês/ano da string ISO por split (não usa `Date.getDate()`/`getMonth()` pra evitar risco de
> virada de dia por fuso horário do servidor), mas exibia `DD/MM/AAAA` (barra) — e a automação em
> produção acabou publicada sem esse `formatarData()` (mensagem real ao lead saiu com o ISO cru,
> `2026-10-13T12:00:00.000Z`, confirmado no atendimento #16038 da Rosangela). A v7 acima (atual)
> reaplica `formatarData()` e troca o separador pra `-`, exibindo `DD-MM-YYYY` em vez do ISO completo.

---

## Passo 3 — Gravar o resumo no lead (rastreabilidade)

Bloco **field-operation** → `set-field-operation`:

| Campo de destino | Valor |
|---|---|
| `Resumo Lead Site` *(criar esse campo adicional se não existir — tipo texto longo)* | `{resumo_lead|[Api-request-1]resumo_lead}` |

Depois, `add-lead-comment-action`:
```
"[timestamp] Resumo gerado via MCP resumo_lead_site — dados completos: {dados_completos}. {resumo_lead}"
```

---

## Passo 4 — Mensagem de resposta

Bloco de **Mensagem → Mensagem de texto**, conteúdo `{mensagem_resposta}`, enviada pro WhatsApp do lead (mesmo padrão de `Consultar_disp_stays`).

---

## Passo 5 — Testar

1. Salvar sem ativar em produção.
2. Simular com um lead de teste **com** os 3 campos preenchidos (dados vindos do site) — conferir se:
   - A mensagem de abertura já reconhece nome/datas/hóspedes sem perguntar de novo
   - O campo `Resumo Lead Site` foi gravado
   - O Art Mendonça 2 segue naturalmente pra apresentação de produtos no próximo turno (usando os dados já no lead), sem repetir perguntas
3. Simular com um lead de teste **sem** os campos preenchidos (lead orgânico via Instagram/WhatsApp) — conferir se a saudação padrão pedindo os dados ainda funciona normalmente.
4. Só ativar depois de confirmar os dois cenários.

---

## Pendências a validar durante a configuração real

- ~~**Acessor do lead no JS:**~~ **Resolvido** — confirmado via caixa de documentação do próprio editor: `session.getValue(name)` (nativos) e `session.getAdditionalValue(name)` (adicionais), consumidos com `.then()` (ver nota de histórico de bugs no bloco JS — `await` direto quebrava nesse engine).
- ~~**Nomes exatos dos campos adicionais:**~~ **Resolvido** — `"Data de Check-in"`, `"Data de Check-Out"` e `"Hospedes Total"` batem certo; testado com o lead "Gabriela Cunha Melo de Souza" e os valores vieram preenchidos.
- ~~**Formato das datas:**~~ **Resolvido** — chegam como ISO 8601 completo (`AAAA-MM-DDT12:00:00.000Z`), não `AAAA-MM-DD` puro. O bloco JS acima trata isso com `formatarData()`, extraindo dia/mês/ano por split de string (evita risco de virada de dia por fuso horário) e exibindo `DD-MM-YYYY`. **Atenção ao republicar a automação no Datacrazy:** confirmar visualmente na tela do editor que o `formatarData()` está mesmo no bloco salvo — a v6 documentada aqui tinha o fix, mas foi ao ar sem ele (ver histórico de bugs acima), então o "está no .md" não bastou como garantia.
- **Datacrazy exige parâmetro obrigatório?** confirmar se uma MCP Server Tool sem nenhum parâmetro é aceita, ou se precisa do parâmetro dummy `origem` sugerido no Passo 1.
- **Art não deve mandar mensagem própria nesse turno** — a instrução está na descrição da tool (Passo 1), mas isso depende do Art realmente obedecer "não escreva depois de chamar a tool". Validar em teste real se não sai mensagem duplicada (a da automação + uma do Art).
