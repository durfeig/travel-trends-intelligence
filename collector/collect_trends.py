"""
Collector principal: obtiene datos de Google Trends vía pytrends
y los persiste en Supabase.

Modos:
  python collect_trends.py --mode trending    # trending diario por país
  python collect_trends.py --mode rising      # related queries en alza
  python collect_trends.py --mode monitored   # lista fija de destinos
  python collect_trends.py --mode all         # los tres (default)
"""

import os
import time
import argparse
import logging

# urllib3 >= 2.0 renombró method_whitelist → allowed_methods.
# pytrends todavía usa el nombre viejo, este shim lo parchea en runtime.
import urllib3.util.retry as _retry
_orig_retry_init = _retry.Retry.__init__
def _patched_retry_init(self, *args, **kwargs):
    if "method_whitelist" in kwargs:
        kwargs["allowed_methods"] = kwargs.pop("method_whitelist")
    _orig_retry_init(self, *args, **kwargs)
_retry.Retry.__init__ = _patched_retry_init
from datetime import date, datetime
from typing import Optional

from pytrends.request import TrendReq
from supabase import create_client, Client

from keywords import MONITORED_COUNTRIES, TRENDING_SEARCH_COUNTRY, get_destination_batches, get_travel_keywords, DESTINATIONS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]  # service role key

# Delay entre requests para evitar rate limiting de Google
REQUEST_DELAY_S = 8
BATCH_DELAY_S = 15


def get_pytrends() -> TrendReq:
    return TrendReq(hl="es-ES", tz=360, timeout=(10, 25), retries=2, backoff_factor=0.5)


def supabase_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def insert_snapshots(sb: Client, rows: list[dict]) -> None:
    if not rows:
        log.warning("  insert_snapshots: rows vacío, nada que insertar")
        return
    log.info(f"  Intentando insertar {len(rows)} rows en Supabase...")
    log.info(f"  Ejemplo row: {rows[0]}")
    try:
        result = sb.table("trend_snapshots").insert(rows).execute()
        log.info(f"  → {len(rows)} snapshots guardados. Result: {result}")
    except Exception as e:
        import traceback
        log.error(f"  ERROR insertando snapshots: {e}")
        log.error(traceback.format_exc())


# ── Modo 1: Trending searches diarios ─────────────────────────────────────────

TRAVEL_FILTER_TERMS = [
    "viaje", "vuelo", "hotel", "turismo", "vacacion", "destino",
    "travel", "flight", "holiday", "trip", "tour", "visa",
    "voyage", "vols", "urlaub", "viaggio", "voo",
]

def is_travel_related(term: str) -> bool:
    t = term.lower()
    return any(kw in t for kw in TRAVEL_FILTER_TERMS) or any(
        dest.lower() in t for dest in DESTINATIONS[:50]  # compara contra top destinos
    )


def collect_trending(sb: Client, pytrends: TrendReq) -> None:
    log.info("=== Modo: trending searches diarios ===")
    today = date.today().isoformat()
    rows = []

    for country in MONITORED_COUNTRIES:
        geo = country["geo"]
        pn = TRENDING_SEARCH_COUNTRY.get(geo)
        if not pn:
            continue
        try:
            df = pytrends.trending_searches(pn=pn)
            trending_terms = df[0].tolist()
            travel_terms = [t for t in trending_terms if is_travel_related(t)]
            log.info(f"  {geo}: {len(travel_terms)} términos de viaje en trending")

            for term in travel_terms[:10]:
                rows.append({
                    "destination": term,
                    "origin_country": geo,
                    "interest_score": 100,
                    "snapshot_date": today,
                    "source": "trending",
                })

            time.sleep(REQUEST_DELAY_S)
        except Exception as e:
            log.warning(f"  {geo} trending error: {e}")
            time.sleep(REQUEST_DELAY_S * 2)

    insert_snapshots(sb, rows)


# ── Modo 2: Related queries rising (emergentes) ────────────────────────────────

def collect_rising(sb: Client, pytrends: TrendReq) -> None:
    log.info("=== Modo: related queries rising ===")
    today = date.today().isoformat()
    rows = []

    for country in MONITORED_COUNTRIES:
        geo = country["geo"]
        keywords = get_travel_keywords(geo)

        for kw in keywords:
            try:
                pytrends.build_payload([kw], cat=67, timeframe="now 7-d", geo=geo)  # cat 67 = Travel
                related = pytrends.related_queries()

                rising_df = related.get(kw, {}).get("rising")
                if rising_df is not None and not rising_df.empty:
                    for _, row_data in rising_df.head(10).iterrows():
                        query = str(row_data["query"])
                        value = int(row_data["value"])
                        rows.append({
                            "destination": query,
                            "origin_country": geo,
                            "interest_score": min(value, 100),
                            "snapshot_date": today,
                            "source": "rising_query",
                        })

                log.info(f"  {geo} / '{kw}': {len(rising_df) if rising_df is not None else 0} rising queries")
                time.sleep(REQUEST_DELAY_S)

            except Exception as e:
                log.warning(f"  {geo} / '{kw}' error: {e}")
                time.sleep(REQUEST_DELAY_S * 2)

        time.sleep(BATCH_DELAY_S)

    insert_snapshots(sb, rows)


# ── Modo 3: Interest over time para lista fija de destinos ─────────────────────

def collect_monitored(sb: Client, pytrends: TrendReq) -> None:
    log.info("=== Modo: destinos monitoreados (lista fija) ===")
    today = date.today().isoformat()
    batches = get_destination_batches(5)

    for country in MONITORED_COUNTRIES:
        geo = country["geo"]
        rows = []

        for batch in batches:
            try:
                pytrends.build_payload(batch, cat=67, timeframe="now 7-d", geo=geo)
                df = pytrends.interest_over_time()

                if df.empty:
                    time.sleep(REQUEST_DELAY_S)
                    continue

                # Promedio de la última semana por destino
                for dest in batch:
                    if dest in df.columns:
                        avg_score = int(df[dest].mean())
                        if avg_score > 0:
                            rows.append({
                                "destination": dest,
                                "origin_country": geo,
                                "interest_score": avg_score,
                                "snapshot_date": today,
                                "source": "monitored",
                            })

                time.sleep(REQUEST_DELAY_S)

            except Exception as e:
                log.warning(f"  {geo} / batch {batch[:2]}... error: {e}")
                time.sleep(REQUEST_DELAY_S * 2)

        if rows:
            insert_snapshots(sb, rows)
            log.info(f"  {geo}: {len(rows)} destinos con datos")

        time.sleep(BATCH_DELAY_S)


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["trending", "rising", "monitored", "all"], default="all")
    args = parser.parse_args()

    sb = supabase_client()
    pytrends = get_pytrends()

    log.info(f"Iniciando colección — modo: {args.mode} — {datetime.now().isoformat()}")

    # trending_searches() excluido del modo 'all' — endpoint de Google da 404
    if args.mode == "trending":
        collect_trending(sb, pytrends)
        time.sleep(BATCH_DELAY_S)

    if args.mode in ("rising", "all"):
        pytrends = get_pytrends()  # reiniciar sesión
        collect_rising(sb, pytrends)
        time.sleep(BATCH_DELAY_S)

    if args.mode in ("monitored", "all"):
        pytrends = get_pytrends()
        collect_monitored(sb, pytrends)

    log.info("Colección completada.")


if __name__ == "__main__":
    main()
