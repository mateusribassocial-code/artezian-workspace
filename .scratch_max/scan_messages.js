const fs = require('fs');

function loadEnv(path) {
  const out = {};
  const txt = fs.readFileSync(path, 'utf8');
  for (const line of txt.split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

const env = loadEnv('operacoes/CRM_datacrazy/.env');
const BASE = env.DATACRAZY_BASE_URL;
const KEY = env.DATACRAZY_API_KEY;

const WINDOW_START = new Date('2026-04-22T00:00:00Z');
const WINDOW_END = new Date('2026-07-22T23:59:59Z');
const MAX_RE = /max\s*t\s*[12]\b|condom[ií]nio\s*(do\s*)?max/i;

async function getWithRetry(url) {
  for (let attempt = 0; attempt < 8; attempt++) {
    let res;
    try {
      res = await fetch(url, { headers: { Authorization: `Bearer ${KEY}` } });
    } catch (e) {
      console.log(`  network error, retrying in 5s: ${e.message}`);
      await new Promise(r => setTimeout(r, 5000));
      continue;
    }
    if (res.status === 429) {
      const retryAfter = Number(res.headers.get('retry-after')) || 15;
      await new Promise(r => setTimeout(r, (retryAfter + 1) * 1000));
      continue;
    }
    return res;
  }
  throw new Error('too many retries for ' + url);
}

async function main() {
  const convs = JSON.parse(fs.readFileSync('.scratch_max/conversations_window.json', 'utf8'));
  console.log('Conversations to scan:', convs.length);

  const matches = []; // { convId, name, msgId, createdAt, received, body }
  const outFile = '.scratch_max/scan_progress.json';
  let processed = 0;
  let errored = 0;

  for (const c of convs) {
    const url = `${BASE}/api/v1/conversations/${c.id}/messages`;
    const res = await getWithRetry(url);
    processed++;
    if (!res.ok) {
      errored++;
      console.log(`  [${processed}/${convs.length}] ERROR ${res.status} on ${c.id}`);
    } else {
      const json = await res.json();
      const msgs = json.messages || [];
      for (const m of msgs) {
        const createdAt = new Date(m.createdAt);
        if (createdAt >= WINDOW_START && createdAt <= WINDOW_END && MAX_RE.test(m.body || '')) {
          matches.push({
            convId: c.id,
            leadName: c.name,
            msgId: m.id,
            createdAt: m.createdAt,
            received: m.received, // true = mensagem do lead, false = mensagem enviada (oferta)
            body: (m.body || '').slice(0, 300),
          });
        }
      }
    }
    if (processed % 25 === 0 || processed === convs.length) {
      console.log(`  progress ${processed}/${convs.length} | matches so far: ${matches.length} | errors: ${errored}`);
      fs.writeFileSync(outFile, JSON.stringify({ processed, total: convs.length, matches }, null, 0));
    }
    await new Promise(r => setTimeout(r, 1050));
  }

  fs.writeFileSync('.scratch_max/scan_final.json', JSON.stringify(matches, null, 2));
  console.log('DONE. total matches:', matches.length, 'errors:', errored);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
