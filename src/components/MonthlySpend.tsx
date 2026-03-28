import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts"
import type { MonthlySpend as MonthlySpendType } from "../lib/analyzer"

export default function MonthlySpend({
  data
}: {
  data: MonthlySpendType[]
}) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
        <h2 className="text-lg font-bold text-primary mb-2">Útrata po měsících</h2>
        <p className="text-sm text-muted">Nedostatek dat</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
      <h2 className="text-lg font-bold text-primary mb-4">
        Útrata po měsících
      </h2>
      <div className="h-72 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e2db" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === "total") return [`${value.toLocaleString("cs-CZ")} Kč`, "Celkem"]
                if (name === "avgPerOrder") return [`${value.toLocaleString("cs-CZ")} Kč`, "Průměr/obj."]
                return [value, name]
              }}
              contentStyle={{ borderRadius: "12px", border: "1px solid #e8e2db" }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#2f7d3b"
              strokeWidth={2}
              dot={{ fill: "#2f7d3b", r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="avgPerOrder"
              stroke="#a39e99"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "#a39e99", r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted border-b border-warm">
            <th className="pb-2">Měsíc</th>
            <th className="pb-2 text-right">Celkem</th>
            <th className="pb-2 text-right">Objednávek</th>
            <th className="pb-2 text-right">Průměr/obj.</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.month} className="border-b border-warm/50">
              <td className="py-1.5">{row.month}</td>
              <td className="py-1.5 text-right font-medium">
                {row.total.toLocaleString("cs-CZ")} Kč
              </td>
              <td className="py-1.5 text-right">{row.orderCount}</td>
              <td className="py-1.5 text-right text-muted">
                {row.avgPerOrder.toLocaleString("cs-CZ")} Kč
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
