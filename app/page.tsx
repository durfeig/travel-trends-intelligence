"use client";

import { useEffect, useState } from "react";
import { TrendMetric, COUNTRY_NAMES } from "@/lib/supabase";
import CountrySelector from "@/components/CountrySelector";
import RisingTable from "@/components/RisingTable";
import StatsBar from "@/components/StatsBar";
import InsightPanel from "@/components/InsightPanel";

export default function Home() {
  const [data, setData] = useState<TrendMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedRow, setSelectedRow] = useState<TrendMetric | null>(null);
  const [triggering, setTriggering] = useState(false);
  const [weekStart, setWeekStart] = useState<string>("");

  const fetchData = async (geo: string) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "100", min_velocity: "0" });
    if (geo) params.set("geo", geo);
    const res = await fetch(`/api/trending?${params}`);
    const json = await res.json();
    setData(json.data ?? []);
    if (json.week_start) setWeekStart(json.week_start);
    setLoading(false);
  };

  useEffect(() => { fetchData(selectedCountry); }, [selectedCountry]);

  const handleTrigger = async () => {
    setTriggering(true);
    await fetch("/api/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "all" }),
    });
    setTimeout(() => setTriggering(false), 3000);
  };

  const spikes = data.filter((d) => d.is_spike).length;
  const countries = new Set(data.map((d) => d.origin_country)).size;

  const hn = { fontFamily: "var(--font-montserrat), sans-serif" };

  return (
    <main className="min-h-screen" style={{ background: "#f7f7f7" }}>

      {/* Header */}
      <header style={{ background: "#E30233" }} className="sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-ukelele-blanco.png" alt="Ukelele" className="h-8 w-auto" />
            <div className="w-px h-8 opacity-40" style={{ background: "#fff" }} />
            <div>
              <div className="text-white font-black text-base uppercase tracking-wide leading-tight" style={hn}>Travel Trends Intelligence</div>
              <div className="text-white text-xs opacity-80" style={{ fontFamily: "var(--font-lato), sans-serif" }}>Destinos en alza · campañas eSIM</div>
            </div>
          </div>
          <button
            onClick={handleTrigger}
            disabled={triggering}
            className="text-xs font-black uppercase tracking-wider px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
            style={{ ...hn, background: "#fff", color: "#E30233" }}
          >
            {triggering ? "Disparando..." : "↻ Actualizar datos"}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

        {/* Semana activa */}
        {weekStart && (
          <div className="text-xs text-[#444444]" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600 }}>
            Semana activa: <span style={{ color: "#E30233" }}>{weekStart}</span>
          </div>
        )}

        {/* Stats */}
        <StatsBar total={data.length} spikes={spikes} countries={countries} />

        {/* Country filter */}
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h2 className="text-xs font-black uppercase tracking-wider mb-3" style={{ ...hn, color: "#444444" }}>Filtrar por país de origen</h2>
          <CountrySelector selected={selectedCountry} onChange={setSelectedCountry} />
        </div>

        {/* Main table */}
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-lg uppercase" style={{ ...hn, color: "#000" }}>
              Destinos en alza
              {selectedCountry && (
                <span className="ml-2 font-semibold normal-case" style={{ color: "#E30233" }}>
                  desde {COUNTRY_NAMES[selectedCountry]}
                </span>
              )}
            </h2>
            <span className="text-sm text-[#444444]" style={{ fontFamily: "var(--font-lato), sans-serif" }}>{data.length} destinos</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-[#444444]">
              <div className="inline-block w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#E30233 transparent transparent transparent" }} />
            </div>
          ) : (
            <RisingTable data={data} onSelectRow={setSelectedRow} showCountry={!selectedCountry} />
          )}
        </div>

        {/* Spikes callout */}
        {spikes > 0 && (
          <div className="rounded-xl p-5" style={{ background: "#E30233" }}>
            <h2 className="font-black text-white uppercase tracking-wide mb-3" style={hn}>🔥 Spikes detectados esta semana</h2>
            <div className="flex flex-wrap gap-2">
              {data.filter((d) => d.is_spike).map((d) => (
                <button
                  key={`${d.destination}-${d.origin_country}`}
                  onClick={() => setSelectedRow(d)}
                  className="px-3 py-1.5 rounded-full text-sm font-black uppercase transition-all duration-200 hover:opacity-80"
                  style={{ ...hn, background: "#fff", color: "#E30233" }}
                >
                  {d.destination}{" "}
                  <span style={{ color: "#444444" }}>{COUNTRY_NAMES[d.origin_country]}</span>{" "}
                  +{d.velocity_pct.toFixed(0)}%
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Sección de referencia ─────────────────────────────── */}
        <div className="rounded-xl overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>

          {/* Header de la sección */}
          <div className="px-6 py-4" style={{ background: "#004E8A" }}>
            <h2 className="font-black text-white uppercase tracking-wider text-sm" style={hn}>Cómo leer este dashboard</h2>
          </div>

          <div className="bg-white px-6 py-5 space-y-6">

            {/* Métricas */}
            <div>
              <h3 className="font-black uppercase tracking-wider text-xs mb-3" style={{ ...hn, color: "#E30233" }}>Las métricas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    titulo: "Crecimiento %",
                    color: "#E30233",
                    desc: "Qué tan rápido está creciendo el interés en ese destino esta semana vs. la semana anterior. Un +45% significa que casi duplicó su nivel de búsqueda.",
                    cuando: "Usalo para priorizar dónde lanzar campañas urgentes.",
                  },
                  {
                    titulo: "Score (0–100)",
                    color: "#1689C0",
                    desc: "Nivel de interés absoluto normalizado por Google Trends. 100 = máximo histórico para ese destino en ese país. No es volumen exacto — es un índice relativo.",
                    cuando: "Usalo para saber si el destino ya tiene masa crítica de búsqueda.",
                  },
                  {
                    titulo: "🔥 SPIKE",
                    color: "#A63D81",
                    desc: "Se activa cuando el crecimiento supera el 30% semanal. Indica una oportunidad de campaña urgente — el interés explotó y hay que actuar antes de que baje.",
                    cuando: "Estos son los destinos donde invertir presupuesto inmediatamente.",
                  },
                ].map((m) => (
                  <div key={m.titulo} className="rounded-xl p-4" style={{ background: "#F1EBF4", borderLeft: `4px solid ${m.color}` }}>
                    <div className="font-black text-sm mb-1" style={{ ...hn, color: m.color }}>{m.titulo}</div>
                    <p className="text-sm text-[#444444] mb-2" style={{ fontFamily: "var(--font-lato), sans-serif" }}>{m.desc}</p>
                    <p className="text-xs font-bold text-[#004E8A]" style={{ fontFamily: "var(--font-lato), sans-serif" }}>→ {m.cuando}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Fuentes */}
            <div>
              <h3 className="font-black uppercase tracking-wider text-xs mb-3" style={{ ...hn, color: "#E30233" }}>Las fuentes de datos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { badge: "G", bg: "#1689C0", nombre: "Google Trends", desc: "Búsquedas relacionadas a viajes por país. Capta la intención de información: gente que googleó 'vuelos a Tokio' o 'vacaciones en Japón'." },
                  { badge: "W", bg: "#444444", nombre: "Wikipedia Pageviews", desc: "Visitas al artículo del destino en Wikipedia. Capta interés general: gente que quiere saber más sobre el lugar antes de decidir." },
                  { badge: "✈", bg: "#004E8A", nombre: "Travelpayouts", desc: "Destinos más buscados en motores de vuelos reales. Capta intención de compra: gente que ya está buscando pasajes." },
                ].map((f) => (
                  <div key={f.nombre} className="flex gap-3 items-start p-4 rounded-xl" style={{ background: "#F1EBF4" }}>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-black flex-shrink-0" style={{ fontFamily: "var(--font-montserrat), sans-serif", background: f.bg, color: "#fff" }}>{f.badge}</span>
                    <div>
                      <div className="font-bold text-sm mb-1" style={{ ...hn, color: "#000" }}>{f.nombre}</div>
                      <p className="text-xs text-[#444444]" style={{ fontFamily: "var(--font-lato), sans-serif" }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-[#444444]" style={{ fontFamily: "var(--font-lato), sans-serif" }}>
                <strong>Un destino que aparece en las tres fuentes</strong> es una señal muy fuerte: hay interés general (W), búsqueda de viaje (G) y búsqueda de vuelo (✈) al mismo tiempo.
              </p>
            </div>

            {/* Cómo usar */}
            <div>
              <h3 className="font-black uppercase tracking-wider text-xs mb-3" style={{ ...hn, color: "#E30233" }}>Flujo de trabajo recomendado</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {[
                  { num: "1", titulo: "Filtrá por país", desc: "Seleccioná el país de origen de tu audiencia objetivo (ej: España, Argentina)." },
                  { num: "2", titulo: "Mirá los SPIKEs", desc: "Son los destinos con mayor crecimiento semanal. Prioridad máxima de campaña." },
                  { num: "3", titulo: "Verificá las fuentes", desc: "Destinos con G + W + ✈ tienen mayor probabilidad de conversión real." },
                  { num: "4", titulo: "Generá el copy", desc: "Hacé clic en 'Ver copy' para que Claude genere creativos listos para lanzar." },
                ].map((p, i) => (
                  <div key={p.num} className="flex gap-3 items-start">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-black flex-shrink-0 text-white" style={{ ...hn, background: ["#E30233","#A63D81","#1689C0","#004E8A"][i] }}>{p.num}</span>
                    <div>
                      <div className="font-bold text-sm" style={{ ...hn, color: "#000" }}>{p.titulo}</div>
                      <p className="text-xs text-[#444444] mt-0.5" style={{ fontFamily: "var(--font-lato), sans-serif" }}>{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="rounded-xl py-5 px-6 flex items-center justify-between" style={{ background: "#000" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-ukelele-blanco.png" alt="Ukelele" className="h-7 w-auto" />
          <span className="text-xs opacity-50 text-white" style={{ fontFamily: "var(--font-lato), sans-serif" }}>Travel Trends Intelligence · actualización automática 2× día</span>
        </div>

      </div>

      {selectedRow && (
        <InsightPanel row={selectedRow} onClose={() => setSelectedRow(null)} />
      )}
    </main>
  );
}
