import { useState, useEffect, useRef, useMemo } from "react"
import QRCode from "qrcode"
import Modal from "./Modal"
import { buildShareStats, CWS_LINK } from "../lib/share-stats"
import type { ShareStatsInput } from "../lib/share-stats"

type Props = ShareStatsInput & {
  open: boolean
  onClose: () => void
  preselect?: string | null
}

export default function ShareModal(props: Props) {
  const { open, onClose, preselect } = props
  const [selected, setSelected] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const qrRef = useRef<HTMLCanvasElement>(null)

  const stats = useMemo(() => buildShareStats(props), [
    props.summaryData, props.dowData, props.impulseData,
    props.inflationData, props.freshRatioData, props.varietyData, props.onSaleData
  ])

  // Preselect or auto-select first stat
  useEffect(() => {
    if (open) {
      if (preselect && stats.some(s => s.id === preselect)) {
        setSelected(preselect)
      } else if (stats.length > 0 && !selected) {
        setSelected(stats[0].id)
      }
    }
  }, [open, preselect, stats])

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

        {/* Stat picker */}
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
