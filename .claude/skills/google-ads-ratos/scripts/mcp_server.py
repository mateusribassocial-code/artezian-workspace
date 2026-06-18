"""
Google Ads MCP Server — Artezian Real Estate
Expõe ferramentas de leitura do Google Ads para o Claude Code.
"""
import os
import sys
import yaml
import json
from mcp.server.fastmcp import FastMCP

SKILL_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CREDENTIALS_FILE = os.path.join(SKILL_DIR, "google-ads.yaml")
ACCOUNTS_FILE = os.path.join(SKILL_DIR, "contas.yaml")
API_VERSION = "v24"
BASE_URL = f"https://googleads.googleapis.com/{API_VERSION}"

try:
    import truststore
    truststore.inject_into_ssl()
except ImportError:
    pass

mcp = FastMCP("google-ads-artezian")


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


@mcp.tool()
def list_accounts() -> str:
    """Lista todas as contas do Google Ads acessíveis via MCC."""
    session, config = get_session_and_config()
    mcc_id = str(config["login_customer_id"]).replace("-", "")

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
    r = session.post(
        f"{BASE_URL}/customers/{mcc_id}/googleAds:search",
        headers=base_headers(config),
        json={"query": query},
    )

    if r.status_code != 200:
        r2 = session.get(
            f"{BASE_URL}/customers:listAccessibleCustomers",
            headers=base_headers(config),
        )
        r2.raise_for_status()
        resource_names = r2.json().get("resourceNames", [])
        ids = [rn.split("/")[-1] for rn in resource_names]
        return json.dumps({"contas": ids})

    results = r.json().get("results", [])
    contas = [
        {
            "id": row.get("customerClient", {}).get("id"),
            "nome": row.get("customerClient", {}).get("descriptiveName"),
            "moeda": row.get("customerClient", {}).get("currencyCode"),
            "status": row.get("customerClient", {}).get("status"),
        }
        for row in results
    ]
    return json.dumps({"total": len(contas), "contas": contas}, ensure_ascii=False)


@mcp.tool()
def list_campaigns(customer_id: str) -> str:
    """Lista campanhas ativas de uma conta Google Ads.

    Args:
        customer_id: ID da conta (ex: 3262773141 para Artezian principal)
    """
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
    campanhas = []
    for row in rows:
        c = row.get("campaign", {})
        b = row.get("campaignBudget", {})
        campanhas.append({
            "id": c.get("id"),
            "nome": c.get("name"),
            "status": c.get("status"),
            "tipo": c.get("advertisingChannelType"),
            "estrategia_lance": c.get("biddingStrategyType"),
            "orcamento_dia_brl": round(int(b.get("amountMicros", 0)) / 1_000_000, 2),
        })
    return json.dumps({"total": len(campanhas), "campanhas": campanhas}, ensure_ascii=False)


@mcp.tool()
def get_insights(customer_id: str, days: int = 7) -> str:
    """Retorna métricas de performance das campanhas ativas dos últimos N dias.

    Args:
        customer_id: ID da conta (ex: 3262773141 para Artezian principal)
        days: Número de dias a analisar (padrão: 7)
    """
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
    resultados = []
    total_gasto = 0
    total_conv = 0
    for row in rows:
        c = row.get("campaign", {})
        m = row.get("metrics", {})
        gasto = int(m.get("costMicros", 0)) / 1_000_000
        conv = float(m.get("conversions", 0))
        total_gasto += gasto
        total_conv += conv
        resultados.append({
            "campanha": c.get("name"),
            "impressoes": int(m.get("impressions", 0)),
            "cliques": int(m.get("clicks", 0)),
            "gasto_brl": round(gasto, 2),
            "conversoes": round(conv, 1),
            "ctr_pct": round(float(m.get("ctr", 0)) * 100, 2),
            "cpc_medio_brl": round(int(m.get("averageCpc", 0)) / 1_000_000, 2),
        })
    return json.dumps({
        "periodo_dias": days,
        "total_gasto_brl": round(total_gasto, 2),
        "total_conversoes": round(total_conv, 1),
        "campanhas": resultados,
    }, ensure_ascii=False)


@mcp.tool()
def get_artezian_insights(days: int = 7) -> str:
    """Retorna métricas das duas contas Artezian (principal + secundária) dos últimos N dias.

    Args:
        days: Número de dias a analisar (padrão: 7)
    """
    with open(ACCOUNTS_FILE) as f:
        accounts = yaml.safe_load(f)

    artezian = accounts["clientes"]["artezian"]
    cid_principal = artezian["google"]["customer_id"]
    cid_secundario = artezian["google"]["customer_id_secundario"]

    resultado = {}
    for label, cid in [("principal", cid_principal), ("secundaria", cid_secundario)]:
        try:
            data = json.loads(get_insights(cid, days))
            resultado[label] = {"customer_id": cid, **data}
        except Exception as e:
            resultado[label] = {"customer_id": cid, "erro": str(e)}

    return json.dumps(resultado, ensure_ascii=False)


if __name__ == "__main__":
    mcp.run()
