import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import type { CategoryBreakdown } from "../lib/analyzer"
import { getCategoryColor } from "../lib/categories"

export default function CategoryChart({
  data
}: {
  data: CategoryBreakdown[]
}) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
        <h2 className="text-lg font-bold text-primary mb-2">Útrata podle kategorií</h2>
        <p className="text-sm text-muted">Nedostatek dat</p>
      </div>
    )
  }

  const total = data.reduce((s, d) => s + d.amount, 0)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
      <h2 className="text-lg font-bold text-primary mb-4">
        Útrata podle kategorií
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={60}
                paddingAngle={2}>
                {data.map((entry) => (
                  <Cell
                    key={entry.category}
                    fill={getCategoryColor(entry.category)}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) =>
                  `${value.toLocaleString("cs-CZ")} Kč`
                }
                contentStyle={{ borderRadius: "12px", border: "1px solid #e8e2db" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="overflow-auto max-h-80">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-warm">
                <th className="pb-2">Kategorie</th>
                <th className="pb-2 text-right">Částka</th>
                <th className="pb-2 text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.category} className="border-b border-warm/50">
                  <td className="py-1.5 flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{
                        backgroundColor:
                          getCategoryColor(row.category)
                      }}
                    />
                    {row.category}
                  </td>
                  <td className="py-1.5 text-right font-medium">
                    {row.amount.toLocaleString("cs-CZ")} Kč
                  </td>
                  <td className="py-1.5 text-right text-muted">
                    {row.percentage}%
                  </td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="pt-2">Celkem</td>
                <td className="pt-2 text-right">
                  {total.toLocaleString("cs-CZ")} Kč
                </td>
                <td className="pt-2 text-right">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
