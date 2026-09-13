# Studio Pricing Benchmark (English)

**Use it online:** https://poliinternational.com/studio-pricing-benchmark/  
**User guide:** [docs/USER-GUIDE.md](docs/USER-GUIDE.md)

> Professional reference utility published by **Poli International** for tattoo artists, body piercers, and studio owners. Available in 7 languages.

**[Languages: EN | DE | FR | ES | IT | PT | NL]** &bull; **[Network: Zero External Requests]** &bull; **[License: MIT]**

---

## Language Editions / Traductions / Übersetzungen / Traducciones / Traduzioni / Vertalingen

- [English (en)](docs/en/README.md)
- [Deutsch (de)](docs/de/README.md)
- [Français (fr)](docs/fr/README.md)
- [Español (es)](docs/es/README.md)
- [Italiano (it)](docs/it/README.md)
- [Português (pt)](docs/pt/README.md)
- [Nederlands (nl)](docs/nl/README.md)

---

## Overview

The **Studio Pricing Benchmark** is a zero-network-request, offline-capable reference tool engineered for commercial tattoo and body piercing studios. It allows studio owners and artists to systematically benchmark their rate cards across **nine global geographic markets**:

1. **UK (National Average)**: Rates outside Greater London across England, Scotland, and Wales.
2. **London / SE England**: Metropolitan commercial studios reflecting higher fixed operating overheads.
3. **United States (National Average)**: Average across urban and suburban commercial studios.
4. **Western Europe**: Metropolitan studios across France, Germany, Netherlands, Belgium, and Austria in EUR (€).
5. **Australia**: State capital cities (Sydney, Melbourne, Brisbane) and regional studios in AUD (A$).
6. **Central & Eastern Europe**: Urban studios in Poland, Czechia, Hungary, and Romania indexed in EUR (€).
7. **Canada** : Urban studios in Ontario, British Columbia, and Quebec in CAD (C$).
8. **South America**: Data rooted in custom studios in São Paulo, Rio de Janeiro (Brazil), and Buenos Aires (Argentina) in BRL (R$).
9. **South East Asia**: Professional studio hubs in Thailand (Bangkok, Phuket, Chiang Mai) and Bali (Indonesia) in THB (฿).

---

## Key Features

- **10 Core Industry Procedures**: 5 tattoo categories (Small, Half-Day, Full-Day, Hourly, Minimum) and 5 piercing categories (Lobe Pair, Nostril, Helix, Navel, Septum).
- **Explicit Confidence Indicators**:
  - `[INDICATIVE]`: An editorial estimate compiled by Poli International from publicly listed prices. Not a survey and not independently verified.
  - `[GAP / NO DATA]`: Intentionally left blank where reliable standardized listings do not exist.
- **Starter Jewellery Policies**: Clear documentation of regional norms (e.g. UK/EU/AU/SEA inclusion vs. US/Canada separate charging).
- **Interactive Price Evaluator & Alignment Metrics**: Enter your studio's rates to analyze alignment (Below Market, Market Rate, Premium) with summary KPI counters.
- **Visual Bar Chart**: Dynamic visual comparison chart plotting your rates directly against regional low and high market thresholds, with procedure category filtering (All, Tattoo, Piercing) and interactive tooltips.
- **Local Rate Persistence (`useStudioPricing` Hook)**: Automatically persists entered prices in `localStorage` (`poli_benchmark_user_prices_v1`) so your numbers remain pre-filled across page reloads and sessions.
- **Structured CSV Export**: Download your benchmark comparison as an RFC-4180 compliant CSV file for offline accounting, internal record-keeping, and studio partner reviews.
- **Your Rates panel**: hourly rate, minimum charge, shop minimum, deposit percentage and studio tier, each placed against the regional range.
- **What-If Rate Calculator**: adjust the hourly rate from -20% to +30% and see the booking total and deposit. Arithmetic on your input only.
- **Your Numbers handoff**: a copyable block of your rates, labelled as your decision, not a recommendation.
- **Printable Rate Card**: a one-page card from your own numbers.
- **Informative Header Tooltips**: Accessible tooltips explaining the statistical criteria for mid-market vs. premium specialist pricing, confidence ratings, and market positioning.
- **Accessibility**: Built with dynamic input ARIA labels and range descriptions, equivalent screen reader data table summaries for charts, and live region announcements.
- **Automated Vitest Test Suite**: 20 comprehensive unit tests verifying calculation formulas, regional data mappings, and alignment consistency across all nine markets.
- **Offline-First & Zero Network Requests**: Zero CDN scripts, remote fonts, or telemetry. Operates entirely in client memory.
- **7 Fully Localized Languages**: EN, DE, FR, ES, IT, PT, NL with 100% key parity.

---

## Embedding in Studio Websites

Embed the self-contained widget into your studio website or booking portal:

```html
<iframe
  src="/tools/studio-pricing-benchmark/index.html"
  width="100%"
  height="850"
  frameborder="0"
  style="border-radius:12px; border:1px solid var(--border); overflow:hidden;"
  title="Studio Pricing Benchmark">
</iframe>
```

The iframe automatically detects dark/light theme changes from the parent container via `postMessage` (`poli-theme`) or `localStorage` (`poli-dark-mode`).

---

## Biomedical Material Standards

All starter jewellery references adhere strictly to established biomedical specifications:
- **ASTM F-136**: Standard Specification for Wrought Titanium-6Aluminum-4Vanadium ELI for Surgical Implant Applications.
- **ASTM F-138**: Standard Specification for Wrought 18Chromium-14Nickel-2.5Molybdenum Stainless Steel for Surgical Implants.
- **EN 1811**: Reference test method for release of nickel from all post assemblies inserted into pierced parts of the human body.
- **ISO 10993**: Biological evaluation of medical devices.
- **EU REACH Annex XVII**: Nickel release restrictions.

---

## Privacy & Data Sovereignty

All calculations and entered rates remain strictly in the local browser session. No data is transmitted to remote servers.

---

## Documentation

- [Studio User Guide](docs/en/USER-GUIDE.md)
- [Technical Documentation](docs/en/TECHNICAL-DOCS.md)
- [Contributing Guide](docs/en/CONTRIBUTING.md)

---

## License

Published under the MIT License by Poli International.
