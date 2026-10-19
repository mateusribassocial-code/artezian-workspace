// Automação: COTAÇÃO por tag (substitui o Art Mendonça 3 / "Art Pro Max")
// Fluxo: tag COTAÇÃO adicionada -> espera 10s -> este bloco JavaScript ->
//        Mensagem {resposta_cotacao} -> remove tag -> transfere pro Mateus
//
// Sem agente de IA na cotação: o Art Pré-Atendimento grava imóvel, datas e
// hóspedes nos campos adicionais e adiciona a tag. Sem imóvel escolhido, cota
// até 3 imóveis livres que comportam o grupo (ordem da TABELA do Art Pré). Daqui pra frente é código —
// valor nenhum passa por LLM, então não tem como sair diária inventada.
//
// A lógica de Stays (ocupação, buffer de faxina, paginação, falha que fecha)
// é a mesma do mcp-consulta-disp-stays.js, que segue documentada em
// mcp-consulta-disp-stays-setup.md. Mudou só a entrada (campos do lead em vez
// do datasource da tool) e a saída (mensagem final pro lead, já com a passagem
// pro Mateus, porque não tem mais agente depois pra completar).
//
// Pré-requisito: campos adicionais `Imovel-Cotacao`, `resposta_cotacao` e
// `erro_stays`. `resposta_cotacao` vai pro lead; `erro_stays` guarda o detalhe
// técnico e nunca é enviado.

// Códigos da Stays que podem ser cotados. Código fora desta lista não é cotado
// — JR02J e JR06J ficam de fora por estarem "hidden" na Stays. HA02J, GF04J e
// GF06J estão na tabela do Art Pré mas não existem mais na Stays: caem no
// caminho "sem cotação automática" e o Mateus cota na mão.
const CODIGOS = [
  "DS03J", "DS04J", "DS05J", "FL10J", "GC01J", "HA03J", "GF02J", "GG08J",
  "JR01J", "JR03J", "JR04J", "JR05J", "JR07J", "JR08J", "JR09J",
];

// Apelido -> código, comparado por trecho de palavras inteiras no nome já
// normalizado. Rede de segurança: o Art Pré deve gravar o código da TABELA,
// mas se gravar o nome também resolve.
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

// Nomes de exibição pro lead, iguais à TABELA do Art Pré. O internalName da
// Stays é nome de painel, não de vitrine.
const NOMES = {
  DS03J: "Studio do João", DS04J: "Flat da Mari", DS05J: "Apartamento do Emanoel",
  FL10J: "Apartamento do Reinaldo (Taperapuã)", GC01J: "Apartamento do Reinaldo (Coroa Vermelha)",
  HA03J: "Flat da Joyce", GF02J: "Casa do Tremura", GG08J: "Casa do John",
  JR01J: "Varandas de Porto VP-01", JR03J: "Varandas de Porto VP-03",
  JR04J: "Varandas de Porto VP-04", JR05J: "Varandas de Porto VP-05",
  JR07J: "Varandas de Porto VP-07", JR08J: "Varandas de Porto VP-08",
  JR09J: "Varandas de Porto VP-09",
};

// Usada quando o lead não escolheu imóvel: ordem de prioridade, condomínio e
// capacidade ("até") iguais à TABELA do Art Pré. Só imóveis cotáveis na Stays.
// Imóvel novo na TABELA = adicionar aqui também.
const TABELA = [
  ["JR01J", "Varandas de Porto", 3],
  ["JR03J", "Varandas de Porto", 4],
  ["JR05J", "Varandas de Porto", 5],
  ["DS04J", "Mont Carmelo", 5],
  ["DS03J", "Mont Carmelo", 5],
  ["JR09J", "Varandas de Porto", 8],
  ["HA03J", "independente", 8],
  ["DS05J", "Mont Carmelo", 8],
  ["FL10J", "independente", 10],
  ["GC01J", "independente", 12],
  ["GF02J", "independente", 27],
  ["GG08J", "independente", 28],
];

// Quantas opções mandar quando o lead não escolheu imóvel.
const MAX_SUGESTOES = 3;

// Os campos adicionais aparecem com dois nomes no histórico do projeto
// ("Data de Check-in" confirmado em produção no resumo_lead_site; "Data-Check-in"
// citado nos prompts do Art). Lê o primeiro que vier preenchido.
const CAMPOS = {
  imovel:   ["Imovel-Cotacao"],
  checkin:  ["Data de Check-in", "Data-Check-in"],
  checkout: ["Data de Check-Out", "Data-Check-out"],
  hospedes: ["Hospedes Total", "Hospede-Total"],
};

const BASE = "https://artezian.stays.net/external/v1";
const AUTH = "Basic NWI1YmU2NTY6ZmU0OGU3MzA=";

// Os 5 tipos que ocupam o calendário. "canceled" fica de fora de propósito
// (reserva cancelada libera a data). A API só aceita estes 6 valores no total.
const TIPOS_OCUPADOS = "type=booked&type=reserved&type=blocked&type=contract&type=maintenance";

// Margem em dias na janela pedida à API. A sobreposição real é decidida no JS.
const MARGEM_DIAS = 3;

// Teto de imóveis por cotação. Cada imóvel custa 2 requests (listing +
// calculate-price).
const MAX_IMOVEIS = 5;

const PASSAGEM = "O Mateus segue com vc daqui pra fechar 💙";

// Qualquer caso sem cotação automática (falha da API, dado faltando, imóvel
// fora da Stays). O Mateus recebe a conversa logo em seguida com o detalhe em
// `erro_stays`, então a mensagem só avisa quem continua.
const MSG_FALHA = "Vou pedir pro Mateus te passar os valores certinhos dessas datas, ele já segue com vc por aqui 💙";

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

// Devolve o código da Stays ou "" se não reconhecer.
function resolveId(nome) {
  const texto = normalizar(nome);
  if (!texto) return "";

  const codigos = texto.toUpperCase().match(/\b[A-Z]{2}\d{2}[A-Z]\b/g) || [];
  for (const c of codigos) {
    if (CODIGOS.indexOf(c) !== -1) return c;
  }

  const vp = texto.match(/\b(?:vp|ap|varandas(?: de porto)?)\s*(\d{1,2})\b/);
  if (vp) {
    const c = `JR${("0" + vp[1]).slice(-2)}J`;
    return CODIGOS.indexOf(c) !== -1 ? c : "";
  }

  const alvo = ` ${texto} `;
  for (const [apelido, codigo] of APELIDOS) {
    if (alvo.indexOf(` ${apelido} `) !== -1) return codigo;
  }
  return "";
}

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
  return s.split(/[;,\n|]/);
}

function normalizeData(d) {
  if (!d) return "";
  d = String(d).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const iso = d.match(/^(\d{4}-\d{2}-\d{2})T/);       // ISO com horário (2026-09-10T12:00:00.000Z)
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
  if (isNaN(dt.getTime())) throw new Error(`data inválida em addDias: "${iso}"`);
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

function hojeBR() {
  // Porto Seguro é UTC-3 o ano todo.
  return new Date(Date.now() - 3 * 3600000).toISOString().slice(0, 10);
}

function fmtBR(iso) {
  const p = iso.split("-");
  return `${p[2]}/${p[1]}`;
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

function listaNomes(nomes) {
  if (nomes.length <= 1) return nomes.join("");
  return `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
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
// trunca em silêncio.
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

// Reserva que só encosta na janela (troca de hóspede no mesmo dia) não bloqueia.
// O período ocupado é expandido pelo buffer de faxina da reserva.
function bloqueiaPeriodo(r, checkin, checkout) {
  const antes  = r.beforeCheckInPreparationBlocking;
  const depois = r.afterCheckOutPreparationBlocking;
  const ini = addDias(normalizeData(r.checkInDate),  antes  && antes.active  ? -(antes._i_days  || 0) : 0);
  const fim = addDias(normalizeData(r.checkOutDate), depois && depois.active ?  (depois._i_days || 0) : 0);
  return ini < checkout && fim > checkin;
}

// Primeiro valor preenchido entre os nomes possíveis do campo. Campo que não
// existe na conta vira "" em vez de derrubar a leitura dos outros.
function lerCampo(nomes) {
  return nomes.reduce(function (anterior, nome) {
    return anterior.then(function (valor) {
      if (valor !== "" && valor !== null && valor !== undefined) return valor;
      return Promise.resolve(session.getAdditionalValue(nome)).catch(function () { return ""; });
    });
  }, Promise.resolve(""));
}

async function cotacao(dados) {
  const erros = [];

  // Limpa Imovel-Cotacao a cada cotação: senão um pedido novo sem imóvel
  // escolhido reaproveitaria o imóvel da cotação anterior em vez de sugerir.
  // O que foi pedido segue no datasource (`imovel`) pra anotação do lead.
  async function concluir(status, mensagem) {
    try { await session.setAdditionalValue("erro_stays", erros.join(" | ")); } catch (e) {}
    try { await session.setAdditionalValue("Imovel-Cotacao", ""); } catch (e) {}
    await session.setAdditionalValue("resposta_cotacao", mensagem);
    return { status: status, imovel: String(dados.imovel || "") || "sugestão por hóspedes e datas" };
  }

  const checkin  = normalizeData(dados.checkin);
  const checkout = normalizeData(dados.checkout);
  const hospedesInformado = parseInt(dados.hospedes) > 0;
  const hospedes = hospedesInformado ? parseInt(dados.hospedes) : 2;

  // Datas faltando ou ilegíveis: não chama a API. O Art Pré deveria ter
  // coletado — se chegou aqui sem, o Mateus resolve.
  const DATA_OK = /^\d{4}-\d{2}-\d{2}$/;
  const noites = DATA_OK.test(checkin) && DATA_OK.test(checkout)
    ? Math.round((new Date(`${checkout}T12:00:00Z`) - new Date(`${checkin}T12:00:00Z`)) / 86400000)
    : 0;
  if (!(noites > 0)) {
    erros.push(`datas inválidas: check-in "${dados.checkin}" → "${checkin}", check-out "${dados.checkout}" → "${checkout}"`);
    return concluir("falha", MSG_FALHA);
  }
  if (checkin < hojeBR()) {
    erros.push(`check-in no passado: ${checkin}`);
    return concluir("falha", MSG_FALHA);
  }

  // Sem imóvel escolhido: cota pelos hóspedes e datas (modo sugestão).
  const semImovel = parseImoveis(dados.imovel).every(x => !String(x || "").trim());

  const alvos = [];
  for (const bruto of parseImoveis(dados.imovel)) {
    const nome = String(bruto || "").trim();
    if (!nome) continue;
    const id = resolveId(nome);
    if (!id) {
      erros.push(`"${nome}": imóvel sem cotação automática (fora da Stays ou não reconhecido)`);
      continue;
    }
    if (alvos.indexOf(id) === -1) alvos.push(id);
    if (alvos.length >= MAX_IMOVEIS) break;
  }

  // 1) Ocupação da janela — UMA chamada, reaproveitada por todos os imóveis.
  // Se falhar, aborta: nunca cota sem ter conferido o calendário.
  let registros;
  async function carregarOcupacao() {
    try {
      registros = await buscarOcupacao(addDias(checkin, -MARGEM_DIAS), addDias(checkout, MARGEM_DIAS));
      return true;
    } catch (e) {
      erros.push(`verificar disponibilidade (${checkin} a ${checkout}): ${e.message}`);
      return false;
    }
  }

  // Identifica o imóvel, cruza com a ocupação e só então cota.
  // calculate-price NÃO olha o calendário — só chamar depois de conferir.
  // Devolve o bloco cotado, "ocupado", ou null quando deu erro (já registrado).
  async function cotarImovel(imovelId) {
    const nome = NOMES[imovelId] || imovelId;
    try {
      const listing = await staysFetch(`${BASE}/content/listings/${imovelId}`, {
        headers: { "Authorization": AUTH }
      });
      const idInterno = listing && listing._id ? listing._id : "";
      if (!idInterno) throw new Error("imóvel sem _id interno na Stays");

      if (registros.some(r => r._idlisting === idInterno && bloqueiaPeriodo(r, checkin, checkout))) {
        return "ocupado";
      }

      const stays = await staysFetch(`${BASE}/booking/calculate-price`, {
        method: "POST",
        headers: { "Authorization": AUTH, "Content-Type": "application/json" },
        body: JSON.stringify({ listingIds: [imovelId], from: checkin, to: checkout, guests: hospedes })
      });
      const item  = Array.isArray(stays) && stays.length > 0 ? stays[0] : null;
      const total = item && item._mctotal ? (item._mctotal.BRL || 0) : 0;
      // calculate-price vazio ou zerado com o calendário livre = regra de preço
      // que não cobre o período (mínimo de noites, por exemplo). Não é "sem
      // vaga": vai pro Mateus.
      if (!(total > 0)) throw new Error(`calculate-price sem valor pra ${checkin} a ${checkout}`);

      const taxas = (item.fees || []).reduce((s, f) => s + ((f._mcval && f._mcval.BRL) || 0), 0);
      return { nome: nome, total: total, diaria: Math.round((total - taxas) / noites) };
    } catch (e) {
      // Erro num imóvel derruba só aquele imóvel; os outros seguem.
      erros.push(`${imovelId}: ${e.message}`);
      return null;
    }
  }

  const periodo = `${fmtBR(checkin)} → ${fmtBR(checkout)}`;
  const cabecalho = `📅 ${periodo} · ${plural(noites, "noite", "noites")} · ${plural(hospedes, "pessoa", "pessoas")}`;
  const bloco = c => `*${c.nome}*\n💰 Diária ${fmtBRL(c.diaria)}\n*Total: ${fmtBRL(c.total)}*`;

  // Percorre a TABELA na ordem de prioridade, só imóveis que comportam o grupo
  // e fora de `excluir`, e cota os primeiros livres, evitando repetir
  // condomínio enquanto houver opção de outro (mesma regra da apresentação do
  // Art Pré). Imóvel ocupado não aparece. Exige a ocupação já carregada.
  async function buscarSugestoes(excluir) {
    const candidatos = TABELA.filter(t => t[2] >= hospedes && excluir.indexOf(t[0]) === -1);
    const cotados = [];
    const condominios = [];
    const adiados = [];
    async function tentar(t) {
      const r = await cotarImovel(t[0]);
      if (r && r !== "ocupado") { cotados.push(r); condominios.push(t[1]); }
    }
    for (const t of candidatos) {
      if (cotados.length >= MAX_SUGESTOES) break;
      if (t[1] !== "independente" && condominios.indexOf(t[1]) !== -1) { adiados.push(t); continue; }
      await tentar(t);
    }
    for (const t of adiados) {
      if (cotados.length >= MAX_SUGESTOES) break;
      await tentar(t);
    }
    return cotados;
  }

  const livres = n => n === 1 ? `Essa tá livre nessas datas:` : `Essas tão livres nessas datas:`;

  // Modo sugestão: o lead não escolheu imóvel.
  async function sugerir() {
    // Sem hóspedes não dá pra filtrar capacidade: chutar 2 ofereceria studio
    // pra grupo grande.
    if (!hospedesInformado) {
      erros.push(`sem imóvel e sem nº de hóspedes (recebido: ${JSON.stringify(dados.hospedes)})`);
      return concluir("falha", MSG_FALHA);
    }
    if (!TABELA.some(t => t[2] >= hospedes)) {
      erros.push(`nenhum imóvel da TABELA comporta ${hospedes} pessoas`);
      return concluir("falha", MSG_FALHA);
    }
    if (!(await carregarOcupacao())) return concluir("falha", MSG_FALHA);

    const cotados = await buscarSugestoes([]);

    if (cotados.length > 0) {
      return concluir("cotado", [
        cabecalho,
        livres(cotados.length),
        ...cotados.map(bloco),
        PASSAGEM,
      ].join("\n\n"));
    }
    // Só diz "sem vaga" se todos os candidatos foram conferidos sem erro.
    if (erros.length === 0) {
      return concluir("indisponivel",
        `Poxa, de ${fmtBR(checkin)} a ${fmtBR(checkout)} não tenho vaga pra ${plural(hospedes, "pessoa", "pessoas")} 😕\n\n` +
        `O Mateus vai ver com vc outras possibilidades 💙`);
    }
    return concluir("falha", MSG_FALHA);
  }

  if (semImovel) return sugerir();
  if (alvos.length === 0) return concluir("falha", MSG_FALHA);
  if (!(await carregarOcupacao())) return concluir("falha", MSG_FALHA);

  const cotados = [];
  const ocupados = [];
  for (const imovelId of alvos) {
    const r = await cotarImovel(imovelId);
    if (r === "ocupado") ocupados.push(NOMES[imovelId] || imovelId);
    else if (r) cotados.push(r);
  }

  const linhas = [];

  if (cotados.length > 0) {
    linhas.push(cabecalho);
    for (const c of cotados) linhas.push(bloco(c));
    if (ocupados.length > 0) {
      linhas.push(`${listaNomes(ocupados)} já ${ocupados.length === 1 ? "tá reservado" : "tão reservados"} nessas datas.`);
    }
    linhas.push(PASSAGEM);
    return concluir("cotado", linhas.join("\n\n"));
  }

  // Nada cotado. Só diz "sem vaga" quando TODOS os imóveis foram conferidos e
  // estão ocupados — falha técnica nunca vira indisponível, senão o lead
  // desiste de uma data que pode estar vaga.
  if (erros.length === 0 && ocupados.length > 0) {
    const reservado = `${listaNomes(ocupados)} já ${ocupados.length === 1 ? "tá reservado" : "tão reservados"}`;

    // Escolhido(s) ocupado(s): oferece os outros imóveis livres nas mesmas
    // datas que comportam o grupo. Se a busca não achar nenhum (ou falhar no
    // meio), o lead recebe só o aviso de reservado — que é verdade — e o
    // Mateus segue com outras opções.
    if (hospedesInformado) {
      const alternativas = await buscarSugestoes(alvos);
      if (alternativas.length > 0) {
        return concluir("alternativas", [
          `Poxa, ${reservado} nessas datas 😕`,
          cabecalho,
          alternativas.length === 1 ? `Mas essa tá livre:` : `Mas essas tão livres:`,
          ...alternativas.map(bloco),
          PASSAGEM,
        ].join("\n\n"));
      }
    }

    return concluir("indisponivel",
      `Poxa, ${reservado} de ${fmtBR(checkin)} a ${fmtBR(checkout)} 😕\n\n` +
      `O Mateus vai ver com vc outras opções pra essas datas 💙`);
  }
  return concluir("falha", MSG_FALHA);
}

// Leitura dos campos com .then(): `await` direto em getValue/getAdditionalValue
// quebra nesse engine (ver histórico em mcp-resumo-lead-setup.md). O resto do
// fluxo usa await normalmente, como no MCP1-Stays em produção.
return Promise.all([
  lerCampo(CAMPOS.imovel),
  lerCampo(CAMPOS.checkin),
  lerCampo(CAMPOS.checkout),
  lerCampo(CAMPOS.hospedes),
]).then(function (r) {
  return cotacao({ imovel: r[0], checkin: r[1], checkout: r[2], hospedes: r[3] });
}).catch(function (e) {
  return Promise.resolve(session.setAdditionalValue("erro_stays", `falha geral: ${e && e.message}`))
    .catch(function () {})
    .then(function () { return session.setAdditionalValue("resposta_cotacao", MSG_FALHA); })
    .then(function () { return { status: "falha" }; });
});
