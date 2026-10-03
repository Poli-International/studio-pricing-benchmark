# Studio Pricing Benchmark Tool - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Schemas](#data-schemas)
3. [Calculation / Logic Algorithms](#calculation--logic-algorithms)
4. [API Reference](#api-reference)
5. [Integration Guide](#integration-guide)
6. [Customization](#customization)
7. [Performance](#performance)
8. [Browser Compatibility](#browser-compatibility)
9. [Security](#security)
10. [Version History](#version-history)
11. [Support / Contact](#support--contact)

---

## Architecture Overview

### Technology Stack

The Studio Pricing Benchmark Tool is a client-side React application bundled as a static asset set. It is served as a single HTML entry point that mounts a React root into `#root`.

| Layer | Technology | Source |
|---|---|---|
| Markup shell | Static HTML5 (`index.html`) | `index.html` |
| UI framework | React 19.2.8 (`react`, `react-dom/client`, `react/jsx-runtime`) | `assets/react-DGj8QgOs.js` |
| Icons | `lucide-react` v1.45.0 (Calculator, Check, Copy, Printer, SlidersVertical) | `assets/vendor-DGtxC7bf.js` |
| Styling | Tailwind CSS build plus two custom stylesheets and a print stylesheet | `css/tailwind.css`, `css/poli-standard.css`, `css/benchmark-style.css`, `css/print.css` |
| Application logic | Single ES module bundle | `assets/index-DsNWzgcZ.js` |
| Persistence | Browser `localStorage` (theme key `poli-dark-mode`; user prices/rates saved in the browser) | `index.html`, `documentation.html` |

The tool is dependency-free in the sense that it ships no server-side component and makes no network calls for its data. All region, service, and range data is compiled into the JavaScript bundle.

### File Structure

```
/tools/studio-pricing-benchmark/
├── index.html                          # Entry point, theme sync, mounts #root
├── documentation.html                  # Standalone documentation page
├── css/
│   ├── tailwind.css
│   ├── poli-standard.css
│   ├── benchmark-style.css
│   └── print.css                       # media="print"
└── assets/
    ├── index-DsNWzgcZ.js               # Application bundle (regions, services, i18n, logic)
    ├── react-DGj8QgOs.js               # React runtime
    ├── vendor-DGtxC7bf.js              # lucide-react icon components
    └── index-DZig5v02.css              # Bundled component styles
```

### Component / Logic Breakdown

- **Theme bridge (`index.html`, inline script).** When the page is embedded in an iframe (`window.self !== window.top`), it reads the parent's `light-mode` class, seeds `localStorage['poli-dark-mode']`, and applies `data-theme`, `dark` class, and `dark-mode` / `light-mode` body classes. It listens for `postMessage` events of type `poli-theme` and reloads the iframe only when the requested theme differs from the currently stored one.
- **Data layer (`index-DsNWzgcZ.js`).** Two top-level constants define the benchmark:
  - `H` (regions): a map of nine region objects keyed by `uk`, `london`, `us`, `eu`, `au`, `cee`, `ca`, `sa`, `sea`.
  - `W` (services): a map keyed by the same region IDs, each holding an array of ten service objects (five tattoo, five piercing).
- **Localization layer (`index-DsNWzgcZ.js`).** A `B` object keyed by language code (`en`, plus `de`, `fr`, `es`, `it`, `pt`, `nl` per the language switcher labels) holds all UI strings, region names, coverage notes, jewellery policies, service names/subtitles, confidence labels, and basis notes.
- **UI layer.** React components render the Benchmark Table, the Compare My Prices view, the Your Rates panel, the What-If Rate Calculator, the Your Numbers handoff block, the printable rate card, the visual comparison chart, the CSV export, and the Embed tab.

---

## Data Schemas

### Region Object (`H`)

Each entry in `H` is keyed by region ID and has this shape:

```js
{
  id: "uk",
  nameKey: "region.uk.name",
  currency: "£",
  currencyCode: "GBP",
  symbol: "£",
  coverageNoteKey: "region.uk.coverage",
  jewelleryPolicyKey: "jewellery.uk.policy"
}
```

The nine regions and their currencies:

| Key | `id` | `currency` / `currencyCode` | `symbol` |
|---|---|---|---|
| `uk` | `uk` | `£` / `GBP` | `£` |
| `london` | `london` | `£` / `GBP` | `£` |
| `us` | `us` | `$` / `USD` | `$` |
| `eu` | `eu` | `€` / `EUR` | `€` |
| `au` | `au` | `A$` / `AUD` | `A$` |
| `cee` | `cee` | `€` / `EUR` | `€` |
| `ca` | `ca` | `C$` / `CAD` | `C$` |
| `sa` | `sa` | `R$` / `BRL` | `R$` |
| `sea` | `sea` | `฿` / `THB` | `฿` |

### Service Object (`W[regionId][n]`)

Each service row has this shape:

```js
{
  id: "tattoo_small",
  nameKey: "service.tattoo_small.name",
  subKey: "service.tattoo_small.sub",
  category: "tattoo",          // "tattoo" | "piercing"
  currency: "£",
  min: 80,
  max: 200,
  confidence: "INDICATIVE",    // "INDICATIVE" | "GAP"
  basisKey: "basis.uk.tattoo_small",
  jewelleryNoteKey: "jewellery.included.titanium"  // piercing rows only
}
```

Service IDs present in every region:

- Tattoo: `tattoo_small`, `tattoo_half_day`, `tattoo_full_day`, `tattoo_hourly`, `tattoo_minimum`
- Piercing: `piercing_earlobe`, `piercing_nostril`, `piercing_helix`, `piercing_navel`, `piercing_septum`

`jewelleryNoteKey` appears only on piercing rows. Its values across regions are `jewellery.included.titanium`, `jewellery.included.standard`, `jewellery.included.basic`, and `jewellery.excluded.fee_only`.

### GAP Rows

Two rows carry `confidence: "GAP"` with `min: null` and `max: null`:

- `W.sa` → `piercing_septum` (`basisKey: "basis.gap.septum"`)
- `W.sea` → `piercing_septum` (`basisKey: "basis.gap.septum"`)

### Example Range Values

| Region | Service | `min` | `max` |
|---|---|---|---|
| `uk` | `tattoo_small` | 80 | 200 |
| `uk` | `tattoo_full_day` | 550 | 1100 |
| `london` | `tattoo_hourly` | 120 | 250 |
| `us` | `tattoo_full_day` | 700 | 1600 |
| `eu` | `tattoo_half_day` | 300 | 650 |
| `au` | `tattoo_hourly` | 150 | 300 |
| `cee` | `tattoo_minimum` | 30 | 60 |
| `ca` | `tattoo_full_day` | 800 | 1800 |
| `sa` | `tattoo_full_day` | 1100 | 2600 |
| `sea` | `tattoo_full_day` | 10000 | 22000 |

### Localization Object (`B`)

`B` is keyed by language code. The `en` entry contains the following string groups (all consumed via `nameKey`, `subKey`, `basisKey`, `coverageNoteKey`, and `jewelleryPolicyKey` lookups):

- `app.*`: title, subtitle, badge, nav labels (`nav_benchmark`, `nav_calculator`, `nav_docs`, `nav_embed`), footnote, `open_standalone`, `print`
- `lang.*`: switcher label and language names
- `common.*`: currency, copy, copied, download, close, all, back
- `region.*`: label, `all_regions`, `coverage_scope`, and per-region `name` / `coverage`
- `jewellery.*`: `policy_label`, `standards_badge`, `policy_desc`, per-region `policy`, and the four inclusion note strings
- `service.*`: per-service `name` and `sub`
- `conf.*`: `indicative`, `no_data`, `indicative_desc`, `gap_desc`
- `basis.*`: per-region, per-service basis notes plus `basis.gap.septum`

---

## Calculation / Logic Algorithms

The tool performs only arithmetic on user-entered numbers. It does not model or predict market behaviour. The following describes the logic the source code implements.

### 1. Region Selection

Selecting a region sets the active key in `H`, which switches the displayed currency symbol and the service array used for every subsequent comparison. Each region also surfaces its `coverageNoteKey` and `jewelleryPolicyKey` text.

### 2. Price Comparison (Compare My Prices)

For each service the user has priced, the tool compares the entered value against the service row's `min` and `max`:

1. If `confidence === "GAP"` (i.e. `min` and `max` are `null`), the row is labelled **Data Gap**.
2. Else if `yourPrice < min`, the row is labelled **Below Market**.
3. Else if `yourPrice > max`, the row is labelled **Premium**.
4. Otherwise (`min <= yourPrice <= max`), the row is labelled **Market Rate**.

A summary then counts how many of the user's services fall into each of the four positions.

### 3. Your Rates Panel

The panel takes four user inputs:

- Hourly rate
- Minimum charge
- Shop minimum
- Deposit percentage

It also takes a **studio tier** selection from four options: Apprentice, Resident Artist, Established Artist, Specialist / Guest Artist. The tier only adds a descriptive label; it does not modify any figure.

The panel then places the hourly rate and the shop minimum against the region's corresponding range using the same below / within / above logic as the price comparison.

### 4. What-If Rate Calculator

The calculator exposes a slider from **-20%** to **+30%** and a booking length in hours (default `2`). Given an adjustment percentage `p` and the user's hourly rate `r`:

- Adjusted hourly rate = `r * (1 + p / 100)`
- Booking price = `adjustedHourlyRate * hours`
- Deposit due = `bookingPrice * (depositPercentage / 100)`

The output is arithmetic on the user's own numbers only.

### 5. Your Numbers Handoff

A plain-text block is assembled from the user's hourly rate, minimum charge, shop minimum, deposit percentage, and tier. Any field left blank renders as a dash (`-`); no default figure is substituted. The block is labelled as the user's decision, not a tool recommendation.

### 6. Printable Rate Card

The print stylesheet (`css/print.css`, loaded with `media="print"`) renders a one-page Studio Rate Card in A4 or US Letter format, dated with today's date, containing only the user's own figures and service prices. The regional ranges are excluded from the card.

### 7. Visual Comparison Chart

After a comparison is run, a bar chart plots the user's price for each service alongside the range's `min` and `max`. The chart can be filtered to **All Procedures**, **Tattoo Only**, or **Piercing Only**, matching the `category` field on each service object.

### 8. CSV Export

Export produces a CSV containing, per row: region, service, currency, range (`min`–`max`), confidence, basis note, jewellery policy, the user's price, and its position (Below Market / Market Rate / Premium / Data Gap).

### 9. Persistence

User prices and rates are written to the browser's `localStorage`. Clearing site data removes them. The theme bridge additionally uses the key `poli-dark-mode`.

---

## API Reference

The tool exposes no public JavaScript API. The following are the real internal handlers and constants referenced in the source.

### Constants

| Name | Type | Description |
|---|---|---|
| `H` | `Object<string, Region>` | Region definitions keyed by region ID. |
| `W` | `Object<string, Service[]>` | Service arrays keyed by region ID. |
| `B` | `Object<string, Object>` | Localization strings keyed by language code. |

### Theme Bridge Handlers (`index.html`)

| Handler | Parameters | Behaviour |
|---|---|---|
| `poliSeed(light)` | `light: boolean` | Writes `'light'` or `'dark'` to `localStorage['poli-dark-mode']`. |
| `poliApplyChrome(light)` | `light: boolean` | Sets `data-theme` on `<html>`, toggles the `dark` class, and toggles `dark-mode` / `light-mode` on `<body>`. |
| `window.addEventListener('message', handler)` | `event.data.type === 'poli-theme'`, `event.data.light: boolean` | Re-seeds and re-applies the theme; reloads the iframe if the requested theme differs from the currently stored one. |

### User-Facing Actions

| Action | Input | Output |
|---|---|---|
| Compare My Prices | Per-service price entries | Per-row position label plus a summary count. |
| Clear All Rates | None | Empties every price the user entered. |
| Copy (Your Numbers) | None | Copies the plain-text handoff block to the clipboard. |
| Print Benchmark | None | Triggers the print stylesheet. |
| Export CSV | None | Downloads the comparison as a CSV file. |
| Region selector | One of nine region IDs | Switches currency and active service array. |
| Language switcher | One of `en`, `de`, `fr`, `es`, `it`, `pt`, `nl` | Switches UI strings via `B`. |
| Studio tier selector | Apprentice / Resident Artist / Established Artist / Specialist / Guest Artist | Adds a descriptive label only. |
| What-If slider | `-20` to `+30` (percent) | Adjusted rate, booking price, deposit. |
| Booking length input | Hours (default `2`) | Used by the What-If calculator. |
| Chart filter | All Procedures / Tattoo Only / Piercing Only | Filters the bar chart. |

---

## Integration Guide

### Standalone Use

Open the live URL directly:

```
https://poliinternational.com/tools/studio-pricing-benchmark/
```

The page loads `index.html`, which mounts the React bundle into `#root`. No build step, server, or external API is required at runtime.

### Iframe Embedding

The tool is designed to be embedded. When `window.self !== window.top`, the inline theme bridge activates:

1. It reads the parent document's `light-mode` class (wrapped in a `try/catch` for cross-origin safety).
2. It seeds `localStorage['poli-dark-mode']` and applies the matching theme to the iframe.
3. It listens for `postMessage` events shaped as `{ type: 'poli-theme', light: boolean }` and reloads the iframe only when the requested theme differs from the stored one.

The **Embed** tab in the tool provides a code snippet for placing it on another site.

### Theme Contract

| Message | Payload | Effect |
|---|---|---|
| `poli-theme` | `{ type: 'poli-theme', light: true }` | Switches to light mode. |
| `poli-theme` | `{ type: 'poli-theme', light: false }` | Switches to dark mode. |

The storage key used for theme persistence is `poli-dark-mode`.

### Dependencies

The tool ships as static HTML, CSS, and JavaScript. It has no server-side dependency and no runtime data fetch. React and `lucide-react` are bundled locally under `assets/`.

---

## Customization

- **Adding or editing ranges.** Edit the `W` constant in `assets/index-DsNWzgcZ.js`. Each entry follows the service object schema above. To mark a row as having no reliable data, set `min` and `max` to `null` and `confidence` to `"GAP"`.
- **Adding a region.** Add an entry to `H` with `id`, `nameKey`, `currency`, `currencyCode`, `symbol`, `coverageNoteKey`, and `jewelleryPolicyKey`, then add a matching array of service objects under the same key in `W`, and add the corresponding strings to each language in `B`.
- **Editing copy.** All user-visible strings live in `B`. Region names, coverage notes, jewellery policies, service names/subtitles, confidence labels, and basis notes are all keyed there.
- **Styling.** Component styles are bundled in `assets/index-DZig5v02.css`; layout overrides live in `css/benchmark-style.css`; print output is controlled by `css/print.css`.

---

## Performance

- The application is a single-page React bundle with no runtime data fetching, so first render depends only on the bundle and stylesheets loading.
- Region and service data are compiled into the bundle as plain objects, so switching regions and running comparisons are synchronous in-memory operations.
- The theme bridge performs a single `localStorage` read/write pair on load and on each `poli-theme` message, and reloads the iframe only when the theme actually changes.

---

## Browser Compatibility

- The theme bridge uses `localStorage`, `classList`, `postMessage`, and `MutationObserver` (via the module preload polyfill in the bundle). These are supported in all current evergreen browsers.
- Cross-origin access to the parent document is wrapped in `try/catch`, so the tool degrades gracefully when embedded from a different origin.
- The print stylesheet is loaded with `media="print"` so it does not affect on-screen rendering.

---

## Security

- **No server transmission.** All input is processed in the browser. Nothing the user enters is sent anywhere.
- **No dynamic HTML injection.** The source defines UI strings as plain text in the `B` object and renders them through React, which escapes text by default. No `innerHTML` or `dangerouslySetInnerHTML` is present in the provided source.
- **Cross-origin isolation.** Parent-document reads are wrapped in `try/catch`, and the `postMessage` handler checks `e.data.type === 'poli-theme'` before acting.
- **Local persistence only.** User prices, rates, and theme preference are stored in the browser's `localStorage` under the tool's own keys and are removed when the user clears site data.

---

## Version History

### 1.0.0

- Initial release of the Studio Pricing Benchmark Tool.
- Nine reference regions: UK (national average), London / South East England, US (national average), Western Europe, Australia, Central & Eastern Europe, Canada, South America, and South East Asia.
- Ten service rows per region (five tattoo, five piercing) with `min` / `max` ranges and `INDICATIVE` or `GAP` confidence labels.
- Compare My Prices with Below Market / Market Rate / Premium / Data Gap positions and a summary count.
- Your Rates panel (hourly rate, minimum charge, shop minimum, deposit percentage) with studio tier selection.
- What-If Rate Calculator with a -20% to +30% slider and booking length input.
- Your Numbers plain-text handoff with Copy.
- Printable one-page Studio Rate Card (A4 / US Letter).
- Visual comparison bar chart with All Procedures / Tattoo Only / Piercing Only filters.
- CSV export of the full comparison.
- Interface languages: English, French, German, Spanish, Italian, Dutch, Portuguese.
- Browser-local persistence of user prices and rates.
- Iframe embedding with `poli-theme` postMessage theme sync.

---

## Support / Contact

For questions about the Studio Pricing Benchmark Tool, contact:

**support@poliinternational.com**

The tool compares prices only. It is not financial or business advice, and the ranges are editorial estimates compiled from publicly listed prices, not survey data.
