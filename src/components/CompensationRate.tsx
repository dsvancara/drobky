import { useState } from "react"
import type { CompensationData } from "../lib/analyzer"
import ProductLink from "./ProductLink"
import Modal from "./Modal"

export default function CompensationCard({ data }: { data: CompensationData }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
      <h2 className="text-lg font-bold text-primary mb-4">Náhrady</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-warm rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-primary">{data.compensationRate}%</p>
          <p className="text-xs text-muted">Míra náhrad</p>
        </div>
        <div className="bg-warm rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-primary">{data.compensatedItems}</p>
          <p className="text-xs text-muted">z {data.totalItems} položek</p>
        </div>
      </div>

      {data.topCompensated.length > 0 && (
        <div>
          <p className="text-xs text-muted mb-2">Nejčastěji nahrazované:</p>
          {data.topCompensated.slice(0, 5).map((item) => (
            <div key={item.productId} className="flex justify-between text-sm py-1 border-b border-warm/50">
              <ProductLink productId={item.productId} name={item.name} />
              <span className="text-muted ml-2 shrink-0">{item.count}x</span>
            </div>
          ))}
          {data.topCompensated.length > 5 && (
            <button
              onClick={() => setShowModal(true)}
              className="text-xs text-primary/70 hover:text-primary mt-1">
              Zobrazit všech {data.topCompensated.length}...
            </button>
          )}
        </div>
      )}

      {data.compensatedItems === 0 && (
        <p className="text-sm text-muted">Žádné náhrady v objednávkách.</p>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Všechny náhrady">
        <div className="space-y-1">
          {data.topCompensated.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm py-1 border-b border-warm/50">
              <ProductLink productId={item.productId} name={item.name} />
              <span className="text-muted ml-2 shrink-0">{item.count}x</span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
