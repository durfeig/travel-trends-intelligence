import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase, COUNTRY_NAMES } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const insightTool: Anthropic.Tool = {
  name: "generate_campaign_insight",
  description: "Genera un análisis de marketing y copy de campaña para eSIM",
  input_schema: {
    type: "object" as const,
    properties: {
      insight_text: {
        type: "string",
        description: "Hipótesis de por qué está creciendo este destino ahora (2-3 oraciones)",
      },
      timing_recommendation: {
        type: "string",
        description: "Cuándo lanzar la campaña y por qué (considera la anticipación típica de compra de eSIM)",
      },
      campaign_copy: {
        type: "string",
        description: "Copy de campaña en el idioma del país de origen para eSIM en el destino (2-3 oraciones, tono urgente pero informativo)",
      },
      target_audience: {
        type: "string",
        description: "Descripción del segmento de audiencia más probable",
      },
    },
    required: ["insight_text", "timing_recommendation", "campaign_copy", "target_audience"],
  },
};

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

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    tools: [insightTool],
    tool_choice: { type: "tool", name: "generate_campaign_insight" },
    messages: [
      {
        role: "user",
        content: `Eres un estratega de marketing especializado en eSIMs para viajeros.

DATOS:
- País de origen: ${countryName} (${geo.toUpperCase()})
- Destino en tendencia: ${destination}
- Crecimiento esta semana: ${velocity.toFixed(1)}%${isSpike ? " (¡SPIKE!)" : ""}
- Score de interés: ${score.toFixed(0)}/100

Genera el análisis de marketing para una campaña de eSIM dirigida a viajeros de ${countryName} que van a ${destination}.`,
      },
    ],
  });

  const toolUse = message.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return NextResponse.json({ error: "Respuesta inesperada de Claude" }, { status: 500 });
  }

  const parsed = toolUse.input as Record<string, string>;

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
