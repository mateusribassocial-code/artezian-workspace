// ============================================================
// Artezian — Gestão de Hospedagens
// Google Apps Script Backend
//
// SETUP:
//   1. Abra o Google Sheets → Extensões → Apps Script
//   2. Cole este código e salve
//   3. Implantar → Nova implantação → App da Web
//      Executar como: Eu | Quem acessa: Qualquer pessoa
//   4. Copie a URL e cole no campo de configuração do app
// ============================================================

// ── Stays API ────────────────────────────────────────────────
const STAYS_CLIENT_ID     = 'c1793dc6';
const STAYS_CLIENT_SECRET = '55140c70';
const STAYS_BASE_URL      = 'https://artezian.stays.net/external/v1';

const STAYS_LISTING_MAP = {
  'GF02J': 'casa-tremura',
  'GG06J': 'casa-euller',
  'GF06J': 'casa-moana',
  'GG08J': 'casa-john',
  'GF04J': 'casa-laureana',
  'HA02J': 'apto-jessilene',
  'DS06J': 'apto-isa'
};

// ── Sheets ───────────────────────────────────────────────────
const MANUAL_SHEET = 'Hospedagens';
const STAYS_SHEET  = 'Stays';

const COLS = [
  'id','propertyId','type','checkIn','checkOut',
  'guestName','totalValue','paymentMethod','paidValue','pendingValue',
  'notes','source','staysId','createdAt'
];

// ── Router ───────────────────────────────────────────────────
function doGet(e) {
  const action   = e.parameter.action;
  const callback = e.parameter.callback;  // JSONP support
  const data     = e.parameter.data
    ? JSON.parse(decodeURIComponent(e.parameter.data))
    : null;

  let result;
  switch (action) {
    case 'getAll':    result = getAllEntries();       break;
    case 'add':       result = addEntry(data);        break;
    case 'delete':    result = deleteEntry(data.id);  break;
    case 'syncStays': result = syncStays();           break;
    default:          result = { error: 'Ação desconhecida: ' + action };
  }

  const json = JSON.stringify(result);

  // JSONP: evita bloqueio de CORS ao abrir de file://
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.TEXT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Sheet helpers ────────────────────────────────────────────
function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(COLS);
    sheet.getRange(1, 1, 1, COLS.length)
      .setBackground('#1a5c4a')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 180);
  }
  return sheet;
}

function getManualSheet() { return getOrCreateSheet(MANUAL_SHEET); }
function getStaysSheet()  { return getOrCreateSheet(STAYS_SHEET);  }

function sheetToEntries(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1)
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    })
    .filter(e => e.id);
}

function fmtDate(d) {
  return d.getFullYear() + '-'
    + String(d.getMonth() + 1).padStart(2, '0') + '-'
    + String(d.getDate()).padStart(2, '0');
}

// ── CRUD (entradas manuais) ───────────────────────────────────
function getAllEntries() {
  const manual = sheetToEntries(getManualSheet());
  const stays  = sheetToEntries(getStaysSheet());
  return { entries: [...manual, ...stays] };
}

function addEntry(entry) {
  if (!entry || !entry.id) return { error: 'Entrada inválida' };
  entry.source  = 'manual';
  entry.staysId = '';
  const row = COLS.map(col => (entry[col] !== undefined ? entry[col] : ''));
  getManualSheet().appendRow(row);
  return { ok: true, id: entry.id };
}

function deleteEntry(id) {
  if (!id) return { error: 'ID inválido' };
  for (const sheet of [getManualSheet(), getStaysSheet()]) {
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        sheet.deleteRow(i + 1);
        return { ok: true, deleted: id };
      }
    }
  }
  return { ok: false, msg: 'ID não encontrado' };
}

// ── Stays Sync ───────────────────────────────────────────────
function syncStays() {
  const auth    = 'Basic ' + Utilities.base64Encode(STAYS_CLIENT_ID + ':' + STAYS_CLIENT_SECRET);
  const options = { headers: { 'Authorization': auth }, muteHttpExceptions: true };

  const today = new Date();
  const from  = fmtDate(new Date(today.getFullYear(), today.getMonth() - 2, 1));
  const to    = fmtDate(new Date(today.getFullYear() + 1, today.getMonth() + 2, 0));

  const allEntries = [];
  const errors     = [];

  Object.entries(STAYS_LISTING_MAP).forEach(([listingId, propId]) => {
    let skip = 0;
    const limit = 20;

    while (true) {
      const url = STAYS_BASE_URL
        + '/booking/reservations'
        + '?listingId=' + listingId
        + '&from=' + from
        + '&to=' + to
        + '&dateType=included'
        + '&skip=' + skip
        + '&limit=' + limit;

      try {
        const resp = UrlFetchApp.fetch(url, options);
        const code = resp.getResponseCode();

        if (code !== 200) {
          errors.push({ listingId, code, body: resp.getContentText().slice(0, 300) });
          break;
        }

        const data = JSON.parse(resp.getContentText());
        if (!Array.isArray(data) || data.length === 0) break;

        data.forEach(res => {
          const entry = mapStaysEntry(res, propId);
          if (entry) allEntries.push(entry);
        });

        if (data.length < limit) break;
        skip += limit;

      } catch (err) {
        errors.push({ listingId, error: err.message });
        break;
      }
    }
  });

  // Reconstruir a aba Stays do zero
  const sheet = getStaysSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);

  allEntries.forEach(entry => {
    sheet.appendRow(COLS.map(col => (entry[col] !== undefined ? entry[col] : '')));
  });

  return {
    ok:      true,
    count:   allEntries.length,
    errors,
    entries: allEntries,
    synced:  new Date().toISOString()
  };
}

function mapStaysEntry(res, propId) {
  if (!res.checkInDate || !res.checkOutDate) return null;

  const type = (res.type === 'blocked' || res.type === 'maintenance') ? 'bloqueio' : 'reserva';

  // Guest name
  let guestName = '';
  if (type === 'reserva') {
    if (res.client) {
      guestName = (
        res.client.fullName ||
        ((res.client.firstName || '') + ' ' + (res.client.lastName || '')).trim()
      ).trim();
    }
    if (!guestName) guestName = 'Hóspede Stays';
  }

  const checkIn  = String(res.checkInDate).substring(0, 10);
  const checkOut = String(res.checkOutDate).substring(0, 10);

  // Price — Stays uses different fields depending on the plan
  const total = res.price
    ? (res.price.total || res.price.amount || res.price.totalPrice || 0)
    : (res.totalPrice || res.amount || 0);

  return {
    id:            'stays_' + res._id,
    propertyId:    propId,
    type,
    checkIn,
    checkOut,
    guestName,
    totalValue:    total,
    paymentMethod: '',
    paidValue:     0,
    pendingValue:  0,
    notes:         res.internalNote || (type === 'bloqueio' ? 'Via Stays' : ''),
    source:        'stays',
    staysId:       res._id || '',
    createdAt:     res.createdAt || new Date().toISOString()
  };
}
