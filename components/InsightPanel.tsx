"use client";

import { useState } from "react";
import { TrendMetric, COUNTRY_NAMES } from "@/lib/supabase";

interface Insight {
  destination: string;
  origin_country: string;
  insight_text: string;
  campaign_copy: string;
  target_audience: string;
  timing_recommendation: string;
  velocity_pct: number;
}

interface Props {
  row: TrendMetric;
  onClose: () => void;
}

export default function InsightPanel({ row, onClose }: Props) {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsight = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/insights?geo=${row.origin_country}&destination=${encodeURIComponent(row.destination)}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setInsight(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const countryName = COUNTRY_NAMES[row.origin_country] ?? row.origin_country;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{row.destination}</h2>
              <p className="text-gray-500 text-sm">Buscado desde {countryName}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
          </div>

          <div className="flex gap-3 mb-5">
            <div className="bg-blue-50 rounded-lg px-3 py-2 text-center">
              <div className="text-2xl font-bold text-blue-700">+{row.velocity_pct.toFixed(0)}%</div>
              <div className="text-xs text-blue-500">crecimiento</div>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
              <div className="text-2xl font-bold text-gray-700">{Math.round(row.avg_score)}</div>
              <div className="text-xs text-gray-500">score /100</div>
            </div>
            {row.is_spike && (
              <div className="bg-red-50 rounded-lg px-3 py-2 flex items-center">
                <span className="text-red-600 font-bold text-sm">🔥 SPIKE</span>
              </div>
            )}
          </div>

          {!insight && !loading && (
            <button
              onClick={fetchInsight}
              className="w-full bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition-colors"
            >
              Generar sugerencia de campaña eSIM con IA
            </button>
          )}

          {loading && (
            <div className="text-center py-8 text-gray-500">
              <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm">Analizando tendencia con Claude...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm">{error}</div>
          )}

          {insight && (
            <div className="space-y-4">
              <Section title="¿Por qué está creciendo?" icon="📈">
                {insight.insight_text}
              </Section>
              <Section title="Cuándo lanzar la campaña" icon="📅">
                {insight.timing_recommendation}
              </Section>
              <Section title="Copy de campaña eSIM" icon="✍️" highlight>
                {insight.campaign_copy}
              </Section>
              <Section title="Audiencia objetivo" icon="🎯">
                {insight.target_audience}
              </Section>
              <button
                onClick={fetchInsight}
                className="w-full text-sm text-gray-500 hover:text-gray-700 underline mt-2"
              >
                Regenerar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  title, icon, children, highlight,
}: {
  title: string; icon: string; children: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? "bg-blue-50 border border-blue-200" : "bg-gray-50"}`}>
      <h3 className="text-sm font-semibold text-gray-700 mb-1">
        {icon} {title}
      </h3>
      <p className="text-sm text-gray-800 leading-relaxed">{children}</p>
    </div>
  );
}
