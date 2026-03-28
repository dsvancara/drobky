import { useState } from "react"
import type { PriceComparison } from "../lib/analyzer"
import ProductLink from "./ProductLink"
import Modal from "./Modal"

export default function CurrentVsPaidTable({ data }: { data: PriceComparison[] }) {
  const [showModal, setShowModal] = useState(false)
  const preview = data.slice(0, 10)

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
        <h2 className="text-lg font-bold text-primary mb-2">Aktuální vs. zaplacené ceny</h2>
        <p className="text-sm text-muted">Nedostatek dat pro srovnání cen.</p>
      </div>
    )
  }

  const renderRow = (item: PriceComparison) => {
    const isUp = item.diffPct > 0
    const isDown = item.diffPct < 0
    return (
      <tr key={item.productId} className="border-b border-warm/50">
        <td className="py-1.5 pr-2">
          <ProductLink productId={item.productId} name={item.name} />
        </td>
        <td className="py-1.5 text-right text-sm">{item.avgPaid} Kč</td>
        <td className="py-1.5 text-right text-sm">{item.currentPrice} Kč</td>
        <td className={`py-1.5 text-right text-sm font-medium ${isUp ? "text-red-600" : isDown ? "text-green-700" : "text-muted"}`}>
          {isUp ? "↑" : isDown ? "↓" : "="} {Math.abs(item.diffPct)}%
        </td>
      </tr>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
      <h2 className="text-lg font-bold text-primary mb-1">Aktuální vs. zaplacené ceny</h2>
      <p className="text-xs text-muted mb-4">Porovnání vaší průměrné ceny s aktuální cenou na Rohlíku</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-warm">
              <th className="pb-2">Produkt</th>
              <th className="pb-2 text-right">Vaše cena</th>
              <th className="pb-2 text-right">Aktuální</th>
              <th className="pb-2 text-right">Rozdíl</th>
            </tr>
          </thead>
          <tbody>
            {preview.map(renderRow)}
          </tbody>
        </table>
      </div>

      {data.length > 10 && (
        <button
          onClick={() => setShowModal(true)}
          className="text-xs text-primary/70 hover:text-primary mt-3">
          Zobrazit všech {data.length} produktů...
        </button>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Aktuální vs. zaplacené ceny">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-warm">
                <th className="pb-2">Produkt</th>
                <th className="pb-2 text-right">Vaše cena</th>
                <th className="pb-2 text-right">Aktuální</th>
                <th className="pb-2 text-right">Rozdíl</th>
              </tr>
            </thead>
            <tbody>
              {data.map(renderRow)}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  )
}
