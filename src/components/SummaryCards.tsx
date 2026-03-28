import type { Summary } from "../lib/analyzer"

const cards = [
  { key: "totalSpend" as const, label: "Celková útrata", suffix: " Kč" },
  { key: "orderCount" as const, label: "Objednávek", suffix: "" },
  { key: "itemCount" as const, label: "Položek celkem", suffix: "" },
  { key: "uniqueItems" as const, label: "Unikátních produktů", suffix: "" },
  { key: "avgOrderSize" as const, label: "Průměrná objednávka", suffix: " Kč" }
]

export default function SummaryCards({ data }: { data: Summary }) {
  return (
    <div className="mb-8">
      <p className="text-sm text-secondary mb-4">{data.dateRange}</p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div
            key={c.key}
            className="bg-white rounded-2xl p-4 shadow-sm border border-warm">
            <p className="text-xs text-muted uppercase tracking-wide">
              {c.label}
            </p>
            <p className="text-2xl font-bold text-primary mt-1">
              {data[c.key].toLocaleString("cs-CZ")}
              {c.suffix}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
