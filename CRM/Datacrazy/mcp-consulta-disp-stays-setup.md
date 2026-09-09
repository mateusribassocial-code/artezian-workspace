# MCP Server Tool — Consultar_disp_stays

## O que é
Tool nativa do Datacrazy (trigger **MCP Server Tool**) que um Agente de IA chama quando o lead pergunta sobre disponibilidade, preço, diária ou valor de uma hospedagem. Diferente do `stays-proxy.gs`, aqui a automação chama a API do Stays **direto** dentro de um bloco JavaScript — não passa por Apps Script.

## Configuração do trigger

| Campo | Valor |
|---|---|
| Nome da tool | `Consultar_disp_stays` |
| Descrição | Consulta disponibilidade e preço de um imóvel na Stays. Use quando o cliente perguntar sobre disponibilidade, preço, diária ou valor de uma hospedagem. Requer: imovel (ID do imóvel), checkin (YYYY-MM-DD), checkout (YYYY-MM-DD), hospedes (número). |
| Parâmetro de sessão | Conversa |
| Fonte de dados de entrada | `MCP1-Stays` |

**Parâmetros:**
| Nome | Tipo |
|---|---|
| Nome do Imóvel | string |
| imovel | string |
| checkin | string |
| checkout | string |
| hospedes | number |

Fluxo: **MCP Server Tool** → bloco **JavaScript** (abaixo) → bloco de **Mensagem** que envia `resposta_stays` pro WhatsApp do lead (mesmo padrão do `mcp-handoff-agentes-setup.md` / `MCP1-Stays` em produção).

## ⚠️ O que torna um período indisponível na Stays (e como o bloco checa)

`booking/calculate-price` **não olha o calendário**: calcula a tarifa da regra de preço e devolve total mesmo com o imóvel reservado ou bloqueado (confirmado em teste direto, 2026-08-23 — Studio do João `DS03J` tinha reserva de 07/09 a 11/09 e uma consulta de 10/09 a 13/09 retornou preço normalmente).

Por isso o bloco **sempre** cruza com `booking/reservations` antes de cotar. Quatro detalhes dessa chamada, todos testados na API real:

1. **Os 5 tipos que bloqueiam** — `type=booked&type=reserved&type=blocked&type=contract&type=maintenance`, parâmetro repetido (não lista separada por vírgula). A API aceita exatamente 6 valores: `reserved, booked, contract, blocked, maintenance, canceled` (confirmado 2026-09-08 pela mensagem de erro do próprio endpoint ao receber um valor inválido). `canceled` é o único que **não** deve entrar — reserva cancelada libera o calendário. Sem passar `type` nenhum, a API devolve só `booked`/`reserved` e esconde todo o resto.
2. **Paginação com `skip`** — `limit=100` é o máximo aceito (`limit=500` dá erro `must be <= 100`) e o default é 20, truncando em silêncio. Confirmado 2026-09-08: a janela 01/09→31/12 tem 121 registros e `limit=100` devolveu 100, cortando justamente as datas do começo de setembro (a ordenação não é cronológica, então não dá pra prever o que some). O bloco pagina com `skip` até a página vir incompleta.
3. **`dateType=included`** — pega reserva/bloqueio que se sobrepõe ao período pedido, inclusive quando o bloqueio **engloba** a janela inteira (testado 2026-09-08: bloqueio de 01/10 a 16/10 aparece numa consulta de 05/10 a 08/10). Continua correto.
4. **A janela vai com margem de 3 dias** de cada lado, porque a sobreposição real é decidida no JS (seção abaixo), não pela API.

### Sobreposição é calculada no JS, não confiada à API

A API devolve como "incluída" também a reserva que apenas **encosta** na janela. Confirmado 2026-09-08: a reserva de 07/12 a 20/12 do `DS03J` é retornada tanto numa consulta de 20/12→23/12 quanto numa de 04/12→07/12 — e as duas estão **livres** (é troca de hóspede no mesmo dia). Confiar direto no retorno da API fazia o agente responder "Produto Indisponível" em data vaga, perdendo reserva.

A regra correta, aplicada no bloco: um registro só bloqueia se `inicio < checkout && fim > checkin`.

### Buffer de faxina (`PreparationBlocking`)

Cada reserva traz `beforeCheckInPreparationBlocking` e `afterCheckOutPreparationBlocking` (`{active, _i_days}`). Quando ativos, o calendário fica bloqueado **além** das datas de check-in/check-out da reserva. Hoje há registros com 1 dia ativo dos dois lados (confirmado 2026-09-08). O bloco expande o período ocupado por esses dias antes de comparar — sem isso, o dia seguinte a um check-out com faxina de 1 dia seria oferecido como vago.

### Falha sempre fecha, nunca abre

Qualquer erro (rede, API fora, resposta em formato inesperado) aborta com mensagem de erro. **Nunca** cai pro `calculate-price` sem ter confirmado o calendário, e nunca trata resposta estranha como "livre". Erros de parâmetro na API retornam HTTP 400 (confirmado), então `staysFetch` lança e o fluxo para.

Quando o período está indisponível — por ocupação real ou por `calculate-price` vindo vazio — a resposta ao lead é sempre o texto fixo **"Produto Indisponível"**.

## O que atualiza automático vs manual

- **Automático (puxa ao vivo da API do Stays a cada chamada):** diária, disponibilidade real (`booking/reservations`), preço/taxas (`booking/calculate-price`), nome do imóvel e nº de quartos (`content/listings/{id}`). Mudar tarifa no painel do Stays já reflete na próxima pergunta do lead — não precisa mexer nesse bloco.
- **Manual (hardcoded no bloco JS, não atualiza sozinho):**
  - `IMOVEIS` — mapa de apelido/nome digitado pelo lead → código do imóvel no Stays.
  - Precisa editar esse bloco sempre que um imóvel entrar/sair do catálogo ou mudar de apelido.

### Vídeo e fotos não saem daqui

Este bloco responde **só** disponibilidade e preço. O envio de mídia é de outra automação, `midia-imovel.js` (fonte de dados `Api-request-1`), que grava `video_link` e `foto_1`..`foto_5`. Se a automação `MCP1-Stays` ainda tiver um bloco de Mensagem que envia `video_link`, ele precisa ser removido no painel do Datacrazy — este bloco não escreve mais nesse campo, então o que sobrasse ali seria um valor velho deixado pelo fluxo de mídia.

## Bloco JavaScript (versão atual — 2026-09-09)

```js
const IMOVEIS = {
  "studio joão": "DS03J", "studio do joão": "DS03J", "ds03j": "DS03J",
  "flat da mari": "DS04J", "flat mari": "DS04J", "ds04j": "DS04J",
  "apartamento emanoel": "DS05J", "apto emanoel": "DS05J", "ds05j": "DS05J",
  "apto do reinaldo mi": "FL10J", "apto reinaldo": "FL10J", "fl10j": "FL10J",
  "apartamento do reinaldo ji": "GC01J", "gc01j": "GC01J",
  "flat da joyce": "HA03J", "flat joyce": "HA03J", "ha03j": "HA03J",
  "casa do tremura": "GF02J", "casa tremura": "GF02J", "gf02j": "GF02J",
  "casa do john": "GG08J", "casa john": "GG08J", "gg08j": "GG08J",
  "vp-01": "JR01J", "jr01j": "JR01J", "vp-03": "JR03J", "jr03j": "JR03J",
  "vp-04": "JR04J", "jr04j": "JR04J", "vp-05": "JR05J", "jr05j": "JR05J",
  "vp-07": "JR07J", "jr07j": "JR07J",
  "vp-08": "JR08J", "varandas 08": "JR08J", "jr08j": "JR08J",
  "vp-09": "JR09J", "varandas 09": "JR09J", "jr09j": "JR09J",
};

const BASE = "https://artezian.stays.net/external/v1";
const AUTH = "Basic NWI1YmU2NTY6ZmU0OGU3MzA=";

// Os 5 tipos que ocupam o calendário. "canceled" fica de fora de propósito
// (reserva cancelada libera a data). A API só aceita estes 6 valores no total.
const TIPOS_OCUPADOS = "type=booked&type=reserved&type=blocked&type=contract&type=maintenance";

// Margem em dias na janela pedida à API. A sobreposição real é decidida no JS,
// então a busca é folgada de propósito pra não perder bloqueio de borda nem
// buffer de faxina de reserva vizinha.
const MARGEM_DIAS = 3;

function resolveId(nome) {
  return IMOVEIS[(nome || "").toLowerCase().trim()] || nome;
}

function normalizeData(d) {
  if (!d) return "";
  d = String(d).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const iso = d.match(/^(\d{4}-\d{2}-\d{2})T/);       // ISO com horário (2026-09-10T00:00:00.000Z)
  if (iso) return iso[1];
  const br = d.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  if (/^\d{10,13}$/.test(d)) {                         // timestamp em ms ou s
    const ms = d.length === 13 ? Number(d) : Number(d) * 1000;
    return new Date(ms).toISOString().slice(0, 10);
  }
  return d;
}

// Meio-dia UTC evita que fuso/horário de verão jogue a data pro dia anterior.
function addDias(iso, n) {
  const dt = new Date(`${iso}T12:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

async function staysFetch(url, options) {
  const resp = await fetch(url, options);
  const text = await resp.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) {}
  if (!resp.ok) {
    throw new Error(`Stays ${resp.status}: ${text.slice(0, 300)}`);
  }
  return json;
}

// Pagina até a página vir incompleta. limit=100 é o teto da API e o default (20)
// trunca em silêncio — sem paginar, um bloqueio pode simplesmente não vir na
// resposta e o imóvel ser oferecido como vago.
async function buscarOcupacao(from, to) {
  const LIMITE = 100;
  const todos = [];
  for (let skip = 0; skip < 1000; skip += LIMITE) {
    const pagina = await staysFetch(
      `${BASE}/booking/reservations?from=${from}&to=${to}&dateType=included&limit=${LIMITE}&skip=${skip}&${TIPOS_OCUPADOS}`,
      { headers: { "Authorization": AUTH } }
    );
    // Formato inesperado = falha, nunca "está livre".
    if (!Array.isArray(pagina)) {
      throw new Error(`resposta inesperada em reservations: ${JSON.stringify(pagina).slice(0, 200)}`);
    }
    todos.push(...pagina);
    if (pagina.length < LIMITE) break;
  }
  return todos;
}

// A API devolve também reserva que só encosta na janela (check-out no dia do
// check-in pedido, e vice-versa) — essas datas estão LIVRES. A conta de
// sobreposição é feita aqui, já expandida pelo buffer de faxina da reserva.
function bloqueiaPeriodo(r, checkin, checkout) {
  const antes  = r.beforeCheckInPreparationBlocking;
  const depois = r.afterCheckOutPreparationBlocking;
  const ini = addDias(r.checkInDate,  antes?.active  ? -(antes._i_days  || 0) : 0);
  const fim = addDias(r.checkOutDate, depois?.active ?  (depois._i_days || 0) : 0);
  return ini < checkout && fim > checkin;
}

const mcp = session.datasources["MCP1-Stays"];
const imovelRaw   = mcp?.imovel || mcp?.["Nome do Imóvel"] || "";
const checkinRaw  = mcp?.checkin  || "";
const checkoutRaw = mcp?.checkout || "";
const hospedes    = parseInt(mcp?.hospedes) || 2;

const imovelId = resolveId(imovelRaw);
const checkin  = normalizeData(checkinRaw);
const checkout = normalizeData(checkoutRaw);
const noites   = Math.round((new Date(checkout) - new Date(checkin)) / 86400000);

// Datas inválidas iam virar URL quebrada (HTTP 400) ou noites <= 0 com diária
// negativa. Barra antes de qualquer chamada.
const DATA_OK = /^\d{4}-\d{2}-\d{2}$/;
if (!DATA_OK.test(checkin) || !DATA_OK.test(checkout) || !(noites > 0)) {
  await session.setAdditionalValue("resposta_stays",
    `Erro: datas inválidas (check-in "${checkinRaw}" → "${checkin}", check-out "${checkoutRaw}" → "${checkout}").`
  );
  return;
}

// 1) Busca o imóvel — precisa do _id interno pra cruzar com as reservas.
// Se essa chamada falhar, aborta com erro em vez de seguir sem checar ocupação.
let nome = imovelId;
let quartos = "";
let idInterno = "";
try {
  const listing = await staysFetch(`${BASE}/content/listings/${imovelId}`, {
    headers: { "Authorization": AUTH }
  });
  nome = listing?.internalName || imovelId;
  quartos = listing?._i_rooms ? `${listing._i_rooms} quartos` : "";
  idInterno = listing?._id || "";
} catch (e) {
  await session.setAdditionalValue("resposta_stays",
    `Erro ao consultar Stays (imóvel: "${imovelRaw}" → ${imovelId}): ${e.message}`
  );
  return;
}

// Sem o _id interno não dá pra cruzar com as reservas — e cotar sem cruzar é
// exatamente o bug de "vaga que não existe". Aborta.
if (!idInterno) {
  await session.setAdditionalValue("resposta_stays",
    `Erro: não foi possível identificar o imóvel "${imovelRaw}" (${imovelId}) na Stays.`
  );
  return;
}

// 2) calculate-price NÃO verifica o calendário: devolve total mesmo com o imóvel
// ocupado ou bloqueado. Então cruza com a ocupação real ANTES de confiar no preço.
let ocupado;
try {
  const registros = await buscarOcupacao(
    addDias(checkin, -MARGEM_DIAS),
    addDias(checkout, MARGEM_DIAS)
  );
  ocupado = registros.some(
    r => r._idlisting === idInterno && bloqueiaPeriodo(r, checkin, checkout)
  );
} catch (e) {
  await session.setAdditionalValue("resposta_stays",
    `Erro ao verificar disponibilidade (imóvel: "${imovelRaw}" → ${imovelId}, ${checkin} a ${checkout}): ${e.message}`
  );
  return;
}

if (ocupado) {
  await session.setAdditionalValue("resposta_stays", "Produto Indisponível");
  return;
}

// 3) Só chega aqui se o período estiver confirmadamente livre.
let stays;
try {
  stays = await staysFetch(`${BASE}/booking/calculate-price`, {
    method: "POST",
    headers: { "Authorization": AUTH, "Content-Type": "application/json" },
    body: JSON.stringify({ listingIds: [imovelId], from: checkin, to: checkout, guests: hospedes })
  });
} catch (e) {
  await session.setAdditionalValue("resposta_stays",
    `Erro ao consultar Stays (imóvel: "${imovelRaw}" → ${imovelId}, ${checkin} a ${checkout}): ${e.message}`
  );
  return;
}

if (!stays || !Array.isArray(stays) || stays.length === 0) {
  await session.setAdditionalValue("resposta_stays", "Produto Indisponível");
  return;
}

const item   = stays[0];
const total  = item._mctotal?.BRL || 0;
const fees   = item.fees || [];
const taxas  = fees.reduce((s, f) => s + (f._mcval?.BRL || 0), 0);
const diaria = noites > 0 ? Math.round((total - taxas) / noites) : 0;

await session.setAdditionalValue("resposta_stays",
  `Imóvel: ${nome}${quartos ? ` · ${quartos}` : ""}\nCheck-in: ${checkin} → Check-out: ${checkout} (${noites} noites)\nHóspedes: ${hospedes}\nDiária: R$${diaria}\nTotal: R$${total}`
);
```

## Pontos em aberto (decisão do Mateus/João, não corrigidos aqui)

- **Imóveis `hidden` na Stays continuam sendo cotados.** `GF02J` (Casa do Tremura), `GG08J` (Casa do John), `JR02J`, `JR06J` e `DS10J` estão com `status: hidden` no `content/listings`, mas os três primeiros seguem no mapa `IMOVEIS`. Testado 2026-09-08: `calculate-price` para `GF02J` devolve preço normal. Se "hidden" significa "fora de operação", o agente está cotando imóvel que não deveria vender — nesse caso a correção é tirar do mapa (ou barrar `status !== "active"` no bloco). Se significa só "não aparece no site", está certo como está.
- **Capacidade de hóspedes não é validada.** O bloco repassa `hospedes` pro `calculate-price` sem conferir contra a capacidade máxima do imóvel.
- **Nome de imóvel não reconhecido gera mensagem técnica.** Se o lead escreve um apelido fora do mapa `IMOVEIS`, o código cai no `content/listings/{nome}` → 404 → o lead recebe "Erro ao consultar Stays...". Falha fechada (não inventa vaga), mas a mensagem não é apresentável.

## Histórico de mudanças
- **2026-09-09** — removidos do bloco o mapa `VIDEOS`, a constante `V` (base do Cloudinary), a variável `videoUrl` e as 8 gravações em `video_link`. A tool passou a responder exclusivamente disponibilidade e preço; mídia é responsabilidade do `midia-imovel.js`. Nenhuma mudança na lógica de disponibilidade — os 9 casos de teste ponta a ponta seguem passando.
- **2026-09-08** — 3ª rodada de correção do bug de "vaga que não existe", depois que o problema continuou em produção. Quatro furos encontrados testando a API real:
  1. **Tipos de bloqueio faltando (causa principal).** A API aceita 6 tipos (`reserved, booked, contract, blocked, maintenance, canceled`) e o bloco só checava 3 — `contract` (temporada longa) e `maintenance` (manutenção) passavam batido e o imóvel era oferecido como vago. Mesma classe do bug de `blocked` corrigido em 23/08. Agora vão os 5 que ocupam; `canceled` segue de fora de propósito.
  2. **Truncagem sem paginação.** `limit=100` é o teto e a resposta corta em silêncio: a janela 01/09→31/12 tem 121 registros e voltava só 100, sumindo com o começo de setembro. Adicionada paginação por `skip`.
  3. **Buffer de faxina ignorado.** `beforeCheckInPreparationBlocking` / `afterCheckOutPreparationBlocking` estão ativos com 1 dia em reservas reais; o dia bloqueado pra faxina era oferecido como vago. O período ocupado agora é expandido por esses dias.
  4. **Resposta em formato inesperado virava "livre".** O `Array.isArray(...) && ...` fazia qualquer retorno fora do previsto cair como disponível. Agora lança erro — falha sempre fecha.

  Corrigido junto o problema inverso (perda de venda): a API devolve como "incluída" a reserva que só encosta na janela, então troca de hóspede no mesmo dia era respondida como "Produto Indisponível". A sobreposição passou a ser calculada no JS (`inicio < checkout && fim > checkin`). Também adicionada validação de datas antes de qualquer chamada e abort quando o `_id` interno do imóvel não vem.
- **2026-08-23 (2ª correção)** — a 1ª correção do dia (checagem via `booking/reservations` sem `type` explícito) ainda deixava passar bloqueios manuais: sem `type`, a API só devolve `booked`/`reserved` por padrão e omite `blocked`. Confirmado com teste real: Casa do John (`GG08J`) tinha bloqueio (`type=blocked`) de 30/09 a 02/10/2026 e uma consulta de 29/09 a 02/10 continuava retornando preço normalmente. Corrigido passando `type=booked&type=reserved&type=blocked` (repetido, não em lista) na chamada. Também: (1) a checagem do imóvel (`content/listings/{id}`) e a checagem de reservas agora abortam com mensagem de erro se falharem, em vez de silenciosamente seguir pro `calculate-price` sem ter confirmado disponibilidade; (2) a mensagem de indisponibilidade (por ocupação real ou por `calculate-price` vazio) passou a ser sempre o texto fixo "Produto Indisponível", a pedido do usuário.
- **2026-08-23 (1ª correção)** — corrigido bug de disponibilidade falsa: `booking/calculate-price` não checa o calendário de reservas e devolvia preço normal mesmo para imóveis já reservados (confirmado com teste real: Studio do João reservado 07/09–11/09/2026 retornava preço pra consulta de 10/09–13/09, período que se sobrepõe à reserva). Adicionada checagem prévia via `booking/reservations?dateType=included&limit=100` filtrando pelo `_id` interno do imóvel — só chama `calculate-price` se não houver reserva `booked`/`reserved` sobrepondo o período. `limit=100` é obrigatório (default da API é 20 e trunca sem aviso).
- **2026-08-17** — removidas do `IMOVEIS`/`VIDEOS` as unidades `DS06J` (Apto da Isa), `HA02J` (Apto da Jessilene), `GF04J` (Casa da Laureana), `GF06J` (Casa da Moana), `GG06J` (Casa do Euller) e `VM10A` (Condomínio do Max). Nenhuma das 6 aparece mais na resposta de `content/listings` da Stays (catálogo real hoje tem 18 IDs — conferido direto na API) — resolver esses códigos e chamar `booking/calculate-price` para eles ia dar erro. Se algum desses imóveis voltar a operar (novo contrato, recadastro), reincluir no mapa e criar/confirmar o ID Stays antes de reativar.
- **2026-08-03** — adicionado `vp-08`/`varandas 08` → `JR08J` e `vp-09`/`varandas 09` → `JR09J` no mapa `IMOVEIS`. As duas unidades já estavam ativas no catálogo Stays e já tinham vídeo no mapa `VIDEOS`, mas não resolviam por nome — lead que perguntasse por "Varandas 08" ou "Varandas 09" caía sem match. Achado ao cruzar o catálogo ativo da Stays (`content/listings`) com este mapa pra montar o painel de diárias/ocupação.
- **2026-07-27** — removida a linha `Disponível!` da mensagem de sucesso. Resposta passou a abrir direto com "Imóvel: ...", mantendo check-in/check-out, hóspedes, diária e total. Mensagem de indisponibilidade não mudou.
