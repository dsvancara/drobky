import type { PriceVariation } from "../lib/analyzer"
import ProductLink from "./ProductLink"

export default function PriceVariations({
  data
}: {
  data: PriceVariation[]
}) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
        <h2 className="text-lg font-bold text-primary mb-2">Cenové výkyvy</h2>
        <p className="text-sm text-muted">Nedostatek dat pro srovnání cen.</p>
      </div>
    )
  }

  const top = data.slice(0, 15)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
      <h2 className="text-lg font-bold text-primary mb-1">Cenové výkyvy</h2>
      <p className="text-sm text-secondary mb-4">
        Produkty s rozdílem 10%+ mezi nejnižší a nejvyšší cenou za kus
      </p>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-warm">
              <th className="pb-2">Produkt</th>
              <th className="pb-2 text-right">Nejlevnější</th>
              <th className="pb-2 text-right">Nejdražší</th>
              <th className="pb-2 text-right">Rozdíl</th>
              <th className="pb-2 text-right">Nákupů</th>
            </tr>
          </thead>
          <tbody>
            {top.map((row) => (
              <tr key={row.productId} className="border-b border-warm/50">
                <td className="py-1.5">
                  <ProductLink productId={row.productId} name={row.name} />
                  {row.textualAmount && (
                    <span className="text-xs text-muted ml-1">
                      ({row.textualAmount})
                    </span>
                  )}
                </td>
                <td className="py-1.5 text-right text-primary">
                  {row.min} Kč
                  <span className="block text-xs text-muted">{row.minDate}</span>
                </td>
                <td className="py-1.5 text-right text-red-500">
                  {row.max} Kč
                  <span className="block text-xs text-muted">{row.maxDate}</span>
                </td>
                <td className="py-1.5 text-right font-medium">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded-lg text-xs font-bold ${
                      row.swingPct >= 50
                        ? "bg-red-50 text-red-600"
                        : row.swingPct >= 25
                          ? "bg-amber-50 text-amber-600"
                          : "bg-warm text-secondary"
                    }`}>
                    {row.swingPct}%
                  </span>
                </td>
                <td className="py-1.5 text-right text-muted">
                  {row.count}x
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
