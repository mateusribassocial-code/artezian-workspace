"""
Completa a campanha "Artezian | Temporada Porto Seguro" (customer 8881844905)
que ficou parcialmente criada: cria o anuncio do grupo Studios (que faltava)
e os grupos de anuncio 1 Quarto / 2 Quartos que nao chegaram a ser criados.
Tambem remove os budgets orfaos deixados pelas tentativas anteriores.
"""
import os
import yaml

try:
    import truststore
    truststore.inject_into_ssl()
except ImportError:
    pass

from create_campaign_temporada import (
    AD_GROUPS,
    create_ad_group,
    add_keywords,
    create_rsa,
)

CREDENTIALS_FILE = os.environ.get("GOOGLE_ADS_YAML", os.path.expanduser("~/.config/google-ads.yaml"))
CUSTOMER_ID = "8881844905"
CAMPAIGN_RN = f"customers/{CUSTOMER_ID}/campaigns/24030412485"
EXISTING_STUDIOS_AG_RN = f"customers/{CUSTOMER_ID}/adGroups/201990010721"
ORPHAN_BUDGET_IDS = ["15716146508", "15725088229"]


def get_client():
    from google.ads.googleads.client import GoogleAdsClient
    config = yaml.safe_load(open(CREDENTIALS_FILE))
    return GoogleAdsClient.load_from_dict({
        "developer_token": config["developer_token"],
        "client_id": config["client_id"],
        "client_secret": config["client_secret"],
        "refresh_token": config["refresh_token"],
        "login_customer_id": str(config["login_customer_id"]),
        "use_proto_plus": True,
    })


def remove_orphan_budgets(client):
    svc = client.get_service("CampaignBudgetService")
    ops = []
    for bid in ORPHAN_BUDGET_IDS:
        op = client.get_type("CampaignBudgetOperation")
        op.remove = f"customers/{CUSTOMER_ID}/campaignBudgets/{bid}"
        ops.append(op)
    res = svc.mutate_campaign_budgets(customer_id=CUSTOMER_ID, operations=ops)
    for r in res.results:
        print(f"  removido: {r.resource_name}")


def main():
    client = get_client()

    print("[1/3] Anuncio do grupo Studios Taperapua...")
    studios = AD_GROUPS[0]
    create_rsa(client, CUSTOMER_ID, EXISTING_STUDIOS_AG_RN, studios["headlines"], studios["descriptions"], studios["url"])
    print("      OK")

    print("[2/3] Grupos de anuncio restantes...")
    for ag in AD_GROUPS[1:]:
        print(f"  -> {ag['ag_nome']}")
        ag_rn = create_ad_group(client, CUSTOMER_ID, ag["ag_nome"], CAMPAIGN_RN, ag["cpc_bid_micros"])
        add_keywords(client, CUSTOMER_ID, ag_rn, ag["keywords"])
        create_rsa(client, CUSTOMER_ID, ag_rn, ag["headlines"], ag["descriptions"], ag["url"])
        print(f"     OK: {len(ag['keywords'])} keywords + anuncio")

    print("[3/3] Removendo budgets orfaos...")
    remove_orphan_budgets(client)

    print("\nCONCLUIDO. Campanha completa em modo PAUSED, pronta pra revisao.")


if __name__ == "__main__":
    main()
