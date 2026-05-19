import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const geo = searchParams.get("geo");
  const limit = parseInt(searchParams.get("limit") ?? "100");
  const minVelocity = parseFloat(searchParams.get("min_velocity") ?? "0");

  // Obtener el week_start más reciente disponible
  const { data: latest } = await supabase
    .from("trend_metrics")
    .select("week_start")
    .order("week_start", { ascending: false })
    .limit(1)
    .single();

  if (!latest) {
    return NextResponse.json({ data: [] });
  }

  let query = supabase
    .from("trend_metrics")
    .select("*")
    .eq("week_start", latest.week_start)
    .gte("velocity_pct", minVelocity)
    .order("velocity_pct", { ascending: false })
    .limit(limit);

  if (geo) {
    query = query.eq("origin_country", geo.toUpperCase());
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, week_start: latest.week_start });
}
