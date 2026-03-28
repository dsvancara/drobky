import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts"
import type { DeliveryCostData } from "../lib/analyzer"

export default function DeliveryCostsCard({ data }: { data: DeliveryCostData }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
      <h2 className="text-lg font-bold text-primary mb-4">Doprava</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-warm rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-primary">{data.totalDelivery.toLocaleString("cs-CZ")} Kč</p>
          <p className="text-xs text-muted">Celkem za dopravu</p>
        </div>
        <div className="bg-warm rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-primary">{data.avgDelivery} Kč</p>
          <p className="text-xs text-muted">Průměr/objednávku</p>
        </div>
      </div>

      <div className="flex gap-4 text-sm text-secondary mb-4">
        <span>Zdarma: <strong>{data.freeDeliveryCount}x</strong></span>
        <span>Placená: <strong>{data.paidDeliveryCount}x</strong></span>
      </div>

      {data.monthlyDelivery.length > 1 && (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.monthlyDelivery}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e2db" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(v) => `${v} Kč`} />
              <Tooltip
                formatter={(value: number) => [`${value} Kč`, "Doprava"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #e8e2db" }}
              />
              <Line type="monotone" dataKey="cost" stroke="#2f7d3b" strokeWidth={2} dot={{ fill: "#2f7d3b", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
