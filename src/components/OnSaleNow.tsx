import type { OnSaleProduct } from "../lib/analyzer"
import ProductLink from "./ProductLink"

export default function OnSaleNowCard({ data }: { data: OnSaleProduct[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
        <h2 className="text-lg font-bold text-primary mb-2">Aktuálně v akci</h2>
        <p className="text-sm text-muted">Žádné vaše produkty nejsou aktuálně v akci.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
      <h2 className="text-lg font-bold text-primary mb-1">Aktuálně v akci</h2>
      <p className="text-xs text-muted mb-4">
        Produkty, které kupujete a jsou nyní ve slevě ({data.length})
      </p>

      <div className="space-y-2">
        {data.slice(0, 15).map((item) => (
          <div key={item.productId} className="flex items-center justify-between py-1.5 border-b border-warm/50">
            <div className="flex-1 min-w-0">
              <ProductLink productId={item.productId} name={item.name} />
            </div>
            <div className="flex items-center gap-3 ml-3 shrink-0">
              <span className="text-xs text-muted line-through">{item.originalPrice} Kč</span>
              <span className="text-sm font-medium text-primary">{item.currentPrice} Kč</span>
              <span className="bg-red-100 text-red-700 text-xs font-medium px-1.5 py-0.5 rounded-lg">
                -{item.discountPct}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
