"""
Google Ads Ratos — Script de leitura (REST API)
Uso: python read.py <comando> [args]

Comandos:
  accounts              Lista todas as contas do MCC
  campaigns <id>        Lista campanhas de uma conta
  insights <id> <days>  Métricas dos últimos N dias
"""
import os
import sys
import yaml

# Patch SSL para requests/urllib3 via truststore (Windows)
try:
    import truststore
    truststore.inject_into_ssl()
except ImportError:
    pass

SKILL_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CREDENTIALS_FILE = os.path.join(SKILL_DIR, "google-ads.yaml")
API_VERSION = "v24"
BASE_URL = f"https://googleads.googleapis.com/{API_VERSION}"


def get_session_and_config():
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import AuthorizedSession

    with open(CREDENTIALS_FILE) as f:
        config = yaml.safe_load(f)

    creds = Credentials(
        token=None,
        refresh_token=config["refresh_token"],
        client_id=config["client_id"],
        client_secret=config["client_secret"],
        token_uri="https://oauth2.googleapis.com/token",
    )
    session = AuthorizedSession(creds)
    return session, config


def base_headers(config):
    h = {"developer-token": config["developer_token"]}
    mcc = str(config.get("login_customer_id", "")).replace("-", "")
    if mcc:
        h["login-customer-id"] = mcc
    return h


def list_accounts():
    session, config = get_session_and_config()
    mcc_id = str(config["login_customer_id"]).replace("-", "")

    # 1. Lista resource names acessíveis
    r = session.get(
        f"{BASE_URL}/customers:listAccessibleCustomers",
        headers=base_headers(config),
    )
    r.raise_for_status()
    resource_names = r.json().get("resourceNames", [])

    if not resource_names:
        print("Nenhuma conta encontrada.")
        return

    # 2. Para cada conta, busca nome via GAQL no MCC
    query = """
        SELECT
            customer_client.id,
            customer_client.descriptive_name,
            customer_client.currency_code,
            customer_client.status
        FROM customer_client
        WHERE customer_client.level = 1
        ORDER BY customer_client.descriptive_name
    """
    r2 = session.post(
        f"{BASE_URL}/customers/{mcc_id}/googleAds:search",
        headers=base_headers(config),
        json={"query": query},
    )

    if r2.status_code == 200:
        results = r2.json().get("results", [])
        print(f"\n{'ID':<15} {'Nome':<45} {'Moeda':<8} {'Status'}")
        print("-" * 80)
        for row in results:
            c = row.get("customerClient", {})
            print(
                f"{c.get('id',''):<15} "
                f"{c.get('descriptiveName','(sem nome)'):<45} "
                f"{c.get('currencyCode',''):<8} "
                f"{c.get('status','')}"
            )
        print(f"\nTotal: {len(results)} conta(s)")
    else:
        # Fallback: mostra só os IDs dos resource names
        print(f"\nContas acessíveis ({len(resource_names)}):")
        for rn in resource_names:
            print(f"  {rn.split('/')[-1]}")


def gaql_search(customer_id, query):
    session, config = get_session_and_config()
    cid = str(customer_id).replace("-", "")
    r = session.post(
        f"{BASE_URL}/customers/{cid}/googleAds:search",
        headers=base_headers(config),
        json={"query": query},
    )
    r.raise_for_status()
    return r.json().get("results", [])


def list_campaigns(customer_id):
    query = """
        SELECT
            campaign.id,
            campaign.name,
            campaign.status,
            campaign.advertising_channel_type,
            campaign.bidding_strategy_type,
            campaign_budget.amount_micros
        FROM campaign
        WHERE campaign.status != 'REMOVED'
        ORDER BY campaign.name
    """
    rows = gaql_search(customer_id, query)
    print(f"\n{'ID':<12} {'Nome':<45} {'Status':<12} {'Tipo':<15} {'Orçamento/dia'}")
    print("-" * 95)
    for row in rows:
        c = row.get("campaign", {})
        b = row.get("campaignBudget", {})
        budget = int(b.get("amountMicros", 0)) / 1_000_000
        print(
            f"{c.get('id',''):<12} "
            f"{c.get('name',''):<45} "
            f"{c.get('status',''):<12} "
            f"{c.get('advertisingChannelType',''):<15} "
            f"R$ {budget:,.2f}"
        )


def get_insights(customer_id, days=7):
    query = f"""
        SELECT
            campaign.name,
            campaign.status,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions,
            metrics.ctr,
            metrics.average_cpc
        FROM campaign
        WHERE
            campaign.status = 'ENABLED'
            AND segments.date DURING LAST_{days}_DAYS
        ORDER BY metrics.cost_micros DESC
    """
    rows = gaql_search(customer_id, query)
    print(f"\n{'Campanha':<45} {'Impressões':>12} {'Cliques':>9} {'Gasto':>12} {'Conversões':>11} {'CTR':>7} {'CPC Médio':>11}")
    print("-" * 110)
    total_cost = 0
    total_conv = 0
    for row in rows:
        c = row.get("campaign", {})
        m = row.get("metrics", {})
        cost = int(m.get("costMicros", 0)) / 1_000_000
        conv = float(m.get("conversions", 0))
        total_cost += cost
        total_conv += conv
        print(
            f"{c.get('name',''):<45} "
            f"{int(m.get('impressions',0)):>12,} "
            f"{int(m.get('clicks',0)):>9,} "
            f"R$ {cost:>9,.2f} "
            f"{conv:>11,.1f} "
            f"{float(m.get('ctr',0))*100:>6.2f}% "
            f"R$ {int(m.get('averageCpc',0))/1_000_000:>8,.2f}"
        )
    print("-" * 110)
    print(f"{'TOTAL':<45} {'':>12} {'':>9} R$ {total_cost:>9,.2f} {total_conv:>11,.1f}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "accounts":
        list_accounts()
    elif cmd == "campaigns" and len(sys.argv) >= 3:
        list_campaigns(sys.argv[2])
    elif cmd == "insights" and len(sys.argv) >= 3:
        days = int(sys.argv[3]) if len(sys.argv) >= 4 else 7
        get_insights(sys.argv[2], days)
    else:
        print(__doc__)
        sys.exit(1)
