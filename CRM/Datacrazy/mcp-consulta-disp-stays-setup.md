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

- **Automático (puxa ao vivo da API do Stays a cada chamada):** diária, disponibilidade real (`booking/reservations`), preço/taxas (`booking/calculate-price`), nome do imóvel e nº de quartos (`content/listings/{id}`). Mudar tarifa no painel do Stays já reflete na próxima pergunta do lead — não precisa mexer nesse bloco.
- **Manual (hardcoded no bloco JS, não atualiza sozinho):**
  - `IMOVEIS` — mapa de apelido/nome digitado pelo lead → código do imóvel no Stays.
  - `VIDEOS` — link de vídeo (Cloudinary) por código de imóvel.
  - Precisa editar esse bloco sempre que um imóvel entrar/sair do catálogo, mudar de apelido, ou ganhar/trocar vídeo.

## ⚠️ `booking/calculate-price` não verifica o calendário de reservas

Confirmado via teste direto na API (2026-08-23): `booking/calculate-price` calcula a tarifa da regra de preço e devolve total **mesmo quando o imóvel já está reservado ou bloqueado** para o período pedido — ele não cruza com o calendário de ocupação. Exemplo real: Studio do João (`DS03J`) tinha reserva confirmada de 07/09 a 11/09/2026, e uma consulta de 10/09 a 13/09 (que se sobrepõe a essa reserva) retornou preço normalmente como se estivesse livre.

Por isso o bloco abaixo faz uma checagem extra antes de confiar no preço: busca `booking/reservations?from=...&to=...&dateType=included&limit=100&type=booked&type=reserved&type=blocked` filtrando pelo `_id` interno do imóvel (obtido em `content/listings/{id}`), e só segue pro `calculate-price` se não houver nenhum registro sobrepondo o período. `dateType=included` pega reservas/bloqueios que se sobrepõem ao período mesmo quando é só um sub-trecho (testado e confirmado).

**Dois detalhes obrigatórios nessa chamada, os dois testados e confirmados na prática:**
1. **`limit=100`** — o default da API é 20 resultados e trunca silenciosamente sem aviso de paginação; 100 é o máximo aceito (`limit=500` retorna erro `must be <= 100`). Sem isso, em janelas de alta ocupação (ex: virada de ano, múltiplos imóveis) o registro do imóvel consultado pode ficar de fora da página retornada.
2. **`type=booked&type=reserved&type=blocked` (parâmetro repetido, não separado por vírgula)** — sem passar `type`, a API só devolve `booked`/`reserved` por padrão e **esconde bloqueios manuais** (`type=blocked`: dono usando o imóvel, manutenção, faxina, etc). Foi exatamente esse buraco que causava "disponibilidade que não existe" continuar aparecendo mesmo com o imóvel bloqueado no painel Stays.

Se a checagem de reservas falhar (erro de rede/API), o bloco aborta com mensagem de erro em vez de silenciosamente confiar no `calculate-price` — nunca deve exibir preço sem antes ter confirmado que o período está livre.

Quando é detectada indisponibilidade (por reserva/bloqueio real, ou pelo `calculate-price` vindo vazio), a resposta enviada ao lead é sempre o texto fixo **"Produto Indisponível"**.

## Bloco JavaScript (versão atual — 2026-08-23)

```js
const IMOVEIS = {
  "studio joão": "DS03J", "studio do joão": "DS03J", "ds03j": "DS03J",
  "flat da mari": "DS04J", "flat mari": "DS04J", "ds04j": "DS04J",
  "apartamento emanoel": "DS05J", "apto emanoel": "DS05J", "ds05j": "DS05J",
  "apto do reinaldo mi": "FL10J", "apto reinaldo": "FL10J", "fl10j": "FL10J",
  "apartamento do reinaldo ji": "GC01J", "gc01j": "GC01J",
  "flat da joyce": "HA03J", "flat joyce": "HA03J", "ha03j": "HA03J",
  "casa do tremura": "GF02J", "casa tremura": "GF02J", "gf02j": "GF02J",
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
  "GG08J": V+"v1782132227/GG08J_-_Casa_do_John_jtppev.mp4",
  "HA03J": V+"v1782133893/HA03J.mp4_qy7e6t.mp4",
  "JR01J": V+"v1782138866/JR01J_rybbdp.mp4",
  "JR03J": V+"v1782131765/JR03.MP4_r5dbxm.mp4",
  "JR04J": V+"v1782131837/JR04.MP4_hppquh.mp4",
  "JR05J": V+"v1782133985/JR05.MP4_ndymhc.mp4",
  "JR07J": V+"v1782131931/JR07.MP4_rtcrtr.mp4",
  "JR08J": V+"v1782132012/JR08.MP4_i5wtp5.mp4",
  "JR09J": V+"v1782131990/JR09.MP4_vskovc.mp4",
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

// 1) Busca o imóvel — precisa do _id interno pra cruzar com as reservas.
// Se essa chamada falhar, aborta com erro em vez de seguir sem checar ocupação.
let nome = imovelId;
let quartos = "";
let idInterno = "";
try {
  const listing = await staysFetch(`https://artezian.stays.net/external/v1/content/listings/${imovelId}`, {
    headers: { "Authorization": AUTH }
  });
  nome = listing?.internalName || imovelId;
  quartos = listing?._i_rooms ? `${listing._i_rooms} quartos` : "";
  idInterno = listing?._id || "";
} catch (e) {
  await session.setAdditionalValue("video_link", "");
  await session.setAdditionalValue("resposta_stays",
    `Erro ao consultar Stays (imóvel: "${imovelRaw}" → ${imovelId}): ${e.message}`
  );
  return;
}

// 2) calculate-price NÃO verifica o calendário de reservas — só calcula tarifa
// da regra de preço e devolve total mesmo se o imóvel já estiver ocupado/bloqueado.
// Por isso, ANTES de confiar no preço, cruza com as reservas reais do período.
// limit=100 é o máximo aceito pela API (default é 20 e trunca silenciosamente,
// podendo esconder a reserva do imóvel buscado em janelas concorridas).
// type= precisa ser repetido (booked + reserved + blocked): sem isso a API
// devolve só booked/reserved por padrão e ESCONDE bloqueios manuais (dono usando
// o imóvel, manutenção etc), que também tornam o período indisponível.
// Se essa chamada falhar, também aborta com erro — nunca cai pro calculate-price
// sem ter confirmado que o período está livre.
let ocupado;
try {
  const reservas = await staysFetch(
    `https://artezian.stays.net/external/v1/booking/reservations?from=${checkin}&to=${checkout}&dateType=included&limit=100&type=booked&type=reserved&type=blocked`,
    { headers: { "Authorization": AUTH } }
  );
  ocupado = Array.isArray(reservas) && reservas.some(
    r => r._idlisting === idInterno
  );
} catch (e) {
  await session.setAdditionalValue("video_link", "");
  await session.setAdditionalValue("resposta_stays",
    `Erro ao verificar disponibilidade (imóvel: "${imovelRaw}" → ${imovelId}, ${checkin} a ${checkout}): ${e.message}`
  );
  return;
}

if (ocupado) {
  await session.setAdditionalValue("video_link", "");
  await session.setAdditionalValue("resposta_stays", "Produto Indisponível");
  return;
}

// 3) Só chega aqui se o período estiver confirmadamente livre.
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
  await session.setAdditionalValue("resposta_stays", "Produto Indisponível");
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
- **2026-08-23 (2ª correção)** — a 1ª correção do dia (checagem via `booking/reservations` sem `type` explícito) ainda deixava passar bloqueios manuais: sem `type`, a API só devolve `booked`/`reserved` por padrão e omite `blocked`. Confirmado com teste real: Casa do John (`GG08J`) tinha bloqueio (`type=blocked`) de 30/09 a 02/10/2026 e uma consulta de 29/09 a 02/10 continuava retornando preço normalmente. Corrigido passando `type=booked&type=reserved&type=blocked` (repetido, não em lista) na chamada. Também: (1) a checagem do imóvel (`content/listings/{id}`) e a checagem de reservas agora abortam com mensagem de erro se falharem, em vez de silenciosamente seguir pro `calculate-price` sem ter confirmado disponibilidade; (2) a mensagem de indisponibilidade (por ocupação real ou por `calculate-price` vazio) passou a ser sempre o texto fixo "Produto Indisponível", a pedido do usuário.
- **2026-08-23 (1ª correção)** — corrigido bug de disponibilidade falsa: `booking/calculate-price` não checa o calendário de reservas e devolvia preço normal mesmo para imóveis já reservados (confirmado com teste real: Studio do João reservado 07/09–11/09/2026 retornava preço pra consulta de 10/09–13/09, período que se sobrepõe à reserva). Adicionada checagem prévia via `booking/reservations?dateType=included&limit=100` filtrando pelo `_id` interno do imóvel — só chama `calculate-price` se não houver reserva `booked`/`reserved` sobrepondo o período. `limit=100` é obrigatório (default da API é 20 e trunca sem aviso).
- **2026-08-17** — removidas do `IMOVEIS`/`VIDEOS` as unidades `DS06J` (Apto da Isa), `HA02J` (Apto da Jessilene), `GF04J` (Casa da Laureana), `GF06J` (Casa da Moana), `GG06J` (Casa do Euller) e `VM10A` (Condomínio do Max). Nenhuma das 6 aparece mais na resposta de `content/listings` da Stays (catálogo real hoje tem 18 IDs — conferido direto na API) — resolver esses códigos e chamar `booking/calculate-price` para eles ia dar erro. Se algum desses imóveis voltar a operar (novo contrato, recadastro), reincluir no mapa e criar/confirmar o ID Stays antes de reativar.
- **2026-08-03** — adicionado `vp-08`/`varandas 08` → `JR08J` e `vp-09`/`varandas 09` → `JR09J` no mapa `IMOVEIS`. As duas unidades já estavam ativas no catálogo Stays e já tinham vídeo no mapa `VIDEOS`, mas não resolviam por nome — lead que perguntasse por "Varandas 08" ou "Varandas 09" caía sem match. Achado ao cruzar o catálogo ativo da Stays (`content/listings`) com este mapa pra montar o painel de diárias/ocupação.
- **2026-07-27** — removida a linha `Disponível!` da mensagem de sucesso. Resposta passou a abrir direto com "Imóvel: ...", mantendo check-in/check-out, hóspedes, diária e total. Mensagem de indisponibilidade não mudou.
