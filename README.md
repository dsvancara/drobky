# Drobky z Rohliku

**Kam mizi vase drobky?** Analyze your [Rohlik.cz](https://www.rohlik.cz) grocery order history — 100% locally in your browser.

Drobky fetches your delivered orders from Rohlik.cz and runs 23 analyses entirely in your browser. No servers, no tracking, no data leaves your machine.

## Features

**Overview** — total spend, order count, day-of-week patterns, basket size trends, order frequency, spending velocity

**Purchases** — monthly spending chart, top items by spend, most frequent items, delivery cost breakdown, compensation/substitution rate, impulse vs staple detection

**Prices** — price variation tracking, current vs historically paid prices, products currently on sale, personal inflation tracker

**Categories** — spend by category (pie chart), fresh vs processed food ratio over time, product variety score, seasonal product detection

**Tips** — health insights (fresh ratio, additives, protein diversity), cheaper alternatives, savings suggestions (expensive repeats, brand loyalty, price swings)

**Orders** — full order list with expandable item details, product links, compensation badges

**Export** — copy a ready-made prompt + data summary for ChatGPT/Claude analysis, or download raw JSON/CSV for your own tools

## Privacy

Drobky runs entirely in your browser as a Chrome extension. It:

- Fetches data directly from Rohlik.cz using your existing login session
- Stores everything in `chrome.storage.local` on your machine
- Makes zero requests to any third-party server
- Has no analytics, no telemetry, no tracking
- Contains no AI/LLM calls — all analysis is deterministic TypeScript (optional LLM export prepares data for you to paste into your own LLM)

## Install

### From Chrome Web Store

*(Coming soon)*

### From source

```bash
git clone https://github.com/dsvancara/drobky.git
cd drobky
pnpm install
pnpm build
```

Then load the `build/chrome-mv3-prod` directory as an unpacked extension in `chrome://extensions` (enable Developer mode).

## Usage

1. Log in to [rohlik.cz](https://www.rohlik.cz)
2. Click the Drobky extension icon
3. Select a date range and click "Analyzovat objednavky"
4. Once fetching completes, click "Zobrazit analyzu" to open the analysis page

## Tech stack

- [Plasmo](https://www.plasmo.com/) — Chrome extension framework
- React 18 + TypeScript
- Tailwind CSS with custom warm palette
- Recharts for data visualization
- Inter font (bundled locally via @fontsource)

## How it works

1. **Order list** — paginates `/api/v3/orders/delivered` to collect order IDs in the selected date range
2. **Order details** — fetches each order's items via `/api/v3/orders/{id}` (6 concurrent requests)
3. **Product enrichment** — batch-fetches current prices, stock status, and categories via `/api/v1/products/*` endpoints (50 products per batch)
4. **Alternatives** — for top-spend items, fetches similar products via `/api/v1/products/{id}/similar`
5. **Analysis** — 23 pure functions in `analyzer.ts` compute all insights from the fetched data

## License

MIT
