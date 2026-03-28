import { useState, useEffect, useRef, useMemo } from "react"
import QRCode from "qrcode"
import Modal from "./Modal"
import type { Summary, DayOfWeekPattern, ImpulseStapleRatio, InflationMonth } from "../lib/analyzer"
import type { FreshRatioMonth, VarietyMonth, OnSaleProduct } from "../lib/analyzer"

type Props = {
  open: boolean
  onClose: () => void
  summaryData: Summary | null
  dowData: DayOfWeekPattern[]
  impulseData: ImpulseStapleRatio | null
  inflationData: InflationMonth[]
  freshRatioData: FreshRatioMonth[]
  varietyData: VarietyMonth[]
  onSaleData: OnSaleProduct[]
}

type ShareStat = {
  id: string
  emoji: string
  label: string
  text: string
}

const CWS_LINK = "https://dsvancara.github.io/drobky"

function buildStats(props: Omit<Props, "open" | "onClose">): ShareStat[] {
  const stats: ShareStat[] = []
  const { summaryData, dowData, impulseData, inflationData, freshRatioData, varietyData, onSaleData } = props

  if (summaryData && summaryData.orderCount > 0) {
    const topDay = [...dowData].sort((a, b) => b.orderCount - a.orderCount)[0]
    if (topDay) {
      stats.push({
        id: "day",
        emoji: "📅",
        label: `Nejčastější den: ${topDay.dayName}`,
        text: `Nejčastěji nakupuju na Rohlíku v ${topDay.dayName.toLowerCase()} — ${topDay.orderCount}x za ${summaryData.orderCount} objednávek.`
      })
    }

    stats.push({
      id: "orders",
      emoji: "🛒",
      label: `${summaryData.orderCount} objednávek, ${summaryData.uniqueItems} produktů`,
      text: `Za posledních ${summaryData.orderCount} objednávek na Rohlíku jsem vyzkoušel/a ${summaryData.uniqueItems} různých produktů. Průměrný košík: ${summaryData.avgOrderSize.toLocaleString("cs-CZ")} Kč.`
    })
  }

  if (impulseData && impulseData.stapleCount > 0) {
    stats.push({
      id: "staples",
      emoji: "🔁",
      label: `${impulseData.stapleCount} stálic v košíku`,
      text: `Mám ${impulseData.stapleCount} stálic, co kupuju skoro pokaždé na Rohlíku. A ${impulseData.impulseCount} impulzivních nákupů, co jsem koupil/a jen jednou.`
    })
  }

  if (freshRatioData.length > 0) {
    const latest = freshRatioData[freshRatioData.length - 1]
    if (latest.freshPct > 0) {
      stats.push({
        id: "fresh",
        emoji: "🥦",
        label: `${latest.freshPct}% čerstvých potravin`,
        text: `${latest.freshPct}% mého košíku na Rohlíku tvoří čerstvé potraviny. Jak jste na tom vy?`
      })
    }
  }

  if (inflationData.length > 0) {
    const latest = inflationData[inflationData.length - 1]
    if (latest.inflationPct !== 0) {
      const dir = latest.inflationPct > 0 ? "+" : ""
      stats.push({
        id: "inflation",
        emoji: "📈",
        label: `Osobní inflace: ${dir}${latest.inflationPct}%`,
        text: `Moje osobní potravinová inflace na Rohlíku: ${dir}${latest.inflationPct}%. Stejný košík by mě dnes stál ${dir}${latest.inflationPct}% jinak.`
      })
    }
  }

  if (varietyData.length > 0) {
    const latest = varietyData[varietyData.length - 1]
    if (latest.newProducts > 0) {
      stats.push({
        id: "variety",
        emoji: "✨",
        label: `${latest.newProducts} nových produktů tento měsíc`,
        text: `Tento měsíc jsem na Rohlíku vyzkoušel/a ${latest.newProducts} nových produktů, co jsem předtím nekupoval/a!`
      })
    }
  }

  if (onSaleData.length > 0) {
    stats.push({
      id: "sale",
      emoji: "🏷️",
      label: `${onSaleData.length} oblíbených produktů v akci`,
      text: `${onSaleData.length} mých oblíbených produktů na Rohlíku je právě v akci. Drobky mi to hlídají automaticky.`
    })
  }

  return stats
}

export default function ShareModal(props: Props) {
  const { open, onClose } = props
  const [selected, setSelected] = useState<string | null>(null)
  const qrRef = useRef<HTMLCanvasElement>(null)

  const stats = useMemo(() => buildStats(props), [
    props.summaryData, props.dowData, props.impulseData,
    props.inflationData, props.freshRatioData, props.varietyData, props.onSaleData
  ])

  // Auto-select first stat
  useEffect(() => {
    if (open && stats.length > 0 && !selected) {
      setSelected(stats[0].id)
    }
  }, [open, stats, selected])

  const selectedStat = stats.find(s => s.id === selected)
  const tweetText = selectedStat
    ? `${selectedStat.text}\n\n${CWS_LINK}`
    : ""
  const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`

  // Generate QR code
  useEffect(() => {
    if (qrRef.current && selectedStat) {
      QRCode.toCanvas(qrRef.current, intentUrl, {
        width: 160,
        margin: 2,
        color: { dark: "#3C2415", light: "#FFFFFF" }
      })
    }
  }, [intentUrl, selectedStat])

  if (stats.length === 0) {
    return (
      <Modal open={open} onClose={onClose} title="Sdílet statistiku">
        <p className="text-sm text-muted text-center py-4">
          Nedostatek dat pro sdílení. Stáhněte více objednávek.
        </p>
      </Modal>
    )
  }

  return (
    <Modal open={open} onClose={onClose} title="Sdílet statistiku">
      <div className="space-y-4">
        {/* Stat picker */}
        <div className="space-y-2">
          {stats.map(stat => (
            <button
              key={stat.id}
              onClick={() => setSelected(stat.id)}
              className={`w-full text-left px-3 py-2 rounded-xl border transition-colors ${
                selected === stat.id
                  ? "border-primary bg-primary/5"
                  : "border-warm hover:bg-warm/50"
              }`}
            >
              <span className="mr-2">{stat.emoji}</span>
              <span className="text-sm font-medium text-primary">{stat.label}</span>
            </button>
          ))}
        </div>

        {/* Preview */}
        {selectedStat && (
          <>
            <div className="bg-warm/30 rounded-xl p-3">
              <p className="text-xs text-muted mb-1">Náhled</p>
              <p className="text-sm text-primary whitespace-pre-line">{tweetText}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 items-start">
              <div className="flex-1 space-y-2">
                <a
                  href={intentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-[#0f1419] text-white rounded-xl font-medium text-sm hover:bg-[#272c30] transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Sdílet na X
                </a>
                <p className="text-xs text-muted text-center">
                  Pro sdílení z mobilu naskenujte QR kód →
                </p>
              </div>

              <div className="flex flex-col items-center">
                <canvas ref={qrRef} className="rounded-lg" />
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
