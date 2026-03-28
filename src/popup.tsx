import { useEffect, useState } from "react"
import "./style.css"

type Status = "checking" | "logged_out" | "idle" | "fetching" | "complete" | "error"

type Preset = {
  label: string
  days: number
}

const PRESETS: Preset[] = [
  { label: "Poslední týden", days: 7 },
  { label: "Poslední 2 týdny", days: 14 },
  { label: "Poslední měsíc", days: 30 },
  { label: "Poslední 3 měsíce", days: 90 },
  { label: "Posledních 6 měsíců", days: 180 },
  { label: "Poslední rok", days: 365 },
  { label: "Vše", days: 0 }
]

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function Popup() {
  const [status, setStatus] = useState<Status>("checking")
  const [selectedPreset, setSelectedPreset] = useState(3) // default: 3 months
  const [showCustom, setShowCustom] = useState(false)
  const [dateFrom, setDateFrom] = useState(daysAgo(90))
  const [dateTo, setDateTo] = useState(today())
  const [progress, setProgress] = useState("")
  const [progressPct, setProgressPct] = useState(0)
  const [error, setError] = useState("")
  const [hasData, setHasData] = useState(false)
  const [fetchedAt, setFetchedAt] = useState("")
  const [lastOrderCount, setLastOrderCount] = useState(0)

  useEffect(() => {
    chrome.runtime.sendMessage({ action: "checkLogin" }, (response) => {
      if (response?.loggedIn) {
        setStatus("idle")
      } else {
        setStatus("logged_out")
      }
    })

    chrome.storage.local.get(
      ["orders", "fetchedAt", "fetchInProgress", "fetchProgress"],
      (data) => {
        if (data.orders?.length > 0) {
          setHasData(true)
          setLastOrderCount(data.orders.length)
          if (data.fetchedAt) {
            setFetchedAt(new Date(data.fetchedAt).toLocaleString("cs-CZ"))
          }
        }
        if (data.fetchInProgress) {
          setStatus("fetching")
          const p = data.fetchProgress
          if (p) {
            const phasePct = p.total > 0 ? p.current / p.total : 0
            const labels: Record<string, string> = {
              list: `Sbírám objednávky... ${p.current}`,
              details: `Stahování objednávky ${p.current}/${p.total}`,
              enriching: `Obohacení produktů... ${p.current}/${p.total}`,
              alternatives: `Hledání alternativ... ${p.current}/${p.total}`
            }
            const offsets: Record<string, [number, number]> = {
              list: [0, 10], details: [10, 40], enriching: [50, 30], alternatives: [80, 20]
            }
            const [base, weight] = offsets[p.phase] || [0, 10]
            setProgress(labels[p.phase] || "Probíhá stahování...")
            setProgressPct(base + phasePct * weight)
          } else {
            setProgress("Probíhá stahování...")
          }
        }
      }
    )

    // Phase weights: list 10%, details 40%, enriching 30%, alternatives 20%
    const listener = (msg: any) => {
      if (msg.type === "progress") {
        setStatus("fetching")
        const phasePct = msg.total > 0 ? msg.current / msg.total : 0
        if (msg.phase === "list") {
          setProgress(
            `Sbírám objednávky... ${msg.current}${msg.total ? "/" + msg.total : ""}`
          )
          setProgressPct(Math.min(phasePct * 10, 10))
        } else if (msg.phase === "details") {
          setProgress(`Stahování objednávky ${msg.current}/${msg.total}`)
          setProgressPct(10 + phasePct * 40)
        } else if (msg.phase === "enriching") {
          setProgress(`Obohacení produktů... ${msg.current}/${msg.total}`)
          setProgressPct(50 + phasePct * 30)
        } else if (msg.phase === "alternatives") {
          setProgress(`Hledání alternativ... ${msg.current}/${msg.total}`)
          setProgressPct(80 + phasePct * 20)
        }
      } else if (msg.type === "complete") {
        setStatus("complete")
        setProgressPct(100)
        setProgress(`Hotovo! ${msg.orderCount} objednávek zpracováno.`)
        setHasData(true)
        setLastOrderCount(msg.orderCount)
        setFetchedAt(new Date().toLocaleString("cs-CZ"))
      } else if (msg.type === "error") {
        setStatus("error")
        setError(msg.message)
      }
    }
    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
  }, [])

  const handlePresetChange = (idx: number) => {
    setSelectedPreset(idx)
    setShowCustom(false)
    const preset = PRESETS[idx]
    if (preset.days > 0) {
      setDateFrom(daysAgo(preset.days))
      setDateTo(today())
    } else {
      setDateFrom("")
      setDateTo(today())
    }
  }

  const startFetch = () => {
    setStatus("fetching")
    setError("")
    setProgress("Spouštím...")
    setProgressPct(0)
    chrome.runtime.sendMessage({
      action: "fetchOrders",
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined
    })
  }

  const openAnalysis = () => {
    chrome.runtime.sendMessage({ action: "openAnalysis" })
  }

  const retryLogin = () => {
    setStatus("checking")
    chrome.runtime.sendMessage({ action: "checkLogin" }, (response) => {
      if (response?.loggedIn) {
        setStatus("idle")
      } else {
        setStatus("logged_out")
      }
    })
  }

  return (
    <div className="w-80 p-4 bg-cream">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <img src={chrome.runtime.getURL("assets/icon128.png")} alt="Drobky" className="w-8 h-8 rounded-lg" />
        <div className="flex-1">
          <h1 className="text-lg font-bold text-primary mb-[-8px]">
            Drobky
          </h1>
          <span className="text-xs text-primary/60">z Rohlíku</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted bg-warm rounded-full px-2 py-0.5">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          100% lokální
        </div>
      </div>

      {status === "checking" && (
        <p className="text-sm text-secondary text-center py-4">
          Kontroluji přihlášení...
        </p>
      )}

      {status === "logged_out" && (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-sm font-medium text-amber-800">
              Nejste přihlášeni
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Přihlaste se na{" "}
              <a
                href="https://www.rohlik.cz/prihlaseni"
                target="_blank"
                rel="noreferrer"
                className="underline font-medium">
                rohlik.cz
              </a>{" "}
              a poté se vraťte sem.
            </p>
          </div>
          <button
            onClick={retryLogin}
            className="w-full py-2 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors">
            Zkontrolovat znovu
          </button>
        </div>
      )}

      {status === "idle" && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">
              Období
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map((preset, idx) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetChange(idx)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedPreset === idx && !showCustom
                      ? "bg-primary text-white"
                      : "bg-warm text-secondary hover:bg-border"
                  } ${preset.days === 0 ? "col-span-2" : ""}`}>
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <button
              onClick={() => setShowCustom(!showCustom)}
              className="text-xs text-primary/70 hover:text-primary transition-colors flex items-center gap-1">
              <svg
                className={`w-3 h-3 transition-transform ${showCustom ? "rotate-90" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              {showCustom ? "Skrýt vlastní rozsah" : "Vlastní rozsah dat"}
            </button>
            {showCustom && (
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <div>
                  <label className="block text-xs text-muted mb-0.5">
                    Od
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value)
                      setSelectedPreset(-1)
                    }}
                    className="w-full px-2 py-1 border border-warm rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-0.5">
                    Do
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value)
                      setSelectedPreset(-1)
                    }}
                    className="w-full px-2 py-1 border border-warm rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={startFetch}
            className="w-full py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors">
            Analyzovat objednávky
          </button>
        </div>
      )}

      {status === "fetching" && (
        <div className="space-y-2">
          <div className="w-full bg-warm rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(progressPct, 2)}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-secondary">{progress}</p>
            <p className="text-xs text-muted">{Math.round(progressPct)}%</p>
          </div>
        </div>
      )}

      {status === "complete" && (
        <div className="space-y-2">
          <p className="text-sm text-primary font-medium">{progress}</p>
          <button
            onClick={openAnalysis}
            className="w-full py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors">
            Zobrazit analýzu
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-2">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => setStatus("idle")}
            className="w-full py-2 bg-warm text-secondary rounded-xl font-medium text-sm hover:bg-border transition-colors">
            Zkusit znovu
          </button>
        </div>
      )}

      {hasData && status !== "complete" && status !== "fetching" && (
        <div className="mt-3 pt-3 border-t border-warm">
          <button
            onClick={openAnalysis}
            className="w-full py-2 px-3 bg-primary/10 text-primary rounded-xl font-medium text-sm hover:bg-primary/20 transition-colors">
            Zobrazit poslední analýzu ({lastOrderCount} objednávek)
          </button>
          {fetchedAt && (
            <p className="text-xs text-muted text-center mt-1">
              Staženo: {fetchedAt}
            </p>
          )}
        </div>
      )}

      <p className="text-[10px] text-muted text-center mt-3 pt-2 border-t border-warm">
        Kam mizí vaše drobky?
      </p>
    </div>
  )
}

export default Popup
