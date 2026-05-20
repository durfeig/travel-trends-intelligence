"""
Calcula métricas de velocity y detecta spikes.
Corre después de collect_trends.py o de forma independiente.

  python analyzer.py
"""

import os
import logging
from datetime import date, timedelta

from supabase import create_client, Client

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]

SPIKE_THRESHOLD = 30.0  # velocity % para marcar como spike


def compute_metrics(sb: Client) -> None:
    today = date.today()
    this_week = today - timedelta(days=today.weekday())      # lunes de esta semana
    last_week = this_week - timedelta(weeks=1)

    log.info(f"Calculando métricas: semana={this_week} vs {last_week}")

    # Obtener todos los snapshots de las últimas 2 semanas
    resp = (
        sb.table("trend_snapshots")
        .select("destination, origin_country, interest_score, snapshot_date, source")
        .gte("snapshot_date", last_week.isoformat())
        .limit(50000)
        .execute()
    )
    snapshots = resp.data
    log.info(f"Snapshots recibidos: {len(snapshots) if snapshots else 0}")
    if snapshots:
        dates = sorted(set(s["snapshot_date"] for s in snapshots))
        log.info(f"Fechas en snapshots: {dates[:5]} ... {dates[-5:] if len(dates) > 5 else ''}")
    if not snapshots:
        log.warning("No hay snapshots recientes.")
        return

    # Agrupar por (destination, origin_country, semana)
    from collections import defaultdict
    buckets: dict[tuple, dict] = defaultdict(lambda: {"this": [], "last": [], "sources": set()})

    for snap in snapshots:
        snap_date = date.fromisoformat(snap["snapshot_date"])
        key = (snap["destination"], snap["origin_country"])
        if snap_date >= this_week:
            buckets[key]["this"].append(snap["interest_score"])
        else:
            buckets[key]["last"].append(snap["interest_score"])
        buckets[key]["sources"].add(snap["source"])

    # Calcular métricas
    upsert_rows = []
    for (destination, origin_country), data in buckets.items():
        if not data["this"]:
            continue

        avg_this = sum(data["this"]) / len(data["this"])
        max_this = max(data["this"])

        if data["last"]:
            avg_last = sum(data["last"]) / len(data["last"])
            velocity = ((avg_this - avg_last) / avg_last * 100) if avg_last > 0 else 0.0
        else:
            velocity = 0.0

        upsert_rows.append({
            "destination": destination,
            "origin_country": origin_country,
            "week_start": this_week.isoformat(),
            "avg_score": round(avg_this, 2),
            "max_score": max_this,
            "velocity_pct": round(velocity, 2),
            "is_spike": velocity >= SPIKE_THRESHOLD,
            "sources": list(data["sources"]),
        })

    if not upsert_rows:
        log.info("Sin datos para calcular métricas.")
        return

    # Rankear por país (orden por velocity desc)
    from itertools import groupby
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
