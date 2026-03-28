import type { Order, EnrichmentData } from "./types"
import type {
  Summary,
  CategoryBreakdown,
  TopItem,
  MonthlySpend,
  PriceComparison,
  DeliveryCostData,
  CompensationData,
  FlatItem
} from "./analyzer"

export function buildDataSummary(
  summaryData: Summary,
  monthlyData: MonthlySpend[],
  topItems: TopItem[],
  categoryData: CategoryBreakdown[],
  currentVsPaid: PriceComparison[],
  deliveryData: DeliveryCostData | null,
  compensationData: CompensationData,
  freshPct: number | null,
  additiveFreeePct: number | null,
  proteinSources: number | null
): string {
  const lines: string[] = []

  lines.push("=== SOUHRN ===")
  lines.push(`Období: ${summaryData.dateRange}`)
  lines.push(`Celková útrata: ${summaryData.totalSpend.toLocaleString("cs-CZ")} Kč`)
  lines.push(`Počet objednávek: ${summaryData.orderCount}`)
  lines.push(`Položek celkem: ${summaryData.itemCount}`)
  lines.push(`Unikátních produktů: ${summaryData.uniqueItems}`)
  lines.push(`Průměrná objednávka: ${summaryData.avgOrderSize.toLocaleString("cs-CZ")} Kč`)
  lines.push("")

  if (monthlyData.length > 0) {
    lines.push("=== MĚSÍČNÍ ÚTRATA ===")
    for (const m of monthlyData) {
      lines.push(`${m.month}: ${m.total.toLocaleString("cs-CZ")} Kč (${m.orderCount} obj., prům. ${m.avgPerOrder.toLocaleString("cs-CZ")} Kč)`)
    }
    lines.push("")
  }

  if (topItems.length > 0) {
    lines.push("=== TOP 15 POLOŽEK PODLE ÚTRATY ===")
    for (const item of topItems.slice(0, 15)) {
      lines.push(`- ${item.name} (${item.textualAmount}): ${item.count}x, celkem ${item.total.toLocaleString("cs-CZ")} Kč, prům. ${item.avgPrice} Kč`)
    }
    lines.push("")
  }

  if (categoryData.length > 0) {
    lines.push("=== KATEGORIE ===")
    for (const cat of categoryData) {
      lines.push(`- ${cat.category}: ${cat.amount.toLocaleString("cs-CZ")} Kč (${cat.percentage}%)`)
    }
    lines.push("")
  }

  if (deliveryData) {
    lines.push("=== DOPRAVA ===")
    lines.push(`Celkem za dopravu: ${deliveryData.totalDelivery.toLocaleString("cs-CZ")} Kč`)
    lines.push(`Průměr/objednávku: ${deliveryData.avgDelivery} Kč`)
    lines.push(`Zdarma: ${deliveryData.freeDeliveryCount}x, placená: ${deliveryData.paidDeliveryCount}x`)
    lines.push("")
  }

  lines.push("=== ZDRAVÍ A SLOŽENÍ ===")
  if (freshPct !== null) lines.push(`Podíl čerstvých potravin: ${freshPct}%`)
  if (additiveFreeePct !== null) lines.push(`Produkty bez aditiv: ${additiveFreeePct}%`)
  if (proteinSources !== null) lines.push(`Různých zdrojů bílkovin: ${proteinSources}`)
  lines.push(`Míra náhrad (substituce): ${compensationData.compensationRate}%`)
  lines.push("")

  if (currentVsPaid.length > 0) {
    const rising = currentVsPaid.filter((p) => p.diffPct > 5).slice(0, 10)
    const falling = currentVsPaid.filter((p) => p.diffPct < -5).slice(0, 10)
    if (rising.length > 0) {
      lines.push("=== CENY KTERÉ VZROSTLY ===")
      for (const p of rising) {
        lines.push(`- ${p.name}: platili jste ${p.avgPaid} Kč, nyní ${p.currentPrice} Kč (+${p.diffPct}%)`)
      }
      lines.push("")
    }
    if (falling.length > 0) {
      lines.push("=== CENY KTERÉ KLESLY ===")
      for (const p of falling) {
        lines.push(`- ${p.name}: platili jste ${p.avgPaid} Kč, nyní ${p.currentPrice} Kč (${p.diffPct}%)`)
      }
      lines.push("")
    }
  }

  return lines.join("\n")
}

export function buildPrompt(): string {
  return `Jsi osobní analytik nákupních zvyklostí. Uživatel ti posílá souhrn svých objednávek z Rohlik.cz (český online supermarket).

Na základě dat níže prosím proveď:

1. **Celkové zhodnocení** — jak uživatel nakupuje, jaké má vzorce, co je na první pohled zajímavý nebo neobvyklý.

2. **Úspory** — konkrétní, akční tipy kde může ušetřit. Zaměřit se na drahé položky kupované pravidelně, možné náhražky, využití akcí.

3. **Zdraví a výživa** — zhodnocení poměru čerstvých vs. zpracovaných potravin, pestrosti stravy, postřehy k nákupním návykům z hlediska zdraví.

4. **Trendy** — jak se mění útrata v čase, jestli roste/klesá, sezónní vzorce, změny v cenách.

5. **Doporučení** — 3-5 konkrétních kroků které by uživatel mohl udělat pro lepší nákupy.

Odpověz v češtině. Buď konkrétní — odkazuj na skutečné produkty a čísla z dat.`
}

export function exportOrdersJson(orders: Order[], enrichment?: EnrichmentData): string {
  return JSON.stringify({ orders, enrichment }, null, 2)
}

export function exportItemsCsv(items: FlatItem[]): string {
  const header = "datum,objednavka,produkt,id_produktu,mnozstvi,baleni,jednotka,cena_za_kus,celkem,nahrada"
  const rows = items.map((item) =>
    [
      item.orderDate?.slice(0, 10) || "",
      item.orderId,
      `"${item.name.replace(/"/g, '""')}"`,
      item.productId,
      item.amount,
      `"${item.textualAmount.replace(/"/g, '""')}"`,
      item.unit,
      item.unitPrice,
      item.total,
      item.compensated ? "ano" : "ne"
    ].join(",")
  )
  return [header, ...rows].join("\n")
}
