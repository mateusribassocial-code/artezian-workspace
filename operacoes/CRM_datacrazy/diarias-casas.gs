/**
 * Artezian — Diárias das Casas do catálogo
 * Le a planilha "Casas — Calendário de Diárias (numérico)": uma linha por casa
 * (nome + código na coluna A, capacidade máxima na coluna B), com o preço de
 * cada dia específico nas colunas seguintes — calendário contínuo, sem
 * lacunas, de 01/07/2026 em diante. Diferente do Vila do Mundaí (mês/dia sem
 * ano, casado por padrão), aqui a data é resolvida direto por diferença de
 * dias a partir da primeira coluna de preço.
 *
 * Deploy: script.google.com → Novo projeto → cola este conteúdo →
 * Implantar → Nova implantação → Web app
 * - Execute as: Me
 * - Who has access: Anyone
 */

var SHEET_ID              = "1DkfupmGIU3bN5iHa2Ig1xzMo4L6OfbiI7k_MBpmJRxk";
var DATA_INICIO           = new Date(2026, 6, 1); // 01/07/2026 — data da primeira coluna de preço
var COL_PRECO_INICIO      = 2;                    // índice 0-based da 1ª coluna de datas (coluna C)
var LINHA_DADOS_INICIO    = 4;                     // índice 0-based da 1ª linha de casa (linha 5 na planilha)

function doGet(e) {
  return rotear(e.parameter || {});
}

// doPost — bloco HTTP Request do Datacrazy manda o JSON no corpo
function doPost(e) {
  var p = {};
  try {
    if (e.postData && e.postData.contents) {
      p = JSON.parse(e.postData.contents);
    } else {
      p = e.parameter || {};
    }
  } catch (err) {
    p = e.parameter || {};
  }
  return rotear(p);
}

function rotear(p) {
  var action = p.action || "diarias_periodo";

  try {
    if (action === "diaria_casa")     return jsonOk(diariaCasa(p));
    if (action === "diarias_periodo") return jsonOk(diariasPeriodo(p));
    if (action === "listar_casas")    return jsonOk(listarCasas());
    return jsonOk({ erro: "Ação desconhecida: " + action, actions_disponiveis: ["diaria_casa", "diarias_periodo", "listar_casas"] });
  } catch (err) {
    return jsonOk({ erro: "Erro interno: " + err.message });
  }
}

/**
 * Diária média e total de UMA casa num período.
 * Params: casa (nome ou código, ex: GF02J ou "Tremura"), checkin, checkout (AAAA-MM-DD), hospedes (opcional)
 */
function diariaCasa(p) {
  var busca    = (p.casa || "").toLowerCase().trim();
  var checkin  = parseData(p.checkin);
  var checkout = parseData(p.checkout);
  var hospedes = parseInt(p.hospedes, 10) || 0;

  if (!busca) return { erro: "Parâmetro 'casa' obrigatório (nome ou código, ex: GF02J)." };
  if (!checkin || !checkout) return { erro: "Parâmetros 'checkin' e 'checkout' devem estar no formato AAAA-MM-DD." };
  if (checkout <= checkin) return { erro: "Checkout deve ser depois do checkin." };

  var dados = lerPlanilha();
  var linha = encontrarCasa(dados, busca);
  if (!linha) {
    return { erro: "Casa não encontrada: " + p.casa, casas_disponiveis: dados.map(function (l) { return l.nome + " (" + l.codigo + ")"; }) };
  }

  return calcularDiaria(linha, checkin, checkout, hospedes);
}

/**
 * Diária de TODAS as casas do catálogo num período — uma chamada só, sem
 * precisar saber o código de cada uma. Ordenado por diária (mais barata primeiro).
 * Params: checkin, checkout (AAAA-MM-DD), hospedes (opcional)
 */
function diariasPeriodo(p) {
  var checkin  = parseData(p.checkin);
  var checkout = parseData(p.checkout);
  var hospedes = parseInt(p.hospedes, 10) || 0;

  if (!checkin || !checkout) return { erro: "Parâmetros 'checkin' e 'checkout' devem estar no formato AAAA-MM-DD." };
  if (checkout <= checkin) return { erro: "Checkout deve ser depois do checkin." };

  var dados = lerPlanilha();
  var resultado = dados.map(function (linha) {
    return calcularDiaria(linha, checkin, checkout, hospedes);
  });

  resultado.sort(function (a, b) {
    if (!!a.erro !== !!b.erro) return a.erro ? 1 : -1;
    return (a.valor_medio_diaria || 0) - (b.valor_medio_diaria || 0);
  });

  return {
    checkin: p.checkin,
    checkout: p.checkout,
    total_casas: resultado.length,
    casas: resultado
  };
}

/** Lista as casas do catálogo com código e capacidade máxima. */
function listarCasas() {
  var dados = lerPlanilha();
  return {
    total: dados.length,
    casas: dados.map(function (l) { return { nome: l.nome, codigo: l.codigo, max_hospedes: l.maxHospedes }; })
  };
}

// ─── Leitura da planilha ──────────────────────────────────────────────────

function lerPlanilha() {
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  var dados = sheet.getDataRange().getValues();

  var linhas = [];
  for (var r = LINHA_DADOS_INICIO; r < dados.length; r++) {
    var nomeCompleto = (dados[r][0] || "").toString().trim();
    if (!nomeCompleto) continue;

    var m      = nomeCompleto.match(/^(.*)\s*\(([A-Z0-9]+)\)\s*$/);
    var nome   = m ? m[1].trim() : nomeCompleto;
    var codigo = m ? m[2].trim() : "";

    linhas.push({
      nome: nome,
      codigo: codigo,
      maxHospedes: parseInt(dados[r][1], 10) || null,
      valores: dados[r]
    });
  }
  return linhas;
}

function encontrarCasa(dados, busca) {
  var porCodigo = dados.filter(function (l) { return l.codigo.toLowerCase() === busca; })[0];
  if (porCodigo) return porCodigo;
  return dados.filter(function (l) { return l.nome.toLowerCase().indexOf(busca) >= 0; })[0];
}

// ─── Cálculo de diária ────────────────────────────────────────────────────

function calcularDiaria(linha, checkin, checkout, hospedesSolicitados) {
  var noites       = diffDias(checkin, checkout);
  var precos       = [];
  var diasSemPreco = [];

  for (var i = 0; i < noites; i++) {
    var d = new Date(checkin);
    d.setDate(d.getDate() + i);

    var col   = COL_PRECO_INICIO + diffDias(DATA_INICIO, d);
    var preco = (col >= 0 && col < linha.valores.length) ? linha.valores[col] : undefined;

    if (typeof preco === "number" && preco > 0) {
      precos.push(preco);
    } else {
      diasSemPreco.push(formatarData(d));
    }
  }

  if (precos.length === 0) {
    return {
      nome: linha.nome,
      codigo: linha.codigo,
      max_hospedes: linha.maxHospedes,
      erro: "Nenhum preço encontrado no período (fora do calendário cadastrado ou sem tarifa)."
    };
  }

  var soma  = precos.reduce(function (a, b) { return a + b; }, 0);
  var media = Math.round(soma / precos.length);

  var resultado = {
    nome: linha.nome,
    codigo: linha.codigo,
    max_hospedes: linha.maxHospedes,
    noites: noites,
    valor_medio_diaria: media,
    valor_total_estimado: media * noites,
    resumo: "R$" + media + "/noite (média) · " + noites + " noite(s) · total estimado R$" + (media * noites)
  };

  if (diasSemPreco.length > 0) {
    resultado.aviso = "Sem tarifa cadastrada para " + diasSemPreco.length + " noite(s); excluídas da média.";
    resultado.dias_sem_preco = diasSemPreco;
  }

  if (hospedesSolicitados > 0 && linha.maxHospedes && hospedesSolicitados > linha.maxHospedes) {
    resultado.capacidade_excedida = true;
    resultado.aviso_capacidade = hospedesSolicitados + " pessoas excede a capacidade máxima desta casa (" + linha.maxHospedes + ").";
  }

  return resultado;
}

function diffDias(d1, d2) {
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

function parseData(str) {
  if (!str) return null;
  var m = (str || "").toString().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
}

function formatarData(d) {
  var dd = ("0" + d.getDate()).slice(-2);
  var mm = ("0" + (d.getMonth() + 1)).slice(-2);
  return d.getFullYear() + "-" + mm + "-" + dd;
}

function jsonOk(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
