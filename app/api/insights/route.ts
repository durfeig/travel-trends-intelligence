import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase, COUNTRY_NAMES } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const geo = searchParams.get("geo");
  const destination = searchParams.get("destination");

  if (!geo || !destination) {
    return NextResponse.json({ error: "geo y destination son requeridos" }, { status: 400 });
  }

  // Verificar si ya existe un insight de hoy
  const today = new Date().toISOString().split("T")[0];
  const { data: existing } = await supabase
    .from("campaign_insights")
    .select("*")
    .eq("origin_country", geo.toUpperCase())
    .ilike("destination", destination)
    .gte("generated_at", `${today}T00:00:00`)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ data: existing, cached: true });
  }

  // Obtener métricas para contexto
  const { data: metrics } = await supabase
    .from("trend_metrics")
    .select("velocity_pct, avg_score, is_spike")
    .eq("origin_country", geo.toUpperCase())
    .ilike("destination", destination)
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  const velocity = metrics?.velocity_pct ?? 0;
  const score = metrics?.avg_score ?? 0;
  const isSpike = metrics?.is_spike ?? false;
  const countryName = COUNTRY_NAMES[geo.toUpperCase()] ?? geo;

  const prompt = `Eres un estratega de marketing especializado en eSIMs y telecomunicaciones para viajeros.

DATOS:
- País de origen de búsquedas: ${countryName} (${geo.toUpperCase()})
- Destino en tendencia: ${destination}
- Crecimiento en búsquedas esta semana: ${velocity.toFixed(1)}%${isSpike ? " (¡SPIKE detectado!)" : ""}
- Score de interés promedio: ${score.toFixed(0)}/100

TAREA: Genera un análisis de marketing para una campaña de eSIM enfocada en viajeros de ${countryName} que van a ${destination}.

Responde en JSON con este formato exacto:
{
  "insight_text": "Hipótesis de por qué está creciendo este destino ahora (2-3 oraciones)",
  "timing_recommendation": "Cuándo lanzar la campaña y por qué (considera el anticipación típica de compra de eSIM)",
  "campaign_copy": "Copy de campaña en el idioma de ${countryName} para eSIM en ${destination} (2-3 oraciones, tono urgente pero informativo, menciona conectividad/cobertura)",
  "target_audience": "Descripción del segmento de audiencia más probable"
}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Respuesta inesperada de Claude" }, { status: 500 });
  }

  let parsed: Record<string, string>;
  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch?.[0] ?? content.text);
  } catch {
    return NextResponse.json({ error: "No se pudo parsear la respuesta de Claude" }, { status: 500 });
  }

  // Persistir en Supabase
  const { data: saved, error } = await supabase
    .from("campaign_insights")
    .insert({
      destination,
      origin_country: geo.toUpperCase(),
      velocity_pct: velocity,
      insight_text: parsed.insight_text,
      campaign_copy: parsed.campaign_copy,
      target_audience: parsed.target_audience,
      timing_recommendation: parsed.timing_recommendation,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: parsed, cached: false });
  }

  return NextResponse.json({ data: saved, cached: false });
}
