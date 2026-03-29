import { useState, useEffect, useRef, useCallback } from "react"

type ShareCard = {
  id: string
  emoji: string
  text: string
}

type Props = {
  cards: ShareCard[]
  onShare: (statId: string) => void
}

const AUTO_INTERVAL = 6000

export default function ShareCarousel({ cards, onShare }: Props) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (progressRef.current) { clearInterval(progressRef.current); progressRef.current = null }
  }, [])

  const startAutoplay = useCallback(() => {
    if (cards.length <= 1) return
    clearTimers()
    setProgress(0)

    const step = 50 // ms per progress tick
    progressRef.current = setInterval(() => {
      setProgress(p => Math.min(p + (step / AUTO_INTERVAL) * 100, 100))
    }, step)

    timerRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % cards.length)
      setProgress(0)
    }, AUTO_INTERVAL)
  }, [cards.length, clearTimers])

  // Start autoplay on mount, restart when active changes (from autoplay)
  useEffect(() => {
    if (!paused && cards.length > 1) {
      startAutoplay()
    }
    return clearTimers
  }, [paused, cards.length, startAutoplay, clearTimers])

  // Reset progress when active changes
  useEffect(() => {
    if (!paused) setProgress(0)
  }, [active, paused])

  const handleDotClick = (i: number) => {
    setPaused(true)
    clearTimers()
    setActive(i)
    setProgress(0)
  }

  if (cards.length === 0) return null

  const card = cards[active]

  return (
    <div className="bg-warm/30 rounded-2xl border border-warm/60 border-dashed px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-xl flex-shrink-0">{card.emoji}</span>
        <p className="flex-1 min-w-0 text-sm text-secondary leading-relaxed">{card.text}</p>
        <button
          onClick={() => onShare(card.id)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted hover:text-primary border border-warm rounded-lg hover:bg-white transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Sdílet
        </button>
      </div>

      {/* Dot indicators with progress */}
      {cards.length > 1 && (
        <div className="flex justify-center gap-2 mt-2.5">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className="relative w-6 h-1.5 rounded-full overflow-hidden bg-warm transition-colors"
              aria-label={`Statistika ${i + 1}`}
            >
              {i === active && !paused ? (
                <div
                  className="absolute inset-y-0 left-0 bg-primary/50 rounded-full transition-none"
                  style={{ width: `${progress}%` }}
                />
              ) : (
                <div className={`absolute inset-0 rounded-full ${i === active ? "bg-primary/50" : ""}`} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
