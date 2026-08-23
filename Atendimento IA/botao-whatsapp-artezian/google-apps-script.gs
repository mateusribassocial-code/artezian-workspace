/**
 * Recebe os leads do botão flutuante de WhatsApp do site artezian.com.br,
 * grava numa aba da planilha onde este script está vinculado
 * (Extensões > Apps Script), envia o evento Lead pra Conversions API do Meta
 * e encaminha o lead pro webhook de CRM da Datacrazy (servidor-a-servidor,
 * sem risco de CORS/preflight que teria se o navegador chamasse direto).
 *
 * Colunas gravadas: Timestamp | Nome | Telefone | Produto | Page Path |
 * URL completa | Título da Página | UTM Source | UTM Medium | UTM Campaign |
 * UTM Term | UTM Content | fbclid | gclid | gbraid | wbraid | fbp | fbc |
 * Event ID | Referrer | User Agent | Check-in | Check-out | Qtd Pessoas
 *
 * IMPORTANTE — Access Token da Conversions API:
 * Não cole o token aqui no código (ele vai pro histórico do git). Configure
 * em Project Settings (ícone de engrenagem) > Script Properties > Add script
 * property, com a chave META_CAPI_ACCESS_TOKEN e o valor do token.
 */

var CONFIG = {
  sheetName: "Leads",
  metaPixelId: "2071021410088369",
  metaApiVersion: "v21.0",
  crmWebhookUrl: "https://api.datacrazy.io/v1/crm/api/crm/flows/webhooks/22af0d21-3a82-4e94-af48-776efd03b4bc/21bd7f59-c22f-4907-bf59-7d167da4b6f5"
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
      data.produto || "",
      data.pagePath || "",
      data.pageUrl || "",
      data.pageTitle || "",
      data.utmSource || "",
      data.utmMedium || "",
      data.utmCampaign || "",
      data.utmTerm || "",
      data.utmContent || "",
      data.fbclid || "",
      data.gclid || "",
      data.gbraid || "",
      data.wbraid || "",
      data.fbp || "",
      data.fbc || "",
      data.eventId || "",
      data.referrer || "",
      data.userAgent || "",
      data.checkIn || "",
      data.checkOut || "",
      data.qtdPessoas || ""
    ]);

    sendMetaCapiLeadEvent(data);
    sendToCrmWebhook(data);

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

var SHEET_HEADERS = [
  "Timestamp", "Nome", "Telefone", "Produto", "Page Path", "URL completa",
  "Título da Página", "UTM Source", "UTM Medium", "UTM Campaign", "UTM Term", "UTM Content",
  "fbclid", "gclid", "gbraid", "wbraid", "fbp", "fbc", "Event ID", "Referrer", "User Agent",
  "Check-in", "Check-out", "Qtd Pessoas"
];

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.sheetName);
    sheet.appendRow(SHEET_HEADERS);
    sheet.getRange(1, 1, 1, SHEET_HEADERS.length).setFontWeight("bold");
    return sheet;
  }

  // Backfill do cabeçalho pra planilhas criadas antes das colunas de
  // Check-in/Check-out/Qtd Pessoas existirem — só completa o que falta,
  // sem mexer nas colunas e nos dados já existentes.
  var lastCol = sheet.getLastColumn();
  if (lastCol < SHEET_HEADERS.length) {
    var missingHeaders = SHEET_HEADERS.slice(lastCol);
    sheet.getRange(1, lastCol + 1, 1, missingHeaders.length)
      .setValues([missingHeaders])
      .setFontWeight("bold");
  }

  return sheet;
}

/**
 * Envia o evento Lead pra Conversions API do Meta (server-side), usando o
 * mesmo Event ID que o Pixel já disparou no navegador — o Meta deduplica
 * os dois automaticamente. Isso mantém o tracking funcionando mesmo com
 * ad blocker ou Safari/iOS bloqueando o Pixel client-side.
 */
function sendMetaCapiLeadEvent(data) {
  var accessToken = PropertiesService.getScriptProperties().getProperty("META_CAPI_ACCESS_TOKEN");
  if (!accessToken) {
    console.warn("META_CAPI_ACCESS_TOKEN não configurado em Script Properties. Evento CAPI não enviado.");
    return;
  }

  var userData = {};
  if (data.hashedPhone) userData.ph = [data.hashedPhone];
  if (data.hashedFirstName) userData.fn = [data.hashedFirstName];
  if (data.fbp) userData.fbp = data.fbp;
  if (data.fbc) userData.fbc = data.fbc;
  if (data.userAgent) userData.client_user_agent = data.userAgent;

  var body = {
    data: [{
      event_name: "Lead",
      event_time: Math.floor(Date.now() / 1000),
      event_id: data.eventId || "",
      event_source_url: data.pageUrl || "",
      action_source: "website",
      user_data: userData,
      custom_data: {
        content_name: data.produto || ""
      }
    }]
  };

  var url = "https://graph.facebook.com/" + CONFIG.metaApiVersion + "/" + CONFIG.metaPixelId
    + "/events?access_token=" + encodeURIComponent(accessToken);

  try {
    var response = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(body),
      muteHttpExceptions: true
    });
    var code = response.getResponseCode();
    if (code < 200 || code >= 300) {
      console.error("Meta CAPI retornou erro " + code + ": " + response.getContentText());
    }
  } catch (err) {
    console.error("Falha ao chamar Meta CAPI: " + err.message);
  }
}

/**
 * Encaminha o lead pro webhook de CRM da Datacrazy. Roda aqui (servidor,
 * dentro do Apps Script) em vez de o navegador chamar direto, porque uma
 * chamada com Content-Type: application/json feita pelo navegador
 * dispararia um preflight CORS — e se o webhook da Datacrazy não tratar
 * OPTIONS (comum em endpoints feitos pra receber chamadas servidor-a-
 * servidor, tipo Zapier/n8n), o preflight falha e o lead nunca chega,
 * silenciosamente. Chamando daqui não existe esse risco.
 */
function sendToCrmWebhook(data) {
  if (!CONFIG.crmWebhookUrl) {
    logCrmDebug("SEM_URL", "crmWebhookUrl não configurada.", "");
    return;
  }

  try {
    var response = UrlFetchApp.fetch(CONFIG.crmWebhookUrl, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(data),
      muteHttpExceptions: true
    });
    var code = response.getResponseCode();
    logCrmDebug(code, response.getContentText(), CONFIG.crmWebhookUrl);
  } catch (err) {
    logCrmDebug("EXCEPTION", err.message, CONFIG.crmWebhookUrl);
  }
}

/**
 * Registro temporário de diagnóstico — grava o resultado de toda chamada ao
 * webhook da Datacrazy numa aba separada ("Debug CRM"), já que os logs do
 * Cloud Logging não estão disponíveis pra esse projeto (aba "Execuções" sem
 * registro). Depois de confirmar que o envio pro CRM está funcionando, pode
 * remover essa função e a chamada a ela em sendToCrmWebhook.
 */
function logCrmDebug(statusCode, responseBody, url) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Debug CRM");
  if (!sheet) {
    sheet = ss.insertSheet("Debug CRM");
    sheet.appendRow(["Timestamp", "Status Code", "Resposta", "URL usada"]);
    sheet.getRange(1, 1, 1, 4).setFontWeight("bold");
  }
  sheet.appendRow([new Date(), statusCode, responseBody, url]);
}
