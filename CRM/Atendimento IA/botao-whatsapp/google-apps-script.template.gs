/**
 * Recebe os leads do botão flutuante de WhatsApp e grava numa aba da
 * planilha onde este script está vinculado (Extensões > Apps Script).
 *
 * Colunas gravadas: Timestamp | Nome | Telefone | <coluna da unidade> |
 * Page Path | URL completa | Título da Página | UTM Source | UTM Medium |
 * UTM Campaign | UTM Term | UTM Content
 */

var CONFIG = {
  sheetName: "Leads",
  // Nome da coluna pro campo de seleção (unidade, loja, filial, serviço...).
  // Deve bater com o que faz sentido pro cliente. Se o widget estiver com
  // unitField.enabled = false, essa coluna fica em branco.
  unitColumnName: "Unidade"
};

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    var sheet = getOrCreateSheet();
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),
      data.nome || "",
      data.telefone || "",
      data.unidade || "",
      data.pagePath || "",
      data.pageUrl || "",
      data.pageTitle || "",
      data.utmSource || "",
      data.utmMedium || "",
      data.utmCampaign || "",
      data.utmTerm || "",
      data.utmContent || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "online" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.sheetName);
    sheet.appendRow([
      "Timestamp", "Nome", "Telefone", CONFIG.unitColumnName, "Page Path", "URL completa",
      "Título da Página", "UTM Source", "UTM Medium", "UTM Campaign", "UTM Term", "UTM Content"
    ]);
    sheet.getRange(1, 1, 1, 12).setFontWeight("bold");
  }

  return sheet;
}
