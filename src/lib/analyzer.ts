import type {
  Order,
  FlatItem,
  EnrichmentData,
  EnrichedProduct,
  ProductAlternatives
} from "./types"
import { categorize as regexCategorize } from "./categories"

// Use API categories when available, fall back to regex
function getCategory(
  item: FlatItem,
  products: Record<number, EnrichedProduct>
): string {
  const enriched = products[item.productId]
  if (enriched?.categories?.length > 0) {
    // Use level-0 (top-level) category name from Rohlik
    const top = enriched.categories.find((c) => c.level === 0)
    if (top) return top.name
  }
  return regexCategorize(item.name)
}

export function flattenItems(orders: Order[]): FlatItem[] {
  const items: FlatItem[] = []
  for (const order of orders) {
    for (const item of order.items || []) {
      items.push({
        name: item.name,
        total: item.priceComposition?.total?.amount || 0,
        unitPrice: item.priceComposition?.unit?.amount || 0,
        amount: item.amount,
        unit: item.unit,
        textualAmount: item.textualAmount,
        compensated: item.compensated,
        orderDate: order.orderTime,
        orderId: order.id,
        productId: item.id
      })
    }
  }
  return items
}

// --- Category breakdown ---

export type CategoryBreakdown = {
  category: string
  amount: number
  percentage: number
}

export function spendByCategory(
  items: FlatItem[],
  enrichment?: EnrichmentData
): CategoryBreakdown[] {
  const products = enrichment?.products || {}
  const map: Record<string, number> = {}
  for (const item of items) {
    const cat = getCategory(item, products)
    map[cat] = (map[cat] || 0) + item.total
  }
  const total = Object.values(map).reduce((a, b) => a + b, 0)
  if (total === 0) return []
  return Object.entries(map)
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount),
      percentage: Math.round((amount / total) * 1000) / 10
    }))
    .sort((a, b) => b.amount - a.amount)
}

// --- Top items ---

export type TopItem = {
  name: string
  productId: number
  total: number
  count: number
  avgPrice: number
  unit: string
  textualAmount: string
}

export function topItemsBySpend(items: FlatItem[], limit = 20): TopItem[] {
  const spend: Record<string, number> = {}
  const count: Record<string, number> = {}
  const meta: Record<string, { productId: number; unit: string; textualAmount: string }> = {}
  for (const item of items) {
    spend[item.name] = (spend[item.name] || 0) + item.total
    count[item.name] = (count[item.name] || 0) + 1
    if (!meta[item.name]) {
      meta[item.name] = { productId: item.productId, unit: item.unit, textualAmount: item.textualAmount }
    }
  }
  return Object.entries(spend)
    .map(([name, total]) => ({
      name,
      productId: meta[name].productId,
      total: Math.round(total),
      count: count[name],
      avgPrice: Math.round((total / count[name]) * 10) / 10,
      unit: meta[name].unit,
      textualAmount: meta[name].textualAmount
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
}

// --- Price variations ---

export type PriceVariation = {
  name: string
  productId: number
  min: number
  max: number
  minDate: string
  maxDate: string
  swingPct: number
  count: number
  unit: string
  textualAmount: string
}

export function priceVariations(
  items: FlatItem[],
  minSwingPct = 10
): PriceVariation[] {
  const prices: Record<number, { unitPrice: number; date: string }[]> = {}
  const meta: Record<number, { name: string; unit: string; textualAmount: string }> = {}
  for (const item of items) {
    if (item.unitPrice > 0) {
      const pid = item.productId
      if (!prices[pid]) prices[pid] = []
      prices[pid].push({
        unitPrice: item.unitPrice,
        date: item.orderDate?.slice(0, 10) || ""
      })
      if (!meta[pid]) {
        meta[pid] = { name: item.name, unit: item.unit, textualAmount: item.textualAmount }
      }
    }
  }
  const results: PriceVariation[] = []
  for (const [pidStr, entries] of Object.entries(prices)) {
    if (entries.length < 2) continue
    const pid = Number(pidStr)
    const unitPrices = entries.map((e) => e.unitPrice)
    const min = Math.min(...unitPrices)
    const max = Math.max(...unitPrices)
    if (min === 0) continue
    const swingPct = Math.round(((max - min) / min) * 100)
    if (swingPct >= minSwingPct) {
      const minEntry = entries.find((e) => e.unitPrice === min)!
      const maxEntry = entries.find((e) => e.unitPrice === max)!
      results.push({
        name: meta[pid].name,
        productId: pid,
        min: Math.round(min * 10) / 10,
        max: Math.round(max * 10) / 10,
        minDate: minEntry.date,
        maxDate: maxEntry.date,
        swingPct,
        count: entries.length,
        unit: meta[pid].unit,
        textualAmount: meta[pid].textualAmount
      })
    }
  }
  return results.sort((a, b) => b.swingPct - a.swingPct)
}

// --- Frequent items ---

export type FrequentItem = {
  name: string
  productId: number
  count: number
  totalSpend: number
}

export function frequentItems(items: FlatItem[], limit = 15): FrequentItem[] {
  const count: Record<string, number> = {}
  const spend: Record<string, number> = {}
  const pids: Record<string, number> = {}
  for (const item of items) {
    count[item.name] = (count[item.name] || 0) + 1
    spend[item.name] = (spend[item.name] || 0) + item.total
    if (!pids[item.name]) pids[item.name] = item.productId
  }
  return Object.entries(count)
    .map(([name, c]) => ({
      name,
      productId: pids[name],
      count: c,
      totalSpend: Math.round(spend[name])
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

// --- Monthly spending ---

export type MonthlySpend = {
  month: string
  total: number
  orderCount: number
  avgPerOrder: number
}

export function monthlySpending(orders: Order[]): MonthlySpend[] {
  const spend: Record<string, number> = {}
  const count: Record<string, number> = {}
  for (const order of orders) {
    const month = order.orderTime?.slice(0, 7)
    if (!month) continue
    const total = order.priceComposition?.total?.amount || 0
    spend[month] = (spend[month] || 0) + total
    count[month] = (count[month] || 0) + 1
  }
  return Object.entries(spend)
    .map(([month, total]) => ({
      month,
      total: Math.round(total),
      orderCount: count[month],
      avgPerOrder: Math.round(total / count[month])
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

// --- Savings tips ---

export type SavingsTip = {
  title: string
  description: string
  amount: number
}

export function savingsSuggestions(items: FlatItem[]): SavingsTip[] {
  const tips: SavingsTip[] = []

  // BIO products (Rohlik-universal: always relevant)
  const bioItems = items.filter((i) => /bio/i.test(i.name))
  const bioSpend = bioItems.reduce((s, i) => s + i.total, 0)
  const bioUniqueCount = new Set(bioItems.map((i) => i.name)).size
  if (bioSpend > 0) {
    tips.push({
      title: "BIO Premium",
      description: `Utratili jste ${Math.round(bioSpend)} Kč za ${bioUniqueCount} různých BIO produktů. U některých často kupovaných položek by přechod na konvenční variantu mohl ušetřit 20-40%.`,
      amount: Math.round(bioSpend)
    })
  }

  // Private labels (Rohlik-specific brands — always relevant)
  const plItems = items.filter((i) =>
    /^(kitchin|miil|yutto|moddia|rohlik\.cz)/i.test(i.name)
  )
  const plSpend = plItems.reduce((s, i) => s + i.total, 0)
  if (plSpend > 0) {
    tips.push({
      title: "Privátní značky",
      description: `Utratili jste ${Math.round(plSpend)} Kč za privátní značky Rohlíku (Kitchin, Miil, Yutto, Moddia). Dobře — tyto jsou obvykle levnější než značkové alternativy.`,
      amount: Math.round(plSpend)
    })
  }

  // Dynamic: Repeat expensive items (bought 5+ times, in top 10% by avg price)
  const itemStats: Record<string, { count: number; totalSpend: number; avgPrice: number }> = {}
  for (const item of items) {
    if (!itemStats[item.name]) {
      itemStats[item.name] = { count: 0, totalSpend: 0, avgPrice: 0 }
    }
    itemStats[item.name].count++
    itemStats[item.name].totalSpend += item.total
  }
  for (const stat of Object.values(itemStats)) {
    stat.avgPrice = stat.totalSpend / stat.count
  }
  const avgPrices = Object.values(itemStats).map((s) => s.avgPrice).sort((a, b) => a - b)
  const p90 = avgPrices[Math.floor(avgPrices.length * 0.9)] || 0
  const expensiveRepeats = Object.entries(itemStats)
    .filter(([, s]) => s.count >= 5 && s.avgPrice >= p90)
    .sort((a, b) => b[1].totalSpend - a[1].totalSpend)
  if (expensiveRepeats.length > 0) {
    const top3 = expensiveRepeats.slice(0, 3)
    const totalSavable = top3.reduce((s, [, v]) => s + v.totalSpend, 0)
    tips.push({
      title: "Drahé pravidelné nákupy",
      description: `Tyto položky kupujete často a patří mezi nejdražší: ${top3.map(([name, s]) => `${name} (${s.count}x, ${Math.round(s.avgPrice)} Kč/ks)`).join(", ")}. Hledání levnějších alternativ by přineslo největší úspory.`,
      amount: Math.round(totalSavable)
    })
  }

  // Dynamic: Brand loyalty — items where user always buys same brand
  const brandPatterns: Record<string, Set<string>> = {}
  for (const item of items) {
    // Extract first word as a rough "brand" proxy
    const firstWord = item.name.split(/\s+/)[0]
    if (firstWord.length < 3) continue
    if (!brandPatterns[firstWord]) brandPatterns[firstWord] = new Set()
    brandPatterns[firstWord].add(item.name)
  }
  const loyalBrands = Object.entries(brandPatterns)
    .filter(([, names]) => names.size >= 3)
    .sort((a, b) => b[1].size - a[1].size)
  if (loyalBrands.length > 0) {
    const topBrand = loyalBrands[0]
    const brandItems = items.filter((i) => i.name.startsWith(topBrand[0]))
    const brandSpend = brandItems.reduce((s, i) => s + i.total, 0)
    if (brandSpend > 200) {
      tips.push({
        title: `Věrnost značce ${topBrand[0]}`,
        description: `Kupujete ${topBrand[1].size} různých produktů značky ${topBrand[0]} za celkem ${Math.round(brandSpend)} Kč. U některých položek by konkurenční značky mohly nabídnout lepší cenu.`,
        amount: Math.round(brandSpend)
      })
    }
  }

  // Price variations
  const variations = priceVariations(items)
  if (variations.length > 0) {
    const topSwings = variations.slice(0, 5)
    const desc = topSwings
      .map((v) => `${v.name}: ${v.min}–${v.max} Kč (${v.swingPct}% rozdíl)`)
      .join("\n")
    tips.push({
      title: "Cenové výkyvy",
      description: `Tyto položky mají výrazné cenové výkyvy mezi nákupy. Nakupujte ve správný čas:\n${desc}`,
      amount: 0
    })
  }

  return tips
}

// --- Health & outlier analysis ---

export type HealthInsight = {
  type: "good" | "warning" | "info"
  title: string
  description: string
  value?: string
}

export function healthAnalysis(
  items: FlatItem[],
  orders: Order[],
  enrichment?: EnrichmentData
): HealthInsight[] {
  const insights: HealthInsight[] = []
  const products = enrichment?.products || {}

  // 1. Fresh vs processed ratio (by top-level category)
  let freshSpend = 0
  let processedSpend = 0
  const freshCategories = new Set([
    "Ovoce a zelenina",
    "Ovoce",
    "Zelenina"
  ])
  const processedCategories = new Set([
    "Trvanlivé",
    "Mražené",
    "Snacky a sladkosti",
    "Hotová jídla"
  ])

  for (const item of items) {
    const cat = getCategory(item, products)
    if (freshCategories.has(cat)) freshSpend += item.total
    if (processedCategories.has(cat)) processedSpend += item.total
  }

  const totalFood = freshSpend + processedSpend
  if (totalFood > 0) {
    const freshPct = Math.round((freshSpend / totalFood) * 100)
    insights.push({
      type: freshPct >= 50 ? "good" : "warning",
      title: "Čerstvé vs. zpracované",
      description:
        freshPct >= 50
          ? `${freshPct}% vašich výdajů za potraviny směřuje na čerstvé produkty (ovoce, zelenina). Výborně!`
          : `Pouze ${freshPct}% výdajů za potraviny jde na čerstvé produkty. Zvažte navýšení podílu ovoce a zeleniny.`,
      value: `${freshPct}% čerstvé`
    })
  }

  // 2. Additive analysis
  let withAdditives = 0
  let withoutAdditives = 0
  let highAdditiveItems: string[] = []
  for (const item of items) {
    const enriched = products[item.productId]
    if (!enriched?.composition) continue
    if (enriched.composition.withoutAdditives) {
      withoutAdditives++
    } else {
      withAdditives++
      if (
        enriched.composition.additiveScoreMax >= 4 &&
        !highAdditiveItems.includes(item.name)
      ) {
        highAdditiveItems.push(item.name)
      }
    }
  }
  const totalComposition = withAdditives + withoutAdditives
  if (totalComposition > 0) {
    const cleanPct = Math.round((withoutAdditives / totalComposition) * 100)
    insights.push({
      type: cleanPct >= 70 ? "good" : cleanPct >= 40 ? "info" : "warning",
      title: "Aditiva v produktech",
      description: `${cleanPct}% vašich produktů je bez aditiv.${
        highAdditiveItems.length > 0
          ? ` Vysoký obsah aditiv: ${highAdditiveItems.slice(0, 5).join(", ")}${highAdditiveItems.length > 5 ? ` a ${highAdditiveItems.length - 5} dalších` : ""}.`
          : ""
      }`,
      value: `${cleanPct}% bez aditiv`
    })
  }

  // 3. Protein source diversity
  const proteinCategories = new Set([
    "Maso a ryby",
    "Mléčné a chlazené",
    "Mléčné výrobky"
  ])
  const proteinItems = items.filter((i) =>
    proteinCategories.has(getCategory(i, products))
  )
  const proteinNames = new Set(proteinItems.map((i) => i.name))
  if (proteinNames.size > 0) {
    insights.push({
      type: proteinNames.size >= 10 ? "good" : "info",
      title: "Diverzita bílkovin",
      description: `Kupujete ${proteinNames.size} různých zdrojů bílkovin. ${
        proteinNames.size >= 10
          ? "Pestrá strava!"
          : "Zvažte rozšíření repertoáru."
      }`,
      value: `${proteinNames.size} zdrojů`
    })
  }

  // 4. Medicine / health spending trend
  const healthCategories = new Set(["Lékárna", "Zdraví a léky"])
  const healthItems = items.filter((i) =>
    healthCategories.has(getCategory(i, products))
  )
  const healthSpend = healthItems.reduce((s, i) => s + i.total, 0)
  if (healthSpend > 0) {
    const totalSpend = items.reduce((s, i) => s + i.total, 0)
    const pct = Math.round((healthSpend / totalSpend) * 100)
    insights.push({
      type: pct > 10 ? "warning" : "info",
      title: "Výdaje za zdraví a léky",
      description: `${Math.round(healthSpend)} Kč (${pct}% celkové útraty) za léky a zdravotní produkty.`,
      value: `${Math.round(healthSpend)} Kč`
    })
  }

  // 5. Spending spikes — orders significantly above average
  const orderTotals = orders.map((o) => ({
    total: o.priceComposition?.total?.amount || 0,
    date: o.orderTime?.slice(0, 10) || ""
  }))
  const avgOrder = orderTotals.length > 0
    ? orderTotals.reduce((s, o) => s + o.total, 0) / orderTotals.length
    : 0
  const spikes = orderTotals.filter((o) => o.total > avgOrder * 1.7)
  if (spikes.length > 0) {
    insights.push({
      type: "info",
      title: "Výrazně nadprůměrné objednávky",
      description: `${spikes.length} objednávek bylo o 70%+ nad průměrem (${Math.round(avgOrder)} Kč): ${spikes
        .slice(0, 3)
        .map((s) => `${s.date} (${Math.round(s.total)} Kč)`)
        .join(", ")}${spikes.length > 3 ? "..." : ""}`,
      value: `${spikes.length}x`
    })
  }

  // 6. One-off expensive purchases (percentile-based threshold)
  const itemCount: Record<string, number> = {}
  const itemSpend: Record<string, number> = {}
  for (const item of items) {
    itemCount[item.name] = (itemCount[item.name] || 0) + 1
    itemSpend[item.name] = (itemSpend[item.name] || 0) + item.total
  }
  const allSpends = Object.values(itemSpend).sort((a, b) => a - b)
  const oneOffThreshold = allSpends[Math.floor(allSpends.length * 0.95)] || 200
  const oneOffs = Object.entries(itemCount)
    .filter(([name, c]) => c === 1 && itemSpend[name] > oneOffThreshold)
    .sort((a, b) => itemSpend[b[0]] - itemSpend[a[0]])

  if (oneOffs.length > 0) {
    insights.push({
      type: "info",
      title: "Jednorázové drahé nákupy",
      description: `${oneOffs.length} produktů koupeno jen jednou za ${Math.round(oneOffThreshold)}+ Kč: ${oneOffs
        .slice(0, 5)
        .map(([name]) => `${name} (${Math.round(itemSpend[name])} Kč)`)
        .join(", ")}`,
      value: `${oneOffs.length} položek`
    })
  }

  // 8. Category concentration — if >40% spend in one category
  const catSpend: Record<string, number> = {}
  const totalSpendAll = items.reduce((s, i) => s + i.total, 0)
  for (const item of items) {
    const cat = getCategory(item, products)
    catSpend[cat] = (catSpend[cat] || 0) + item.total
  }
  const topCat = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0]
  if (topCat && totalSpendAll > 0) {
    const topPct = Math.round((topCat[1] / totalSpendAll) * 100)
    if (topPct >= 40) {
      insights.push({
        type: "info",
        title: "Koncentrace v jedné kategorii",
        description: `${topPct}% vaší útraty směřuje do kategorie „${topCat[0]}". To může znamenat specifické stravovací preference, ale zvažte pestřejší nákupy.`,
        value: `${topPct}% v ${topCat[0]}`
      })
    }
  }

  // 9. Convenience ratio (ready meals + frozen as % of food spend)
  const convenienceCategories = new Set([
    "Hotová jídla", "Mražené"
  ])
  let convenienceSpend = 0
  for (const item of items) {
    if (convenienceCategories.has(getCategory(item, products))) {
      convenienceSpend += item.total
    }
  }
  if (totalSpendAll > 0) {
    const convPct = Math.round((convenienceSpend / totalSpendAll) * 100)
    if (convPct >= 15) {
      insights.push({
        type: "info",
        title: "Hotová jídla a mražené",
        description: `${convPct}% útraty jde na hotová jídla a mražené produkty (${Math.round(convenienceSpend)} Kč). Vaření z čerstvých surovin bývá levnější i zdravější.`,
        value: `${convPct}%`
      })
    }
  }

  // 7. Disappeared items — bought 3+ times in older orders but not recently
  const sortedOrders = [...orders].sort((a, b) =>
    a.orderTime.localeCompare(b.orderTime)
  )
  const midpoint = Math.floor(sortedOrders.length / 2)
  const olderOrders = new Set(sortedOrders.slice(0, midpoint).map((o) => o.id))
  const newerOrders = new Set(sortedOrders.slice(midpoint).map((o) => o.id))

  const olderItems: Record<string, number> = {}
  const newerItems = new Set<string>()
  for (const item of items) {
    if (olderOrders.has(item.orderId)) {
      olderItems[item.name] = (olderItems[item.name] || 0) + 1
    }
    if (newerOrders.has(item.orderId)) {
      newerItems.add(item.name)
    }
  }
  const disappeared = Object.entries(olderItems)
    .filter(([name, count]) => count >= 3 && !newerItems.has(name))
    .map(([name]) => name)

  if (disappeared.length > 0) {
    insights.push({
      type: "info",
      title: "Přestali jste kupovat",
      description: `Tyto produkty jste dříve kupovali pravidelně, ale v posledních objednávkách se neobjevují: ${disappeared.slice(0, 5).join(", ")}${disappeared.length > 5 ? ` a ${disappeared.length - 5} dalších` : ""}`,
      value: `${disappeared.length} produktů`
    })
  }

  return insights
}

// --- Summary ---

export type Summary = {
  totalSpend: number
  orderCount: number
  itemCount: number
  uniqueItems: number
  avgOrderSize: number
  dateRange: string
}

export function summary(orders: Order[], items: FlatItem[]): Summary {
  const totalSpend = orders.reduce(
    (s, o) => s + (o.priceComposition?.total?.amount || 0),
    0
  )
  const dates = orders
    .map((o) => o.orderTime?.slice(0, 10))
    .filter(Boolean)
    .sort()
  return {
    totalSpend: Math.round(totalSpend),
    orderCount: orders.length,
    itemCount: items.length,
    uniqueItems: new Set(items.map((i) => i.name)).size,
    avgOrderSize: orders.length > 0 ? Math.round(totalSpend / orders.length) : 0,
    dateRange:
      dates.length > 0 ? `${dates[0]} — ${dates[dates.length - 1]}` : ""
  }
}

// --- Day-of-week patterns ---

const CZECH_DAYS = ["Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota"]

export type DayOfWeekPattern = {
  day: number
  dayName: string
  orderCount: number
  avgSpend: number
  avgItems: number
}

export function dayOfWeekPatterns(orders: Order[]): DayOfWeekPattern[] {
  const buckets: Record<number, { spend: number[]; items: number[] }> = {}
  for (let d = 0; d < 7; d++) buckets[d] = { spend: [], items: [] }
  for (const order of orders) {
    const day = new Date(order.orderTime).getDay()
    buckets[day].spend.push(order.priceComposition?.total?.amount || 0)
    buckets[day].items.push(order.items?.length || 0)
  }
  return Array.from({ length: 7 }, (_, d) => {
    const b = buckets[d]
    const count = b.spend.length
    return {
      day: d,
      dayName: CZECH_DAYS[d],
      orderCount: count,
      avgSpend: count > 0 ? Math.round(b.spend.reduce((a, v) => a + v, 0) / count) : 0,
      avgItems: count > 0 ? Math.round(b.items.reduce((a, v) => a + v, 0) / count) : 0
    }
  })
}

// --- Order frequency trend ---

export type OrderFrequency = {
  month: string
  daysBetweenOrders: number
}

export function orderFrequencyTrend(orders: Order[]): OrderFrequency[] {
  const sorted = [...orders].sort((a, b) => a.orderTime.localeCompare(b.orderTime))
  if (sorted.length < 2) return []
  const gapsByMonth: Record<string, number[]> = {}
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].orderTime).getTime()
    const curr = new Date(sorted[i].orderTime).getTime()
    const gap = (curr - prev) / (1000 * 60 * 60 * 24)
    const month = sorted[i].orderTime.slice(0, 7)
    if (!gapsByMonth[month]) gapsByMonth[month] = []
    gapsByMonth[month].push(gap)
  }
  return Object.entries(gapsByMonth)
    .map(([month, gaps]) => ({
      month,
      daysBetweenOrders: Math.round((gaps.reduce((a, b) => a + b, 0) / gaps.length) * 10) / 10
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

// --- Basket size trend ---

export type BasketSizeTrendItem = {
  month: string
  avgItems: number
  avgUniqueItems: number
}

export function basketSizeTrend(orders: Order[]): BasketSizeTrendItem[] {
  const byMonth: Record<string, { items: number[]; unique: number[] }> = {}
  for (const order of orders) {
    const month = order.orderTime?.slice(0, 7)
    if (!month) continue
    if (!byMonth[month]) byMonth[month] = { items: [], unique: [] }
    byMonth[month].items.push(order.items?.length || 0)
    byMonth[month].unique.push(new Set(order.items?.map((i) => i.name)).size)
  }
  return Object.entries(byMonth)
    .map(([month, data]) => ({
      month,
      avgItems: Math.round(data.items.reduce((a, b) => a + b, 0) / data.items.length),
      avgUniqueItems: Math.round(data.unique.reduce((a, b) => a + b, 0) / data.unique.length)
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

// --- Impulse vs staple ---

export type ImpulseStapleRatio = {
  stapleCount: number
  impulseCount: number
  stapleSpend: number
  impulseSpend: number
  topImpulse: { name: string; productId: number; spend: number }[]
}

export function impulseVsStaple(items: FlatItem[], orders: Order[]): ImpulseStapleRatio {
  const orderCount = orders.length
  const threshold = orderCount * 0.5
  const itemOrders: Record<string, Set<number>> = {}
  const itemSpend: Record<string, number> = {}
  const itemPid: Record<string, number> = {}
  for (const item of items) {
    if (!itemOrders[item.name]) itemOrders[item.name] = new Set()
    itemOrders[item.name].add(item.orderId)
    itemSpend[item.name] = (itemSpend[item.name] || 0) + item.total
    if (!itemPid[item.name]) itemPid[item.name] = item.productId
  }
  let stapleCount = 0, impulseCount = 0, stapleSpend = 0, impulseSpend = 0
  const impulseItems: { name: string; productId: number; spend: number }[] = []
  for (const [name, orderIds] of Object.entries(itemOrders)) {
    const spend = itemSpend[name]
    if (orderIds.size >= threshold) {
      stapleCount++
      stapleSpend += spend
    } else if (orderIds.size === 1) {
      impulseCount++
      impulseSpend += spend
      impulseItems.push({ name, productId: itemPid[name], spend: Math.round(spend) })
    }
  }
  impulseItems.sort((a, b) => b.spend - a.spend)
  return {
    stapleCount,
    impulseCount,
    stapleSpend: Math.round(stapleSpend),
    impulseSpend: Math.round(impulseSpend),
    topImpulse: impulseItems.slice(0, 10)
  }
}

// --- Current vs paid price comparison ---

export type PriceComparison = {
  name: string
  productId: number
  avgPaid: number
  currentPrice: number
  diffPct: number
  totalSpend: number
  inStock: boolean
}

export function currentVsPaidPrices(
  items: FlatItem[],
  enrichment?: EnrichmentData
): PriceComparison[] {
  if (!enrichment) return []
  const products = enrichment.products
  const spent: Record<number, { name: string; totalPrice: number; count: number; totalSpend: number }> = {}
  for (const item of items) {
    if (!products[item.productId]) continue
    if (!spent[item.productId]) {
      spent[item.productId] = { name: item.name, totalPrice: 0, count: 0, totalSpend: 0 }
    }
    spent[item.productId].totalPrice += item.unitPrice
    spent[item.productId].count++
    spent[item.productId].totalSpend += item.total
  }
  const results: PriceComparison[] = []
  for (const [pidStr, data] of Object.entries(spent)) {
    const pid = Number(pidStr)
    const enriched = products[pid]
    if (!enriched || enriched.currentPrice <= 0 || data.count === 0) continue
    // Skip out-of-stock products — cached prices are unreliable
    if (!enriched.inStock) continue
    const avgPaid = data.totalPrice / data.count
    if (avgPaid <= 0) continue
    const diffPct = Math.round(((enriched.currentPrice - avgPaid) / avgPaid) * 100)
    results.push({
      name: data.name,
      productId: pid,
      avgPaid: Math.round(avgPaid * 10) / 10,
      currentPrice: enriched.currentPrice,
      diffPct,
      totalSpend: Math.round(data.totalSpend),
      inStock: enriched.inStock
    })
  }
  return results.sort((a, b) => Math.abs(b.diffPct) - Math.abs(a.diffPct))
}

// --- Products currently on sale ---

export type OnSaleProduct = {
  name: string
  productId: number
  currentPrice: number
  originalPrice: number
  discountPct: number
  yourAvgPrice: number
  yourTotalSpend: number
}

export function productsOnSaleNow(
  items: FlatItem[],
  enrichment?: EnrichmentData
): OnSaleProduct[] {
  if (!enrichment) return []
  const products = enrichment.products
  const spent: Record<number, { name: string; totalPrice: number; count: number; totalSpend: number }> = {}
  for (const item of items) {
    if (!products[item.productId]) continue
    if (!spent[item.productId]) {
      spent[item.productId] = { name: item.name, totalPrice: 0, count: 0, totalSpend: 0 }
    }
    spent[item.productId].totalPrice += item.unitPrice
    spent[item.productId].count++
    spent[item.productId].totalSpend += item.total
  }
  const results: OnSaleProduct[] = []
  for (const [pidStr, data] of Object.entries(spent)) {
    const pid = Number(pidStr)
    const enriched = products[pid]
    if (!enriched || enriched.originalPrice <= 0 || !enriched.inStock) continue
    const discountPct = Math.round(((enriched.originalPrice - enriched.currentPrice) / enriched.originalPrice) * 100)
    results.push({
      name: data.name,
      productId: pid,
      currentPrice: enriched.currentPrice,
      originalPrice: enriched.originalPrice,
      discountPct,
      yourAvgPrice: Math.round((data.totalPrice / data.count) * 10) / 10,
      yourTotalSpend: Math.round(data.totalSpend)
    })
  }
  return results.sort((a, b) => b.yourTotalSpend - a.yourTotalSpend)
}

// --- Personal inflation tracker ---

export type InflationMonth = {
  month: string
  basketCostThen: number
  basketCostNow: number
  inflationPct: number
}

export function personalInflationTracker(
  items: FlatItem[],
  enrichment?: EnrichmentData
): InflationMonth[] {
  if (!enrichment) return []
  const products = enrichment.products
  const byMonth: Record<string, { then: number; now: number }> = {}
  for (const item of items) {
    const enriched = products[item.productId]
    if (!enriched || enriched.currentPrice <= 0 || item.unitPrice <= 0 || !enriched.inStock) continue
    const month = item.orderDate?.slice(0, 7)
    if (!month) continue
    if (!byMonth[month]) byMonth[month] = { then: 0, now: 0 }
    byMonth[month].then += item.unitPrice * item.amount
    byMonth[month].now += enriched.currentPrice * item.amount
  }
  return Object.entries(byMonth)
    .filter(([, d]) => d.then > 0)
    .map(([month, d]) => ({
      month,
      basketCostThen: Math.round(d.then),
      basketCostNow: Math.round(d.now),
      inflationPct: Math.round(((d.now - d.then) / d.then) * 1000) / 10
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

// --- Variety score by month ---

export type VarietyMonth = {
  month: string
  uniqueProducts: number
  newProducts: number
}

export function varietyScoreByMonth(items: FlatItem[]): VarietyMonth[] {
  const byMonth: Record<string, Set<string>> = {}
  const seenBefore = new Set<string>()
  const sortedItems = [...items].sort((a, b) =>
    (a.orderDate || "").localeCompare(b.orderDate || "")
  )
  const newByMonth: Record<string, number> = {}
  for (const item of sortedItems) {
    const month = item.orderDate?.slice(0, 7)
    if (!month) continue
    if (!byMonth[month]) byMonth[month] = new Set()
    byMonth[month].add(item.name)
    if (!seenBefore.has(item.name)) {
      newByMonth[month] = (newByMonth[month] || 0) + 1
      seenBefore.add(item.name)
    }
  }
  return Object.entries(byMonth)
    .map(([month, names]) => ({
      month,
      uniqueProducts: names.size,
      newProducts: newByMonth[month] || 0
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

// --- Seasonal products ---

export type SeasonalProduct = {
  name: string
  productId: number
  months: number[]
  totalSpend: number
}

export function seasonalProducts(items: FlatItem[]): SeasonalProduct[] {
  const data: Record<string, { pid: number; months: Set<number>; count: number; spend: number }> = {}
  for (const item of items) {
    if (!data[item.name]) {
      data[item.name] = { pid: item.productId, months: new Set(), count: 0, spend: 0 }
    }
    const m = item.orderDate ? new Date(item.orderDate).getMonth() : -1
    if (m >= 0) data[item.name].months.add(m)
    data[item.name].count++
    data[item.name].spend += item.total
  }
  return Object.entries(data)
    .filter(([, d]) => d.count >= 3 && d.months.size <= 4)
    .map(([name, d]) => ({
      name,
      productId: d.pid,
      months: Array.from(d.months).sort((a, b) => a - b),
      totalSpend: Math.round(d.spend)
    }))
    .sort((a, b) => b.totalSpend - a.totalSpend)
}

// --- Fresh food ratio trend ---

export type FreshRatioMonth = {
  month: string
  freshPct: number
  processedPct: number
}

export function freshFoodRatioTrend(
  items: FlatItem[],
  enrichment?: EnrichmentData
): FreshRatioMonth[] {
  const products = enrichment?.products || {}
  const freshCats = new Set(["Ovoce a zelenina", "Ovoce", "Zelenina"])
  const processedCats = new Set(["Trvanlivé", "Mražené", "Snacky a sladkosti", "Hotová jídla"])
  const byMonth: Record<string, { fresh: number; processed: number; total: number }> = {}
  for (const item of items) {
    const month = item.orderDate?.slice(0, 7)
    if (!month) continue
    if (!byMonth[month]) byMonth[month] = { fresh: 0, processed: 0, total: 0 }
    const cat = getCategory(item, products)
    byMonth[month].total += item.total
    if (freshCats.has(cat)) byMonth[month].fresh += item.total
    if (processedCats.has(cat)) byMonth[month].processed += item.total
  }
  return Object.entries(byMonth)
    .filter(([, d]) => d.total > 0)
    .map(([month, d]) => ({
      month,
      freshPct: Math.round((d.fresh / d.total) * 1000) / 10,
      processedPct: Math.round((d.processed / d.total) * 1000) / 10
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

// --- Delivery cost analysis ---

export type DeliveryCostData = {
  totalDelivery: number
  avgDelivery: number
  freeDeliveryCount: number
  paidDeliveryCount: number
  monthlyDelivery: { month: string; cost: number }[]
}

export function deliveryCostAnalysis(orders: Order[]): DeliveryCostData {
  let totalDelivery = 0
  let freeCount = 0
  let paidCount = 0
  const byMonth: Record<string, number> = {}
  for (const order of orders) {
    const cost = order.priceComposition?.delivery?.amount || 0
    totalDelivery += cost
    if (cost > 0) paidCount++
    else freeCount++
    const month = order.orderTime?.slice(0, 7)
    if (month) byMonth[month] = (byMonth[month] || 0) + cost
  }
  return {
    totalDelivery: Math.round(totalDelivery),
    avgDelivery: orders.length > 0 ? Math.round((totalDelivery / orders.length) * 10) / 10 : 0,
    freeDeliveryCount: freeCount,
    paidDeliveryCount: paidCount,
    monthlyDelivery: Object.entries(byMonth)
      .map(([month, cost]) => ({ month, cost: Math.round(cost) }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }
}

// --- Compensation rate ---

export type CompensationData = {
  totalItems: number
  compensatedItems: number
  compensationRate: number
  topCompensated: { name: string; productId: number; count: number }[]
}

export function compensationRateAnalysis(items: FlatItem[]): CompensationData {
  let compensated = 0
  const compCount: Record<string, { pid: number; count: number }> = {}
  for (const item of items) {
    if (item.compensated) {
      compensated++
      if (!compCount[item.name]) compCount[item.name] = { pid: item.productId, count: 0 }
      compCount[item.name].count++
    }
  }
  return {
    totalItems: items.length,
    compensatedItems: compensated,
    compensationRate: items.length > 0 ? Math.round((compensated / items.length) * 1000) / 10 : 0,
    topCompensated: Object.entries(compCount)
      .map(([name, d]) => ({ name, productId: d.pid, count: d.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }
}

// --- Spending velocity ---

export type SpendingVelocityItem = {
  month: string
  dailyAvgSpend: number
  cumulativeSpend: number
}

export function spendingVelocity(orders: Order[]): SpendingVelocityItem[] {
  const byMonth: Record<string, number> = {}
  for (const order of orders) {
    const month = order.orderTime?.slice(0, 7)
    if (!month) continue
    byMonth[month] = (byMonth[month] || 0) + (order.priceComposition?.total?.amount || 0)
  }
  const sorted = Object.entries(byMonth).sort((a, b) => a[0].localeCompare(b[0]))
  let cumulative = 0
  return sorted.map(([month, total]) => {
    cumulative += total
    const [y, m] = month.split("-").map(Number)
    const daysInMonth = new Date(y, m, 0).getDate()
    return {
      month,
      dailyAvgSpend: Math.round((total / daysInMonth) * 10) / 10,
      cumulativeSpend: Math.round(cumulative)
    }
  })
}
