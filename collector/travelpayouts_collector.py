"""
Colector de Travelpayouts Data API.

Consulta los destinos más buscados desde el aeropuerto principal
de cada país monitoreado. Señal basada en búsquedas y reservas
reales de vuelos — complementa Google Trends (intención) y
Wikipedia (interés general).

  python travelpayouts_collector.py
"""

import os
import time
import logging
import requests
from datetime import date

from supabase import create_client, Client

from keywords import GEO_TO_IATA, IATA_TO_DESTINATION, MONITORED_COUNTRIES

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]
TRAVELPAYOUTS_TOKEN = os.environ["TRAVELPAYOUTS_TOKEN"]

API_URL = "https://api.travelpayouts.com/v1/city-directions"
REQUEST_DELAY_S = 2


def fetch_popular_destinations(origin_iata: str) -> dict:
    """Devuelve los destinos más buscados desde un aeropuerto de origen."""
    params = {
        "origin": origin_iata,
        "currency": "usd",
        "token": TRAVELPAYOUTS_TOKEN,
    }
    resp = requests.get(API_URL, params=params, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    if not data.get("success"):
        raise ValueError(f"API error: {data}")
    return data.get("data") or {}


def collect_travelpayouts(sb: Client) -> None:
    log.info("=== Travelpayouts Popular Destinations Collector ===")
    today = date.today().isoformat()

    for country in MONITORED_COUNTRIES:
        geo = country["geo"]
        origin_iata = GEO_TO_IATA.get(geo)
        if not origin_iata:
            continue

        try:
            destinations = fetch_popular_destinations(origin_iata)
            if not destinations:
                log.info(f"  {geo}: sin resultados")
                time.sleep(REQUEST_DELAY_S)
                continue

            # La API devuelve los destinos ordenados por popularidad.
            # Convertimos posición en score: 1° → 100, último → ~20
            items = list(destinations.items())
            n = len(items)
            rows = []

            for rank, (dest_iata, _) in enumerate(items, start=1):
                dest_name = IATA_TO_DESTINATION.get(dest_iata)
                if not dest_name:
                    continue  # destino fuera de nuestra lista monitoreada

                score = max(20, int(100 - (rank - 1) * 80 / max(n - 1, 1)))
                rows.append({
                    "destination": dest_name,
                    "origin_country": geo,
                    "interest_score": score,
                    "snapshot_date": today,
                    "source": "travelpayouts",
                })

            log.info(f"  {geo} ({origin_iata}): {len(rows)} destinos conocidos de {n} totales")

            if rows:
                sb.table("trend_snapshots").insert(rows).execute()
                log.info(f"  → {len(rows)} snapshots guardados")

            time.sleep(REQUEST_DELAY_S)

        except Exception as e:
            import traceback
            log.warning(f"  {geo} error: {e}")
            log.warning(traceback.format_exc())
            time.sleep(REQUEST_DELAY_S * 3)


if __name__ == "__main__":
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    collect_travelpayouts(sb)
