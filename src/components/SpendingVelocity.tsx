import {
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ComposedChart
} from "recharts"
import type { SpendingVelocityItem } from "../lib/analyzer"

export default function SpendingVelocityChart({ data }: { data: SpendingVelocityItem[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
        <h2 className="text-lg font-bold text-primary mb-2">Tempo útraty</h2>
        <p className="text-sm text-muted">Nedostatek dat</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
      <h2 className="text-lg font-bold text-primary mb-1">Tempo útraty</h2>
      <p className="text-xs text-muted mb-4">Průměrná denní útrata a kumulativní součet</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e2db" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tickFormatter={(v) => `${v} Kč`} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === "dailyAvgSpend") return [`${value} Kč/den`, "Denní průměr"]
                if (name === "cumulativeSpend") return [`${value.toLocaleString("cs-CZ")} Kč`, "Kumulativně"]
                return [value, name]
              }}
              contentStyle={{ borderRadius: "12px", border: "1px solid #e8e2db" }}
            />
            <Bar yAxisId="left" dataKey="dailyAvgSpend" fill="#2f7d3b" radius={[4, 4, 0, 0]} opacity={0.7} />
            <Line yAxisId="right" type="monotone" dataKey="cumulativeSpend" stroke="#a39e99" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
