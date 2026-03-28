import { useState } from "react"
import type { Order } from "../lib/types"
import ProductLink from "./ProductLink"

export default function OrdersList({ orders }: { orders: Order[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const sorted = [...orders].sort((a, b) =>
    b.orderTime.localeCompare(a.orderTime)
  )

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
      <h2 className="text-lg font-bold text-primary mb-4">
        Všechny objednávky
      </h2>
      <div className="space-y-2">
        {sorted.map((order) => {
          const total = Math.round(
            order.priceComposition?.total?.amount || 0
          )
          const date = order.orderTime?.slice(0, 10) || ""
          const isExpanded = expandedId === order.id
          const itemCount = order.items?.length || 0

          return (
            <div key={order.id} className="border border-warm rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                className="w-full px-4 py-3 flex items-center justify-between text-sm hover:bg-warm/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-secondary font-medium">{date}</span>
                  <span className="text-muted">
                    {itemCount} položek
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-primary">
                    {total.toLocaleString("cs-CZ")} Kč
                  </span>
                  <svg
                    className={`w-4 h-4 text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-3 border-t border-warm">
                  <table className="w-full text-xs mt-2">
                    <thead>
                      <tr className="text-left text-muted">
                        <th className="pb-1.5">Produkt</th>
                        <th className="pb-1.5 text-right">Množství</th>
                        <th className="pb-1.5 text-right">Cena/ks</th>
                        <th className="pb-1.5 text-right">Celkem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(order.items || []).map((item, i) => {
                        const unitPrice = item.priceComposition?.unit?.amount || 0
                        const itemTotal = item.priceComposition?.total?.amount || 0
                        return (
                          <tr key={i} className="border-t border-warm/50">
                            <td className="py-1.5">
                              <ProductLink productId={item.id} name={item.name} />
                              {item.compensated && (
                                <span className="ml-1 text-[10px] bg-amber-50 text-amber-600 px-1 rounded">
                                  náhrada
                                </span>
                              )}
                            </td>
                            <td className="py-1.5 text-right text-muted whitespace-nowrap">
                              {item.textualAmount || `${item.amount} ks`}
                            </td>
                            <td className="py-1.5 text-right text-muted whitespace-nowrap">
                              {unitPrice > 0 ? `${Math.round(unitPrice * 10) / 10} Kč` : "–"}
                            </td>
                            <td className="py-1.5 text-right font-medium whitespace-nowrap">
                              {Math.round(itemTotal)} Kč
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
