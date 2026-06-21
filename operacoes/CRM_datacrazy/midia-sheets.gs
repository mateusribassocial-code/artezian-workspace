/**
 * Artezian — API de Mídia dos Imóveis
 * Lê a planilha de mídia e retorna links por código do imóvel.
 *
 * Deploy: Extensions > Apps Script > Deploy > New deployment > Web app
 * - Execute as: Me
 * - Who has access: Anyone
 *
 * Estrutura esperada da planilha (linha 1 = cabeçalho):
 * Coluna A: Código     (ex: DS03J)
 * Coluna B: Nome       (ex: Studio do João 001)
 * Coluna C: Instagram  (link do reel/post)
 * Coluna D: Youtube    (link do vídeo)
 * Coluna E: Fotos      (link da pasta do Google Drive)
 */

function doGet(e) {
  var p      = e.parameter;
  var codigo = (p.codigo || "").toUpperCase().trim();

  if (!codigo) {
    return jsonOk({ erro: "Parâmetro obrigatório: codigo" });
  }

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows  = sheet.getDataRange().getValues();

    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      if ((row[0] || "").toString().toUpperCase().trim() === codigo) {
        var fotos_url = (row[4] || "").toString().trim();

        return jsonOk({
          codigo:     row[0] || "",
          nome:       row[1] || "",
          instagram:  row[2] || "",
          youtube:    row[3] || "",
          fotos:      fotos_url,
          site:       "https://www.artezian.com.br/pt/apartment/" + row[0]
        });
      }
    }

    return jsonOk({ erro: "Imóvel não encontrado: " + codigo });

  } catch (err) {
    return jsonOk({ erro: "Erro interno: " + err.message });
  }
}

function jsonOk(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
