import { useState } from "react"
import type { SeasonalProduct } from "../lib/analyzer"
import ProductLink from "./ProductLink"
import Modal from "./Modal"

const MONTH_NAMES = ["Led", "Úno", "Bře", "Dub", "Kvě", "Čvn", "Čvc", "Srp", "Zář", "Říj", "Lis", "Pro"]

export default function SeasonalProductsList({ data }: { data: SeasonalProduct[] }) {
  const [showModal, setShowModal] = useState(false)
  const preview = data.slice(0, 8)

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
        <h2 className="text-lg font-bold text-primary mb-2">Sezónní produkty</h2>
        <p className="text-sm text-muted">Nedostatek dat pro detekci sezónních vzorců.</p>
      </div>
    )
  }

  const renderItem = (item: SeasonalProduct) => (
    <div key={item.productId} className="flex items-center justify-between py-2 border-b border-warm/50">
      <div className="flex-1 min-w-0">
        <ProductLink productId={item.productId} name={item.name} />
        <div className="flex gap-1 mt-1">
          {item.months.map((m) => (
            <span key={m} className="text-[10px] bg-warm text-secondary px-1.5 py-0.5 rounded">
              {MONTH_NAMES[m]}
            </span>
          ))}
        </div>
      </div>
      <span className="text-sm text-muted ml-3 shrink-0">{item.totalSpend.toLocaleString("cs-CZ")} Kč</span>
    </div>
  )

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
      <h2 className="text-lg font-bold text-primary mb-1">Sezónní produkty</h2>
      <p className="text-xs text-muted mb-4">Produkty kupované pravidelně, ale jen v určitých měsících</p>

      <div>{preview.map(renderItem)}</div>

      {data.length > 8 && (
        <button
          onClick={() => setShowModal(true)}
          className="text-xs text-primary/70 hover:text-primary mt-2">
          Zobrazit všech {data.length}...
        </button>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Sezónní produkty">
        <div>{data.map(renderItem)}</div>
      </Modal>
    </div>
  )
}
