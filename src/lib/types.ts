export type PriceCompositionPart = {
  amount: number
  currency: string
}

export type PriceComposition = {
  total: PriceCompositionPart
  unit: PriceCompositionPart
  goods?: PriceCompositionPart
  delivery?: PriceCompositionPart
}

export type OrderListItem = {
  id: number
  itemsCount: number
  orderTime: string
  priceComposition: PriceComposition
}

export type OrderItem = {
  amount: number
  compensated: boolean
  id: number
  name: string
  priceComposition: PriceComposition
  textualAmount: string
  unit: string
}

export type Order = OrderListItem & {
  items: OrderItem[]
}

export type FlatItem = {
  name: string
  total: number
  unitPrice: number
  amount: number
  unit: string
  textualAmount: string
  compensated: boolean
  orderDate: string
  orderId: number
  productId: number
}

// --- Rohlik API types ---

export type ApiCategory = {
  id: number
  name: string
  nameId: string
  nameLong: string
  level: number // 0 = top (e.g. "Ovoce a zelenina"), 1 = mid, 2 = leaf
}

export type ApiPrice = {
  full: number
  whole: number
  fraction: number
  currency: string
}

export type ApiComposition = {
  additiveScoreMax: number
  withoutAdditives: boolean
}

export type EnrichedProduct = {
  productId: number
  name: string
  categories: ApiCategory[]
  currentPrice: number
  currentPricePerUnit: number
  originalPrice: number // > 0 if on sale
  composition: ApiComposition | null
  badges: string[]
  inStock: boolean
}

export type SimilarProduct = {
  productId: number
  name: string
  currentPrice: number
  currentPricePerUnit: number
  categories: ApiCategory[]
}

export type ProductAlternatives = {
  productId: number
  name: string
  yourAvgPrice: number
  yourTotalSpend: number
  purchaseCount: number
  currentPrice: number
  alternatives: SimilarProduct[]
}

export type EnrichmentData = {
  products: Record<number, EnrichedProduct>
  alternatives: ProductAlternatives[]
}

// --- Messages ---

export type ProgressMessage = {
  type: "progress"
  phase: "list" | "details" | "enriching" | "alternatives"
  current: number
  total: number
}

export type ErrorMessage = {
  type: "error"
  message: string
}

export type CompleteMessage = {
  type: "complete"
  orderCount: number
}

export type BgMessage = ProgressMessage | ErrorMessage | CompleteMessage
