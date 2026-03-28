import { useState, useRef, useEffect } from "react"
import type { Order } from "../lib/types"
import ProductLink from "./ProductLink"

export default function OrderPopover({
  orderId,
  orders,
  children
}: {
  orderId: number
  orders: Order[]
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const order = orders.find((o) => o.id === orderId)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer hover:underline decoration-primary/30 text-left"
        title="Zobrazit obsah objednávky">
        {children}
      </button>
      {open && order && (
        <div className="absolute z-50 left-0 top-full mt-1 w-80 max-h-96 overflow-auto bg-white rounded-xl shadow-lg border border-warm p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-primary">
              Objednávka #{order.id}
            </p>
            <p className="text-xs text-muted">
              {order.orderTime?.slice(0, 10)}
            </p>
          </div>
          <div className="space-y-1">
            {(order.items || []).map((item, i) => (
              <div
                key={i}
                className="flex items-start justify-between text-xs py-1 border-b border-warm/50 last:border-0">
                <div className="flex-1 min-w-0 pr-2">
                  <ProductLink productId={item.id} name={item.name} />
                  {item.textualAmount && (
                    <span className="text-muted ml-1">
                      ({item.textualAmount})
                    </span>
                  )}
                </div>
                <span className="text-secondary whitespace-nowrap font-medium">
                  {Math.round(item.priceComposition?.total?.amount || 0)} Kč
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-warm flex justify-between text-xs font-bold">
            <span>Celkem</span>
            <span>
              {Math.round(order.priceComposition?.total?.amount || 0)} Kč
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
