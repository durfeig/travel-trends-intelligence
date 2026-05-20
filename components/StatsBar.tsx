interface Props {
  total: number;
  spikes: number;
  countries: number;
  lastUpdate?: string;
}

export default function StatsBar({ total, spikes, countries, lastUpdate }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Stat label="Destinos en alza" value={total} bg="#004E8A" />
      <Stat label="Spikes detectados" value={spikes} bg="#E30233" />
      <Stat label="Países analizados" value={countries} bg="#A63D81" />
      <div className="rounded-xl p-4 bg-[#F1EBF4]">
        <div className="text-xs text-[#444444] mb-1 uppercase tracking-wider" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, letterSpacing: "0.08em" }}>
          Última actualización
        </div>
        <div className="text-sm font-semibold text-[#004E8A]" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
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

function Stat({ label, value, bg }: { label: string; value: number; bg: string }) {
  return (
    <div className="rounded-xl p-4 text-white" style={{ background: bg }}>
      <div className="text-3xl font-black" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>{value}</div>
      <div className="text-xs mt-1 uppercase tracking-wider opacity-90" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, letterSpacing: "0.08em" }}>{label}</div>
    </div>
  );
}
