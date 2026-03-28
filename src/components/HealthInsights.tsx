import type { HealthInsight } from "../lib/analyzer"

const icons: Record<HealthInsight["type"], string> = {
  good: "bg-primary-light text-primary",
  warning: "bg-amber-50 text-amber-600",
  info: "bg-blue-50 text-blue-600"
}

const labels: Record<HealthInsight["type"], string> = {
  good: "OK",
  warning: "!",
  info: "i"
}

export default function HealthInsights({
  data
}: {
  data: HealthInsight[]
}) {
  if (data.length === 0) return null

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm">
      <h2 className="text-lg font-bold text-primary mb-1">
        Zdraví a postřehy
      </h2>
      <p className="text-sm text-secondary mb-4">
        Analýza nákupních návyků, složení produktů a výdajových anomálií
      </p>
      <div className="space-y-3">
        {data.map((insight, i) => (
          <div
            key={i}
            className="flex items-start gap-3 border border-warm rounded-xl p-4">
            <span
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${icons[insight.type]}`}>
              {labels[insight.type]}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-primary">
                  {insight.title}
                </h3>
                {insight.value && (
                  <span className="text-sm font-medium text-secondary ml-2 whitespace-nowrap">
                    {insight.value}
                  </span>
                )}
              </div>
              <p className="text-sm text-secondary mt-0.5">
                {insight.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
