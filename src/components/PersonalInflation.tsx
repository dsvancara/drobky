import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine
} from "recharts"
import type { InflationMonth } from "../lib/analyzer"

export default function PersonalInflationChart({ data }: { data: InflationMonth[] }) {
  if (data.length < 2) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
        <h2 className="text-lg font-bold text-primary mb-2">Osobní inflace</h2>
        <p className="text-sm text-muted">Nedostatek dat pro výpočet inflace.</p>
      </div>
    )
  }

  const latest = data[data.length - 1]

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
      <h2 className="text-lg font-bold text-primary mb-1">Osobní inflace</h2>
      <p className="text-xs text-muted mb-4">
        Kolik byste dnes zaplatili za stejné produkty vs. kolik jste platili tehdy
      </p>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e2db" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis unit="%" />
            <ReferenceLine y={0} stroke="#a39e99" />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === "inflationPct") return [`${value > 0 ? "+" : ""}${value}%`, "Změna cen"]
                return [value, name]
              }}
              contentStyle={{ borderRadius: "12px", border: "1px solid #e8e2db" }}
            />
            <Line
              type="monotone"
              dataKey="inflationPct"
              stroke={latest.inflationPct > 0 ? "#dc2626" : "#2f7d3b"}
              strokeWidth={2}
              dot={{ fill: latest.inflationPct > 0 ? "#dc2626" : "#2f7d3b", r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-sm text-center mt-3">
        <span className={`font-semibold ${latest.inflationPct > 0 ? "text-red-600" : "text-green-700"}`}>
          {latest.inflationPct > 0 ? "+" : ""}{latest.inflationPct}%
        </span>
        <span className="text-muted"> — aktuální změna vašeho košíku</span>
      </p>
    </div>
  )
}
