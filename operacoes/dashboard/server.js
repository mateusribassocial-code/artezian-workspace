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

    // Stays PMS — listar todos os listings ativos
    const url = `${base}/v1/listings?limit=100&fields=_id,name,type,address,capacity,bedrooms,bathrooms,subtype`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `Stays API ${response.status}`, detail: text });
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
    const endDate = `${year}-${mon}-${String(lastDay).padStart(2, '0')}`;

    const base = process.env.DATACRAZY_BASE_URL;
    const token = process.env.DATACRAZY_API_KEY;

    // Tenta endpoint de deals (locação) com filtro de data
    const url = `${base}/v1/deals?startDate=${startDate}&endDate=${endDate}&limit=500`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `Datacrazy API ${response.status}`, detail: text });
    }

    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Endpoint de diagnóstico para testar as APIs
app.get('/api/diagnostico', async (req, res) => {
  const resultado = { stays: null, datacrazy: null };

  try {
    const r = await fetch(`${process.env.STAYS_BASE_URL}/v1/listings?limit=1`, {
      headers: { 'Authorization': `Basic ${process.env.STAYS_AUTH_BASE64}` },
    });
    resultado.stays = { status: r.status, ok: r.ok };
    if (!r.ok) resultado.stays.body = await r.text();
  } catch (e) {
    resultado.stays = { error: e.message };
  }

  try {
    const r = await fetch(`${process.env.DATACRAZY_BASE_URL}/v1/deals?limit=1`, {
      headers: { 'Authorization': `Bearer ${process.env.DATACRAZY_API_KEY}` },
    });
    resultado.datacrazy = { status: r.status, ok: r.ok };
    if (!r.ok) resultado.datacrazy.body = await r.text();
  } catch (e) {
    resultado.datacrazy = { error: e.message };
  }

  res.json(resultado);
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  Artezian Dashboard → http://localhost:${PORT}\n`);
});
