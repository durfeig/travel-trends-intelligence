"""
Calcula métricas de velocity y detecta spikes.
Corre después de collect_trends.py o de forma independiente.

  python analyzer.py
"""

import os
import logging
from datetime import date, timedelta
from itertools import groupby

from supabase import create_client, Client

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]

SPIKE_THRESHOLD = 30.0  # velocity % para marcar como spike


def compute_metrics(sb: Client) -> None:
    today = date.today()
    this_week = today - timedelta(days=today.weekday())   # lunes de esta semana
    last_week = this_week - timedelta(weeks=1)

    log.info(f"Calculando métricas: semana={this_week} vs {last_week}")

    # Agregación en la base de datos para evitar el límite de 1000 filas de Supabase.
    # La función devuelve una fila por (destination, origin_country) ya promediada.
    resp = sb.rpc("compute_weekly_metrics", {
        "p_this_week": this_week.isoformat(),
        "p_last_week": last_week.isoformat(),
    }).execute()

    rows = resp.data
    log.info(f"Combinaciones destino+país recibidas: {len(rows) if rows else 0}")

    if not rows:
        log.warning("Sin datos agregados de la función compute_weekly_metrics.")
        return

    upsert_rows = []
    for r in rows:
        avg_this = r["avg_this"] or 0.0
        avg_last = r["avg_last"] or 0.0
        max_this = r["max_this"] or 0

        velocity = ((avg_this - avg_last) / avg_last * 100) if avg_last > 0 else 0.0

        upsert_rows.append({
            "destination": r["destination"],
            "origin_country": r["origin_country"],
            "week_start": this_week.isoformat(),
            "avg_score": round(avg_this, 2),
            "max_score": max_this,
            "velocity_pct": round(velocity, 2),
            "is_spike": velocity >= SPIKE_THRESHOLD,
            "sources": r["sources"] or [],
        })

    # Rankear por país (orden por velocity desc)
    upsert_rows.sort(key=lambda r: (r["origin_country"], -r["velocity_pct"]))
    for country, group in groupby(upsert_rows, key=lambda r: r["origin_country"]):
        for rank, row in enumerate(group, start=1):
            row["rank_in_country"] = rank

    # Upsert en Supabase
    sb.table("trend_metrics").upsert(
        upsert_rows,
        on_conflict="destination,origin_country,week_start"
    ).execute()

    spikes = sum(1 for r in upsert_rows if r["is_spike"])
    log.info(f"Métricas calculadas: {len(upsert_rows)} registros, {spikes} spikes detectados.")


if __name__ == "__main__":
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    compute_metrics(sb)
