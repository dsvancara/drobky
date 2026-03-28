import { useState } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import type { ImpulseStapleRatio } from "../lib/analyzer"
import ProductLink from "./ProductLink"
import Modal from "./Modal"

export default function ImpulseVsStapleCard({ data }: { data: ImpulseStapleRatio }) {
  const [showModal, setShowModal] = useState(false)

  const pieData = [
    { name: "Stálice", value: data.stapleSpend },
    { name: "Impulzivní", value: data.impulseSpend }
  ].filter((d) => d.value > 0)

  const COLORS = ["#2f7d3b", "#e8a838"]

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
      <h2 className="text-lg font-bold text-primary mb-1">Stálice vs. impulzivní nákupy</h2>
      <p className="text-xs text-muted mb-4">
        Stálice = v &gt;50% objednávek, impulzivní = jen jednou
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString("cs-CZ")} Kč`]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #e8e2db" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary">Stálice</span>
            <span className="text-sm font-medium">{data.stapleCount} produktů · {data.stapleSpend.toLocaleString("cs-CZ")} Kč</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary">Impulzivní</span>
            <span className="text-sm font-medium">{data.impulseCount} produktů · {data.impulseSpend.toLocaleString("cs-CZ")} Kč</span>
          </div>

          {data.topImpulse.length > 0 && (
            <div className="pt-2 border-t border-warm">
              <p className="text-xs text-muted mb-2">Top impulzivní nákupy:</p>
              {data.topImpulse.slice(0, 5).map((item) => (
                <div key={item.productId} className="flex justify-between text-sm py-0.5">
                  <ProductLink productId={item.productId} name={item.name} />
                  <span className="text-muted ml-2 shrink-0">{item.spend} Kč</span>
                </div>
              ))}
              {data.topImpulse.length > 5 && (
                <button
                  onClick={() => setShowModal(true)}
                  className="text-xs text-primary/70 hover:text-primary mt-1">
                  Zobrazit všech {data.topImpulse.length}...
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Impulzivní nákupy">
        <div className="space-y-1">
          {data.topImpulse.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm py-1 border-b border-warm/50">
              <ProductLink productId={item.productId} name={item.name} />
              <span className="text-muted ml-2 shrink-0">{item.spend} Kč</span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
