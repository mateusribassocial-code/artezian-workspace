// Para ambiente local: ignora erros de SSL (certificados corporativos)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../CRM_datacrazy/.env') });

const app = express();
const PORT = 3131;
const DATA_FILE = path.join(__dirname, 'data', 'artezian.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Data helpers ──────────────────────────────────────────────────────────────

const DEFAULT_DATA = { parceiros: [], custos: {} };

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
      return DEFAULT_DATA;
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return DEFAULT_DATA;
  }
}

function writeData(data) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ── Local data endpoints ──────────────────────────────────────────────────────

app.get('/api/data', (req, res) => res.json(readData()));

app.post('/api/data', (req, res) => {
  try {
    writeData(req.body);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Stays API proxy ───────────────────────────────────────────────────────────

app.get('/api/stays/listings', async (req, res) => {
  try {
    const base = process.env.STAYS_BASE_URL;
    const auth = process.env.STAYS_AUTH_BASE64;

    const url = `${base}/external/v1/content/listings`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `Stays API ${response.status}`, detail: text.slice(0, 300) });
    }

    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Datacrazy API proxy ───────────────────────────────────────────────────────

app.get('/api/datacrazy/reservations', async (req, res) => {
  const { month } = req.query; // formato: "2026-05"
  try {
    const [year, mon] = month.split('-');
    const lastDay = new Date(parseInt(year), parseInt(mon), 0).getDate();
    const startDate = `${year}-${mon}-01`;
    const endDate   = `${year}-${mon}-${String(lastDay).padStart(2, '0')}`;

    const base  = process.env.DATACRAZY_BASE_URL;
    const token = process.env.DATACRAZY_API_KEY;

    // Datacrazy — GET /api/v1/businesses com filtro de data de criação
    const params = new URLSearchParams({
      take: 500,
      'filter[createdAtGreaterOrEqual]': `${startDate}T00:00:00.000Z`,
      'filter[createdAtLessOrEqual]':   `${endDate}T23:59:59.999Z`,
    });
    const url = `${base}/api/v1/businesses?${params}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `Datacrazy API ${response.status}`, detail: text.slice(0, 300) });
    }

    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Endpoint de diagnóstico — sonda múltiplos paths da Stays e Datacrazy
app.get('/api/diagnostico', async (req, res) => {
  const auth = `Basic ${process.env.STAYS_AUTH_BASE64}`;
  const base = process.env.STAYS_BASE_URL; // https://artezian.stays.net
  const apiBase = 'https://api.stays.net';

  const staysCandidates = [
    `${base}/v1/listings?limit=1`,
    `${base}/api/v1/listings?limit=1`,
    `${apiBase}/v1/listings?limit=1`,
    `${base}/oauth2/token`,
  ];

  const resultado = { stays: {}, datacrazy: null };

  for (const url of staysCandidates) {
    try {
      const r = await fetch(url, { headers: { Authorization: auth } });
      const text = await r.text();
      resultado.stays[url] = { status: r.status, snippet: text.slice(0, 200) };
    } catch (e) {
      resultado.stays[url] = { error: e.message };
    }
  }

  // Datacrazy — testa vários endpoints
  const dcBase = process.env.DATACRAZY_BASE_URL;
  const dcToken = process.env.DATACRAZY_API_KEY;
  const dcCandidates = [
    `${dcBase}/v1/deals?limit=1`,
    `${dcBase}/deals?limit=1`,
    `${dcBase}/v1/reservations?limit=1`,
    `${dcBase}/v1/bookings?limit=1`,
    `${dcBase}/v1/contacts?limit=1`,
  ];

  resultado.datacrazy = {};
  for (const url of dcCandidates) {
    try {
      const r = await fetch(url, { headers: { Authorization: `Bearer ${dcToken}` } });
      const text = await r.text();
      resultado.datacrazy[url] = { status: r.status, snippet: text.slice(0, 200) };
    } catch (e) {
      resultado.datacrazy[url] = { error: e.message };
    }
  }

  res.json(resultado);
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  Artezian Dashboard → http://localhost:${PORT}\n`);
});
