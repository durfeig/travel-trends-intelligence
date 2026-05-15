import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "name param required" }, { status: 400 });
  }

  // Métricas del destino en todos los países
  const { data: metrics, error: metricsError } = await supabase
    .from("trend_metrics")
    .select("*")
    .ilike("destination", name)
    .order("velocity_pct", { ascending: false });

  // Histórico últimas 4 semanas
  const { data: snapshots, error: snapshotsError } = await supabase
    .from("trend_snapshots")
    .select("destination, origin_country, interest_score, snapshot_date")
    .ilike("destination", name)
    .order("snapshot_date", { ascending: true })
    .limit(200);

  if (metricsError || snapshotsError) {
    return NextResponse.json(
      { error: metricsError?.message ?? snapshotsError?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ metrics, snapshots });
}
