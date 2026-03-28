import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts"
import type { VarietyMonth } from "../lib/analyzer"

export default function VarietyScoreChart({ data }: { data: VarietyMonth[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
        <h2 className="text-lg font-bold text-primary mb-2">Pestrost nákupů</h2>
        <p className="text-sm text-muted">Nedostatek dat</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
      <h2 className="text-lg font-bold text-primary mb-1">Pestrost nákupů</h2>
      <p className="text-xs text-muted mb-4">Unikátní produkty a novinky po měsících</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e2db" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === "uniqueProducts") return [value, "Unikátních"]
                if (name === "newProducts") return [value, "Novinky"]
                return [value, name]
              }}
              contentStyle={{ borderRadius: "12px", border: "1px solid #e8e2db" }}
            />
            <Legend formatter={(v) => v === "uniqueProducts" ? "Unikátní produkty" : "Poprvé koupené"} />
            <Bar dataKey="uniqueProducts" fill="#2f7d3b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="newProducts" fill="#e8a838" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
