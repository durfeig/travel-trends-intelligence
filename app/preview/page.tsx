"use client";

import { useState } from "react";
import CountrySelector from "@/components/CountrySelector";
import RisingTable from "@/components/RisingTable";
import StatsBar from "@/components/StatsBar";
import InsightPanel from "@/components/InsightPanel";
import { TrendMetric } from "@/lib/supabase";

const MOCK_DATA: TrendMetric[] = [
  { destination: "Tokio", origin_country: "ES", week_start: "2026-05-12", avg_score: 82, max_score: 95, velocity_pct: 67, is_spike: true, rank_in_country: 1, sources: ["rising_query", "wikipedia", "travelpayouts"] },
  { destination: "Tailandia", origin_country: "ES", week_start: "2026-05-12", avg_score: 74, max_score: 88, velocity_pct: 48, is_spike: true, rank_in_country: 2, sources: ["rising_query", "travelpayouts"] },
  { destination: "Vietnam", origin_country: "AR", week_start: "2026-05-12", avg_score: 61, max_score: 79, velocity_pct: 41, is_spike: true, rank_in_country: 1, sources: ["rising_query", "wikipedia"] },
  { destination: "Bali", origin_country: "BR", week_start: "2026-05-12", avg_score: 70, max_score: 85, velocity_pct: 38, is_spike: true, rank_in_country: 1, sources: ["monitored", "travelpayouts"] },
  { destination: "Japón", origin_country: "MX", week_start: "2026-05-12", avg_score: 65, max_score: 80, velocity_pct: 35, is_spike: true, rank_in_country: 1, sources: ["rising_query", "wikipedia", "travelpayouts"] },
  { destination: "Marruecos", origin_country: "FR", week_start: "2026-05-12", avg_score: 58, max_score: 72, velocity_pct: 29, is_spike: false, rank_in_country: 1, sources: ["monitored"] },
  { destination: "Grecia", origin_country: "DE", week_start: "2026-05-12", avg_score: 55, max_score: 68, velocity_pct: 26, is_spike: false, rank_in_country: 1, sources: ["monitored", "travelpayouts"] },
  { destination: "Dubai", origin_country: "GB", week_start: "2026-05-12", avg_score: 72, max_score: 89, velocity_pct: 24, is_spike: false, rank_in_country: 1, sources: ["rising_query"] },
  { destination: "Turquía", origin_country: "ES", week_start: "2026-05-12", avg_score: 48, max_score: 61, velocity_pct: 22, is_spike: false, rank_in_country: 3, sources: ["monitored", "wikipedia"] },
  { destination: "Maldivas", origin_country: "IT", week_start: "2026-05-12", avg_score: 44, max_score: 58, velocity_pct: 19, is_spike: false, rank_in_country: 1, sources: ["monitored"] },
  { destination: "Singapur", origin_country: "CO", week_start: "2026-05-12", avg_score: 40, max_score: 52, velocity_pct: 15, is_spike: false, rank_in_country: 2, sources: ["rising_query", "travelpayouts"] },
  { destination: "Nueva York", origin_country: "AR", week_start: "2026-05-12", avg_score: 38, max_score: 49, velocity_pct: 12, is_spike: false, rank_in_country: 2, sources: ["monitored"] },
];

const MOCK_INSIGHT = {
  destination: "Tokio",
  origin_country: "ES",
  velocity_pct: 67,
  insight_text: "El interés en Tokio desde España creció un 67% esta semana, probablemente impulsado por la reciente cobertura mediática de los Juegos Olímpicos de 2026 y la debilidad del yen japonés que hace el viaje más accesible para europeos.",
  campaign_copy: "¡El momento de viajar a Tokio es ahora! Conectate sin sorpresas con nuestra eSIM para Japón — cobertura 5G en todo el país desde €12/semana. Activá antes de subir al avión.",
  target_audience: "Viajeros españoles de 25-45 años, interesados en cultura asiática, con capacidad de gasto medio-alto. Probable reserva de vuelo en los próximos 30-60 días.",
  timing_recommendation: "Lanzar campaña ahora — el pico de búsquedas indica intención de viaje 4-8 semanas antes de la partida. Ideal para captar la demanda mientras está caliente.",
  generated_at: new Date().toISOString(),
};

export default function Preview() {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedRow, setSelectedRow] = useState<TrendMetric | null>(null);
  const [showInsight, setShowInsight] = useState(false);

  const filtered = selectedCountry
    ? MOCK_DATA.filter((d) => d.origin_country === selectedCountry)
    : MOCK_DATA;

  const spikes = filtered.filter((d) => d.is_spike).length;
  const countries = new Set(filtered.map((d) => d.origin_country)).size;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Travel Trends Intelligence</h1>
            <p className="text-sm text-gray-500">Destinos en alza para campañas de eSIM</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">Vista previa con datos de ejemplo</span>
            <button className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg opacity-50 cursor-not-allowed">
              ↻ Actualizar datos
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <StatsBar total={filtered.length} spikes={spikes} countries={countries} lastUpdate={new Date().toISOString()} />

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Filtrar por país de origen</h2>
          <CountrySelector selected={selectedCountry} onChange={setSelectedCountry} />
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Destinos en alza</h2>
            <span className="text-sm text-gray-500">{filtered.length} destinos</span>
          </div>
          <RisingTable data={filtered} onSelectRow={(row) => { setSelectedRow(row); setShowInsight(true); }} showCountry={!selectedCountry} />
        </div>

        {spikes > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <h2 className="font-semibold text-red-800 mb-3">🔥 Spikes detectados esta semana</h2>
            <div className="flex flex-wrap gap-2">
              {filtered.filter((d) => d.is_spike).map((d) => (
                <button key={`${d.destination}-${d.origin_country}`}
                  onClick={() => { setSelectedRow(d); setShowInsight(true); }}
                  className="px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-medium hover:bg-red-200 transition-colors">
                  {d.destination} <span className="font-bold">+{d.velocity_pct.toFixed(0)}%</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showInsight && selectedRow && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowInsight(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{MOCK_INSIGHT.destination}</h2>
                  <p className="text-gray-500 text-sm">Buscado desde España</p>
                </div>
                <button onClick={() => setShowInsight(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <div className="flex gap-3 mb-5">
                <div className="bg-blue-50 rounded-lg px-3 py-2 text-center">
                  <div className="text-2xl font-bold text-blue-700">+67%</div>
                  <div className="text-xs text-blue-500">crecimiento</div>
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
                  <div className="text-2xl font-bold text-gray-700">82</div>
                  <div className="text-xs text-gray-500">score /100</div>
                </div>
                <div className="bg-red-50 rounded-lg px-3 py-2 flex items-center">
                  <span className="text-red-600 font-bold text-sm">🔥 SPIKE</span>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { title: "¿Por qué está creciendo?", icon: "📈", text: MOCK_INSIGHT.insight_text },
                  { title: "Cuándo lanzar la campaña", icon: "📅", text: MOCK_INSIGHT.timing_recommendation },
                  { title: "Copy de campaña eSIM", icon: "✍️", text: MOCK_INSIGHT.campaign_copy, highlight: true },
                  { title: "Audiencia objetivo", icon: "🎯", text: MOCK_INSIGHT.target_audience },
                ].map((s) => (
                  <div key={s.title} className={`rounded-xl p-4 ${s.highlight ? "bg-blue-50 border border-blue-200" : "bg-gray-50"}`}>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">{s.icon} {s.title}</h3>
                    <p className="text-sm text-gray-800 leading-relaxed">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
