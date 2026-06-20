"""
Google Ads — Criação de Campanhas Artezian Locação por Temporada
Usa o SDK oficial google-ads (proto-encoding correto)
Status inicial: PAUSED (revisar antes de ativar)
"""
import os
import sys
import yaml
import time
from datetime import datetime

SKILL_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CREDENTIALS_FILE = os.path.join(SKILL_DIR, "google-ads.yaml")
TAG = datetime.now().strftime("%Y%m%d-%H%M%S")

try:
    import truststore
    truststore.inject_into_ssl()
except ImportError:
    pass


def load_config():
    with open(CREDENTIALS_FILE) as f:
        return yaml.safe_load(f)


def get_client(config):
    from google.ads.googleads.client import GoogleAdsClient
    client_config = {
        "developer_token": config["developer_token"],
        "client_id": config["client_id"],
        "client_secret": config["client_secret"],
        "refresh_token": config["refresh_token"],
        "login_customer_id": str(config["login_customer_id"]),
        "use_proto_plus": True,
    }
    return GoogleAdsClient.load_from_dict(client_config)


CAMPANHAS = [
    {
        "nome": "Artezian | Studios - ate 3 pessoas",
        "budget_micros": 12_000_000,
        "ag_nome": "Studios Taperapua",
        "keywords": [
            "studio Porto Seguro aluguel",
            "studio Taperapua",
            "studio aluguel temporada Porto Seguro",
            "aluguel casal Porto Seguro",
            "hospedagem 2 pessoas Porto Seguro",
            "studio perto praia Porto Seguro",
            "studio piscina Porto Seguro",
            "apto casal Taperapua",
            "aluguel Varandas de Porto",
        ],
        "headlines": [
            "Studio em Taperapua - Reserve",
            "A partir de R$190 por noite",
            "400m da Praia - Piscina - Wi-Fi",
            "Avaliacao 4.9 - Superhost Airbnb",
            "Casal ou 2 Amigos - Perfeito",
            "Reserva Direta, Sem Taxa Extra",
            "Cozinha + Ar + Garagem Incluso",
            "Studio com Churrasqueira Inclusa",
            "Taperapua - Perto do Axe Moi",
            "Condominio Fechado - Seguranca",
            "Gestao Artezian - 95k Instagram",
            "Porto Seguro - Check-in Facil",
            "3 Noites Minimo - Reserve Online",
            "Studio Completo em Porto Seguro",
            "Comodidades Completas - Nota Max",
        ],
        "descriptions": [
            "Studio com piscina e churrasqueira em Taperapua. Reserve direto, sem taxa de plataforma.",
            "Avaliacao 4.9 - Superhost Airbnb - Gestao completa. Confira disponibilidade agora.",
            "400m da praia, cozinha equipada, ar-condicionado. Perfeito para casal ou 2 amigos.",
            "A Artezian cuida de tudo - voce chega e aproveita. Reserve pelo site ou WhatsApp.",
        ],
        "url": "https://www.artezian.com.br",
    },
    {
        "nome": "Artezian | Aptos 1 Quarto - ate 5 pessoas",
        "budget_micros": 20_000_000,
        "ag_nome": "Apartamentos 1 Quarto Taperapua",
        "keywords": [
            "apartamento 1 quarto Porto Seguro aluguel",
            "apartamento Taperapua aluguel",
            "flat Porto Seguro aluguel",
            "apartamento 5 pessoas Porto Seguro",
            "aluguel temporada familia Porto Seguro",
            "apartamento piscina Porto Seguro",
            "aluguel flat Taperapua",
            "apartamento pet friendly Porto Seguro",
            "aluguel familia pequena Porto Seguro",
            "apartamento Mont Carmelo Porto Seguro",
        ],
        "headlines": [
            "Apto em Taperapua - Reserve Ja",
            "Ate 5 Pessoas - A partir R$250",
            "Piscina + Churrasqueira Inclusa",
            "Superhost 4.9 - Gestao Artezian",
            "Pet Friendly - Cozinha Equipada",
            "Familia ou Grupo Pequeno? Aqui",
            "Reserva Direta - Sem Taxa Extra",
            "Ar-Condicionado em Todos os Aptos",
            "400m da Praia - Taperapua",
            "Perto do Axe Moi e Toa Toa",
            "1 Suite - Ate 5 Pessoas - Wi-Fi",
            "Gestao Profissional - Nota Maxima",
            "Ferias em Familia - Porto Seguro",
            "Varandas de Porto - Mont Carmelo",
            "Apartamento Completo Porto Seguro",
        ],
        "descriptions": [
            "Apartamentos com piscina e churrasqueira em Taperapua. Ate 5 pessoas. Reserve direto.",
            "Gestao profissional, avaliacao 4.9, Superhost Airbnb. A Artezian cuida de tudo pra voce.",
            "1 suite, cozinha equipada, ar-condicionado. 400m da praia. Perfeito para familia.",
            "Pet friendly, vaga de garagem, wi-fi. Condominio com piscina. Agende sua temporada.",
        ],
        "url": "https://www.artezian.com.br",
    },
    {
        "nome": "Artezian | Aptos 2 Quartos - ate 8 pessoas",
        "budget_micros": 13_000_000,
        "ag_nome": "Apartamentos 2 Quartos Taperapua",
        "keywords": [
            "apartamento 2 quartos Porto Seguro aluguel",
            "apartamento 8 pessoas Porto Seguro",
            "apartamento 2 suites Porto Seguro",
            "aluguel familia Porto Seguro 8 pessoas",
            "apartamento grande Taperapua aluguel",
            "aluguel grupo pequeno Porto Seguro",
            "apartamento churrasqueira Porto Seguro",
            "2 quartos temporada Porto Seguro",
            "apartamento espacoso Porto Seguro aluguel",
        ],
        "headlines": [
            "Apto 2 Suites em Porto Seguro",
            "Ate 8 Pessoas - Piscina Inclusa",
            "Churrasqueira Privativa Inclusa",
            "Superhost 4.9 - Reserve Direto",
            "Familia Grande? Temos o Espaco",
            "2 Banheiros - Cozinha Equipada",
            "Garagem - Ar - Wi-Fi - Perfeito",
            "Taperapua - 400m da Praia",
            "Perto do Axe Moi e Toa Toa",
            "3 Banheiros - Amplo e Confortavel",
            "Grupos de Ate 8 - Agende Ja",
            "Gestao Artezian - Avaliacao 4.9",
            "Ferias em Grupo - Sem Preocupacao",
            "2 Quartos - Gestao Profissional",
            "Apartamento Espacoso Porto Seguro",
        ],
        "descriptions": [
            "2 suites, churrasqueira, piscina em Taperapua. Ideal para familia ou grupo. Reserve ja.",
            "Avaliacao 4.9 - Superhost Airbnb - Gestao completa. Cuide so de curtir - a gente resolve.",
            "Ate 8 pessoas, 3 banheiros, cozinha completa. 400m da praia em Taperapua.",
            "Apartamento amplo com churrasqueira privativa e piscina. Reserve direto, sem taxa.",
        ],
        "url": "https://www.artezian.com.br",
    },
]

NEGATIVOS = [
    "hotel", "pousada", "hostel", "resort", "all inclusive",
    "venda", "comprar", "investir", "imovel a venda",
    "casa", "mansao", "chale", "fazenda",
    "trancoso", "morro de sao paulo", "itacare",
    "gratuito", "gratis",
]


def create_budget(client, customer_id, nome, amount_micros):
    svc = client.get_service("CampaignBudgetService")
    op = client.get_type("CampaignBudgetOperation")
    budget = op.create
    budget.name = f"{nome} {TAG}"
    budget.amount_micros = amount_micros
    budget.delivery_method = client.enums.BudgetDeliveryMethodEnum.STANDARD
    budget.explicitly_shared = False
    res = svc.mutate_campaign_budgets(customer_id=customer_id, operations=[op])
    return res.results[0].resource_name


def create_campaign(client, customer_id, nome, budget_rn):
    svc = client.get_service("CampaignService")
    op = client.get_type("CampaignOperation")
    c = op.create
    c.name = nome
    c.advertising_channel_type = client.enums.AdvertisingChannelTypeEnum.SEARCH
    c.status = client.enums.CampaignStatusEnum.PAUSED
    c.campaign_budget = budget_rn
    c.manual_cpc.enhanced_cpc_enabled = False
    c.network_settings.target_google_search = True
    c.network_settings.target_search_network = False
    c.network_settings.target_content_network = False
    res = svc.mutate_campaigns(customer_id=customer_id, operations=[op])
    return res.results[0].resource_name


def add_geo_target(client, customer_id, campaign_rn):
    svc = client.get_service("CampaignCriterionService")
    op = client.get_type("CampaignCriterionOperation")
    cc = op.create
    cc.campaign = campaign_rn
    cc.location.geo_target_constant = client.get_service("GeoTargetConstantService").geo_target_constant_path("2076")
    res = svc.mutate_campaign_criteria(customer_id=customer_id, operations=[op])
    return res.results[0].resource_name


def add_negative_keywords(client, customer_id, campaign_rn, negativos):
    svc = client.get_service("CampaignCriterionService")
    ops = []
    for neg in negativos:
        op = client.get_type("CampaignCriterionOperation")
        cc = op.create
        cc.campaign = campaign_rn
        cc.negative = True
        cc.keyword.text = neg
        cc.keyword.match_type = client.enums.KeywordMatchTypeEnum.BROAD
        ops.append(op)
    svc.mutate_campaign_criteria(customer_id=customer_id, operations=ops)


def create_ad_group(client, customer_id, nome, campaign_rn):
    svc = client.get_service("AdGroupService")
    op = client.get_type("AdGroupOperation")
    ag = op.create
    ag.name = nome
    ag.campaign = campaign_rn
    ag.status = client.enums.AdGroupStatusEnum.ENABLED
    ag.type_ = client.enums.AdGroupTypeEnum.SEARCH_STANDARD
    ag.cpc_bid_micros = 1_500_000
    res = svc.mutate_ad_groups(customer_id=customer_id, operations=[op])
    return res.results[0].resource_name


def add_keywords(client, customer_id, ag_rn, keywords):
    svc = client.get_service("AdGroupCriterionService")
    ops = []
    for kw in keywords:
        op = client.get_type("AdGroupCriterionOperation")
        agc = op.create
        agc.ad_group = ag_rn
        agc.status = client.enums.AdGroupCriterionStatusEnum.ENABLED
        agc.keyword.text = kw
        agc.keyword.match_type = client.enums.KeywordMatchTypeEnum.PHRASE
        ops.append(op)
    svc.mutate_ad_group_criteria(customer_id=customer_id, operations=ops)


def create_rsa(client, customer_id, ag_rn, headlines, descriptions, final_url):
    svc = client.get_service("AdGroupAdService")
    op = client.get_type("AdGroupAdOperation")
    aga = op.create
    aga.ad_group = ag_rn
    aga.status = client.enums.AdGroupAdStatusEnum.ENABLED

    ad = aga.ad
    ad.final_urls.append(final_url)
    rsa = ad.responsive_search_ad

    for text in headlines[:15]:
        asset = client.get_type("AdTextAsset")
        asset.text = text
        rsa.headlines.append(asset)

    for text in descriptions[:4]:
        asset = client.get_type("AdTextAsset")
        asset.text = text
        rsa.descriptions.append(asset)

    svc.mutate_ad_group_ads(customer_id=customer_id, operations=[op])


def run(customer_id):
    config = load_config()
    client = get_client(config)
    cid = str(customer_id).replace("-", "")
    resultados = []

    for camp in CAMPANHAS:
        print(f"\n{'='*60}")
        print(f"  {camp['nome']}")
        print(f"{'='*60}")

        print("  [1/5] Budget...")
        budget_rn = create_budget(client, cid, camp["nome"], camp["budget_micros"])
        print(f"        OK: {budget_rn}")

        print("  [2/5] Campanha...")
        campaign_rn = create_campaign(client, cid, camp["nome"], budget_rn)
        campaign_id = campaign_rn.split("/")[-1]
        print(f"        OK: ID {campaign_id}")

        print("  [3/5] Geo target Brasil...")
        add_geo_target(client, cid, campaign_rn)
        add_negative_keywords(client, cid, campaign_rn, NEGATIVOS)
        print(f"        OK: Brasil + {len(NEGATIVOS)} negativos")

        print("  [4/5] Ad group + keywords...")
        ag_rn = create_ad_group(client, cid, camp["ag_nome"], campaign_rn)
        add_keywords(client, cid, ag_rn, camp["keywords"])
        print(f"        OK: {len(camp['keywords'])} keywords (correspondencia de frase)")

        print("  [5/5] Anuncio RSA...")
        create_rsa(client, cid, ag_rn, camp["headlines"], camp["descriptions"], camp["url"])
        print(f"        OK: {len(camp['headlines'][:15])} headlines / {len(camp['descriptions'][:4])} descriptions")

        resultados.append({
            "nome": camp["nome"],
            "id": campaign_id,
            "budget": f"R${camp['budget_micros']//1_000_000}/dia",
        })
        time.sleep(1)

    print(f"\n{'='*60}")
    print("  CONCLUIDO")
    print(f"{'='*60}")
    for r in resultados:
        print(f"  [OK] {r['nome']}")
        print(f"       ID: {r['id']}  |  Budget: {r['budget']}  |  Status: PAUSED")
    print()
    print("  Campanhas criadas em modo PAUSED.")
    print("  Acesse o Google Ads, revise e ative quando estiver pronto.")


if __name__ == "__main__":
    cid = sys.argv[1] if len(sys.argv) > 1 else "8881844905"
    run(cid)
