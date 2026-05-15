interface Props {
  total: number;
  spikes: number;
  countries: number;
  lastUpdate?: string;
}

export default function StatsBar({ total, spikes, countries, lastUpdate }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Stat label="Destinos en alza" value={total} color="blue" />
      <Stat label="Spikes detectados" value={spikes} color="red" />
      <Stat label="Países analizados" value={countries} color="green" />
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="text-xs text-gray-500 mb-1">Última actualización</div>
        <div className="text-sm font-medium text-gray-700">
          {lastUpdate
            ? new Date(lastUpdate).toLocaleString("es-AR", {
                day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
              })
            : "—"}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "text-blue-700 bg-blue-50",
    red: "text-red-700 bg-red-50",
    green: "text-green-700 bg-green-50",
  };
  return (
    <div className={`rounded-xl p-4 ${colors[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs mt-0.5 opacity-80">{label}</div>
    </div>
  );
}
