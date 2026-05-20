"use client";

import { useState } from "react";
import { TrendMetric, COUNTRY_NAMES } from "@/lib/supabase";

interface Props {
  data: TrendMetric[];
  onSelectRow?: (row: TrendMetric) => void;
  showCountry?: boolean;
}

export default function RisingTable({ data, onSelectRow, showCountry = true }: Props) {
  const [sortBy, setSortBy] = useState<"velocity_pct" | "avg_score">("velocity_pct");

  const sorted = [...data].sort((a, b) => b[sortBy] - a[sortBy]);

  if (!sorted.length) {
    return (
      <div className="text-center py-12 text-[#444444]" style={{ fontFamily: "var(--font-lato), sans-serif" }}>
        Sin datos de tendencias aún. El collector debe correr primero.
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 items-center">
        <span className="text-xs uppercase tracking-wider text-[#444444]" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600 }}>Ordenar por:</span>
        {[
          { key: "velocity_pct" as const, label: "Crecimiento %" },
          { key: "avg_score" as const, label: "Score" },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className="text-xs px-3 py-1 rounded-full transition-all duration-200"
            style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontWeight: 700,
              background: sortBy === opt.key ? "#E30233" : "#F1EBF4",
              color: sortBy === opt.key ? "#fff" : "#444444",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#E30233" }}>
              <th className="text-left py-3 px-4 text-white font-bold uppercase tracking-wider text-xs" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>#</th>
              <th className="text-left py-3 px-4 text-white font-bold uppercase tracking-wider text-xs" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>Destino</th>
              {showCountry && (
                <th className="text-left py-3 px-4 text-white font-bold uppercase tracking-wider text-xs" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>País origen</th>
              )}
              <th className="text-right py-3 px-4 text-white font-bold uppercase tracking-wider text-xs" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>Crecimiento</th>
              <th className="text-right py-3 px-4 text-white font-bold uppercase tracking-wider text-xs" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>Score</th>
              <th className="text-right py-3 px-4 text-white font-bold uppercase tracking-wider text-xs" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>Fuentes</th>
              <th className="text-right py-3 px-4 text-white font-bold uppercase tracking-wider text-xs" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>Campaña</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 30).map((row, i) => (
              <tr
                key={`${row.destination}-${row.origin_country}`}
                className="transition-colors duration-150 hover:bg-[#E8DEEF] cursor-pointer"
                style={{ background: i % 2 === 0 ? "#ffffff" : "#F1EBF4" }}
                onClick={() => onSelectRow?.(row)}
              >
                <td className="py-3 px-4 text-[#444444] font-semibold" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>{i + 1}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#000000]" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>{row.destination}</span>
                    {row.is_spike && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black uppercase tracking-wider" style={{ fontFamily: "var(--font-montserrat), sans-serif", background: "#E30233", color: "#fff" }}>
                        🔥 SPIKE
                      </span>
                    )}
                  </div>
                </td>
                {showCountry && (
                  <td className="py-3 px-4 text-[#444444]" style={{ fontFamily: "var(--font-lato), sans-serif" }}>
                    {COUNTRY_NAMES[row.origin_country] ?? row.origin_country}
                  </td>
                )}
                <td className="py-3 px-4 text-right">
                  <VelocityBadge velocity={row.velocity_pct} />
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "#E5E5E5" }}>
                      <div className="h-full rounded-full" style={{ width: `${row.avg_score}%`, background: "#1689C0" }} />
                    </div>
                    <span className="font-bold text-[#004E8A] w-6 text-right" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>{Math.round(row.avg_score)}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <SourceBadges sources={row.sources ?? []} />
                </td>
                <td className="py-3 px-4 text-right">
                  {onSelectRow && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectRow(row); }}
                      className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-all duration-200 hover:opacity-80"
                      style={{ fontFamily: "var(--font-montserrat), sans-serif", background: "#004E8A", color: "#fff" }}
                    >
                      Ver copy
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const SOURCE_CONFIG: Record<string, { label: string; bg: string; color: string; title: string }> = {
  trending:      { label: "G", bg: "#1689C0", color: "#fff", title: "Google Trends" },
  rising_query:  { label: "G", bg: "#1689C0", color: "#fff", title: "Google Trends" },
  monitored:     { label: "G", bg: "#1689C0", color: "#fff", title: "Google Trends" },
  wikipedia:     { label: "W", bg: "#444444", color: "#fff", title: "Wikipedia Pageviews" },
  travelpayouts: { label: "✈", bg: "#004E8A", color: "#fff", title: "Travelpayouts (vuelos reales)" },
};

function SourceBadges({ sources }: { sources: string[] }) {
  const seen = new Set<string>();
  const badges: { label: string; bg: string; color: string; title: string; key: string }[] = [];
  for (const s of sources) {
    const config = SOURCE_CONFIG[s];
    if (!config) continue;
    if (!seen.has(config.label)) {
      seen.add(config.label);
      badges.push({ ...config, key: s });
    }
  }
  if (!badges.length) return null;
  return (
    <span className="flex items-center justify-end gap-1">
      {badges.map((b) => (
        <span
          key={b.key}
          title={b.title}
          className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-black"
          style={{ fontFamily: "var(--font-montserrat), sans-serif", background: b.bg, color: b.color }}
        >
          {b.label}
        </span>
      ))}
    </span>
  );
}

function VelocityBadge({ velocity }: { velocity: number }) {
  const style: React.CSSProperties = { fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 800 };
  if (velocity >= 50) return <span className="text-sm" style={{ ...style, color: "#E30233" }}>+{velocity.toFixed(0)}%</span>;
  if (velocity >= 20) return <span className="text-sm" style={{ ...style, color: "#A63D81" }}>+{velocity.toFixed(0)}%</span>;
  if (velocity > 0)  return <span className="text-sm" style={{ ...style, color: "#1689C0" }}>+{velocity.toFixed(0)}%</span>;
  return <span className="text-sm" style={{ ...style, color: "#444444" }}>{velocity.toFixed(0)}%</span>;
}
