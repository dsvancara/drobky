import type { SavingsTip } from "../lib/analyzer"

export default function SavingsTips({ data }: { data: SavingsTip[] }) {
  if (data.length === 0) return null

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
      <h2 className="text-lg font-bold text-primary mb-4">
        Tipy na úspory
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((tip) => (
          <div
            key={tip.title}
            className="rounded-xl border border-warm p-4 hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-primary">{tip.title}</h3>
              {tip.amount > 0 && (
                <span className="text-sm font-bold text-amber-600">
                  {tip.amount.toLocaleString("cs-CZ")} Kč
                </span>
              )}
            </div>
            <p className="text-sm text-secondary whitespace-pre-line">
              {tip.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
