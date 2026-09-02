// Em ambiente local (dev), ignora erros de SSL corporativos
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const express    = require('express');
const basicAuth  = require('express-basic-auth');
const fs         = require('fs');
const path       = require('path');

// Carrega .env local do dashboard (produção) ou o do CRM (dev local)
const localEnv = path.join(__dirname, '.env');
require('dotenv').config({ path: fs.existsSync(localEnv) ? localEnv : path.join(__dirname, '../../CRM/Datacrazy/.env') });

const app  = express();
const PORT = process.env.PORT || 3131;
const DATA_FILE = path.join(__dirname, 'data', 'artezian.json');

// ── Autenticação básica (só em produção) ─────────────────────────────────────

if (process.env.NODE_ENV === 'production') {
  const DASHBOARD_USER = process.env.DASHBOARD_USER;
  const DASHBOARD_PASS = process.env.DASHBOARD_PASS;

  // Sem senha configurada o painel nao sobe. Nao existe credencial padrao:
  // o repositorio e versionado e o painel expoe receita, custo e dados de parceiros.
  if (!DASHBOARD_USER || !DASHBOARD_PASS) {
    console.error('[FATAL] DASHBOARD_USER e DASHBOARD_PASS sao obrigatorios em producao.');
    process.exit(1);
  }

  app.use(basicAuth({
    users: { [DASHBOARD_USER]: DASHBOARD_PASS },
    challenge: true,
    realm: 'Artezian',
  }));
}

app.use(express.json());

const staticOptions = {
  setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache'),
};

app.use(express.static(path.join(__dirname, 'public'), staticOptions));

// ── Redirecionamentos de URLs antigas ─────────────────────────────────────────
// /hub era um deploy separado; virou a aba Documentos do painel unificado.
app.get('/hub', (req, res) => res.redirect(301, '/#documentos'));
app.get('/hub/', (req, res) => res.redirect(301, '/#documentos'));

// ── Data helpers ──────────────────────────────────────────────────────────────

const DEFAULT_DATA = { parceiros: [], custos: {} };

const JSONBIN_KEY = process.env.JSONBIN_KEY;
const JSONBIN_ID  = process.env.JSONBIN_ID;
const useJsonbin  = !!(JSONBIN_KEY && JSONBIN_ID);

async function readData() {
  if (useJsonbin) {
    try {
      const r = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`, {
        headers: { 'X-Master-Key': JSONBIN_KEY },
      });
      const d = await r.json();
      return d.record || DEFAULT_DATA;
    } catch (e) {
      console.error('JSONbin read error:', e.message);
      return DEFAULT_DATA;
    }
  }
  // fallback: arquivo local (dev)
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

async function writeData(data) {
  if (useJsonbin) {
    await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_KEY },
      body: JSON.stringify(data),
    });
    return;
  }
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ── Local data endpoints ──────────────────────────────────────────────────────

app.get('/api/data', async (req, res) => res.json(await readData()));

app.post('/api/data', async (req, res) => {
  try {
    await writeData(req.body);
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

function diffNoites(checkin, checkout) {
  if (!checkin || !checkout) return 0;
  return Math.round((new Date(checkout) - new Date(checkin)) / 86400000);
}

// GET /api/stays/reservations?month=2026-05&dateType=arrival
// GET /api/stays/reservations?from=2026-05-01&to=2026-06-15&dateType=arrival  (from/to têm prioridade sobre month)
app.get('/api/stays/reservations', async (req, res) => {
  try {
    const { month, dateType = 'arrival' } = req.query;
    let { from, to } = req.query;

    if (!from || !to) {
      if (!month) return res.status(400).json({ error: 'Parâmetro obrigatório: month (YYYY-MM) ou from/to (YYYY-MM-DD)' });
      const [year, mon] = month.split('-');
      const lastDay = new Date(parseInt(year), parseInt(mon), 0).getDate();
      from = `${year}-${mon}-01`;
      to   = `${year}-${mon}-${String(lastDay).padStart(2, '0')}`;
    }

    const base = process.env.STAYS_BASE_URL;
    const auth = process.env.STAYS_AUTH_BASE64;
    const headers = { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' };

    const url = `${base}/external/v1/booking/reservations?from=${from}&to=${to}&dateType=${dateType}&type=booked`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `Stays API ${response.status}`, detail: text.slice(0, 300) });
    }

    const raw = await response.json();
    const lista = Array.isArray(raw) ? raw : (Array.isArray(raw.value) ? raw.value : []);

    // A listagem em lote não traz o nome do hóspede — só o detalhe de cada reserva tem guestsDetails.list
    const detalhes = await Promise.all(lista.map(r =>
      fetch(`${base}/external/v1/booking/reservations/${r._id}`, { headers })
        .then(resp => (resp.ok ? resp.json() : null))
        .catch(() => null)
    ));

    const reservas = lista.map((r, i) => {
      const fees = (r.price && r.price.hostingDetails) ? (r.price.hostingDetails.fees || []) : [];
      let taxaLimpeza = 0;
      fees.forEach(f => { if ((f.name || '').toLowerCase().includes('limpeza')) taxaLimpeza += (f._f_val || 0); });

      const detalhe = detalhes[i];
      const guestList = (detalhe && detalhe.guestsDetails && detalhe.guestsDetails.list) ? detalhe.guestsDetails.list : [];
      const titular = guestList.length > 0 ? (guestList[0].name || '') : '';

      return {
        id: r.id,
        _idlisting: r._idlisting,
        titular,
        checkin: r.checkInDate,
        checkout: r.checkOutDate,
        noites: diffNoites(r.checkInDate, r.checkOutDate),
        hospedes: r.guests || 0,
        total: r.price ? (r.price._f_total || 0) : 0,
        totalPago: r.stats ? (r.stats._f_totalPaid || 0) : 0,
        taxaLimpeza,
        status: r.type,
        criadaEm: r.creationDate,
        urlReserva: r.reservationUrl || '',
      };
    });

    res.json({ periodo: { from, to, dateType }, total: reservas.length, reservas });
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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n  Artezian Dashboard → http://localhost:${PORT}\n`);
  });
}

module.exports = app;
