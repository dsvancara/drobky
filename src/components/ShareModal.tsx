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

const DAY_LOCATIVE: Record<string, string> = {
  "Pondělí": "v pondělí",
  "Úterý": "v úterý",
  "Středa": "ve středu",
  "Čtvrtek": "ve čtvrtek",
  "Pátek": "v pátek",
  "Sobota": "v sobotu",
  "Neděle": "v neděli"
}

/** Czech plural: 1 → singular, 2-4 → few, 5+ → many */
function plural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return `${n} ${one}`
  if (n >= 2 && n <= 4) return `${n} ${few}`
  return `${n} ${many}`
}

function pct(n: number): string {
  return `${n} %`
}

function buildStats(props: Omit<Props, "open" | "onClose">): ShareStat[] {
  const stats: ShareStat[] = []
  const { summaryData, dowData, impulseData, inflationData, freshRatioData, varietyData, onSaleData } = props

  if (!summaryData || summaryData.orderCount === 0) return stats

  const orders = plural(summaryData.orderCount, "objednávku", "objednávky", "objednávek")
  const products = plural(summaryData.uniqueItems, "různý produkt", "různé produkty", "různých produktů")

  // Total spend
  stats.push({
    id: "spend",
    emoji: "💸",
    label: `Útrata: ${summaryData.totalSpend.toLocaleString("cs-CZ")} Kč`,
    text: `Na Rohlíku jsem za ${orders} utratil/a ${summaryData.totalSpend.toLocaleString("cs-CZ")} Kč. To je ${summaryData.avgOrderSize.toLocaleString("cs-CZ")} Kč na objednávku. Kam mizí vaše drobky?`
  })

  // Favorite day
  const topDay = [...dowData].sort((a, b) => b.orderCount - a.orderCount)[0]
  if (topDay) {
    stats.push({
      id: "day",
      emoji: "📅",
      label: `Nejčastější den: ${topDay.dayName}`,
      text: `Nejčastěji nakupuju na Rohlíku ${DAY_LOCATIVE[topDay.dayName] || topDay.dayName.toLowerCase()} — ${topDay.orderCount}x za ${orders}. Kdy nakupujete vy?`
    })
  }

  // Product variety
  stats.push({
    id: "orders",
    emoji: "🛒",
    label: `${products}`,
    text: `Za ${orders} na Rohlíku jsem vyzkoušel/a ${products}. Kolik máte vy?`
  })

  // Staples vs impulse
  if (impulseData && impulseData.stapleCount > 0) {
    const staples = plural(impulseData.stapleCount, "stálice", "stálice", "stálic")
    const impulse = plural(impulseData.impulseCount, "impulzivní nákup", "impulzivní nákupy", "impulzivních nákupů")
    stats.push({
      id: "staples",
      emoji: "🔁",
      label: `${staples}, ${impulse}`,
      text: `Mám ${staples}, co kupuju skoro pokaždé, a ${impulse}, co jsem koupil/a jen jednou. Jaký je váš poměr?`
    })
  }

  // Fresh ratio
  if (freshRatioData.length > 0) {
    const latest = freshRatioData[freshRatioData.length - 1]
    if (latest.freshPct > 0) {
      stats.push({
        id: "fresh",
        emoji: "🥦",
        label: `${pct(latest.freshPct)} čerstvých potravin`,
        text: `${pct(latest.freshPct)} mého košíku na Rohlíku tvoří čerstvé potraviny. Jak jste na tom vy?`
      })
    }
  }

  // Personal inflation
  if (inflationData.length > 0) {
    const latest = inflationData[inflationData.length - 1]
    if (latest.inflationPct !== 0) {
      const dir = latest.inflationPct > 0 ? "+" : ""
      stats.push({
        id: "inflation",
        emoji: "📈",
        label: `Osobní inflace: ${dir}${pct(latest.inflationPct)}`,
        text: `Moje osobní potravinová inflace na Rohlíku: ${dir}${pct(latest.inflationPct)}. Stejný košík by mě dnes stál jinak. Jaká je ta vaše?`
      })
    }
  }

  // New products
  if (varietyData.length > 0) {
    const latest = varietyData[varietyData.length - 1]
    if (latest.newProducts > 0) {
      const newProds = plural(latest.newProducts, "nový produkt", "nové produkty", "nových produktů")
      stats.push({
        id: "variety",
        emoji: "✨",
        label: `${newProds} tento měsíc`,
        text: `Tento měsíc jsem na Rohlíku vyzkoušel/a ${newProds}, co jsem předtím nekupoval/a! Zkoušíte taky nové věci?`
      })
    }
  }

  // Products on sale
  if (onSaleData.length > 0) {
    const onSale = plural(onSaleData.length, "oblíbený produkt", "oblíbené produkty", "oblíbených produktů")
    stats.push({
      id: "sale",
      emoji: "🏷️",
      label: `${onSale} v akci`,
      text: `${onSale} na Rohlíku je právě v akci. Drobky mi to hlídají automaticky.`
    })
  }

  return stats
}

export default function ShareModal(props: Props) {
  const { open, onClose } = props
  const [selected, setSelected] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
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

  // Reset copied state on selection change
  useEffect(() => {
    setCopied(false)
  }, [selected])

  const selectedStat = stats.find(s => s.id === selected)
  const tweetText = selectedStat
    ? `${selectedStat.text}\n\n${CWS_LINK}`
    : ""
  const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`

  // Generate QR code
  useEffect(() => {
    if (qrRef.current && selectedStat) {
      QRCode.toCanvas(qrRef.current, intentUrl, {
        width: 140,
        margin: 2,
        color: { dark: "#3C2415", light: "#FFFFFF" }
      })
    }
  }, [intentUrl, selectedStat])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(tweetText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (stats.length === 0) {
    return (
      <Modal open={open} onClose={onClose} title="Pochlubte se svými Drobky">
        <p className="text-sm text-muted text-center py-4">
          Nedostatek dat pro sdílení. Stáhněte více objednávek.
        </p>
      </Modal>
    )
  }

  return (
    <Modal open={open} onClose={onClose} title="Pochlubte se svými Drobky">
      <div className="space-y-4">
        <p className="text-xs text-muted">Vyberte statistiku a sdílejte s přáteli</p>

        {/* Stat picker — horizontal scrollable chips */}
        <div className="flex flex-wrap gap-2">
          {stats.map(stat => (
            <button
              key={stat.id}
              onClick={() => setSelected(stat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                selected === stat.id
                  ? "border-primary bg-primary text-white"
                  : "border-warm bg-white text-secondary hover:bg-warm/50"
              }`}
            >
              <span className="mr-1.5">{stat.emoji}</span>
              {stat.label}
            </button>
          ))}
        </div>

        {/* Preview + actions */}
        {selectedStat && (
          <>
            {/* Preview card */}
            <div className="bg-warm/30 rounded-xl p-4 border border-warm">
              <p className="text-sm text-primary whitespace-pre-line leading-relaxed">{tweetText}</p>
            </div>

            {/* Action buttons + QR */}
            <div className="flex gap-4 items-center">
              <div className="flex-1 space-y-2">
                <a
                  href={intentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#0f1419] text-white rounded-xl font-medium text-sm hover:bg-[#272c30] transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Sdílet na X
                </a>
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 w-full py-2.5 border border-warm rounded-xl font-medium text-sm text-secondary hover:bg-warm/50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {copied ? "Zkopírováno!" : "Kopírovat text"}
                </button>
              </div>

              {/* QR code */}
              <div className="flex flex-col items-center gap-1">
                <canvas ref={qrRef} className="rounded-lg" />
                <p className="text-[10px] text-muted">Sdílet z mobilu</p>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
