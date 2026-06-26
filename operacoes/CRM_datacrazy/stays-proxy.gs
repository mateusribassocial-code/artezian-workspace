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
    if      (action === "preco")           result = calcularPreco(p);
    else if (action === "disponibilidade") result = verificarDisponibilidade(p);
    else if (action === "imoveis")         result = listarImoveis(p);
    else if (action === "imovel")          result = detalheImovel(p);
    else if (action === "listar_taxas")    result = listarTaxas(p);
    else if (action === "listar_tarifas")  result = listarTarifas(p);
    else if (action === "diagnostico")     result = diagnosticoTaxas(p);
    else if (action === "raw_get")         result = staysGet(p.path || "/content/listings");
    else result = { erro: "action inválida. Use: preco | disponibilidade | imoveis | imovel | listar_taxas | listar_tarifas | diagnostico | raw_get" };

    return jsonOk(result);
  } catch (err) {
    return jsonOk({ erro: err.message });
  }
}

function doPost(e) {
  var p = {};
  try {
    // Aceita parâmetros tanto por query string quanto por JSON body
    if (e.postData && e.postData.contents) {
      p = JSON.parse(e.postData.contents);
    } else {
      p = e.parameter || {};
    }
  } catch (err) {
    p = e.parameter || {};
  }

  var action = p.action || "";

  try {
    var result;
    if      (action === "remover_taxa_limpeza") result = removerTaxaLimpeza(p);
    else if (action === "atualizar_diaria")     result = atualizarDiaria(p);
    else result = { erro: "action inválida. Use: remover_taxa_limpeza | atualizar_diaria" };

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

/**
 * Lista todas as taxas/fees de um imóvel.
 * Útil pra pegar o ID da taxa de limpeza antes de remover.
 *
 * Params: imovel
 * Exemplo: ?action=listar_taxas&imovel=DS03J
 */
function listarTaxas(p) {
  var imovel = p.imovel || "";
  if (!imovel) return { erro: "Parâmetro obrigatório: imovel" };

  var listing = staysGet("/content/listings/" + imovel);
  var fees = listing.fees || listing._o_fees || [];

  var taxas = fees.map(function(f) {
    return {
      id:    f._id || f.id || null,
      nome:  f.internalName || f.name || "",
      tipo:  f._s_type || f.type || "",
      valor: f._mcval ? (f._mcval.BRL || 0) : (f.value || 0)
    };
  });

  return {
    imovel: imovel,
    total_taxas: taxas.length,
    taxas: taxas
  };
}

/**
 * Lista os planos de tarifa (rate plans) de um imóvel.
 *
 * Params: imovel
 * Exemplo: ?action=listar_tarifas&imovel=DS03J
 */
function listarTarifas(p) {
  var imovel = p.imovel || "";
  if (!imovel) return { erro: "Parâmetro obrigatório: imovel" };

  var plans = staysGet("/prices/rates?listingId=" + imovel);
  if (!Array.isArray(plans)) plans = plans.ratePlans || plans.rates || [plans];

  var tarifas = plans.map(function(r) {
    return {
      id:   r._id || r.id || null,
      nome: r.internalName || r.name || "",
      min_noites: r._i_minNights || r.minNights || null,
      valor_base: r._mc_nightlyPrice ? (r._mc_nightlyPrice.BRL || null) : null
    };
  });

  return {
    imovel: imovel,
    total_planos: tarifas.length,
    planos: tarifas
  };
}

/**
 * Remove a taxa de limpeza de um imóvel.
 * Primeiro busca o ID da taxa via listar_taxas, depois deleta.
 *
 * Params: imovel, [taxa_id] (opcional — se omitido, busca automaticamente)
 * Exemplo POST body: { "action": "remover_taxa_limpeza", "imovel": "DS03J" }
 */
function removerTaxaLimpeza(p) {
  var imovel  = p.imovel   || "";
  var taxaId  = p.taxa_id  || "";

  if (!imovel) return { erro: "Parâmetro obrigatório: imovel" };

  // Busca ID automaticamente se não foi passado
  if (!taxaId) {
    var listing = staysGet("/content/listings/" + imovel);
    var fees    = listing.fees || listing._o_fees || [];
    var taxaLimpeza = null;

    for (var i = 0; i < fees.length; i++) {
      var nome = (fees[i].internalName || fees[i].name || "").toLowerCase();
      if (nome.indexOf("limpeza") >= 0 || nome.indexOf("cleaning") >= 0) {
        taxaLimpeza = fees[i];
        break;
      }
    }

    if (!taxaLimpeza) {
      return { erro: "Taxa de limpeza não encontrada para o imóvel " + imovel + ". Use listar_taxas pra ver as taxas disponíveis." };
    }

    taxaId = taxaLimpeza._id || taxaLimpeza.id || "";
    if (!taxaId) {
      return { erro: "Taxa de limpeza encontrada mas sem ID. Verifique com listar_taxas.", taxa: taxaLimpeza };
    }
  }

  staysDelete("/content/fees/" + taxaId);

  return {
    ok: true,
    imovel: imovel,
    taxa_removida: taxaId,
    mensagem: "Taxa de limpeza removida com sucesso."
  };
}

/**
 * Atualiza o valor de diária de um imóvel por temporada.
 * Passa os valores que quiser alterar — os demais ficam intactos.
 *
 * Params: imovel, [baixa], [alta], [feriado], [plano_id] (opcional)
 * Exemplo POST body: { "action": "atualizar_diaria", "imovel": "DS03J", "baixa": 300, "alta": 700 }
 */
function atualizarDiaria(p) {
  var imovel  = p.imovel   || "";
  var baixa   = p.baixa    ? parseFloat(p.baixa)   : null;
  var alta    = p.alta     ? parseFloat(p.alta)    : null;
  var feriado = p.feriado  ? parseFloat(p.feriado) : null;
  var planoId = p.plano_id || "";

  if (!imovel) return { erro: "Parâmetro obrigatório: imovel" };
  if (baixa === null && alta === null && feriado === null) {
    return { erro: "Informe ao menos um valor: baixa, alta ou feriado" };
  }

  // Busca o plano de tarifa do imóvel se não foi passado
  if (!planoId) {
    var plans = staysGet("/prices/rates?listingId=" + imovel);
    if (!Array.isArray(plans)) plans = plans.ratePlans || plans.rates || [plans];
    if (plans.length === 0) return { erro: "Nenhum plano de tarifa encontrado para " + imovel };
    planoId = plans[0]._id || plans[0].id || "";
    if (!planoId) return { erro: "Plano de tarifa sem ID. Use listar_tarifas pra inspecionar." };
  }

  var payload = { listingId: imovel };
  if (baixa   !== null) payload._mc_nightlyPriceLow      = { BRL: baixa };
  if (alta    !== null) payload._mc_nightlyPriceHigh     = { BRL: alta };
  if (feriado !== null) payload._mc_nightlyPriceHoliday  = { BRL: feriado };

  var resultado = staysPut("/prices/rates/" + planoId, payload);

  return {
    ok: true,
    imovel: imovel,
    plano_id: planoId,
    atualizado: {
      baixa:   baixa,
      alta:    alta,
      feriado: feriado
    },
    resposta: resultado
  };
}

/**
 * Diagnóstico: chama calculate-price pra um período teste e retorna
 * o objeto completo de fees com todos os campos (incluindo IDs).
 * Também testa endpoints alternativos de taxas e tarifas.
 *
 * Params: imovel (default DS03J)
 * Exemplo: ?action=diagnostico&imovel=DS03J
 */
function diagnosticoTaxas(p) {
  var imovel = p.imovel || "DS03J";

  // Calcula datas: checkin daqui 30 dias, 2 noites
  var hoje    = new Date();
  var checkin  = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
  var checkout = new Date(hoje.getTime() + 32 * 24 * 60 * 60 * 1000);
  var fmt = function(d) { return d.toISOString().split("T")[0]; };

  var calcRaw = staysPost("/booking/calculate-price", {
    listingIds: [imovel],
    from: fmt(checkin),
    to: fmt(checkout),
    guests: 2
  });

  var item       = (calcRaw && calcRaw.length > 0) ? calcRaw[0] : {};
  var fees       = item.fees || [];
  var allKeys    = Object.keys(item);
  var feesComIds = fees.map(function(f) { return JSON.parse(JSON.stringify(f)); });

  // Tenta endpoints alternativos pra taxas
  var endpointsTaxas = [
    "/content/extra-charges",
    "/content/fees",
    "/content/listings/" + imovel + "/fees",
    "/content/listings/" + imovel + "/extra-charges"
  ];
  var probes = {};
  endpointsTaxas.forEach(function(ep) {
    try {
      probes[ep] = staysGet(ep);
    } catch (e) {
      probes[ep] = { erro: e.message };
    }
  });

  // Tenta endpoints alternativos pra tarifas
  var endpointsTarifas = [
    "/prices/listing/" + imovel,
    "/prices/seasons?listingId=" + imovel,
    "/prices/rates/" + imovel,
    "/content/listings/" + imovel + "/rates"
  ];
  endpointsTarifas.forEach(function(ep) {
    try {
      probes[ep] = staysGet(ep);
    } catch (e) {
      probes[ep] = { erro: e.message };
    }
  });

  return {
    imovel: imovel,
    periodo_teste: fmt(checkin) + " → " + fmt(checkout),
    calc_price_keys: allKeys,
    fees_raw: feesComIds,
    total_fees: fees.length,
    probes: probes
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

function staysPut(path, payload) {
  var resp = UrlFetchApp.fetch(STAYS_BASE + path, {
    method: "put",
    contentType: "application/json",
    headers: { Authorization: authHeader() },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  if (resp.getResponseCode() !== 200 && resp.getResponseCode() !== 204) {
    throw new Error("Stays PUT " + path + " → " + resp.getResponseCode() + ": " + resp.getContentText().substring(0, 200));
  }
  var body = resp.getContentText();
  return body ? JSON.parse(body) : { ok: true };
}

function staysDelete(path) {
  var resp = UrlFetchApp.fetch(STAYS_BASE + path, {
    method: "delete",
    headers: { Authorization: authHeader() },
    muteHttpExceptions: true
  });
  if (resp.getResponseCode() !== 200 && resp.getResponseCode() !== 204) {
    throw new Error("Stays DELETE " + path + " → " + resp.getResponseCode() + ": " + resp.getContentText().substring(0, 200));
  }
  return { ok: true };
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
