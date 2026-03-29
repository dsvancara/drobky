import type { Summary, DayOfWeekPattern, ImpulseStapleRatio, InflationMonth } from "./analyzer"
import type { FreshRatioMonth, VarietyMonth, OnSaleProduct } from "./analyzer"

export type ShareStat = {
  id: string
  emoji: string
  label: string
  text: string
}

export type ShareStatsInput = {
  summaryData: Summary | null
  dowData: DayOfWeekPattern[]
  impulseData: ImpulseStapleRatio | null
  inflationData: InflationMonth[]
  freshRatioData: FreshRatioMonth[]
  varietyData: VarietyMonth[]
  onSaleData: OnSaleProduct[]
}

export const CWS_LINK = "https://dsvancara.github.io/drobky"

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

export function buildShareStats(input: ShareStatsInput): ShareStat[] {
  const stats: ShareStat[] = []
  const { summaryData, dowData, impulseData, inflationData, freshRatioData, varietyData, onSaleData } = input

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
