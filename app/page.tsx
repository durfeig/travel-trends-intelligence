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

  const fetchData = async (geo: string) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "100", min_velocity: "0" });
    if (geo) params.set("geo", geo);
    const res = await fetch(`/api/trending?${params}`);
    const json = await res.json();
    setData(json.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData(selectedCountry);
  }, [selectedCountry]);

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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Travel Trends Intelligence</h1>
            <p className="text-sm text-gray-500">Destinos en alza para campañas de eSIM</p>
          </div>
          <button
            onClick={handleTrigger}
            disabled={triggering}
            className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {triggering ? "Disparando..." : "↻ Actualizar datos"}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <StatsBar total={data.length} spikes={spikes} countries={countries} />

        {/* Country filter */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Filtrar por país de origen</h2>
          <CountrySelector selected={selectedCountry} onChange={setSelectedCountry} />
        </div>

        {/* Main table */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              Destinos en alza
              {selectedCountry && (
                <span className="ml-2 text-blue-600">
                  desde {COUNTRY_NAMES[selectedCountry]}
                </span>
              )}
            </h2>
            <span className="text-sm text-gray-500">{data.length} destinos</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400">
              <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <RisingTable
              data={data}
              onSelectRow={setSelectedRow}
              showCountry={!selectedCountry}
            />
          )}
        </div>

        {/* Spikes callout */}
        {spikes > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <h2 className="font-semibold text-red-800 mb-3">🔥 Spikes detectados esta semana</h2>
            <div className="flex flex-wrap gap-2">
              {data
                .filter((d) => d.is_spike)
                .map((d) => (
                  <button
                    key={`${d.destination}-${d.origin_country}`}
                    onClick={() => setSelectedRow(d)}
                    className="px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    {d.destination}{" "}
                    <span className="text-red-500">{COUNTRY_NAMES[d.origin_country]}</span>{" "}
                    <span className="font-bold">+{d.velocity_pct.toFixed(0)}%</span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {selectedRow && (
        <InsightPanel row={selectedRow} onClose={() => setSelectedRow(null)} />
      )}
    </main>
  );
}
