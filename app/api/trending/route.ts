import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const geo = searchParams.get("geo");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const minVelocity = parseFloat(searchParams.get("min_velocity") ?? "0");

  let query = supabase
    .from("trend_metrics")
    .select("*")
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

  return NextResponse.json({ data });
}
