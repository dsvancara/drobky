import { useState, useMemo } from "react"
import Modal from "./Modal"
import type { Order, EnrichmentData } from "../lib/types"
import {
  flattenItems,
  summary,
  monthlySpending,
  topItemsBySpend,
  spendByCategory,
  currentVsPaidPrices,
  deliveryCostAnalysis,
  compensationRateAnalysis,
  healthAnalysis
} from "../lib/analyzer"
import {
  buildPrompt,
  buildDataSummary,
  exportOrdersJson,
  exportItemsCsv
} from "../lib/export"

type Props = {
  open: boolean
  onClose: () => void
  orders: Order[]
  enrichment?: EnrichmentData
}

export default function AiExportModal({ open, onClose, orders, enrichment }: Props) {
  const [prompt, setPrompt] = useState(buildPrompt)
  const [copied, setCopied] = useState(false)
  const [activeExportTab, setActiveExportTab] = useState<"ai" | "json" | "csv">("ai")

  const dataSummary = useMemo(() => {
    if (!open || orders.length === 0) return ""
    const items = flattenItems(orders)
    const summaryData = summary(orders, items)
    const monthly = monthlySpending(orders)
    const top = topItemsBySpend(items, 15)
    const cats = spendByCategory(items, enrichment)
    const prices = currentVsPaidPrices(items, enrichment)
    const delivery = deliveryCostAnalysis(orders)
    const compensation = compensationRateAnalysis(items)
    const health = healthAnalysis(items, orders, enrichment)

    const freshInsight = health.find((h) => h.title === "Čerstvé vs. zpracované")
    const additiveInsight = health.find((h) => h.title === "Aditiva v produktech")
    const proteinInsight = health.find((h) => h.title === "Diverzita bílkovin")

    const freshPct = freshInsight?.value ? parseInt(freshInsight.value) : null
    const additivePct = additiveInsight?.value ? parseInt(additiveInsight.value) : null
    const proteinCount = proteinInsight?.value ? parseInt(proteinInsight.value) : null

    return buildDataSummary(
      summaryData, monthly, top, cats, prices,
      delivery, compensation,
      freshPct, additivePct, proteinCount
    )
  }, [open, orders, enrichment])

  const handleCopyAll = async () => {
    const text = prompt + "\n\n---\n\n" + dataSummary
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadJson = () => {
    const blob = new Blob([exportOrdersJson(orders, enrichment)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "drobky-export.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadCsv = () => {
    const items = flattenItems(orders)
    const blob = new Blob([exportItemsCsv(items)], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "drobky-export.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Modal open={open} onClose={onClose} title="AI analýza & export dat">
      <div className="space-y-4">
        {/* Tab switcher */}
        <div className="flex gap-1 border-b border-warm">
          <button
            onClick={() => setActiveExportTab("ai")}
            className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
              activeExportTab === "ai"
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-secondary"
            }`}>
            AI prompt
          </button>
          <button
            onClick={() => setActiveExportTab("json")}
            className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
              activeExportTab === "json"
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-secondary"
            }`}>
            JSON export
          </button>
          <button
            onClick={() => setActiveExportTab("csv")}
            className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
              activeExportTab === "csv"
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-secondary"
            }`}>
            CSV export
          </button>
        </div>

        {activeExportTab === "ai" && (
          <>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-primary">Prompt</label>
                <span className="text-xs text-muted">Upravte dle potřeby</span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-warm rounded-xl text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary bg-white resize-y"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-primary mb-1 block">
                Data ({dataSummary.split("\n").length} řádků)
              </label>
              <textarea
                value={dataSummary}
                readOnly
                rows={10}
                className="w-full px-3 py-2 border border-warm rounded-xl text-sm font-mono bg-warm/50 focus:outline-none resize-y"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyAll}
                className="flex-1 py-2 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors">
                {copied ? "Zkopírováno!" : "Kopírovat prompt + data"}
              </button>
            </div>

            <p className="text-xs text-muted text-center">
              Vložte do ChatGPT, Claude nebo jiného LLM dle vašeho výběru.
              Data zůstávají pod vaší kontrolou.
            </p>
          </>
        )}

        {activeExportTab === "json" && (
          <div className="space-y-3">
            <p className="text-sm text-secondary">
              Stáhněte kompletní data objednávek včetně obohacení produktů jako JSON soubor.
              Vhodné pro vlastní analýzu v Pythonu, Excelu nebo jiném nástroji.
            </p>
            <p className="text-xs text-muted">
              {orders.length} objednávek, {enrichment ? Object.keys(enrichment.products).length : 0} obohacených produktů
            </p>
            <button
              onClick={handleDownloadJson}
              className="w-full py-2 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors">
              Stáhnout JSON
            </button>
          </div>
        )}

        {activeExportTab === "csv" && (
          <div className="space-y-3">
            <p className="text-sm text-secondary">
              Stáhněte všechny položky jako CSV tabulku. Sloupce: datum, objednávka, produkt,
              množství, balení, cena za kus, celkem, náhrada.
              Lze otevřít přímo v Excelu nebo Google Sheets.
            </p>
            <p className="text-xs text-muted">
              {flattenItems(orders).length} položek
            </p>
            <button
              onClick={handleDownloadCsv}
              className="w-full py-2 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors">
              Stáhnout CSV
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}
