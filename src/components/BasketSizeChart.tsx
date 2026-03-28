import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts"
import type { BasketSizeTrendItem } from "../lib/analyzer"

export default function BasketSizeChart({ data }: { data: BasketSizeTrendItem[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
        <h2 className="text-lg font-bold text-primary mb-2">Velikost košíku</h2>
        <p className="text-sm text-muted">Nedostatek dat</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
      <h2 className="text-lg font-bold text-primary mb-1">Velikost košíku</h2>
      <p className="text-xs text-muted mb-4">Průměrný počet položek na objednávku</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e2db" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === "avgItems") return [value, "Položek celkem"]
                if (name === "avgUniqueItems") return [value, "Unikátních"]
                return [value, name]
              }}
              contentStyle={{ borderRadius: "12px", border: "1px solid #e8e2db" }}
            />
            <Legend formatter={(v) => v === "avgItems" ? "Položek" : "Unikátních"} />
            <Line type="monotone" dataKey="avgItems" stroke="#2f7d3b" strokeWidth={2} dot={{ fill: "#2f7d3b", r: 3 }} />
            <Line type="monotone" dataKey="avgUniqueItems" stroke="#a39e99" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "#a39e99", r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
