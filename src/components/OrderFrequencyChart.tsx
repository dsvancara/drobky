import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts"
import type { OrderFrequency } from "../lib/analyzer"

export default function OrderFrequencyChart({ data }: { data: OrderFrequency[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
        <h2 className="text-lg font-bold text-primary mb-2">Frekvence objednávek</h2>
        <p className="text-sm text-muted">Nedostatek dat</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
      <h2 className="text-lg font-bold text-primary mb-1">Frekvence objednávek</h2>
      <p className="text-xs text-muted mb-4">Průměrný počet dnů mezi objednávkami</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e2db" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis unit=" d" />
            <Tooltip
              formatter={(value: number) => [`${value} dnů`, "Mezi objednávkami"]}
              contentStyle={{ borderRadius: "12px", border: "1px solid #e8e2db" }}
            />
            <Line
              type="monotone"
              dataKey="daysBetweenOrders"
              stroke="#2f7d3b"
              strokeWidth={2}
              dot={{ fill: "#2f7d3b", r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
