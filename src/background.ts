import type {
  Order,
  OrderListItem,
  EnrichedProduct,
  EnrichmentData,
  ProductAlternatives,
  SimilarProduct
} from "./lib/types"

export {}

const LIMIT = 50
const DELAY_MS = 50
const ORDER_DETAIL_CONCURRENCY = 6
const TOP_ALTERNATIVES_COUNT = 15
const MIN_SPEND_TO_ENRICH = 50 // skip products with less total spend
const MAX_PAGES = 100 // safety cap: 5000 orders max
const BATCH_SIZE = 50 // products per batch API call

const HEADERS = {
  accept: "application/json",
  "x-origin": "WEB"
}

// --- Login check ---

async function checkLogin(): Promise<boolean> {
  try {
    const res = await fetch(
      "https://www.rohlik.cz/services/frontend-service/user",
      { headers: HEADERS, credentials: "include" }
    )
    if (!res.ok) return false
    const data = await res.json()
    return data?.data?.user != null
  } catch {
    return false
  }
}

// --- Order fetching ---

async function fetchDeliveredPage(
  offset: number,
  limit: number
): Promise<OrderListItem[]> {
  const res = await fetch(
    `https://www.rohlik.cz/api/v3/orders/delivered?offset=${offset}&limit=${limit}`,
    { headers: HEADERS, credentials: "include" }
  )
  if (res.status === 401 || res.status === 403) {
    throw new Error("NOT_LOGGED_IN")
  }
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }
  return res.json()
}

async function fetchOrderDetail(id: number): Promise<Order> {
  const res = await fetch(`https://www.rohlik.cz/api/v3/orders/${id}`, {
    headers: HEADERS,
    credentials: "include"
  })
  if (!res.ok) {
    throw new Error(`Order ${id} failed: ${res.status}`)
  }
  return res.json()
}

// --- Batch product endpoints ---

function buildBatchUrl(base: string, ids: number[]): string {
  const params = ids.map((id) => `products=${id}`).join("&")
  return `${base}?${params}`
}

// Response shapes (verified against live API):
// /products         → [{ id, name, slug, brand, badges, composition?, ... }]
// /products/stock   → [{ productId, inStock, ... }]  — missing entries = discontinued
// /products/prices  → [{ productId, price: { amount }, pricePerUnit: { amount }, sales: [{ price, originalPrice }] }]
// /products/categories → [{ productId, categories: [{ id, name, slug, level }] }]

async function fetchBatchProducts(ids: number[]): Promise<Record<number, any>> {
  if (ids.length === 0) return {}
  try {
    const res = await fetch(
      buildBatchUrl("https://www.rohlik.cz/api/v1/products", ids),
      { headers: HEADERS }
    )
    if (!res.ok) return {}
    const data: any[] = await res.json()
    const result: Record<number, any> = {}
    for (const p of data) result[p.id] = p
    return result
  } catch {
    return {}
  }
}

async function fetchBatchStock(ids: number[]): Promise<Record<number, boolean>> {
  if (ids.length === 0) return {}
  try {
    const res = await fetch(
      buildBatchUrl("https://www.rohlik.cz/api/v1/products/stock", ids),
      { headers: HEADERS }
    )
    if (!res.ok) return {}
    const data: any[] = await res.json()
    const result: Record<number, boolean> = {}
    for (const item of data) result[item.productId] = item.inStock ?? false
    return result
  } catch {
    return {}
  }
}

async function fetchBatchPrices(ids: number[]): Promise<Record<number, { price: number; pricePerUnit: number; originalPrice: number }>> {
  if (ids.length === 0) return {}
  try {
    const res = await fetch(
      buildBatchUrl("https://www.rohlik.cz/api/v1/products/prices", ids),
      { headers: HEADERS }
    )
    if (!res.ok) return {}
    const data: any[] = await res.json()
    const result: Record<number, { price: number; pricePerUnit: number; originalPrice: number }> = {}
    for (const item of data) {
      // Base price is the current shelf price
      // If there's an active sale, sales[0].originalPrice is the pre-discount price
      const activeSale = item.sales?.find((s: any) => s.active)
      result[item.productId] = {
        price: activeSale ? activeSale.price.amount : item.price.amount,
        pricePerUnit: activeSale ? (activeSale.pricePerUnit?.amount ?? item.pricePerUnit.amount) : item.pricePerUnit.amount,
        originalPrice: activeSale ? activeSale.originalPrice.amount : 0
      }
    }
    return result
  } catch {
    return {}
  }
}

async function fetchBatchCategories(ids: number[]): Promise<Record<number, any[]>> {
  if (ids.length === 0) return {}
  try {
    const res = await fetch(
      buildBatchUrl("https://www.rohlik.cz/api/v1/products/categories", ids),
      { headers: HEADERS }
    )
    if (!res.ok) return {}
    const data: any[] = await res.json()
    const result: Record<number, any[]> = {}
    for (const item of data) result[item.productId] = item.categories || []
    return result
  } catch {
    return {}
  }
}

// --- Search (used only for alternatives now) ---

async function searchProduct(
  name: string
): Promise<EnrichedProduct | null> {
  try {
    const res = await fetch(
      `https://www.rohlik.cz/services/frontend-service/search?query=${encodeURIComponent(name)}&limit=5`,
      { headers: HEADERS }
    )
    if (!res.ok) return null
    const data = await res.json()
    const products = data?.data?.productList
    if (!products || products.length === 0) return null
    const match =
      products.find((p: any) => p.productName === name) || products[0]
    return {
      productId: match.productId,
      name: match.productName,
      categories: match.categories || [],
      currentPrice: match.price?.full || 0,
      currentPricePerUnit: match.pricePerUnit?.full || 0,
      originalPrice: match.originalPrice?.full || 0,
      composition: match.composition || null,
      badges: (match.badge || []).map((b: any) => b.slug || b.label),
      inStock: match.inStock ?? true
    }
  } catch {
    return null
  }
}

async function fetchSimilarIds(productId: number): Promise<number[]> {
  try {
    const res = await fetch(
      `https://www.rohlik.cz/api/v1/products/${productId}/similar`,
      { headers: HEADERS }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.similarProducts || []
  } catch {
    return []
  }
}

// --- Helpers ---

function broadcast(msg: unknown) {
  chrome.runtime.sendMessage(msg).catch(() => {})
  const m = msg as any
  if (m.type === "progress") {
    chrome.storage.local.set({
      fetchProgress: { phase: m.phase, current: m.current, total: m.total }
    })
  }
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

// --- Parallel batch runner ---

async function runInBatches<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number,
  onProgress?: (done: number, total: number) => void
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let nextIdx = 0
  let doneCount = 0

  async function worker() {
    while (nextIdx < items.length) {
      const idx = nextIdx++
      results[idx] = await fn(items[idx])
      doneCount++
      onProgress?.(doneCount, items.length)
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  )
  await Promise.all(workers)
  return results
}

// --- Chunk helper ---

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

// --- Enrichment pipeline (batch API) ---

async function enrichProducts(
  orders: Order[],
  cachedProducts?: Record<number, EnrichedProduct>
): Promise<EnrichmentData> {
  const products: Record<number, EnrichedProduct> = { ...cachedProducts }

  const spendMap: Record<
    number,
    { name: string; totalSpend: number; count: number; prices: number[] }
  > = {}
  for (const order of orders) {
    for (const item of order.items || []) {
      if (!spendMap[item.id]) {
        spendMap[item.id] = { name: item.name, totalSpend: 0, count: 0, prices: [] }
      }
      spendMap[item.id].totalSpend += item.priceComposition?.total?.amount || 0
      spendMap[item.id].count += 1
      const up = item.priceComposition?.unit?.amount
      if (up && up > 0) spendMap[item.id].prices.push(up)
    }
  }

  // Only enrich products worth enriching and not already cached
  const idsToEnrich = Object.keys(spendMap)
    .map(Number)
    .filter((pid) => !products[pid] && spendMap[pid].totalSpend >= MIN_SPEND_TO_ENRICH)

  // Phase 3: batch enrichment using direct product APIs
  const batches = chunk(idsToEnrich, BATCH_SIZE)
  let enrichedSoFar = 0

  for (const batch of batches) {
    // Fetch all 4 endpoints in parallel for this batch
    const [prodData, stockData, priceData, catData] = await Promise.all([
      fetchBatchProducts(batch),
      fetchBatchStock(batch),
      fetchBatchPrices(batch),
      fetchBatchCategories(batch)
    ])

    for (const pid of batch) {
      const prod = prodData[pid]
      const price = priceData[pid]
      const cats = catData[pid]
      // stock endpoint omits discontinued products entirely
      const inStock = pid in stockData ? stockData[pid] : false

      // Skip if neither products nor prices returned data (truly gone)
      if (!prod && !price) continue

      products[pid] = {
        productId: pid,
        name: prod?.name || spendMap[pid].name,
        categories: cats || [],
        currentPrice: price?.price || 0,
        currentPricePerUnit: price?.pricePerUnit || 0,
        originalPrice: price?.originalPrice || 0, // > 0 means on sale
        composition: prod?.composition || null,
        badges: Array.isArray(prod?.badges)
          ? prod.badges.map((b: any) => b.type || b.title)
          : [],
        inStock
      }
    }

    enrichedSoFar += batch.length
    broadcast({
      type: "progress",
      phase: "enriching",
      current: enrichedSoFar,
      total: idsToEnrich.length
    })
  }

  // Phase 4: parallel alternatives for top-spend items
  const topItems = Object.entries(spendMap)
    .sort((a, b) => b[1].totalSpend - a[1].totalSpend)
    .slice(0, TOP_ALTERNATIVES_COUNT)

  const alternatives: ProductAlternatives[] = []

  await runInBatches(
    topItems,
    async ([pidStr, info]) => {
      const pid = Number(pidStr)
      const similarIds = await fetchSimilarIds(pid)

      // Fetch similar products via search (these are different products, so search is fine)
      const altResults = await runInBatches(
        similarIds.slice(0, 5),
        async (sid) => {
          // Use batch product endpoint to get the name, then search for full info
          const prodData = await fetchBatchProducts([sid])
          const prod = prodData[sid]
          if (!prod) return null
          return searchProduct(prod.name || prod.productName)
        },
        3
      )

      const alts: SimilarProduct[] = altResults
        .filter(
          (r): r is EnrichedProduct => r != null && r.currentPrice > 0
        )
        .map((r) => ({
          productId: r.productId,
          name: r.name,
          currentPrice: r.currentPrice,
          currentPricePerUnit: r.currentPricePerUnit,
          categories: r.categories
        }))

      const enriched = products[pid]
      const avgPrice =
        info.prices.length > 0
          ? info.prices.reduce((a, b) => a + b, 0) / info.prices.length
          : info.totalSpend / info.count

      alternatives.push({
        productId: pid,
        name: info.name,
        yourAvgPrice: Math.round(avgPrice * 10) / 10,
        yourTotalSpend: Math.round(info.totalSpend),
        purchaseCount: info.count,
        currentPrice: enriched?.currentPrice || 0,
        alternatives: alts
      })

      return null
    },
    4,
    (done, total) => {
      broadcast({
        type: "progress",
        phase: "alternatives",
        current: done,
        total
      })
    }
  )

  return { products, alternatives }
}

// --- Main fetch flow (date-based) ---

async function fetchAllOrders(dateFrom?: string, dateTo?: string) {
  await chrome.storage.local.set({ fetchInProgress: true })

  const cutoffStart = dateFrom ? new Date(dateFrom).getTime() : 0
  const cutoffEnd = dateTo
    ? new Date(dateTo + "T23:59:59").getTime()
    : Infinity

  try {
    broadcast({ type: "progress", phase: "list", current: 0, total: 0 })
    const list: OrderListItem[] = []
    let page = 0
    let done = false

    while (!done && page < MAX_PAGES) {
      const offset = page * LIMIT
      const batch = await fetchDeliveredPage(offset, LIMIT)

      if (batch.length === 0) {
        done = true
        break
      }

      for (const item of batch) {
        const orderTime = new Date(item.orderTime).getTime()
        if (orderTime > cutoffEnd) continue
        if (orderTime < cutoffStart) {
          done = true
          break
        }
        list.push(item)
      }

      broadcast({
        type: "progress",
        phase: "list",
        current: list.length,
        total: 0
      })

      page++
      if (!done) await sleep(DELAY_MS)
    }

    if (list.length === 0) {
      await chrome.storage.local.set({ fetchInProgress: false })
      broadcast({
        type: "error",
        message: "V tomto období nebyly nalezeny žádné objednávky."
      })
      return
    }

    // Phase 2: fetch order details in parallel
    const orders: Order[] = []

    const detailResults = await runInBatches(
      list,
      async (item) => {
        try {
          return await fetchOrderDetail(item.id)
        } catch {
          await sleep(300)
          try {
            return await fetchOrderDetail(item.id)
          } catch {
            console.warn(`Skipping order ${item.id}`)
            return null
          }
        }
      },
      ORDER_DETAIL_CONCURRENCY,
      (done, total) => {
        broadcast({
          type: "progress",
          phase: "details",
          current: done,
          total
        })
      }
    )

    orders.push(...detailResults.filter((o): o is Order => o != null))
    await chrome.storage.local.set({ orders, fetchedAt: Date.now() })

    // Load cached enrichment to avoid re-fetching known products
    const cached = await chrome.storage.local.get(["enrichment"])
    const cachedProducts = cached?.enrichment?.products || {}

    // Phase 3 & 4: enrichment (with cache)
    const enrichment = await enrichProducts(orders, cachedProducts)

    await chrome.storage.local.set({
      orders,
      enrichment,
      fetchedAt: Date.now(),
      fetchInProgress: false,
      fetchProgress: null
    })

    broadcast({ type: "complete", orderCount: orders.length })
  } catch (e: any) {
    await chrome.storage.local.set({ fetchInProgress: false, fetchProgress: null })
    broadcast({
      type: "error",
      message:
        e.message === "NOT_LOGGED_IN"
          ? "Nejste přihlášeni na rohlik.cz. Přihlaste se a zkuste to znovu."
          : `Chyba: ${e.message}`
    })
  }
}

// --- Message listener ---

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === "checkLogin") {
    checkLogin().then((loggedIn) => sendResponse({ loggedIn }))
    return true
  }

  if (msg.action === "fetchOrders") {
    fetchAllOrders(msg.dateFrom, msg.dateTo)
    sendResponse({ started: true })
    return true
  }

  if (msg.action === "openAnalysis") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("tabs/analysis.html")
    })
    sendResponse({ ok: true })
    return true
  }
})
