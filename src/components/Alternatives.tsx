import type { ProductAlternatives } from "../lib/types"
import ProductLink from "./ProductLink"

export default function Alternatives({
  data
}: {
  data: ProductAlternatives[]
}) {
  const withCheaper = data.filter((item) =>
    item.alternatives.some(
      (alt) => alt.currentPricePerUnit > 0 && alt.currentPricePerUnit < item.yourAvgPrice
    )
  )

  if (withCheaper.length === 0) return null

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
      <h2 className="text-lg font-bold text-primary mb-1">
        Levnější alternativy
      </h2>
      <p className="text-sm text-secondary mb-4">
        Podobné produkty, které jsou aktuálně levnější (porovnáno podle jednotkové ceny)
      </p>
      <div className="space-y-4">
        {withCheaper.map((item) => {
          const cheaperAlts = item.alternatives
            .filter(
              (alt) =>
                alt.currentPricePerUnit > 0 && alt.currentPricePerUnit < item.yourAvgPrice
            )
            .sort((a, b) => a.currentPricePerUnit - b.currentPricePerUnit)

          const bestAlt = cheaperAlts[0]
          const savingPerPurchase = Math.round(
            (item.yourAvgPrice - bestAlt.currentPricePerUnit) * 10
          ) / 10
          const savingTotal = Math.round(savingPerPurchase * item.purchaseCount)

          return (
            <div
              key={item.productId}
              className="border border-warm rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <ProductLink productId={item.productId} name={item.name} className="font-medium text-primary" />
                  <p className="text-sm text-secondary">
                    {item.purchaseCount}x nakoupeno, průměr{" "}
                    {item.yourAvgPrice} Kč, celkem{" "}
                    {item.yourTotalSpend.toLocaleString("cs-CZ")} Kč
                  </p>
                </div>
                <span className="text-sm font-bold text-primary whitespace-nowrap ml-2">
                  ušetřit ~{savingTotal} Kč
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {cheaperAlts.slice(0, 3).map((alt) => (
                  <div
                    key={alt.productId}
                    className="flex items-center justify-between text-sm bg-primary-light rounded-lg px-3 py-1.5">
                    <ProductLink productId={alt.productId} name={alt.name} className="text-secondary" />
                    <span className="font-medium text-primary whitespace-nowrap ml-2">
                      {alt.currentPrice} Kč
                      <span className="text-xs text-primary/70 ml-1">
                        (-{Math.round(((item.yourAvgPrice - alt.currentPricePerUnit) / item.yourAvgPrice) * 100)}%)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
