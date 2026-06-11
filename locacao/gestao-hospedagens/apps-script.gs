// ============================================================
// Artezian — Gestão de Hospedagens
// Google Apps Script Backend
//
// SETUP:
//   1. Abra o Google Sheets e crie uma planilha nova.
//   2. Vá em Extensões > Apps Script.
//   3. Cole este código, salve.
//   4. Clique em "Implantar" > "Nova implantação".
//      - Tipo: "App da Web"
//      - Executar como: "Eu"
//      - Quem tem acesso: "Qualquer pessoa"
//   5. Copie a URL gerada e cole no campo de configuração do index.html.
// ============================================================

const SHEET_NAME = 'Hospedagens';

// Columns (order matters — must match COLS array)
const COLS = [
  'id','propertyId','type','checkIn','checkOut',
  'guestName','totalValue','paymentMethod','paidValue','pendingValue',
  'notes','createdAt'
];

function doGet(e) {
  const action = e.parameter.action;
  const data   = e.parameter.data ? JSON.parse(decodeURIComponent(e.parameter.data)) : null;

  let result;
  if      (action === 'getAll') result = getAllEntries();
  else if (action === 'add'   ) result = addEntry(data);
  else if (action === 'delete') result = deleteEntry(data.id);
  else                          result = { error: 'Ação desconhecida: ' + action };

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── Helpers ────────────────────────────────────────────────

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(COLS);
    sheet.getRange(1, 1, 1, COLS.length)
      .setBackground('#1a5c4a')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ─── Actions ────────────────────────────────────────────────

function getAllEntries() {
  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();
  if (data.length <= 1) return { entries: [] };

  const headers = data[0];
  const entries = data.slice(1)
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    })
    .filter(e => e.id);  // skip empty rows

  return { entries };
}

function addEntry(entry) {
  if (!entry || !entry.id) return { error: 'Entrada inválida' };
  const sheet = getSheet();
  const row = COLS.map(col => entry[col] !== undefined ? entry[col] : '');
  sheet.appendRow(row);
  return { ok: true, id: entry.id };
}

function deleteEntry(id) {
  if (!id) return { error: 'ID inválido' };
  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { ok: true, deleted: id };
    }
  }
  return { ok: false, msg: 'ID não encontrado' };
}
