import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts"
import type { DayOfWeekPattern } from "../lib/analyzer"

export default function DayOfWeekChart({ data }: { data: DayOfWeekPattern[] }) {
  // Reorder: Mon-Sun instead of Sun-Sat
  const reordered = [...data.slice(1), data[0]]

  if (reordered.every((d) => d.orderCount === 0)) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
        <h2 className="text-lg font-bold text-primary mb-2">Dny v týdnu</h2>
        <p className="text-sm text-muted">Nedostatek dat</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
      <h2 className="text-lg font-bold text-primary mb-4">Dny v týdnu</h2>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={reordered}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e2db" />
            <XAxis dataKey="dayName" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === "orderCount") return [value, "Objednávek"]
                if (name === "avgSpend") return [`${value.toLocaleString("cs-CZ")} Kč`, "Prům. útrata"]
                return [value, name]
              }}
              contentStyle={{ borderRadius: "12px", border: "1px solid #e8e2db" }}
            />
            <Bar dataKey="orderCount" fill="#2f7d3b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-muted">
        {reordered.map((d) => (
          <div key={d.day}>
            <span className="font-medium text-secondary">{d.avgSpend.toLocaleString("cs-CZ")} Kč</span>
            <br />prům. útrata
          </div>
        ))}
      </div>
    </div>
  )
}
