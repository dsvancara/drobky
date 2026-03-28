import { productUrl } from "../lib/rohlik-url"

export default function ProductLink({
  productId,
  name,
  className
}: {
  productId: number
  name: string
  className?: string
}) {
  if (!productId) return <span className={className}>{name}</span>

  return (
    <a
      href={productUrl(productId, name)}
      target="_blank"
      rel="noreferrer"
      className={`underline decoration-warm decoration-1 underline-offset-2 hover:decoration-primary/50 transition-colors ${className || ""}`}
      title="Otevřít na rohlik.cz">
      {name}
    </a>
  )
}
