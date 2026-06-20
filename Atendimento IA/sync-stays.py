"""
Sincroniza a base de imóveis com a API da Stays.
Rodar sempre que cadastrar um imóvel novo: python sync-stays.py
"""

import urllib.request
import urllib.error
import json
import re
import base64
from datetime import date

CLIENT_ID = "5b5be656"
CLIENT_SECRET = "fe48e730"
BASE_URL = "https://artezian.stays.net/external/v1"
OUTPUT_FILE = "base-imoveis.md"

VIDEOS = {
    "DS03J": "https://www.youtube.com/watch?v=bcQ10tzSVzM",
    "DS04J": "https://www.youtube.com/watch?v=TiEYINlPgyY",
    "DS05J": "https://www.youtube.com/shorts/ZhV-y6uEDoI",
    "DS06J": "https://www.youtube.com/watch?v=WzCzDBHpds4",
    "DT04J": "https://www.youtube.com/watch?v=RKqMnJd4_f8",
    "FL10J": "https://www.youtube.com/watch?v=xjnOGp2ELQQ",
    "HA03J": "https://youtube.com/shorts/RUPRqGTvTjM",
    "GC01J": None,
    "HA02J": "https://www.youtube.com/watch?v=yldiuX6TMn0",
    "GF02J": "https://youtu.be/CNCtmX10Bko",
    "GF04J": "https://www.youtube.com/watch?v=Uirc8KLGs0g",
    "GF06J": "https://www.youtube.com/watch?v=xDgFD3-_jYc",
    "GG08J": "https://www.youtube.com/watch?v=sKs-Fo-NQIw",
    "GG06J": "https://www.youtube.com/watch?v=VpjgSYfPblw",
}

PRECOS = {
    "DS03J": {"baixa": 250,  "alta": 600,  "feriado": 400,  "limpeza": None, "caucao": None},
    "DS04J": {"baixa": 250,  "alta": 600,  "feriado": 400,  "limpeza": 200,  "caucao": None},
    "DS05J": {"baixa": 250,  "alta": 600,  "feriado": 400,  "limpeza": None, "caucao": None},
    "DS06J": {"baixa": 250,  "alta": 600,  "feriado": 400,  "limpeza": None, "caucao": None},
    "DT04J": {"baixa": 500,  "alta": 1100, "feriado": 750,  "limpeza": None, "caucao": None},
    "FL10J": {"baixa": 750,  "alta": 1600, "feriado": 1200, "limpeza": None, "caucao": None},
    "HA03J": {"baixa": 650,  "alta": 1200, "feriado": 850,  "limpeza": 200,  "caucao": None},
    "GC01J": {"baixa": 750,  "alta": 1600, "feriado": 1200, "limpeza": None, "caucao": None},
    "HA02J": {"baixa": 750,  "alta": 1400, "feriado": 1100, "limpeza": None, "caucao": None},
    "GF02J": {"baixa": 1600, "alta": 3000, "feriado": 2500, "limpeza": None, "caucao": None},
    "GF04J": {"baixa": 1800, "alta": 3000, "feriado": 2500, "limpeza": 250,  "caucao": 2000},
    "GF06J": {"baixa": 1500, "alta": 3000, "feriado": 2500, "limpeza": None, "caucao": None},
    "GG08J": {"baixa": 1800, "alta": 2700, "feriado": 2200, "limpeza": None, "caucao": None},
    "GG06J": {"baixa": 2500, "alta": 3500, "feriado": 3500, "limpeza": None, "caucao": None},
}

def clean_html(text):
    if not text:
        return ""
    text = re.sub(r"<br\s*/?>", "\n", text)
    text = re.sub(r"</p>", "\n", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    lines = [l.strip() for l in text.strip().split("\n") if l.strip()]
    return "\n".join(lines)

def fetch_listings():
    token = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
    req = urllib.request.Request(
        f"{BASE_URL}/content/listings",
        headers={"Authorization": f"Basic {token}", "Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def preco_str(iid):
    p = PRECOS.get(iid)
    if not p:
        return "- **Diárias:** a definir"
    lines = [f"- **Diárias:** Baixa R${p['baixa']} | Alta R${p['alta']} | Feriados R${p['feriado']}"]
    if p["limpeza"]:
        lines.append(f"- **Taxa de limpeza:** R${p['limpeza']}")
    if p["caucao"]:
        lines.append(f"- **Caução:** R${p['caucao']}")
    return "\n".join(lines)

def build_entry(item):
    iid = item["id"]
    internal = item.get("internalName", "")
    title = item.get("_mstitle", {}).get("pt_BR", internal)
    addr = item.get("address", {})
    region = addr.get("region", "")
    city = addr.get("city", "")
    location = f"{region}, {city}".strip(", ")
    guests = item.get("_i_maxGuests", "?")
    rooms = item.get("_i_rooms", "?")
    beds = item.get("_i_beds", "?")
    baths = item.get("_f_bathrooms", "?")
    photo = item.get("_t_mainImageMeta", {}).get("url", "")
    link = f"https://www.artezian.com.br/pt/apartment/{iid}"
    desc = clean_html(item.get("_msdesc", {}).get("pt_BR", ""))
    desc_lines = [f"  {l}" for l in desc.split("\n")[:6] if l.strip()]
    desc_block = "\n".join(desc_lines)

    video = VIDEOS.get(iid)
    video_line = f"- **Video:** {video}\n" if video else ""

    return f"""### {internal}
- **ID:** {iid}
- **Link:** {link}
{video_line}- **Foto:** {photo}
- **Localização:** {location}
- **Capacidade:** até {guests} pessoas
- **Quartos:** {rooms} | **Camas:** {beds} | **Banheiros:** {baths}
{preco_str(iid)}
- **Descrição:**
{desc_block}

---
"""

def main():
    print("Buscando imóveis na Stays...")
    listings = fetch_listings()
    active = [l for l in listings if l.get("status") == "active"]
    print(f"{len(active)} imóveis ativos encontrados.")

    mont = [l for l in active if l["id"] in ("DS03J", "DS04J", "DS05J")]
    aptos_tp = [l for l in active if l["id"] in ("DS06J", "DT04J", "FL10J", "HA03J")]
    aptos_arr = [l for l in active if l["id"] in ("GC01J", "HA02J")]
    casas = [l for l in active if l["id"] in ("GF02J", "GF04J", "GF06J", "GG08J", "GG06J")]
    outros = [l for l in active if l["id"] not in
              {i["id"] for grupo in [mont, aptos_tp, aptos_arr, casas] for i in grupo}]

    hoje = date.today().strftime("%Y-%m-%d")

    sections = [f"""# Base de Imóveis — Artezian Real Estate

> Sincronizado com a API da Stays. Última atualização: {hoje}.
> Preços mantidos manualmente — atualizar conforme temporada.

---

## CONDOMÍNIO MONT CARMELO — TAPERAPUÃ

> Condomínio com piscina adulto e infantil, sauna, churrasqueira coletiva, segurança 24h, restaurantes e acesso à praia de Taperapuã. Beach clubs próximos: Axé Moi, Tôa Tôa, Cabana Malibu, Boa Beach.

"""]

    for l in mont:
        sections.append(build_entry(l))

    sections.append("## APARTAMENTOS AVULSOS — TAPERAPUÃ / PORTO SEGURO\n\n")
    for l in aptos_tp:
        sections.append(build_entry(l))

    sections.append("## APARTAMENTOS — ARRAIAL D'AJUDA / COROA VERMELHA\n\n")
    for l in aptos_arr:
        sections.append(build_entry(l))

    sections.append("## CASAS\n\n")
    for l in casas:
        sections.append(build_entry(l))

    if outros:
        sections.append("## OUTROS\n\n")
        for l in outros:
            sections.append(build_entry(l))

    sections.append("""## FORMAS DE PAGAMENTO

- **Pix:** 30-50% de entrada, restante na chegada
- **Cartão de crédito:** até 6x com 13% de juros
- **Transferência bancária:** combinado direto

---

## PERÍODOS

- **Baixa temporada:** fora de feriados e férias escolares
- **Alta temporada:** férias de julho, janeiro/fevereiro, Carnaval
- **Feriados:** Natal, Réveillon, Semana Santa, feriados prolongados

---

## SOBRE A ARTEZIAN

Gestão completa de locação por temporada em Porto Seguro e região. Superhost Airbnb, avaliação 4.9, mais de 95k seguidores no Instagram (@ojoaomendonca). Site: artezian.com.br
""")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(sections))

    print(f"base-imoveis.md atualizado com {len(active)} imóveis.")

if __name__ == "__main__":
    main()
