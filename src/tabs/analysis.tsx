import { useEffect, useMemo, useState } from "react"
import "../style.css"
import type { Order, EnrichmentData } from "../lib/types"
import {
  flattenItems,
  spendByCategory,
  topItemsBySpend,
  priceVariations,
  frequentItems,
  monthlySpending,
  savingsSuggestions,
  healthAnalysis,
  summary,
  dayOfWeekPatterns,
  orderFrequencyTrend,
  basketSizeTrend,
  impulseVsStaple,
  currentVsPaidPrices,
  productsOnSaleNow,
  personalInflationTracker,
  varietyScoreByMonth,
  seasonalProducts,
  freshFoodRatioTrend,
  deliveryCostAnalysis,
  compensationRateAnalysis,
  spendingVelocity
} from "../lib/analyzer"
import SummaryCards from "../components/SummaryCards"
import CategoryChart from "../components/CategoryChart"
import TopItems from "../components/TopItems"
import PriceVariations from "../components/PriceVariations"
import FrequentItems from "../components/FrequentItems"
import MonthlySpend from "../components/MonthlySpend"
import SavingsTips from "../components/SavingsTips"
import Alternatives from "../components/Alternatives"
import HealthInsights from "../components/HealthInsights"
import OrdersList from "../components/OrdersList"
import DayOfWeekChart from "../components/DayOfWeekChart"
import OrderFrequencyChart from "../components/OrderFrequencyChart"
import BasketSizeChart from "../components/BasketSizeChart"
import SpendingVelocityChart from "../components/SpendingVelocity"
import ImpulseVsStapleCard from "../components/ImpulseVsStaple"
import DeliveryCostsCard from "../components/DeliveryCosts"
import CompensationCard from "../components/CompensationRate"
import CurrentVsPaidTable from "../components/CurrentVsPaid"
import OnSaleNowCard from "../components/OnSaleNow"
import PersonalInflationChart from "../components/PersonalInflation"
import FreshRatioChart from "../components/FreshRatioTrend"
import VarietyScoreChart from "../components/VarietyScore"
import SeasonalProductsList from "../components/SeasonalProducts"
import AiExportModal from "../components/AiExportModal"

const TABS = [
  { id: "prehled", label: "Přehled" },
  { id: "nakupy", label: "Nákupy" },
  { id: "ceny", label: "Ceny" },
  { id: "kategorie", label: "Kategorie" },
  { id: "tipy", label: "Tipy" },
  { id: "objednavky", label: "Objednávky" }
]

function AnalysisPage() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [enrichment, setEnrichment] = useState<EnrichmentData | undefined>()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("prehled")
  const [exportOpen, setExportOpen] = useState(false)

  useEffect(() => {
    chrome.storage.local.get(["orders", "enrichment"], (data) => {
      if (data.orders?.length > 0) {
        setOrders(data.orders)
      }
      if (data.enrichment) {
        setEnrichment(data.enrichment)
      }
      setLoading(false)
    })
  }, [])

  const items = useMemo(() => (orders ? flattenItems(orders) : []), [orders])

  // Přehled tab data
  const summaryData = useMemo(() => (orders ? summary(orders, items) : null), [orders, items])
  const dowData = useMemo(() => (orders ? dayOfWeekPatterns(orders) : []), [orders])
  const freqTrendData = useMemo(() => (orders ? orderFrequencyTrend(orders) : []), [orders])
  const basketData = useMemo(() => (orders ? basketSizeTrend(orders) : []), [orders])
  const velocityData = useMemo(() => (orders ? spendingVelocity(orders) : []), [orders])

  // Nákupy tab data
  const monthlyData = useMemo(() => (orders ? monthlySpending(orders) : []), [orders])
  const deliveryData = useMemo(() => (orders ? deliveryCostAnalysis(orders) : null), [orders])
  const compensationData = useMemo(() => compensationRateAnalysis(items), [items])
  const impulseData = useMemo(() => (orders ? impulseVsStaple(items, orders) : null), [items, orders])
  const topItemsData = useMemo(() => topItemsBySpend(items), [items])
  const frequentData = useMemo(() => frequentItems(items), [items])

  // Ceny tab data
  const variationsData = useMemo(() => priceVariations(items), [items])
  const currentVsPaidData = useMemo(() => currentVsPaidPrices(items, enrichment), [items, enrichment])
  const onSaleData = useMemo(() => productsOnSaleNow(items, enrichment), [items, enrichment])
  const inflationData = useMemo(() => personalInflationTracker(items, enrichment), [items, enrichment])

  // Kategorie tab data
  const categoryData = useMemo(() => spendByCategory(items, enrichment), [items, enrichment])
  const freshRatioData = useMemo(() => freshFoodRatioTrend(items, enrichment), [items, enrichment])
  const varietyData = useMemo(() => varietyScoreByMonth(items), [items])
  const seasonalData = useMemo(() => seasonalProducts(items), [items])

  // Tipy tab data
  const savingsData = useMemo(() => savingsSuggestions(items), [items])
  const healthData = useMemo(() => (orders ? healthAnalysis(items, orders, enrichment) : []), [items, orders, enrichment])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-secondary text-lg">Načítání dat...</p>
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary text-lg mb-2">Žádná data k analýze</p>
          <p className="text-muted text-sm">
            Klikněte na ikonu rozšíření a stáhněte objednávky.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-warm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
          <img src={chrome.runtime.getURL("assets/icon128.png")} alt="Drobky" className="w-8 h-8 rounded-lg" />
          <div className="flex-1">
            <h1 className="text-lg font-bold text-primary mb-[-8px]">
              Drobky
            </h1>
            <span className="text-xs font-normal text-primary/60">
              z Rohlíku
            </span>
          </div>
          <button
            onClick={() => setExportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-secondary hover:text-primary border border-warm rounded-xl hover:bg-warm/50 transition-colors"
            title="Export dat & AI analýza"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>

        {/* Tab navigation */}
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted hover:text-secondary"
                }`}>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {activeTab === "prehled" && (
          <>
            {summaryData && <SummaryCards data={summaryData} />}

            {/* Highlight cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(() => {
                const topDay = [...dowData].sort((a, b) => b.orderCount - a.orderCount)[0]
                return topDay && topDay.orderCount > 0 ? (
                  <div className="bg-white rounded-xl p-3 border border-warm text-center">
                    <p className="text-xs text-muted">Nejčastější den</p>
                    <p className="text-lg font-bold text-primary">{topDay.dayName}</p>
                    <p className="text-xs text-muted">{topDay.orderCount} objednávek</p>
                  </div>
                ) : null
              })()}
              {basketData.length > 0 && (
                <div className="bg-white rounded-xl p-3 border border-warm text-center">
                  <p className="text-xs text-muted">Prům. košík</p>
                  <p className="text-lg font-bold text-primary">{basketData[basketData.length - 1].avgItems} položek</p>
                  <p className="text-xs text-muted">{basketData[basketData.length - 1].avgUniqueItems} unikátních</p>
                </div>
              )}
              {onSaleData.length > 0 && (
                <div className="bg-white rounded-xl p-3 border border-warm text-center cursor-pointer hover:bg-warm/50 transition-colors" onClick={() => setActiveTab("ceny")}>
                  <p className="text-xs text-muted">V akci teď</p>
                  <p className="text-lg font-bold text-primary">{onSaleData.length} produktů</p>
                  <p className="text-xs text-primary/60">Zobrazit →</p>
                </div>
              )}
              {inflationData.length > 0 && (
                <div className="bg-white rounded-xl p-3 border border-warm text-center">
                  <p className="text-xs text-muted">Osobní inflace</p>
                  <p className={`text-lg font-bold ${inflationData[inflationData.length - 1].inflationPct > 0 ? "text-red-600" : "text-green-700"}`}>
                    {inflationData[inflationData.length - 1].inflationPct > 0 ? "+" : ""}{inflationData[inflationData.length - 1].inflationPct}%
                  </p>
                  <p className="text-xs text-muted">aktuální měsíc</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <DayOfWeekChart data={dowData} />
              <BasketSizeChart data={basketData} />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <OrderFrequencyChart data={freqTrendData} />
              <SpendingVelocityChart data={velocityData} />
            </div>
          </>
        )}

        {activeTab === "nakupy" && (
          <>
            <MonthlySpend data={monthlyData} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <TopItems data={topItemsData} />
              <FrequentItems data={frequentData} />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {deliveryData && <DeliveryCostsCard data={deliveryData} />}
              <CompensationCard data={compensationData} />
            </div>
            {impulseData && <ImpulseVsStapleCard data={impulseData} />}
          </>
        )}

        {activeTab === "ceny" && (
          <>
            <PriceVariations data={variationsData} />
            <CurrentVsPaidTable data={currentVsPaidData} />
            {onSaleData.length > 0 && <OnSaleNowCard data={onSaleData} />}
            {inflationData.length > 0 && <PersonalInflationChart data={inflationData} />}
          </>
        )}

        {activeTab === "kategorie" && (
          <>
            <CategoryChart data={categoryData} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <FreshRatioChart data={freshRatioData} />
              <VarietyScoreChart data={varietyData} />
            </div>
            {seasonalData.length > 0 && <SeasonalProductsList data={seasonalData} />}
          </>
        )}

        {activeTab === "tipy" && (
          <>
            <HealthInsights data={healthData} />
            {enrichment && enrichment.alternatives.length > 0 && (
              <Alternatives data={enrichment.alternatives} />
            )}
            <SavingsTips data={savingsData} />
          </>
        )}

        {activeTab === "objednavky" && (
          <OrdersList orders={orders} />
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-8 text-center border-t border-warm">
        <p className="text-sm font-medium text-secondary mb-1">
          Drobky z Rohlíku
        </p>
        <p className="text-xs text-muted mb-3">
          Kam mizí vaše drobky?
        </p>
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted mb-2">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Vše zpracováno lokálně ve vašem prohlížeči. Žádná data neopouští váš počítač.
        </div>
        <p className="text-[10px] text-muted">
          Žádné servery, žádné sledování, žádná AI. Jen vaše data, jen pro vás.
        </p>
      </footer>

      <AiExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        orders={orders}
        enrichment={enrichment}
      />
    </div>
  )
}

export default AnalysisPage
