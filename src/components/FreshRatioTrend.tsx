import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts"
import type { FreshRatioMonth } from "../lib/analyzer"

export default function FreshRatioChart({ data }: { data: FreshRatioMonth[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
        <h2 className="text-lg font-bold text-primary mb-2">Čerstvé vs. zpracované</h2>
        <p className="text-sm text-muted">Nedostatek dat</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
      <h2 className="text-lg font-bold text-primary mb-1">Čerstvé vs. zpracované</h2>
      <p className="text-xs text-muted mb-4">Podíl čerstvých a zpracovaných potravin v čase</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e2db" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis unit="%" />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === "freshPct") return [`${value}%`, "Čerstvé"]
                if (name === "processedPct") return [`${value}%`, "Zpracované"]
                return [value, name]
              }}
              contentStyle={{ borderRadius: "12px", border: "1px solid #e8e2db" }}
            />
            <Legend formatter={(v) => v === "freshPct" ? "Čerstvé" : "Zpracované"} />
            <Area type="monotone" dataKey="freshPct" fill="#2f7d3b" fillOpacity={0.3} stroke="#2f7d3b" strokeWidth={2} />
            <Area type="monotone" dataKey="processedPct" fill="#e8a838" fillOpacity={0.2} stroke="#e8a838" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
