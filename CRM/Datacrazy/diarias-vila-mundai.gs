/**
 * Artezian — Diárias Vila do Mundaí
 * Calcula a diária média por quantidade de hóspedes, para um período de check-in/check-out.
 * Fonte: planilha Google Sheets "Diárias_Vila do Mundaí" (tabelas de 01 e 02 Quartos
 * empilhadas na mesma aba). A planilha cobre Junho a Dezembro (sem ano) — datas são
 * casadas por mês + dia.
 *
 * Deploy: script.google.com → Novo projeto → cola este conteúdo →
 * Implantar → Nova implantação → Web app
 * - Execute as: Me
 * - Who has access: Anyone
 */

var SHEET_ID = "193zIatG_duMz2R-tsZhl8907XLRLLs10UM0-wUX43YY";
var ABA = "Página1";

var MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
             "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

var TITULOS = {
  "1quarto":  "Apartamentos 01 Quarto",
  "2quartos": "Apartamentos 02 Quartos"
};

function doGet(e) {
  var p = e.parameter;
  var action = p.action || "diaria_media";

  try {
    if (action === "diaria_media") {
      return jsonOk(diariaMedia(p));
    }
    return jsonOk({ erro: "Ação desconhecida: " + action });
  } catch (err) {
    return jsonOk({ erro: "Erro interno: " + err.message });
  }
}

function diariaMedia(p) {
  var tipo     = (p.tipo || "").toLowerCase().trim();
  var hospedes = parseInt(p.hospedes, 10);
  var checkin  = parseData(p.checkin);
  var checkout = parseData(p.checkout);

  if (!TITULOS[tipo]) {
    return { erro: "Parâmetro 'tipo' inválido. Use '1quarto' ou '2quartos'." };
  }
  if (!hospedes || hospedes < 1) {
    return { erro: "Parâmetro 'hospedes' inválido." };
  }
  if (!checkin || !checkout) {
    return { erro: "Parâmetros 'checkin' e 'checkout' devem estar no formato AAAA-MM-DD." };
  }
  if (checkout <= checkin) {
    return { erro: "Checkout deve ser depois do checkin." };
  }

  var bloco = lerBloco(TITULOS[tipo]);
  if (!bloco) {
    return { erro: "Tabela de preços não encontrada para: " + tipo };
  }

  var linhaPreco = escolherLinhaHospedes(bloco.linhasPessoas, hospedes);
  if (!linhaPreco) {
    return { erro: "Nenhuma faixa de hóspedes cadastrada para: " + tipo };
  }

  var datas = listarDatas(checkin, checkout);
  var precos = [];
  var diasSemPreco = [];

  for (var i = 0; i < datas.length; i++) {
    var d = datas[i];
    var chave = MESES[d.getMonth()] + "-" + d.getDate();
    var col = bloco.colunaPorMesDia[chave];
    var preco = (col !== undefined) ? linhaPreco.valores[col] : undefined;

    if (typeof preco === "number" && preco > 0) {
      precos.push(preco);
    } else {
      diasSemPreco.push(formatarData(d));
    }
  }

  if (precos.length === 0) {
    return {
      erro: "Nenhum preço encontrado no período informado (fora da tabela ou sem tarifa cadastrada).",
      dias_sem_preco: diasSemPreco
    };
  }

  var soma   = precos.reduce(function (a, b) { return a + b; }, 0);
  var media  = Math.round(soma / precos.length);
  var noites = datas.length;

  var resultado = {
    tipo: tipo,
    hospedes_solicitados: hospedes,
    faixa_aplicada: linhaPreco.label,
    checkin: p.checkin,
    checkout: p.checkout,
    noites: noites,
    valor_medio_diaria: media,
    valor_total_estimado: media * noites,
    resumo: "R$" + media + "/noite (média) · " + noites + " noite(s) · total estimado R$" + (media * noites)
  };

  if (diasSemPreco.length > 0) {
    resultado.aviso = "Sem tarifa cadastrada para " + diasSemPreco.length + " noite(s); excluídas da média.";
    resultado.dias_sem_preco = diasSemPreco;
  }

  return resultado;
}

/**
 * Localiza o bloco de uma tabela (1 Quarto / 2 Quartos) pelo título na coluna A e monta:
 * - colunaPorMesDia: { "Mês-dia": índice da coluna }
 * - linhasPessoas: [{ label, qtd, valores: linha inteira da planilha }]
 * Lida com células de mês mescladas (só a primeira coluna do bloco tem o valor).
 */
function lerBloco(titulo) {
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(ABA);
  var dados = sheet.getDataRange().getValues();

  var linhaTitulo = -1;
  for (var i = 0; i < dados.length; i++) {
    if ((dados[i][0] || "").toString().trim() === titulo) {
      linhaTitulo = i;
      break;
    }
  }
  if (linhaTitulo === -1) return null;

  var linhaMeses = dados[linhaTitulo + 1];
  var linhaDia   = dados[linhaTitulo + 3];

  var colunaPorMesDia = {};
  var mesAtual = null;
  for (var c = 2; c < linhaDia.length; c++) {
    if (linhaMeses[c]) mesAtual = linhaMeses[c].toString().trim();
    var dia = linhaDia[c];
    if (mesAtual && typeof dia === "number") {
      colunaPorMesDia[mesAtual + "-" + dia] = c;
    }
  }

  var linhasPessoas = [];
  for (var r = linhaTitulo + 4; r < dados.length; r++) {
    var label = (dados[r][1] || "").toString().trim();
    var m = label.match(/^(\d+)\s*Pessoas?$/i);
    if (!m) break;
    linhasPessoas.push({ label: label, qtd: parseInt(m[1], 10), valores: dados[r] });
  }

  return { colunaPorMesDia: colunaPorMesDia, linhasPessoas: linhasPessoas };
}

/**
 * Faixa exata de hóspedes; sem match exato, usa a próxima faixa acima (tarifa por
 * capacidade); se hóspedes excede a maior faixa, usa a maior disponível.
 */
function escolherLinhaHospedes(linhasPessoas, hospedes) {
  if (linhasPessoas.length === 0) return null;

  var exata = linhasPessoas.filter(function (l) { return l.qtd === hospedes; })[0];
  if (exata) return exata;

  var acima = linhasPessoas
    .filter(function (l) { return l.qtd > hospedes; })
    .sort(function (a, b) { return a.qtd - b.qtd; })[0];
  if (acima) return acima;

  return linhasPessoas.sort(function (a, b) { return b.qtd - a.qtd; })[0];
}

function listarDatas(checkin, checkout) {
  var datas = [];
  var atual = new Date(checkin);
  while (atual < checkout) {
    datas.push(new Date(atual));
    atual.setDate(atual.getDate() + 1);
  }
  return datas;
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
