import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const minVelocity = parseFloat(searchParams.get("min_velocity") ?? "20");
  const spikesOnly = searchParams.get("spikes_only") === "true";
  const limit = parseInt(searchParams.get("limit") ?? "50");

  let query = supabase
    .from("trend_metrics")
    .select("*")
    .gte("velocity_pct", minVelocity)
    .order("velocity_pct", { ascending: false })
    .limit(limit);

  if (spikesOnly) {
    query = query.eq("is_spike", true);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Agrupar por país de origen para el dashboard
  const byCountry: Record<string, typeof data> = {};
  for (const row of data ?? []) {
    if (!byCountry[row.origin_country]) byCountry[row.origin_country] = [];
    byCountry[row.origin_country].push(row);
  }

  return NextResponse.json({ data, byCountry });
}
