import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import type { TopItem } from "../lib/analyzer"
import ProductLink from "./ProductLink"

export default function TopItems({ data }: { data: TopItem[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
        <h2 className="text-lg font-bold text-primary mb-2">Top 20 položek podle útraty</h2>
        <p className="text-sm text-muted">Nedostatek dat</p>
      </div>
    )
  }

  const chartData = data.slice(0, 10).map((d) => ({
    ...d,
    shortName: d.name.length > 15 ? d.name.slice(0, 15) + "..." : d.name
  }))

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
      <h2 className="text-lg font-bold text-primary mb-4">
        Top 20 položek podle útraty
      </h2>
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0 }}>
            <XAxis type="number" tickFormatter={(v) => `${v} Kč`} />
            <YAxis type="category" dataKey="shortName" width={120} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value: number) =>
                `${value.toLocaleString("cs-CZ")} Kč`
              }
              contentStyle={{ borderRadius: "12px", border: "1px solid #e8e2db" }}
            />
            <Bar dataKey="total" fill="#2f7d3b" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="overflow-auto max-h-96">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-warm">
              <th className="pb-2 px-1">#</th>
              <th className="pb-2 px-1">Produkt</th>
              <th className="pb-2 px-1 text-right">Celkem</th>
              <th className="pb-2 px-1 text-right">Nákupů</th>
              <th className="pb-2 px-1 text-right">Průměr</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.productId} className="border-b border-warm/50">
                <td className="py-1.5 px-1 text-muted">{i + 1}</td>
                <td className="py-1.5 px-1">
                  <ProductLink productId={row.productId} name={row.name} />
                  {row.textualAmount && (
                    <span className="text-xs text-muted ml-1">
                      ({row.textualAmount})
                    </span>
                  )}
                </td>
                <td className="py-1.5 px-1 text-right font-medium">
                  {row.total.toLocaleString("cs-CZ")} Kč
                </td>
                <td className="py-1.5 px-1 text-right">{row.count}x</td>
                <td className="py-1.5 px-1 text-right text-muted whitespace-nowrap">
                  {row.avgPrice.toLocaleString("cs-CZ")} Kč
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
