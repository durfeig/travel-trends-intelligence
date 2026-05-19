"""
Colector de Wikipedia Pageviews.

Usa la API pública de Wikimedia (sin autenticación) para obtener
las visitas diarias a artículos de destinos turísticos en inglés.

Señal complementaria a Google Trends: cuando un destino gana tracción,
las visitas a su artículo de Wikipedia crecen antes o en paralelo.
Los datos se guardan con origin_country="GLOBAL" (señal universal).

  python wikipedia_collector.py
"""

import os
import time
import logging
import requests
from datetime import date, timedelta

from supabase import create_client, Client

from keywords import DESTINATIONS_WIKI_EN

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]

WIKIMEDIA_API = "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article"
HEADERS = {"User-Agent": "TravelTrendsIntelligence/1.0 (innovacion@ukelele.la)"}
REQUEST_DELAY_S = 0.5  # Wikimedia es permisiva; 0.5s es suficiente


def get_pageviews(en_title: str, days: int = 14) -> list[dict]:
    """Devuelve pageviews diarios de los últimos N días para un artículo de en.wikipedia."""
    end = date.today() - timedelta(days=1)   # ayer (el día actual puede estar incompleto)
    start = end - timedelta(days=days - 1)

    article = requests.utils.quote(en_title.replace(" ", "_"), safe="")
    url = (
        f"{WIKIMEDIA_API}/en.wikipedia/all-access/user"
        f"/{article}/daily"
        f"/{start.strftime('%Y%m%d')}/{end.strftime('%Y%m%d')}"
    )

    resp = requests.get(url, headers=HEADERS, timeout=10)
    if resp.status_code == 404:
        return []
    resp.raise_for_status()
    return resp.json().get("items", [])


def calc_velocity(items: list[dict]) -> tuple[int, int, float]:
    """
    Compara la última semana vs la semana anterior.
    Retorna (avg_last_week, avg_prev_week, velocity_pct).
    """
    if len(items) < 14:
        return 0, 0, 0.0

    avg_prev = sum(i["views"] for i in items[:7]) / 7
    avg_last = sum(i["views"] for i in items[7:]) / 7

    velocity = ((avg_last - avg_prev) / avg_prev * 100) if avg_prev > 0 else 0.0
    return int(avg_last), int(avg_prev), round(velocity, 1)


def collect_wikipedia(sb: Client) -> None:
    log.info("=== Wikipedia Pageviews Collector ===")
    today = date.today().isoformat()
    raw: list[dict] = []

    for es_name, en_title in DESTINATIONS_WIKI_EN.items():
        try:
            items = get_pageviews(en_title, days=14)
            if not items:
                log.info(f"  {es_name} ({en_title}): no encontrado")
                time.sleep(REQUEST_DELAY_S)
                continue

            avg_last, avg_prev, velocity = calc_velocity(items)
            log.info(f"  {es_name}: {avg_last:,} vistas/día (velocity: {velocity:+.1f}%)")

            raw.append({
                "es_name": es_name,
                "avg_views": avg_last,
                "velocity": velocity,
            })
            time.sleep(REQUEST_DELAY_S)

        except Exception as e:
            log.warning(f"  {es_name} error: {e}")
            time.sleep(REQUEST_DELAY_S * 3)

    if not raw:
        log.warning("  No se obtuvieron datos de Wikipedia.")
        return

    # Normalizar avg_views a escala 0-100 relativa al destino más visto del batch
    max_views = max(r["avg_views"] for r in raw) or 1

    rows = []
    for r in raw:
        score = min(100, int(r["avg_views"] / max_views * 100))
        if score > 0:
            rows.append({
                "destination": r["es_name"],
                "origin_country": "GLOBAL",
                "interest_score": score,
                "snapshot_date": today,
                "source": "wikipedia",
            })

    log.info(f"  Insertando {len(rows)} snapshots de Wikipedia...")
    try:
        sb.table("trend_snapshots").insert(rows).execute()
        log.info(f"  → {len(rows)} snapshots guardados")
    except Exception as e:
        import traceback
        log.error(f"  ERROR insertando: {e}")
        log.error(traceback.format_exc())


if __name__ == "__main__":
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    collect_wikipedia(sb)
