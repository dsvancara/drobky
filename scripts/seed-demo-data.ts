/**
 * Generates realistic-looking demo data for Drobky screenshots.
 * Run: npx tsx scripts/seed-demo-data.ts > scripts/demo-data.json
 * Then paste into chrome.storage.local via DevTools console:
 *   chrome.storage.local.set(JSON.parse('...'))
 */

import type { Order, EnrichedProduct, ProductAlternatives, ApiCategory } from "../src/lib/types"

// --- Seed helpers ---

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff
    return s / 0x7fffffff
  }
}

const rand = rng(42)

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

function between(min: number, max: number): number {
  return Math.round((min + rand() * (max - min)) * 100) / 100
}

function intBetween(min: number, max: number): number {
  return Math.floor(min + rand() * (max - min + 1))
}

// --- Product catalog ---

type CatalogProduct = {
  id: number
  name: string
  unit: string
  textualAmount: string
  minPrice: number
  maxPrice: number
  category: string
  categoryId: number
  fresh: boolean
  withoutAdditives: boolean
  badges: string[]
  composition: { additiveScoreMax: number; withoutAdditives: boolean } | null
}

const CATEGORIES: Record<string, { id: number; name: string }> = {
  "ovoce": { id: 300101, name: "Ovoce" },
  "zelenina": { id: 300102, name: "Zelenina" },
  "pecivo": { id: 300103, name: "Pečivo" },
  "mlecne": { id: 300104, name: "Mléčné výrobky" },
  "maso": { id: 300105, name: "Maso a uzeniny" },
  "napoje": { id: 300106, name: "Nápoje" },
  "sladkosti": { id: 300107, name: "Sladkosti a snacky" },
  "mrazene": { id: 300108, name: "Mražené výrobky" },
  "prilohy": { id: 300109, name: "Přílohy a luštěniny" },
  "konzervy": { id: 300110, name: "Konzervy a trvanlivé" },
  "drogerie": { id: 300111, name: "Drogerie" },
  "bio": { id: 300112, name: "BIO a zdravá výživa" },
  "vejce": { id: 300113, name: "Vejce" },
  "ryby": { id: 300114, name: "Ryby" },
  "koření": { id: 300115, name: "Koření a přísady" },
  "hotova": { id: 300116, name: "Hotová jídla" },
}

const CATALOG: CatalogProduct[] = [
  // Ovoce
  { id: 1001, name: "Banány svazek cca 1kg", unit: "kg", textualAmount: "1 kg", minPrice: 29, maxPrice: 39, category: "ovoce", categoryId: 300101, fresh: true, withoutAdditives: true, badges: [], composition: { additiveScoreMax: 0, withoutAdditives: true } },
  { id: 1002, name: "Jablka Gala 1kg", unit: "kg", textualAmount: "1 kg", minPrice: 39, maxPrice: 55, category: "ovoce", categoryId: 300101, fresh: true, withoutAdditives: true, badges: [], composition: { additiveScoreMax: 0, withoutAdditives: true } },
  { id: 1003, name: "Citróny síťka 500g", unit: "ks", textualAmount: "500 g", minPrice: 29, maxPrice: 39, category: "ovoce", categoryId: 300101, fresh: true, withoutAdditives: true, badges: [], composition: null },
  { id: 1004, name: "Avokádo Hass 1ks", unit: "ks", textualAmount: "1 ks", minPrice: 29, maxPrice: 49, category: "ovoce", categoryId: 300101, fresh: true, withoutAdditives: true, badges: [], composition: null },
  { id: 1005, name: "Borůvky 125g", unit: "ks", textualAmount: "125 g", minPrice: 49, maxPrice: 79, category: "ovoce", categoryId: 300101, fresh: true, withoutAdditives: true, badges: [], composition: null },
  { id: 1006, name: "Pomeranče síťka 1kg", unit: "kg", textualAmount: "1 kg", minPrice: 35, maxPrice: 49, category: "ovoce", categoryId: 300101, fresh: true, withoutAdditives: true, badges: [], composition: null },

  // Zelenina
  { id: 1010, name: "Rajčata cherry 250g", unit: "ks", textualAmount: "250 g", minPrice: 34, maxPrice: 49, category: "zelenina", categoryId: 300102, fresh: true, withoutAdditives: true, badges: [], composition: null },
  { id: 1011, name: "Okurka salátová 1ks", unit: "ks", textualAmount: "1 ks", minPrice: 14, maxPrice: 24, category: "zelenina", categoryId: 300102, fresh: true, withoutAdditives: true, badges: [], composition: null },
  { id: 1012, name: "Paprika červená 1ks", unit: "ks", textualAmount: "1 ks", minPrice: 15, maxPrice: 29, category: "zelenina", categoryId: 300102, fresh: true, withoutAdditives: true, badges: [], composition: null },
  { id: 1013, name: "Mrkev svazek 500g", unit: "ks", textualAmount: "500 g", minPrice: 15, maxPrice: 25, category: "zelenina", categoryId: 300102, fresh: true, withoutAdditives: true, badges: [], composition: null },
  { id: 1014, name: "Cibule žlutá síťka 1kg", unit: "kg", textualAmount: "1 kg", minPrice: 19, maxPrice: 29, category: "zelenina", categoryId: 300102, fresh: true, withoutAdditives: true, badges: [], composition: null },
  { id: 1015, name: "Česnek český 200g", unit: "ks", textualAmount: "200 g", minPrice: 25, maxPrice: 39, category: "zelenina", categoryId: 300102, fresh: true, withoutAdditives: true, badges: [], composition: null },
  { id: 1016, name: "Špenát baby 100g", unit: "ks", textualAmount: "100 g", minPrice: 29, maxPrice: 45, category: "zelenina", categoryId: 300102, fresh: true, withoutAdditives: true, badges: [], composition: null },
  { id: 1017, name: "Brambory konzumní 2kg", unit: "kg", textualAmount: "2 kg", minPrice: 39, maxPrice: 59, category: "zelenina", categoryId: 300102, fresh: true, withoutAdditives: true, badges: [], composition: null },

  // Pečivo
  { id: 1020, name: "Chléb kváskový 500g", unit: "ks", textualAmount: "500 g", minPrice: 45, maxPrice: 65, category: "pecivo", categoryId: 300103, fresh: true, withoutAdditives: true, badges: ["FRESH"], composition: { additiveScoreMax: 0, withoutAdditives: true } },
  { id: 1021, name: "Rohlík český 43g", unit: "ks", textualAmount: "43 g", minPrice: 2.5, maxPrice: 4, category: "pecivo", categoryId: 300103, fresh: true, withoutAdditives: false, badges: ["FRESH"], composition: { additiveScoreMax: 3, withoutAdditives: false } },
  { id: 1022, name: "Bageta francouzská", unit: "ks", textualAmount: "1 ks", minPrice: 25, maxPrice: 39, category: "pecivo", categoryId: 300103, fresh: true, withoutAdditives: false, badges: ["FRESH"], composition: { additiveScoreMax: 2, withoutAdditives: false } },
  { id: 1023, name: "Croissant máslový", unit: "ks", textualAmount: "1 ks", minPrice: 19, maxPrice: 29, category: "pecivo", categoryId: 300103, fresh: true, withoutAdditives: false, badges: ["FRESH"], composition: { additiveScoreMax: 4, withoutAdditives: false } },

  // Mléčné
  { id: 1030, name: "Mléko polotučné 1l Kunín", unit: "ks", textualAmount: "1 l", minPrice: 19, maxPrice: 27, category: "mlecne", categoryId: 300104, fresh: true, withoutAdditives: true, badges: [], composition: { additiveScoreMax: 0, withoutAdditives: true } },
  { id: 1031, name: "Máslo Madeta 250g", unit: "ks", textualAmount: "250 g", minPrice: 49, maxPrice: 69, category: "mlecne", categoryId: 300104, fresh: true, withoutAdditives: true, badges: [], composition: { additiveScoreMax: 0, withoutAdditives: true } },
  { id: 1032, name: "Jogurt bílý Hollandia 500g", unit: "ks", textualAmount: "500 g", minPrice: 29, maxPrice: 39, category: "mlecne", categoryId: 300104, fresh: true, withoutAdditives: true, badges: [], composition: { additiveScoreMax: 0, withoutAdditives: true } },
  { id: 1033, name: "Eidam 30% plátky 100g", unit: "ks", textualAmount: "100 g", minPrice: 22, maxPrice: 35, category: "mlecne", categoryId: 300104, fresh: true, withoutAdditives: false, badges: [], composition: { additiveScoreMax: 2, withoutAdditives: false } },
  { id: 1034, name: "Parmezán Grana Padano 200g", unit: "ks", textualAmount: "200 g", minPrice: 89, maxPrice: 129, category: "mlecne", categoryId: 300104, fresh: true, withoutAdditives: true, badges: [], composition: { additiveScoreMax: 0, withoutAdditives: true } },
  { id: 1035, name: "Cottage sýr 200g", unit: "ks", textualAmount: "200 g", minPrice: 29, maxPrice: 42, category: "mlecne", categoryId: 300104, fresh: true, withoutAdditives: true, badges: [], composition: { additiveScoreMax: 0, withoutAdditives: true } },
  { id: 1036, name: "Mozzarella 125g", unit: "ks", textualAmount: "125 g", minPrice: 25, maxPrice: 39, category: "mlecne", categoryId: 300104, fresh: true, withoutAdditives: true, badges: [], composition: null },

  // Maso
  { id: 1040, name: "Kuřecí prsa 500g", unit: "ks", textualAmount: "500 g", minPrice: 89, maxPrice: 129, category: "maso", categoryId: 300105, fresh: true, withoutAdditives: true, badges: [], composition: null },
  { id: 1041, name: "Mleté maso hovězí 400g", unit: "ks", textualAmount: "400 g", minPrice: 79, maxPrice: 119, category: "maso", categoryId: 300105, fresh: true, withoutAdditives: true, badges: [], composition: null },
  { id: 1042, name: "Šunka nejvyšší jakosti 100g", unit: "ks", textualAmount: "100 g", minPrice: 32, maxPrice: 49, category: "maso", categoryId: 300105, fresh: true, withoutAdditives: false, badges: [], composition: { additiveScoreMax: 5, withoutAdditives: false } },
  { id: 1043, name: "Salám Vysočina 100g", unit: "ks", textualAmount: "100 g", minPrice: 29, maxPrice: 42, category: "maso", categoryId: 300105, fresh: true, withoutAdditives: false, badges: [], composition: { additiveScoreMax: 6, withoutAdditives: false } },
  { id: 1044, name: "Kuřecí stehna 1kg", unit: "kg", textualAmount: "1 kg", minPrice: 69, maxPrice: 99, category: "maso", categoryId: 300105, fresh: true, withoutAdditives: true, badges: [], composition: null },

  // Nápoje
  { id: 1050, name: "Mattoni neperlivá 1.5l", unit: "ks", textualAmount: "1.5 l", minPrice: 15, maxPrice: 22, category: "napoje", categoryId: 300106, fresh: false, withoutAdditives: true, badges: [], composition: null },
  { id: 1051, name: "Coca-Cola 1.75l", unit: "ks", textualAmount: "1.75 l", minPrice: 35, maxPrice: 49, category: "napoje", categoryId: 300106, fresh: false, withoutAdditives: false, badges: [], composition: { additiveScoreMax: 4, withoutAdditives: false } },
  { id: 1052, name: "Džus Cappy pomeranč 1l", unit: "ks", textualAmount: "1 l", minPrice: 35, maxPrice: 49, category: "napoje", categoryId: 300106, fresh: false, withoutAdditives: false, badges: [], composition: { additiveScoreMax: 2, withoutAdditives: false } },
  { id: 1053, name: "Káva zrnková Lavazza 250g", unit: "ks", textualAmount: "250 g", minPrice: 109, maxPrice: 149, category: "napoje", categoryId: 300106, fresh: false, withoutAdditives: true, badges: [], composition: null },
  { id: 1054, name: "Čaj Teekanne Earl Grey 20ks", unit: "ks", textualAmount: "20 sáčků", minPrice: 45, maxPrice: 65, category: "napoje", categoryId: 300106, fresh: false, withoutAdditives: true, badges: [], composition: null },

  // Sladkosti
  { id: 1060, name: "Čokoláda Lindt 100g", unit: "ks", textualAmount: "100 g", minPrice: 59, maxPrice: 89, category: "sladkosti", categoryId: 300107, fresh: false, withoutAdditives: false, badges: [], composition: { additiveScoreMax: 3, withoutAdditives: false } },
  { id: 1061, name: "Sušenky BeBe Dobré ráno 50g", unit: "ks", textualAmount: "50 g", minPrice: 12, maxPrice: 19, category: "sladkosti", categoryId: 300107, fresh: false, withoutAdditives: false, badges: [], composition: { additiveScoreMax: 5, withoutAdditives: false } },
  { id: 1062, name: "Zmrzlina Ben&Jerry's 465ml", unit: "ks", textualAmount: "465 ml", minPrice: 139, maxPrice: 189, category: "mrazene", categoryId: 300108, fresh: false, withoutAdditives: false, badges: [], composition: { additiveScoreMax: 4, withoutAdditives: false } },
  { id: 1063, name: "Tyčinka Corny Big 50g", unit: "ks", textualAmount: "50 g", minPrice: 12, maxPrice: 19, category: "sladkosti", categoryId: 300107, fresh: false, withoutAdditives: false, badges: [], composition: { additiveScoreMax: 4, withoutAdditives: false } },

  // Přílohy
  { id: 1070, name: "Rýže basmati 1kg", unit: "kg", textualAmount: "1 kg", minPrice: 45, maxPrice: 69, category: "prilohy", categoryId: 300109, fresh: false, withoutAdditives: true, badges: [], composition: null },
  { id: 1071, name: "Těstoviny penne 500g", unit: "ks", textualAmount: "500 g", minPrice: 25, maxPrice: 39, category: "prilohy", categoryId: 300109, fresh: false, withoutAdditives: true, badges: [], composition: null },
  { id: 1072, name: "Špagety De Cecco 500g", unit: "ks", textualAmount: "500 g", minPrice: 49, maxPrice: 69, category: "prilohy", categoryId: 300109, fresh: false, withoutAdditives: true, badges: [], composition: null },

  // Konzervy a trvanlivé
  { id: 1080, name: "Rajčatový protlak 200g", unit: "ks", textualAmount: "200 g", minPrice: 19, maxPrice: 29, category: "konzervy", categoryId: 300110, fresh: false, withoutAdditives: true, badges: [], composition: { additiveScoreMax: 0, withoutAdditives: true } },
  { id: 1081, name: "Olivový olej extra panenský 500ml", unit: "ks", textualAmount: "500 ml", minPrice: 119, maxPrice: 179, category: "konzervy", categoryId: 300110, fresh: false, withoutAdditives: true, badges: [], composition: null },
  { id: 1082, name: "Fazole v rajčatovém nálevu 400g", unit: "ks", textualAmount: "400 g", minPrice: 22, maxPrice: 35, category: "konzervy", categoryId: 300110, fresh: false, withoutAdditives: false, badges: [], composition: { additiveScoreMax: 2, withoutAdditives: false } },
  { id: 1083, name: "Tunák v oleji 185g", unit: "ks", textualAmount: "185 g", minPrice: 35, maxPrice: 55, category: "ryby", categoryId: 300114, fresh: false, withoutAdditives: true, badges: [], composition: null },

  // Drogerie
  { id: 1090, name: "Toaletní papír Zewa 8ks", unit: "ks", textualAmount: "8 rolí", minPrice: 89, maxPrice: 129, category: "drogerie", categoryId: 300111, fresh: false, withoutAdditives: true, badges: [], composition: null },
  { id: 1091, name: "Jar na nádobí 900ml", unit: "ks", textualAmount: "900 ml", minPrice: 55, maxPrice: 79, category: "drogerie", categoryId: 300111, fresh: false, withoutAdditives: true, badges: [], composition: null },
  { id: 1092, name: "Prací gel Persil 1l", unit: "ks", textualAmount: "1 l", minPrice: 129, maxPrice: 189, category: "drogerie", categoryId: 300111, fresh: false, withoutAdditives: true, badges: [], composition: null },

  // BIO
  { id: 1100, name: "BIO vejce M 10ks", unit: "ks", textualAmount: "10 ks", minPrice: 69, maxPrice: 89, category: "bio", categoryId: 300112, fresh: true, withoutAdditives: true, badges: ["BIO"], composition: { additiveScoreMax: 0, withoutAdditives: true } },
  { id: 1101, name: "BIO mléko plnotučné 1l", unit: "ks", textualAmount: "1 l", minPrice: 29, maxPrice: 42, category: "bio", categoryId: 300112, fresh: true, withoutAdditives: true, badges: ["BIO"], composition: { additiveScoreMax: 0, withoutAdditives: true } },

  // Vejce
  { id: 1110, name: "Vejce L 10ks volný chov", unit: "ks", textualAmount: "10 ks", minPrice: 49, maxPrice: 69, category: "vejce", categoryId: 300113, fresh: true, withoutAdditives: true, badges: [], composition: null },

  // Ryby
  { id: 1120, name: "Losos filet 200g", unit: "ks", textualAmount: "200 g", minPrice: 99, maxPrice: 149, category: "ryby", categoryId: 300114, fresh: true, withoutAdditives: true, badges: [], composition: null },

  // Koření
  { id: 1130, name: "Sůl mořská jemná 1kg", unit: "kg", textualAmount: "1 kg", minPrice: 19, maxPrice: 29, category: "koření", categoryId: 300115, fresh: false, withoutAdditives: true, badges: [], composition: null },
  { id: 1131, name: "Pepř černý mletý 20g", unit: "ks", textualAmount: "20 g", minPrice: 25, maxPrice: 39, category: "koření", categoryId: 300115, fresh: false, withoutAdditives: true, badges: [], composition: null },

  // Hotová jídla
  { id: 1140, name: "Pizza Ristorante Mozzarella 355g", unit: "ks", textualAmount: "355 g", minPrice: 79, maxPrice: 109, category: "hotova", categoryId: 300116, fresh: false, withoutAdditives: false, badges: [], composition: { additiveScoreMax: 6, withoutAdditives: false } },
  { id: 1141, name: "Tortellini šunka 250g", unit: "ks", textualAmount: "250 g", minPrice: 55, maxPrice: 79, category: "hotova", categoryId: 300116, fresh: false, withoutAdditives: false, badges: [], composition: { additiveScoreMax: 5, withoutAdditives: false } },

  // Mražené
  { id: 1150, name: "Hrášek mražený 450g", unit: "ks", textualAmount: "450 g", minPrice: 29, maxPrice: 42, category: "mrazene", categoryId: 300108, fresh: false, withoutAdditives: true, badges: [], composition: null },
  { id: 1151, name: "Hranolky mražené 1kg", unit: "kg", textualAmount: "1 kg", minPrice: 49, maxPrice: 69, category: "mrazene", categoryId: 300108, fresh: false, withoutAdditives: false, badges: [], composition: { additiveScoreMax: 2, withoutAdditives: false } },
]

// Staples — products appearing in most orders
const STAPLE_IDS = [1001, 1010, 1011, 1020, 1030, 1031, 1032, 1033, 1050, 1110]
// Frequent — appear in roughly half
const FREQUENT_IDS = [1002, 1012, 1013, 1014, 1021, 1040, 1041, 1042, 1070, 1071, 1080, 1081]
// Occasional
const OCCASIONAL_IDS = CATALOG.filter(p => !STAPLE_IDS.includes(p.id) && !FREQUENT_IDS.includes(p.id)).map(p => p.id)

// --- Generate orders ---

function generateOrders(): Order[] {
  const orders: Order[] = []
  // 28 orders over 7 months: Sep 2025 – Mar 2026
  const startDate = new Date(2025, 8, 3) // Sep 3
  let currentDate = new Date(startDate)
  let orderId = 900001

  for (let i = 0; i < 28; i++) {
    // Advance 5-12 days between orders
    const gap = intBetween(5, 12)
    currentDate = new Date(currentDate.getTime() + gap * 86400000)

    // Don't go past March 25, 2026
    if (currentDate > new Date(2026, 2, 25)) break

    const items: Order["items"] = []
    let itemIdCounter = 1

    // Always add staples (80% chance each)
    for (const pid of STAPLE_IDS) {
      if (rand() < 0.8) {
        const product = CATALOG.find(p => p.id === pid)!
        items.push(makeItem(product, itemIdCounter++, i))
      }
    }

    // Add frequent items (40% chance each)
    for (const pid of FREQUENT_IDS) {
      if (rand() < 0.4) {
        const product = CATALOG.find(p => p.id === pid)!
        items.push(makeItem(product, itemIdCounter++, i))
      }
    }

    // Add 2-5 occasional items
    const occasionalCount = intBetween(2, 5)
    const shuffled = [...OCCASIONAL_IDS].sort(() => rand() - 0.5)
    for (let j = 0; j < occasionalCount && j < shuffled.length; j++) {
      const product = CATALOG.find(p => p.id === shuffled[j])!
      items.push(makeItem(product, itemIdCounter++, i))
    }

    // Some items bought multiple times in same order
    if (rand() < 0.3 && items.length > 0) {
      const dupProduct = CATALOG.find(p => p.id === pick(items).id)
      if (dupProduct) {
        items.push(makeItem(dupProduct, itemIdCounter++, i))
      }
    }

    // Mark 1-2 items as compensated in ~30% of orders
    if (rand() < 0.3) {
      const compCount = intBetween(1, 2)
      for (let c = 0; c < compCount && c < items.length; c++) {
        const idx = intBetween(0, items.length - 1)
        items[idx].compensated = true
      }
    }

    const goodsTotal = items.reduce((sum, it) => sum + it.priceComposition.total.amount, 0)
    const roundedGoods = Math.round(goodsTotal * 100) / 100

    // Delivery: free if goods > 1200, otherwise 49-79
    const deliveryAmount = roundedGoods > 1200 ? 0 : pick([49, 59, 69, 79])
    const totalAmount = Math.round((roundedGoods + deliveryAmount) * 100) / 100

    const order: Order = {
      id: orderId++,
      itemsCount: items.length,
      orderTime: currentDate.toISOString(),
      priceComposition: {
        total: { amount: totalAmount, currency: "CZK" },
        unit: { amount: totalAmount, currency: "CZK" },
        goods: { amount: roundedGoods, currency: "CZK" },
        delivery: { amount: deliveryAmount, currency: "CZK" }
      },
      items
    }

    orders.push(order)
  }

  return orders
}

function makeItem(product: CatalogProduct, _seq: number, orderIndex: number): Order["items"][0] {
  // Price drifts slightly over time (simulate inflation/sales)
  const timeFactor = 1 + (orderIndex - 14) * 0.003 * (rand() > 0.5 ? 1 : -1)
  const basePrice = between(product.minPrice, product.maxPrice)
  const price = Math.round(basePrice * timeFactor * 100) / 100
  const amount = product.unit === "kg" ? between(0.5, 2) : intBetween(1, 3)
  const total = Math.round(price * amount * 100) / 100

  return {
    id: product.id,
    name: product.name,
    amount,
    unit: product.unit,
    textualAmount: product.textualAmount,
    compensated: false,
    priceComposition: {
      total: { amount: total, currency: "CZK" },
      unit: { amount: price, currency: "CZK" }
    }
  }
}

// --- Generate enrichment data ---

function generateEnrichment(orders: Order[]): { products: Record<number, EnrichedProduct>; alternatives: ProductAlternatives[] } {
  const productIds = new Set<number>()
  for (const order of orders) {
    for (const item of order.items) {
      productIds.add(item.id)
    }
  }

  const products: Record<number, EnrichedProduct> = {}

  for (const pid of productIds) {
    const cat = CATALOG.find(p => p.id === pid)!
    const categoryInfo = Object.values(CATEGORIES).find(c => c.id === cat.categoryId)!

    const categories: ApiCategory[] = [{
      id: cat.categoryId,
      name: categoryInfo.name,
      nameId: categoryInfo.name.toLowerCase().replace(/\s+/g, "-"),
      nameLong: categoryInfo.name,
      level: 0
    }]

    // Current price: slightly different from historical range
    const currentPrice = Math.round(between(cat.minPrice * 0.95, cat.maxPrice * 1.05) * 100) / 100

    // ~20% of products are on sale
    const onSale = rand() < 0.2
    const originalPrice = onSale ? Math.round(currentPrice * between(1.15, 1.35) * 100) / 100 : 0

    // ~10% are out of stock (discontinued)
    const inStock = rand() < 0.9

    products[pid] = {
      productId: pid,
      name: cat.name,
      categories,
      currentPrice,
      currentPricePerUnit: currentPrice,
      originalPrice,
      composition: cat.composition,
      badges: cat.badges,
      inStock
    }
  }

  // Generate alternatives for top 3 spend items
  const spendByProduct = new Map<number, number>()
  for (const order of orders) {
    for (const item of order.items) {
      spendByProduct.set(item.id, (spendByProduct.get(item.id) || 0) + item.priceComposition.total.amount)
    }
  }
  const topSpend = [...spendByProduct.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)

  const alternatives: ProductAlternatives[] = topSpend.map(([pid, totalSpend]) => {
    const product = CATALOG.find(p => p.id === pid)!
    const enriched = products[pid]

    return {
      productId: pid,
      name: product.name,
      yourAvgPrice: Math.round(totalSpend / (spendByProduct.get(pid) || 1) * 100) / 100,
      yourTotalSpend: Math.round(totalSpend * 100) / 100,
      purchaseCount: orders.filter(o => o.items.some(it => it.id === pid)).length,
      currentPrice: enriched.currentPrice,
      alternatives: [
        {
          productId: pid + 5000,
          name: `${product.name} (levnější varianta)`,
          currentPrice: Math.round(enriched.currentPrice * 0.75 * 100) / 100,
          currentPricePerUnit: Math.round(enriched.currentPrice * 0.75 * 100) / 100,
          categories: enriched.categories
        },
        {
          productId: pid + 5001,
          name: `${product.name} (privátní značka)`,
          currentPrice: Math.round(enriched.currentPrice * 0.6 * 100) / 100,
          currentPricePerUnit: Math.round(enriched.currentPrice * 0.6 * 100) / 100,
          categories: enriched.categories
        }
      ]
    }
  })

  return { products, alternatives }
}

// --- Main ---

const orders = generateOrders()
const enrichment = generateEnrichment(orders)

const output = JSON.stringify({ orders, enrichment }, null, 2)
console.log(output)

// Also print a summary
const totalSpend = orders.reduce((s, o) => s + o.priceComposition.total.amount, 0)
const itemCount = orders.reduce((s, o) => s + o.items.length, 0)
const productCount = new Set(orders.flatMap(o => o.items.map(i => i.id))).size
console.error(`Generated ${orders.length} orders, ${itemCount} items, ${productCount} unique products`)
console.error(`Total spend: ${Math.round(totalSpend).toLocaleString("cs-CZ")} Kč`)
console.error(`Date range: ${orders[0].orderTime.slice(0, 10)} — ${orders[orders.length - 1].orderTime.slice(0, 10)}`)
