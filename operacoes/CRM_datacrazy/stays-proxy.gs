/**
 * Stays API Proxy — para a IA do Datacrazy
 *
 * Deploy: Extensions > Apps Script > Deploy > New deployment > Web app
 * - Execute as: Me
 * - Who has access: Anyone
 *
 * Após deploy, copiar a URL gerada e configurar no Datacrazy como HTTP Tool.
 */

var STAYS_LOGIN = "5b5be656";
var STAYS_SENHA = "fe48e730";
var STAYS_BASE  = "https://artezian.stays.net/external/v1";

// ─── Roteador principal ────────────────────────────────────────────────────

function doGet(e) {
  var p      = e.parameter;
  var action = p.action || "";

  try {
    var result;
    if      (action === "preco")        result = calcularPreco(p);
    else if (action === "disponibilidade") result = verificarDisponibilidade(p);
    else if (action === "imoveis")      result = listarImoveis(p);
    else if (action === "imovel")       result = detalheImovel(p);
    else result = { erro: "action inválida. Use: preco | disponibilidade | imoveis | imovel" };

    return jsonOk(result);
  } catch (err) {
    return jsonOk({ erro: err.message });
  }
}

// ─── Actions ──────────────────────────────────────────────────────────────

/**
 * Calcula preço e disponibilidade para um imóvel e período.
 *
 * Params: imovel, checkin (YYYY-MM-DD), checkout (YYYY-MM-DD), hospedes (default 2)
 *
 * Exemplo:
 * ?action=preco&imovel=DS03J&checkin=2026-07-10&checkout=2026-07-14&hospedes=4
 */
function calcularPreco(p) {
  var imovel   = p.imovel   || "";
  var checkin  = p.checkin  || "";
  var checkout = p.checkout || "";
  var hospedes = parseInt(p.hospedes) || 2;

  if (!imovel || !checkin || !checkout) {
    return { erro: "Parâmetros obrigatórios: imovel, checkin, checkout" };
  }

  var noites = diffNoites(checkin, checkout);
  if (noites <= 0) return { erro: "checkout deve ser após checkin" };

  var dados = staysCalcularPreco([imovel], checkin, checkout, hospedes);
  if (!dados || dados.length === 0) {
    return {
      disponivel: false,
      imovel: imovel,
      checkin: checkin,
      checkout: checkout,
      noites: noites,
      hospedes: hospedes,
      mensagem: "Imóvel indisponível ou sem tarifa configurada para o período."
    };
  }

  var item       = dados[0];
  var total      = item._mctotal ? item._mctotal.BRL : 0;
  var fees       = item.fees || [];
  var taxas_total = 0;
  var limpeza    = 0;
  var detalhe_taxas = [];

  fees.forEach(function(f) {
    var val = f._mcval ? f._mcval.BRL : 0;
    taxas_total += val;
    detalhe_taxas.push({ nome: f.internalName, valor: val });
    if (f.internalName && f.internalName.toLowerCase().indexOf("limpeza") >= 0) {
      limpeza = val;
    }
  });

  var valor_hospedagem = total - taxas_total;
  var diaria = noites > 0 ? Math.round(valor_hospedagem / noites) : 0;

  return {
    disponivel: true,
    imovel: imovel,
    checkin: checkin,
    checkout: checkout,
    noites: noites,
    hospedes: hospedes,
    diaria: diaria,
    valor_hospedagem: valor_hospedagem,
    taxa_limpeza: limpeza,
    total: total,
    moeda: "BRL",
    taxas: detalhe_taxas,
    resumo: "R$" + diaria + "/noite · " + noites + " noites · total R$" + total
  };
}

/**
 * Verifica se um imóvel está disponível (retorno booleano simples).
 *
 * Params: imovel, checkin, checkout, hospedes
 */
function verificarDisponibilidade(p) {
  var resultado = calcularPreco(p);
  return {
    disponivel: resultado.disponivel === true,
    imovel: resultado.imovel,
    checkin: resultado.checkin,
    checkout: resultado.checkout,
    noites: resultado.noites,
    mensagem: resultado.disponivel
      ? "Disponível · " + resultado.resumo
      : (resultado.mensagem || "Indisponível para o período")
  };
}

/**
 * Lista imóveis ativos com opção de filtrar por capacidade.
 *
 * Params: hospedes (opcional — filtra por capacidade mínima)
 *
 * Exemplo: ?action=imoveis&hospedes=6
 */
function listarImoveis(p) {
  var hospedes = parseInt(p.hospedes) || 0;
  var listings = staysListings();

  var ativos = listings.filter(function(l) {
    if (l.status !== "active") return false;
    if (hospedes > 0 && (l._i_maxGuests || 0) < hospedes) return false;
    return true;
  });

  var resultado = ativos.map(function(l) {
    var addr = l.address || {};
    return {
      id: l.id,
      nome: l.internalName || l.id,
      regiao: addr.region || addr.city || "",
      max_hospedes: l._i_maxGuests || null,
      quartos: l._i_rooms || null,
      banheiros: l._f_bathrooms || null,
      link: "https://www.artezian.com.br/pt/apartment/" + l.id
    };
  });

  return {
    total: resultado.length,
    imoveis: resultado
  };
}

/**
 * Retorna detalhes de um imóvel específico.
 *
 * Params: imovel
 *
 * Exemplo: ?action=imovel&imovel=GF02J
 */
function detalheImovel(p) {
  var imovel = p.imovel || "";
  if (!imovel) return { erro: "Parâmetro obrigatório: imovel" };

  var l    = staysListingById(imovel);
  var addr = l.address || {};
  var desc = (l._msdesc || {}).pt_BR || "";

  return {
    id: l.id,
    nome: l.internalName || l.id,
    titulo: ((l._mstitle || {}).pt_BR) || "",
    regiao: addr.region || addr.city || "",
    cidade: addr.city || "",
    max_hospedes: l._i_maxGuests || null,
    quartos: l._i_rooms || null,
    camas: l._i_beds || null,
    banheiros: l._f_bathrooms || null,
    area_m2: l._f_square || null,
    descricao: stripHtml(desc).substring(0, 500),
    link: "https://www.artezian.com.br/pt/apartment/" + l.id,
    foto: (l._t_mainImageMeta || {}).url || "",
    status: l.status
  };
}

// ─── Stays API helpers ────────────────────────────────────────────────────

function authHeader() {
  return "Basic " + Utilities.base64Encode(STAYS_LOGIN + ":" + STAYS_SENHA);
}

function staysGet(path) {
  var resp = UrlFetchApp.fetch(STAYS_BASE + path, {
    method: "get",
    headers: { Authorization: authHeader() },
    muteHttpExceptions: true
  });
  if (resp.getResponseCode() !== 200) {
    throw new Error("Stays GET " + path + " → " + resp.getResponseCode() + ": " + resp.getContentText().substring(0, 200));
  }
  return JSON.parse(resp.getContentText());
}

function staysPost(path, payload) {
  var resp = UrlFetchApp.fetch(STAYS_BASE + path, {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: authHeader() },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  if (resp.getResponseCode() !== 200) {
    throw new Error("Stays POST " + path + " → " + resp.getResponseCode() + ": " + resp.getContentText().substring(0, 200));
  }
  return JSON.parse(resp.getContentText());
}

function staysListings() {
  return staysGet("/content/listings");
}

function staysListingById(id) {
  return staysGet("/content/listings/" + id);
}

function staysCalcularPreco(listingIds, from, to, guests) {
  return staysPost("/booking/calculate-price", {
    listingIds: listingIds,
    from: from,
    to: to,
    guests: guests
  });
}

// ─── Utils ────────────────────────────────────────────────────────────────

function diffNoites(checkin, checkout) {
  var d1 = new Date(checkin);
  var d2 = new Date(checkout);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

function stripHtml(html) {
  return (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function jsonOk(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}
