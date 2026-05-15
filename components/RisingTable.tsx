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
      <div className="text-center py-12 text-gray-400">
        Sin datos de tendencias aún. El collector debe correr primero.
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <span className="text-sm text-gray-500">Ordenar por:</span>
        <button
          onClick={() => setSortBy("velocity_pct")}
          className={`text-sm px-2 py-0.5 rounded ${sortBy === "velocity_pct" ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-500 hover:text-gray-700"}`}
        >
          Crecimiento %
        </button>
        <button
          onClick={() => setSortBy("avg_score")}
          className={`text-sm px-2 py-0.5 rounded ${sortBy === "avg_score" ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-500 hover:text-gray-700"}`}
        >
          Score
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 pr-4 font-medium text-gray-600">#</th>
              <th className="text-left py-2 pr-4 font-medium text-gray-600">Destino</th>
              {showCountry && (
                <th className="text-left py-2 pr-4 font-medium text-gray-600">País origen</th>
              )}
              <th className="text-right py-2 pr-4 font-medium text-gray-600">Crecimiento</th>
              <th className="text-right py-2 pr-4 font-medium text-gray-600">Score</th>
              <th className="text-right py-2 font-medium text-gray-600">Campaña</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 30).map((row, i) => (
              <tr
                key={`${row.destination}-${row.origin_country}`}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-2.5 pr-4 text-gray-400">{i + 1}</td>
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{row.destination}</span>
                    {row.is_spike && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                        SPIKE
                      </span>
                    )}
                  </div>
                </td>
                {showCountry && (
                  <td className="py-2.5 pr-4 text-gray-600">
                    {COUNTRY_NAMES[row.origin_country] ?? row.origin_country}
                  </td>
                )}
                <td className="py-2.5 pr-4 text-right">
                  <VelocityBadge velocity={row.velocity_pct} />
                </td>
                <td className="py-2.5 pr-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${row.avg_score}%` }}
                      />
                    </div>
                    <span className="text-gray-700 w-6 text-right">{Math.round(row.avg_score)}</span>
                  </div>
                </td>
                <td className="py-2.5 text-right">
                  {onSelectRow && (
                    <button
                      onClick={() => onSelectRow(row)}
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
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

function VelocityBadge({ velocity }: { velocity: number }) {
  if (velocity >= 50) return <span className="font-bold text-red-600">+{velocity.toFixed(0)}%</span>;
  if (velocity >= 20) return <span className="font-semibold text-orange-500">+{velocity.toFixed(0)}%</span>;
  if (velocity > 0) return <span className="text-green-600">+{velocity.toFixed(0)}%</span>;
  return <span className="text-gray-400">{velocity.toFixed(0)}%</span>;
}
