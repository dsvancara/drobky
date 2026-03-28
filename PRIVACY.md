# Privacy Policy — Drobky z Rohlíku

**Last updated:** March 28, 2026

## Summary

Drobky z Rohlíku does not collect, transmit, or share any user data. All data processing happens locally in your browser.

## Data collection

Drobky does **not** collect any personal data, analytics, telemetry, or usage statistics. There are no third-party services, tracking pixels, or external API calls beyond Rohlik.cz itself.

## Data storage

All data (order history, product enrichment, analysis results) is stored exclusively in `chrome.storage.local` on your device. Nothing is sent to any external server.

## Network requests

Drobky makes requests only to `www.rohlik.cz` API endpoints, using your existing authenticated session, to fetch your order history and current product information. No other network requests are made.

## Permissions

- **`host_permissions` (`https://www.rohlik.cz/*`)** — required to fetch your order data from the Rohlik.cz API
- **`storage`** — required to save fetched orders locally in your browser

## Data sharing

Your data is never shared with anyone. There are no servers, no databases, no accounts, and no registration.

## AI / LLM export

The optional export feature prepares a data summary that you can manually copy and paste into an LLM of your choice (e.g., ChatGPT, Claude). This is entirely user-initiated — Drobky never sends data to any AI service automatically.

## Data deletion

All data can be deleted by removing the extension or by clearing the extension's storage via `chrome://extensions`.

## Changes

If this policy changes, the update will be posted here.

## Contact

For questions, open an issue at [github.com/dsvancara/drobky](https://github.com/dsvancara/drobky).
