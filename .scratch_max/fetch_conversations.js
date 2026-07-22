const fs = require('fs');

// manual .env parse (avoid needing dotenv package)
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

async function getWithRetry(url) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${KEY}` } });
    if (res.status === 429) {
      const retryAfter = Number(res.headers.get('retry-after')) || 15;
      console.log(`  429 rate limited, waiting ${retryAfter}s...`);
      await new Promise(r => setTimeout(r, (retryAfter + 1) * 1000));
      continue;
    }
    return res;
  }
  throw new Error('too many 429 retries');
}

async function fetchAll(extraQuery) {
  const take = 100;
  let skip = 0;
  let all = [];
  let total = null;
  while (true) {
    const url = `${BASE}/api/v1/conversations?take=${take}&skip=${skip}${extraQuery}`;
    const res = await getWithRetry(url);
    if (!res.ok) {
      console.error('ERROR', res.status, await res.text());
      break;
    }
    const json = await res.json();
    if (total === null) total = json.count;
    const data = json.data || [];
    all = all.concat(data);
    console.log(`  skip=${skip} got=${data.length} runningTotal=${all.length} reportedCount=${total}`);
    if (data.length < take) break;
    skip += take;
    await new Promise(r => setTimeout(r, 1100));
  }
  return all;
}

async function main() {
  console.log('Fetching OPEN conversations (default)...');
  const openConvs = await fetchAll('');
  console.log('Fetching CLOSED conversations (filter[opened]=false)...');
  const closedConvs = await fetchAll('&filter[opened]=false');

  const byId = new Map();
  for (const c of [...openConvs, ...closedConvs]) byId.set(c.id, c);
  const all = Array.from(byId.values());

  fs.writeFileSync('.scratch_max/conversations_all.json', JSON.stringify(all));
  console.log('DONE. unique conversations:', all.length, '(open:', openConvs.length, ', closed:', closedConvs.length, ')');
}

main().catch(e => { console.error(e); process.exit(1); });
