# MCP Server Tool — Consultar_disp_stays

## O que é
Tool nativa do Datacrazy (trigger **MCP Server Tool**) que um Agente de IA chama quando o lead pergunta sobre disponibilidade, preço, diária ou valor de uma hospedagem. Diferente do `stays-proxy.gs`, aqui a automação chama a API do Stays **direto** dentro de um bloco JavaScript — não passa por Apps Script.

## Configuração do trigger

| Campo | Valor |
|---|---|
| Nome da tool | `Consultar_disp_stays` |
| Descrição | Consulta disponibilidade e preço de um imóvel na Stays. Use quando o cliente perguntar sobre disponibilidade, preço, diária ou valor de uma hospedagem. Requer: imovel (ID do imóvel), checkin (YYYY-MM-DD), checkout (YYYY-MM-DD), hospedes (número). |
| Parâmetro de sessão | Conversa |
| Fonte de dados de entrada | `MCP1-Stays` |

**Parâmetros:**
| Nome | Tipo |
|---|---|
| Nome do Imóvel | string |
| imovel | string |
| checkin | string |
| checkout | string |
| hospedes | number |

Fluxo: **MCP Server Tool** → bloco **JavaScript** (abaixo) → bloco de **Mensagem** que envia `resposta_stays` pro WhatsApp do lead (mesmo padrão do `mcp-handoff-agentes-setup.md` / `MCP1-Stays` em produção).

## O que atualiza automático vs manual

- **Automático (puxa ao vivo da API do Stays a cada chamada):** diária, disponibilidade, total, taxas (`booking/calculate-price`), nome do imóvel e nº de quartos (`content/listings/{id}`). Mudar tarifa no painel do Stays já reflete na próxima pergunta do lead — não precisa mexer nesse bloco.
- **Manual (hardcoded no bloco JS, não atualiza sozinho):**
  - `IMOVEIS` — mapa de apelido/nome digitado pelo lead → código do imóvel no Stays.
  - `VIDEOS` — link de vídeo (Cloudinary) por código de imóvel.
  - Precisa editar esse bloco sempre que um imóvel entrar/sair do catálogo, mudar de apelido, ou ganhar/trocar vídeo.

## Bloco JavaScript (versão atual — 2026-08-03)

```js
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
  "vp-08": "JR08J", "varandas 08": "JR08J", "jr08j": "JR08J",
  "vp-09": "JR09J", "varandas 09": "JR09J", "jr09j": "JR09J",
};

const V = "https://res.cloudinary.com/dwtylly4h/video/upload/";
const VIDEOS = {
  "DS03J": V+"v1782131150/DS03J.mp4_yjhh1w.mp4",
  "DS04J": V+"v1782131320/DS04J_nymqap.mp4",
  "DS05J": V+"v1782131463/DS05J.mp4_he2dn9.mp4",
  "FL10J": V+"v1782131613/FL10J.mp4_qkygw7.mp4",
  "GF02J": V+"v1782132258/GF02J_-_Casa_do_Tremura_yakxbl.mp4",
  "GF04J": V+"v1782132109/GF04J.mp4_pifndc.mp4",
  "GF06J": V+"v1782132137/GF06J.mp4_sasotv.mp4",
  "GG06J": V+"v1782132178/GG06J.mp4_bjxyri.mp4",
  "GG08J": V+"v1782132227/GG08J_-_Casa_do_John_jtppev.mp4",
  "HA03J": V+"v1782133893/HA03J.mp4_qy7e6t.mp4",
  "JR01J": V+"v1782138866/JR01J_rybbdp.mp4",
  "JR03J": V+"v1782131765/JR03.MP4_r5dbxm.mp4",
  "JR04J": V+"v1782131837/JR04.MP4_hppquh.mp4",
  "JR05J": V+"v1782133985/JR05.MP4_ndymhc.mp4",
  "JR07J": V+"v1782131931/JR07.MP4_rtcrtr.mp4",
  "JR08J": V+"v1782132012/JR08.MP4_i5wtp5.mp4",
  "JR09J": V+"v1782131990/JR09.MP4_vskovc.mp4",
  "VM10A": V+"v1782131516/VM10A.mp4_vt3cra.mp4",
};

function resolveId(nome) {
  return IMOVEIS[(nome || "").toLowerCase().trim()] || nome;
}

function normalizeData(d) {
  if (!d) return "";
  d = String(d).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const iso = d.match(/^(\d{4}-\d{2}-\d{2})T/);       // ISO com horário (2026-09-10T00:00:00.000Z)
  if (iso) return iso[1];
  const br = d.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  if (/^\d{10,13}$/.test(d)) {                         // timestamp em ms ou s
    const ms = d.length === 13 ? Number(d) : Number(d) * 1000;
    return new Date(ms).toISOString().slice(0, 10);
  }
  return d;
}

async function staysFetch(url, options) {
  const resp = await fetch(url, options);
  const text = await resp.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) {}
  if (!resp.ok) {
    throw new Error(`Stays ${resp.status}: ${text.slice(0, 300)}`);
  }
  return json;
}

const mcp = session.datasources["MCP1-Stays"];
const imovelRaw   = mcp?.imovel || mcp?.["Nome do Imóvel"] || "";
const checkinRaw  = mcp?.checkin  || "";
const checkoutRaw = mcp?.checkout || "";
const hospedes    = parseInt(mcp?.hospedes) || 2;

const imovelId = resolveId(imovelRaw);
const checkin  = normalizeData(checkinRaw);
const checkout = normalizeData(checkoutRaw);
const noites   = Math.round((new Date(checkout) - new Date(checkin)) / 86400000);
const videoUrl = VIDEOS[imovelId] || "";

const AUTH = "Basic NWI1YmU2NTY6ZmU0OGU3MzA=";

let nome = imovelId;
let quartos = "";
try {
  const listing = await staysFetch(`https://artezian.stays.net/external/v1/content/listings/${imovelId}`, {
    headers: { "Authorization": AUTH }
  });
  nome = listing?.internalName || imovelId;
  quartos = listing?._i_rooms ? `${listing._i_rooms} quartos` : "";
} catch (e) {}

let stays;
try {
  stays = await staysFetch("https://artezian.stays.net/external/v1/booking/calculate-price", {
    method: "POST",
    headers: { "Authorization": AUTH, "Content-Type": "application/json" },
    body: JSON.stringify({ listingIds: [imovelId], from: checkin, to: checkout, guests: hospedes })
  });
} catch (e) {
  await session.setAdditionalValue("video_link", "");
  await session.setAdditionalValue("resposta_stays",
    `Erro ao consultar Stays (imóvel: "${imovelRaw}" → ${imovelId}, ${checkin} a ${checkout}): ${e.message}`
  );
  return;
}

if (!stays || !Array.isArray(stays) || stays.length === 0) {
  await session.setAdditionalValue("video_link", "");
  await session.setAdditionalValue("resposta_stays",
    `${nome} está indisponível de ${checkinRaw} a ${checkoutRaw}.`
  );
  return;
}

const item   = stays[0];
const total  = item._mctotal?.BRL || 0;
const fees   = item.fees || [];
const taxas  = fees.reduce((s, f) => s + (f._mcval?.BRL || 0), 0);
const diaria = noites > 0 ? Math.round((total - taxas) / noites) : 0;

await session.setAdditionalValue("video_link", videoUrl);
await session.setAdditionalValue("resposta_stays",
  `Imóvel: ${nome}${quartos ? ` · ${quartos}` : ""}\nCheck-in: ${checkin} → Check-out: ${checkout} (${noites} noites)\nHóspedes: ${hospedes}\nDiária: R$${diaria}\nTotal: R$${total}`
);
```

## Histórico de mudanças
- **2026-08-03** — adicionado `vp-08`/`varandas 08` → `JR08J` e `vp-09`/`varandas 09` → `JR09J` no mapa `IMOVEIS`. As duas unidades já estavam ativas no catálogo Stays e já tinham vídeo no mapa `VIDEOS`, mas não resolviam por nome — lead que perguntasse por "Varandas 08" ou "Varandas 09" caía sem match. Achado ao cruzar o catálogo ativo da Stays (`content/listings`) com este mapa pra montar o painel de diárias/ocupação.
- **2026-07-27** — removida a linha `Disponível!` da mensagem de sucesso. Resposta passou a abrir direto com "Imóvel: ...", mantendo check-in/check-out, hóspedes, diária e total. Mensagem de indisponibilidade não mudou.
