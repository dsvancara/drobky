import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import type { FrequentItem } from "../lib/analyzer"
import ProductLink from "./ProductLink"

export default function FrequentItems({ data }: { data: FrequentItem[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
        <h2 className="text-lg font-bold text-primary mb-2">Nejčastěji kupované</h2>
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
        Nejčastěji kupované
      </h2>
      <div className="h-72 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" />
            <YAxis
              type="category"
              dataKey="shortName"
              width={120}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value: number, name: string) =>
                name === "count"
                  ? `${value}x`
                  : `${value.toLocaleString("cs-CZ")} Kč`
              }
              contentStyle={{ borderRadius: "12px", border: "1px solid #e8e2db" }}
            />
            <Bar dataKey="count" fill="#6b6560" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted border-b border-warm">
            <th className="pb-2">Produkt</th>
            <th className="pb-2 text-right">Nákupů</th>
            <th className="pb-2 text-right">Celkem</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.productId} className="border-b border-warm/50">
              <td className="py-1.5">
                <ProductLink productId={row.productId} name={row.name} />
              </td>
              <td className="py-1.5 text-right font-medium">{row.count}x</td>
              <td className="py-1.5 text-right text-muted">
                {row.totalSpend.toLocaleString("cs-CZ")} Kč
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
