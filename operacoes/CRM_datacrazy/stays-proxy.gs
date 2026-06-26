/**
 * Stays API Proxy — para a IA do Datacrazy
 *
 * Deploy: Extensions > Apps Script > Deploy > Web app
 * - Execute as: Me
 * - Who has access: Anyone
 *
 * API Stays /external/v1 — somente leitura.
 * Escrita de tarifas/taxas não é suportada pela API externa.
 */

var STAYS_LOGIN = "5b5be656";
var STAYS_SENHA = "fe48e730";
var STAYS_BASE  = "https://artezian.stays.net/external/v1";

// ─── Roteador ─────────────────────────────────────────────────────────────

function doGet(e) {
  var p      = e.parameter;
  var action = p.action || "";

  try {
    var result;
    if      (action === "preco")           result = calcularPreco(p);
    else if (action === "disponibilidade") result = verificarDisponibilidade(p);
    else if (action === "imoveis")         result = listarImoveis(p);
    else if (action === "imovel")          result = detalheImovel(p);
    else if (action === "reservas")        result = listarReservas(p);
    else if (action === "reserva")         result = detalheReserva(p);
    else if (action === "ocupacao")        result = ocupacaoPeriodo(p);
    else if (action === "financeiro")      result = resumoFinanceiro(p);
    else if (action === "hospedes")        result = listarHospedes(p);
    else result = {
      erro: "action inválida",
      actions_disponiveis: [
        "preco", "disponibilidade", "imoveis", "imovel",
        "reservas", "reserva", "ocupacao", "financeiro", "hospedes"
      ]
    };

    return jsonOk(result);
  } catch (err) {
    return jsonOk({ erro: err.message });
  }
}

// ─── IMÓVEIS ──────────────────────────────────────────────────────────────

/**
 * Calcula preço e disponibilidade para um imóvel e período.
 * Params: imovel, checkin (YYYY-MM-DD), checkout (YYYY-MM-DD), hospedes
 * Exemplo: ?action=preco&imovel=DS03J&checkin=2026-09-10&checkout=2026-09-14&hospedes=2
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

  var dados = staysPost("/booking/calculate-price", {
    listingIds: [imovel],
    from: checkin,
    to: checkout,
    guests: hospedes
  });

  if (!dados || dados.length === 0) {
    return {
      disponivel: false,
      imovel: imovel,
      checkin: checkin,
      checkout: checkout,
      noites: noites,
      mensagem: "Imóvel indisponível ou sem tarifa para o período."
    };
  }

  var item        = dados[0];
  var total       = item._mctotal ? item._mctotal.BRL : 0;
  var fees        = item.fees || [];
  var taxas_total = 0;
  var limpeza     = 0;
  var detalhe_taxas = [];

  fees.forEach(function(f) {
    var val = f._mcval ? f._mcval.BRL : 0;
    taxas_total += val;
    detalhe_taxas.push({ nome: f.internalName, valor: val });
    if ((f.internalName || "").toLowerCase().indexOf("limpeza") >= 0) {
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
 * Verifica disponibilidade (resposta simplificada).
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
 * Lista imóveis ativos com filtro opcional por capacidade.
 * Params: hospedes (opcional)
 * Exemplo: ?action=imoveis&hospedes=6
 */
function listarImoveis(p) {
  var hospedes = parseInt(p.hospedes) || 0;
  var listings = staysGet("/content/listings");

  var ativos = listings.filter(function(l) {
    if (l.status !== "active") return false;
    if (hospedes > 0 && (l._i_maxGuests || 0) < hospedes) return false;
    return true;
  });

  return {
    total: ativos.length,
    imoveis: ativos.map(function(l) {
      var addr = l.address || {};
      return {
        id: l.id,
        nome: l.internalName || l.id,
        regiao: addr.region || addr.city || "",
        max_hospedes: l._i_maxGuests || null,
        quartos: l._i_rooms || null,
        camas: l._i_beds || null,
        banheiros: l._f_bathrooms || null,
        area_m2: l._f_square || null,
        link: "https://www.artezian.com.br/pt/apartment/" + l.id
      };
    })
  };
}

/**
 * Detalhe completo de um imóvel.
 * Params: imovel
 * Exemplo: ?action=imovel&imovel=GF02J
 */
function detalheImovel(p) {
  var imovel = p.imovel || "";
  if (!imovel) return { erro: "Parâmetro obrigatório: imovel" };

  var l    = staysGet("/content/listings/" + imovel);
  var addr = l.address || {};
  var desc = (l._msdesc || {}).pt_BR || "";
  var title = (l._mstitle || {});

  return {
    id: l.id,
    nome: l.internalName || l.id,
    titulo_pt: title.pt_BR || "",
    titulo_en: title.en_US || "",
    tipo: (l._t_typeMeta && l._t_typeMeta._mstitle) ? (l._t_typeMeta._mstitle.pt_BR || "") : "",
    subtipo: l.subtype || "",
    regiao: addr.region || "",
    cidade: addr.city || "",
    max_hospedes: l._i_maxGuests || null,
    quartos: l._i_rooms || null,
    camas: l._i_beds || null,
    banheiros: l._f_bathrooms || null,
    area_m2: l._f_square || null,
    descricao: stripHtml(desc).substring(0, 800),
    link: "https://www.artezian.com.br/pt/apartment/" + l.id,
    foto: (l._t_mainImageMeta || {}).url || "",
    status: l.status
  };
}

// ─── RESERVAS ─────────────────────────────────────────────────────────────

/**
 * Lista reservas por período.
 * Params:
 *   from, to (YYYY-MM-DD) — obrigatórios
 *   tipo_data: arrival | departure | creation | included (default: arrival)
 *   imovel: filtra por imóvel (opcional)
 *   status: booked | reserved | cancelled (opcional)
 *
 * Exemplo: ?action=reservas&from=2026-07-01&to=2026-07-31&tipo_data=arrival
 */
function listarReservas(p) {
  var from      = p.from      || "";
  var to        = p.to        || "";
  var tipoData  = p.tipo_data || "arrival";
  var imovelId  = p.imovel    || "";
  var status    = p.status    || "";

  if (!from || !to) return { erro: "Parâmetros obrigatórios: from, to" };

  var path = "/booking/reservations?from=" + from + "&to=" + to + "&dateType=" + tipoData;
  if (status) path += "&type=" + status;

  var reservas = staysGet(path);

  // Filtra por imóvel se passado (API não suporta filtro direto por listingId em todos os casos)
  if (imovelId) {
    var listing = staysGet("/content/listings/" + imovelId);
    var idInterno = listing._id || "";
    if (idInterno) {
      reservas = reservas.filter(function(r) { return r._idlisting === idInterno; });
    }
  }

  return {
    total: reservas.length,
    periodo: from + " → " + to,
    tipo_data: tipoData,
    reservas: reservas.map(function(r) {
      var fees = (r.price && r.price.hostingDetails) ? (r.price.hostingDetails.fees || []) : [];
      var limpeza = 0;
      fees.forEach(function(f) {
        if ((f.name || "").toLowerCase().indexOf("limpeza") >= 0) limpeza = f._f_val || 0;
      });
      return {
        id: r.id,
        _id: r._id,
        _idlisting: r._idlisting,
        checkin: r.checkInDate,
        checkout: r.checkOutDate,
        noites: diffNoites(r.checkInDate, r.checkOutDate),
        hospedes: r.guests || 0,
        total: r.price ? r.price._f_total : 0,
        total_pago: r.stats ? r.stats._f_totalPaid : 0,
        taxa_limpeza: limpeza,
        status: r.type,
        criada_em: r.creationDate,
        url_reserva: r.reservationUrl || ""
      };
    })
  };
}

/**
 * Detalhe completo de uma reserva.
 * Params: id (o _id da reserva, ex: 6a3bc959fd6c75dc2e7d09ad)
 * Exemplo: ?action=reserva&id=6a3bc959fd6c75dc2e7d09ad
 */
function detalheReserva(p) {
  var id = p.id || "";
  if (!id) return { erro: "Parâmetro obrigatório: id (o _id da reserva)" };

  var r    = staysGet("/booking/reservations/" + id);
  var fees = (r.price && r.price.hostingDetails) ? (r.price.hostingDetails.fees || []) : [];
  var guests = (r.guestsDetails && r.guestsDetails.list) ? r.guestsDetails.list : [];

  return {
    id: r.id,
    _id: r._id,
    _idlisting: r._idlisting,
    _idclient: r._idclient,
    checkin: r.checkInDate,
    checkout: r.checkOutDate,
    horario_checkin: r.checkInTime,
    horario_checkout: r.checkOutTime,
    noites: diffNoites(r.checkInDate, r.checkOutDate),
    hospedes: r.guests || 0,
    adultos: (r.guestsDetails || {}).adults || 0,
    criancas: (r.guestsDetails || {}).children || 0,
    lista_hospedes: guests.map(function(g) { return { tipo: g.type, nome: g.name || "" }; }),
    status: r.type,
    criada_em: r.creationDate,
    total_esperado: r.price ? (r.price._f_expected || 0) : 0,
    total: r.price ? r.price._f_total : 0,
    total_pago: r.stats ? r.stats._f_totalPaid : 0,
    diaria: r.price && r.price.hostingDetails ? r.price.hostingDetails._f_nightPrice : 0,
    taxas: fees.map(function(f) { return { nome: f.name, valor: f._f_val, id_taxa: f._idfee }; }),
    url_reserva: r.reservationUrl || "",
    agente: r.agent ? r.agent.name : ""
  };
}

/**
 * Mapa de ocupação: quais imóveis estão ocupados em cada período.
 * Params: from, to (YYYY-MM-DD)
 * Exemplo: ?action=ocupacao&from=2026-07-01&to=2026-07-31
 */
function ocupacaoPeriodo(p) {
  var from = p.from || "";
  var to   = p.to   || "";
  if (!from || !to) return { erro: "Parâmetros obrigatórios: from, to" };

  var reservas = staysGet("/booking/reservations?from=" + from + "&to=" + to + "&dateType=included");
  var listings = staysGet("/content/listings");

  // Mapeia _id interno → nome do imóvel
  var nomes = {};
  listings.forEach(function(l) { nomes[l._id] = l.internalName || l.id; });

  // Agrupa por imóvel
  var por_imovel = {};
  reservas.forEach(function(r) {
    var lid = r._idlisting;
    if (!por_imovel[lid]) por_imovel[lid] = { nome: nomes[lid] || lid, reservas: [] };
    por_imovel[lid].reservas.push({
      id: r.id,
      checkin: r.checkInDate,
      checkout: r.checkOutDate,
      hospedes: r.guests || 0,
      status: r.type,
      total: r.price ? r.price._f_total : 0
    });
  });

  var resultado = Object.keys(por_imovel).map(function(lid) {
    return {
      _idlisting: lid,
      nome: por_imovel[lid].nome,
      total_reservas: por_imovel[lid].reservas.length,
      reservas: por_imovel[lid].reservas
    };
  });

  return {
    periodo: from + " → " + to,
    total_reservas: reservas.length,
    imoveis_ocupados: resultado.length,
    ocupacao: resultado
  };
}

/**
 * Resumo financeiro de um período: receita total, por imóvel, taxas cobradas.
 * Params: from, to (YYYY-MM-DD), tipo_data (default: arrival)
 * Exemplo: ?action=financeiro&from=2026-07-01&to=2026-07-31
 */
function resumoFinanceiro(p) {
  var from     = p.from      || "";
  var to       = p.to        || "";
  var tipoData = p.tipo_data || "arrival";
  if (!from || !to) return { erro: "Parâmetros obrigatórios: from, to" };

  var reservas = staysGet("/booking/reservations?from=" + from + "&to=" + to + "&dateType=" + tipoData + "&type=booked");
  var listings = staysGet("/content/listings");

  var nomes = {};
  listings.forEach(function(l) { nomes[l._id] = l.internalName || l.id; });

  var receita_total  = 0;
  var recebido_total = 0;
  var limpeza_total  = 0;
  var por_imovel     = {};

  reservas.forEach(function(r) {
    var total   = r.price ? (r.price._f_total || 0) : 0;
    var pago    = r.stats ? (r.stats._f_totalPaid || 0) : 0;
    var fees    = (r.price && r.price.hostingDetails) ? (r.price.hostingDetails.fees || []) : [];
    var limpeza = 0;
    fees.forEach(function(f) {
      if ((f.name || "").toLowerCase().indexOf("limpeza") >= 0) limpeza += (f._f_val || 0);
    });

    receita_total  += total;
    recebido_total += pago;
    limpeza_total  += limpeza;

    var lid = r._idlisting;
    if (!por_imovel[lid]) por_imovel[lid] = { nome: nomes[lid] || lid, reservas: 0, receita: 0, recebido: 0 };
    por_imovel[lid].reservas++;
    por_imovel[lid].receita  += total;
    por_imovel[lid].recebido += pago;
  });

  return {
    periodo: from + " → " + to,
    tipo_data: tipoData,
    total_reservas: reservas.length,
    receita_total: receita_total,
    recebido_total: recebido_total,
    a_receber: receita_total - recebido_total,
    taxa_limpeza_total: limpeza_total,
    receita_hospedagem: receita_total - limpeza_total,
    por_imovel: Object.keys(por_imovel).map(function(lid) {
      return {
        nome: por_imovel[lid].nome,
        reservas: por_imovel[lid].reservas,
        receita: por_imovel[lid].receita,
        recebido: por_imovel[lid].recebido
      };
    }).sort(function(a, b) { return b.receita - a.receita; })
  };
}

/**
 * Lista hóspedes com check-in em um período.
 * Params: from, to (YYYY-MM-DD)
 * Exemplo: ?action=hospedes&from=2026-07-01&to=2026-07-31
 */
function listarHospedes(p) {
  var from = p.from || "";
  var to   = p.to   || "";
  if (!from || !to) return { erro: "Parâmetros obrigatórios: from, to" };

  var reservas = staysGet("/booking/reservations?from=" + from + "&to=" + to + "&dateType=arrival&type=booked");
  var listings = staysGet("/content/listings");

  var nomes = {};
  listings.forEach(function(l) { nomes[l._id] = l.internalName || l.id; });

  return {
    periodo: from + " → " + to,
    total: reservas.length,
    hospedes: reservas.map(function(r) {
      var lista = (r.guestsDetails && r.guestsDetails.list) ? r.guestsDetails.list : [];
      var titular = lista.length > 0 ? lista[0].name : "";
      return {
        reserva_id: r.id,
        imovel: nomes[r._idlisting] || r._idlisting,
        checkin: r.checkInDate,
        checkout: r.checkOutDate,
        total_hospedes: r.guests || 0,
        titular: titular,
        url_reserva: r.reservationUrl || ""
      };
    }).sort(function(a, b) { return a.checkin > b.checkin ? 1 : -1; })
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
    throw new Error("Stays GET " + path + " → " + resp.getResponseCode() + ": " + resp.getContentText().substring(0, 300));
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
    throw new Error("Stays POST " + path + " → " + resp.getResponseCode() + ": " + resp.getContentText().substring(0, 300));
  }
  return JSON.parse(resp.getContentText());
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
