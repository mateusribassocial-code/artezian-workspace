// MCP Server Tool: Consultar_disp_stays
// Fluxo: MCP Server Tool -> este bloco JavaScript -> Mensagem de texto {resposta_stays}
//
// Versão multi-imóvel. Cota até MAX_IMOVEIS numa única chamada da tool.
// Motivo da mudança: o Art Mendonça 3 cota 3 propriedades por vez, e a versão
// anterior (1 imóvel por chamada) fazia 3 tool calls em série, cada uma
// refazendo a busca de ocupação da conta inteira. Em janela de Réveillon isso
// estourava o timeout do agente ("a busca demorou mais que o esperado").
// Aqui a ocupação é buscada UMA vez e reaproveitada pra todos os imóveis.
//
// Pré-requisito: campos adicionais `resposta_stays` e `erro_stays` (escopo
// Conversa). `resposta_stays` vai pro lead; `erro_stays` guarda o detalhe
// técnico da última falha e nunca é enviado.

// Códigos da Stays que podem ser cotados. Código fora desta lista não é cotado
// — JR02J e JR06J ficam de fora por estarem "hidden" na Stays.
const CODIGOS = [
  "DS03J", "DS04J", "DS05J", "FL10J", "GC01J", "HA03J", "GF02J", "GG08J",
  "JR01J", "JR03J", "JR04J", "JR05J", "JR07J", "JR08J", "JR09J",
];

// Apelido -> código, comparado por trecho de palavras inteiras no nome já
// normalizado (sem acento, sem pontuação). Vale o primeiro que aparecer, por
// isso os dois apartamentos do Reinaldo só resolvem com o local junto:
// "Apartamento do Reinaldo" sozinho é ambíguo e não é cotado.
const APELIDOS = [
  ["reinaldo coroa", "GC01J"], ["reinaldo ji", "GC01J"],
  ["reinaldo taperapua", "FL10J"], ["reinaldo mi", "FL10J"],
  ["studio do joao", "DS03J"], ["studio joao", "DS03J"],
  ["flat da mari", "DS04J"], ["flat mari", "DS04J"],
  ["emanoel", "DS05J"],
  ["joyce", "HA03J"],
  ["tremura", "GF02J"],
  ["john", "GG08J"],
];

const BASE = "https://artezian.stays.net/external/v1";
const AUTH = "Basic NWI1YmU2NTY6ZmU0OGU3MzA=";

// Os 5 tipos que ocupam o calendário. "canceled" fica de fora de propósito
// (reserva cancelada libera a data). A API só aceita estes 6 valores no total.
const TIPOS_OCUPADOS = "type=booked&type=reserved&type=blocked&type=contract&type=maintenance";

// Margem em dias na janela pedida à API. A sobreposição real é decidida no JS,
// então a busca é folgada de propósito pra não perder bloqueio de borda nem
// buffer de faxina de reserva vizinha.
const MARGEM_DIAS = 3;

// Teto de imóveis por chamada. Cada imóvel custa 2 requests (listing +
// calculate-price); o teto existe pra não voltar ao timeout.
const MAX_IMOVEIS = 5;

// O que o lead recebe em qualquer falha técnica. O detalhe vai pra `erro_stays`
// — erro cru da API (JSON, HTTP 400) nunca chega no WhatsApp.
const MSG_FALHA = "Não consegui puxar os valores dessas datas agora. Alguém da equipe vai te passar a cotação por aqui 💙";

// Troca acento manualmente: String.normalize depende de ICU, que o sandbox
// pode não ter.
function normalizar(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[áàâãä]/g, "a").replace(/[éèêë]/g, "e").replace(/[íìîï]/g, "i")
    .replace(/[óòôõö]/g, "o").replace(/[úùûü]/g, "u").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Devolve o código da Stays ou "" se não reconhecer. Nunca devolve o texto cru:
// a API só aceita código e responde 400 pra qualquer outra coisa.
function resolveId(nome) {
  const texto = normalizar(nome);
  if (!texto) return "";

  // 1) Código escrito direto: "DS03J", "jr05j".
  const codigos = texto.toUpperCase().match(/\b[A-Z]{2}\d{2}[A-Z]\b/g) || [];
  for (const c of codigos) {
    if (CODIGOS.indexOf(c) !== -1) return c;
  }

  // 2) Varandas de Porto, como a base do agente escreve: "VP-05 (AP05)",
  // "AP05", "vp 5", "Varandas de Porto 05".
  const vp = texto.match(/\b(?:vp|ap|varandas(?: de porto)?)\s*(\d{1,2})\b/);
  if (vp) {
    const c = `JR${("0" + vp[1]).slice(-2)}J`;
    return CODIGOS.indexOf(c) !== -1 ? c : "";
  }

  // 3) Apelidos.
  const alvo = ` ${texto} `;
  for (const [apelido, codigo] of APELIDOS) {
    if (alvo.indexOf(` ${apelido} `) !== -1) return codigo;
  }
  return "";
}

// O formato aceito pro parâmetro Array do Datacrazy não está confirmado
// (array real, string JSON ou lista separada por vírgula). Aceita os três.
function parseImoveis(v) {
  if (Array.isArray(v)) return v;
  if (v === null || v === undefined) return [];
  const s = String(v).trim();
  if (!s) return [];
  if (s.charAt(0) === "[") {
    try {
      const j = JSON.parse(s);
      if (Array.isArray(j)) return j;
    } catch (e) {}
  }
  return s.split(/[;,\n]/);
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
  // Data ilegível lança aqui em vez de estourar RangeError no toISOString.
  // Mantém o princípio "falha sempre fecha".
  if (isNaN(dt.getTime())) throw new Error(`data inválida em addDias: "${iso}"`);
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

function fmtBR(iso) {
  const p = iso.split("-");
  return `${p[2]}/${p[1]}/${p[0]}`;
}

// toLocaleString("pt-BR") não é confiável em sandbox sem ICU completo.
function fmtBRL(v) {
  const n = Math.round(Number(v || 0) * 100) / 100;
  const p = n.toFixed(2).split(".");
  return `R$ ${p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${p[1]}`;
}

function plural(n, um, muitos) {
  return `${n} ${n === 1 ? um : muitos}`;
}

async function registrarErro(detalhe) {
  try {
    await session.setAdditionalValue("erro_stays", detalhe);
  } catch (e) {}
}

async function falhar(detalhe) {
  await registrarErro(detalhe);
  await session.setAdditionalValue("resposta_stays", MSG_FALHA);
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
  // normalizeData nas datas da API: se checkInDate vier como ISO com horário,
  // a concatenação em addDias geraria Invalid Date.
  const ini = addDias(normalizeData(r.checkInDate),  antes  && antes.active  ? -(antes._i_days  || 0) : 0);
  const fim = addDias(normalizeData(r.checkOutDate), depois && depois.active ?  (depois._i_days || 0) : 0);
  return ini < checkout && fim > checkin;
}

// ---------------------------------------------------------------------------

const mcp = (session.datasources || {})["MCP1-Stays"] || {};

// `imovel` / `Nome do Imóvel` seguem aceitos por compatibilidade com a versão
// anterior da tool, caso o agente ainda mande o parâmetro antigo.
const imoveisRaw  = mcp.imoveis || mcp.imovel || mcp["Nome do Imóvel"] || "";
const checkinRaw  = mcp.checkin  || "";
const checkoutRaw = mcp.checkout || "";
const hospedes    = parseInt(mcp.hospedes) || 2;

const checkin  = normalizeData(checkinRaw);
const checkout = normalizeData(checkoutRaw);
const noites   = Math.round((new Date(checkout) - new Date(checkin)) / 86400000);

// Datas inválidas iam virar URL quebrada (HTTP 400) ou noites <= 0 com diária
// negativa. Barra antes de qualquer chamada.
const DATA_OK = /^\d{4}-\d{2}-\d{2}$/;
if (!DATA_OK.test(checkin) || !DATA_OK.test(checkout) || !(noites > 0)) {
  await falhar(`datas inválidas: check-in "${checkinRaw}" → "${checkin}", check-out "${checkoutRaw}" → "${checkout}"`);
  return;
}

// Resolve nomes -> códigos, remove duplicados, aplica o teto. Nome não
// reconhecido não vai pra API: fica registrado em `erros`.
const alvos = [];
const erros = [];
for (const bruto of parseImoveis(imoveisRaw)) {
  const nome = String(bruto || "").trim();
  if (!nome) continue;
  const id = resolveId(nome);
  if (!id) {
    erros.push(`"${nome}": imóvel não reconhecido`);
    continue;
  }
  if (alvos.indexOf(id) === -1) alvos.push(id);
  if (alvos.length >= MAX_IMOVEIS) break;
}

if (alvos.length === 0) {
  await falhar(erros.length > 0
    ? erros.join(" | ")
    : `nenhum imóvel informado (recebido: ${JSON.stringify(imoveisRaw)})`);
  return;
}

// 1) Ocupação da janela — UMA chamada, reaproveitada por todos os imóveis.
// O endpoint devolve as reservas da conta inteira; o filtro por imóvel é feito
// abaixo, no JS. Se essa chamada falhar, aborta: nunca cota sem ter conferido
// o calendário.
let registros;
try {
  registros = await buscarOcupacao(
    addDias(checkin, -MARGEM_DIAS),
    addDias(checkout, MARGEM_DIAS)
  );
} catch (e) {
  await falhar(`verificar disponibilidade (${checkin} a ${checkout}): ${e.message}`);
  return;
}

// 2) Por imóvel: identifica, cruza com a ocupação e só então cota.
// calculate-price NÃO olha o calendário — devolve total mesmo com o imóvel
// reservado ou bloqueado. Por isso o cruzamento vem antes.
const cotados = [];

for (const imovelId of alvos) {
  try {
    const listing = await staysFetch(`${BASE}/content/listings/${imovelId}`, {
      headers: { "Authorization": AUTH }
    });

    // Sem o _id interno não dá pra cruzar com as reservas — e cotar sem cruzar
    // é exatamente o bug de "vaga que não existe".
    const idInterno = listing && listing._id ? listing._id : "";
    if (!idInterno) throw new Error("imóvel sem _id interno na Stays");

    const nome = (listing && listing.internalName) || imovelId;
    const nQuartos = listing && listing._i_rooms;
    const quartos = nQuartos ? plural(nQuartos, "quarto", "quartos") : "";

    const ocupado = registros.some(
      r => r._idlisting === idInterno && bloqueiaPeriodo(r, checkin, checkout)
    );
    // Ocupado simplesmente não entra na resposta — o Art nunca fala de
    // disponibilidade, só mostra o que dá pra cotar.
    if (ocupado) continue;

    const stays = await staysFetch(`${BASE}/booking/calculate-price`, {
      method: "POST",
      headers: { "Authorization": AUTH, "Content-Type": "application/json" },
      body: JSON.stringify({ listingIds: [imovelId], from: checkin, to: checkout, guests: hospedes })
    });

    if (!Array.isArray(stays) || stays.length === 0) continue;

    const item  = stays[0];
    const total = (item._mctotal && item._mctotal.BRL) || 0;
    const taxas = (item.fees || []).reduce((s, f) => s + ((f._mcval && f._mcval.BRL) || 0), 0);
    if (!(total > 0)) continue;

    cotados.push({
      nome: nome,
      quartos: quartos,
      total: total,
      diaria: Math.round((total - taxas) / noites)
    });
  } catch (e) {
    // Erro num imóvel derruba só aquele imóvel; os outros seguem sendo cotados.
    erros.push(`${imovelId}: ${e.message}`);
  }
}

// Sempre regrava: sem erro, limpa o que tiver sobrado de uma chamada anterior.
await registrarErro(erros.join(" | "));

// 3) Uma única mensagem, com todos os imóveis que deu pra cotar.
if (cotados.length > 0) {
  const cabecalho =
    `📅 ${fmtBR(checkin)} → ${fmtBR(checkout)} · ` +
    `${plural(noites, "noite", "noites")} · ` +
    `${plural(hospedes, "hóspede", "hóspedes")}`;

  const blocos = cotados.map(c =>
    `*${String(c.nome).toUpperCase()}*${c.quartos ? ` · ${c.quartos}` : ""}\n` +
    `💰 Diária ${fmtBRL(c.diaria)}\n` +
    `*Total: ${fmtBRL(c.total)}*`
  );

  await session.setAdditionalValue("resposta_stays", `${cabecalho}\n\n${blocos.join("\n\n")}`);
} else if (erros.length > 0) {
  // Falha técnica NUNCA vira "Produto Indisponível": uma queda da API faria o
  // lead desistir de uma data que na verdade está vaga.
  await session.setAdditionalValue("resposta_stays", MSG_FALHA);
} else {
  await session.setAdditionalValue("resposta_stays", "Produto Indisponível");
}
