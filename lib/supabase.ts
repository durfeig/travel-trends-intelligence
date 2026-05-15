import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("Supabase env vars not set");
    _client = createClient(url, key);
  }
  return _client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export type TrendMetric = {
  destination: string;
  origin_country: string;
  week_start: string;
  avg_score: number;
  max_score: number;
  velocity_pct: number;
  is_spike: boolean;
  rank_in_country: number;
};

export type CampaignInsight = {
  id: string;
  destination: string;
  origin_country: string;
  velocity_pct: number;
  insight_text: string;
  campaign_copy: string;
  target_audience: string;
  timing_recommendation: string;
  generated_at: string;
};

export const COUNTRY_NAMES: Record<string, string> = {
  AR: "Argentina", BR: "Brasil", CL: "Chile", MX: "México",
  CO: "Colombia", ES: "España", PT: "Portugal", FR: "Francia",
  IT: "Italia", DE: "Alemania", GB: "Reino Unido", NL: "Países Bajos",
  US: "EEUU", CA: "Canadá", AU: "Australia",
};
