// ─── Mapeamento nome → ID ──────────────────────────────────────────────────
const IMOVEIS = {
  "studio joão": "DS03J", "studio do joão": "DS03J", "ds03j": "DS03J",
  "flat da mari": "DS04J", "flat mari": "DS04J", "ds04j": "DS04J",
  "apartamento emanoel": "DS05J", "apto emanoel": "DS05J", "ds05j": "DS05J",
  "apto da isa": "DS06J", "apto isa": "DS06J", "ds06j": "DS06J",
  "apto do reinaldo mi": "FL10J", "apto reinaldo": "FL10J", "fl10j": "FL10J",
  "apartamento do reinaldo ji": "GC01J", "gc01j": "GC01J",
  "apto da jessilene": "HA02J", "apto jessilene": "HA02J", "ha02j": "HA02J",
  "flat da joyce": "HA03J", "flat joyce": "HA03J", "ha03j": "HA03J",
  "casa do tremura": "GF02J", "casa tremura": "GF02J", "gf02j": "GF02J",
  "casa laureana": "GF04J", "gf04j": "GF04J",
  "casa da moana": "GF06J", "casa moana": "GF06J", "gf06j": "GF06J",
  "casa do euller": "GG06J", "casa euller": "GG06J", "gg06j": "GG06J",
  "casa do john": "GG08J", "casa john": "GG08J", "gg08j": "GG08J",
  "vp-01": "JR01J", "jr01j": "JR01J", "vp-03": "JR03J", "jr03j": "JR03J",
  "vp-04": "JR04J", "jr04j": "JR04J", "vp-05": "JR05J", "jr05j": "JR05J",
  "vp-07": "JR07J", "jr07j": "JR07J",
};

function resolveId(nome) {
  return IMOVEIS[(nome || "").toLowerCase().trim()] || nome;
}

// ─── Parâmetro do MCP ──────────────────────────────────────────────────────
// ATENÇÃO: substituir "midia_imovel" pelo nome exato do datasource no DC
const mcp       = session.datasources["midia_imovel"];
const imovelRaw = mcp?.imovel || "";
const imovelId  = resolveId(imovelRaw);

// ─── URL do Apps Script (substituir após o deploy) ────────────────────────
const SHEETS_URL = "COLE_AQUI_A_URL_DO_APPS_SCRIPT";

// ─── Buscar mídia na planilha ─────────────────────────────────────────────
let midia = {};
try {
  const resp = await fetch(`${SHEETS_URL}?codigo=${imovelId}`);
  midia = await resp.json();
} catch (e) {
  await session.setAdditionalValue("resposta_midia",
    `Erro ao buscar mídia: ${e.message}`
  );
  return;
}

if (midia.erro) {
  await session.setAdditionalValue("resposta_midia",
    `Não encontrei mídia para o imóvel informado (${imovelId}).`
  );
  return;
}

// ─── Montar resposta ───────────────────────────────────────────────────────
const linhas = [`${midia.nome} (${midia.codigo})`];

if (midia.youtube)   linhas.push(`Vídeo: ${midia.youtube}`);
if (midia.instagram) linhas.push(`Instagram: ${midia.instagram}`);
if (midia.fotos)     linhas.push(`Fotos: ${midia.fotos}`);
if (midia.site)      linhas.push(`Site: ${midia.site}`);

await session.setAdditionalValue("resposta_midia", linhas.join("\n"));
