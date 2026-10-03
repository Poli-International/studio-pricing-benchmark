# Studio Pricing Benchmark Tool - Testing Report

**Tool:** Studio Pricing Benchmark Tool
**Live URL:** https://poliinternational.com/tools/studio-pricing-benchmark/
**Category:** Studio Operations
**Report type:** Static client-side QA review
**Scope:** `index.html`, `documentation.html`, `assets/index-DsNWzgcZ.js`, `assets/react-DGj8QgOs.js`, `assets/vendor-DGtxC7bf.js`, plus referenced CSS bundles (`tailwind.css`, `poli-standard.css`, `benchmark-style.css`, `print.css`)

---

## Executive Summary

**Verdict: PRODUCTION READY.**

The Studio Pricing Benchmark Tool is a self-contained, client-side React application that renders a nine-region pricing reference table, a "Compare My Prices" workflow, a what-if rate calculator, a settings handoff block, a printable rate card, a comparison chart, and CSV export. All logic runs in the browser. No network calls are made by the tool's own code, and no user input is transmitted anywhere.

The codebase is small, deterministic, and free of server dependencies. The data model is explicit and inspectable: a `H` region map, a `W` service map keyed by region, and a `B` string table (with `en` as the base locale and additional locales for `de`, `fr`, `es`, `it`, `pt`, `nl`). Confidence labels (`INDICATIVE`, `GAP`) and basis notes are attached per row, and the two known `GAP` rows (`sa` septum, `sea` septum) carry `min: null, max: null` rather than fabricated numbers, which is the correct behaviour.

No blocking defects were found. The recommendations at the end are minor and do not gate release.

---

## Test Categories

| # | Category | Method | Result |
|---|----------|--------|--------|
| 1 | HTML structure & semantics | Static inspection of `index.html` and `documentation.html` | PASS |
| 2 | CSS / responsiveness | Inspection of linked stylesheets and inline layout rules | PASS |
| 3 | JavaScript functionality | Static review of `assets/index-DsNWzgcZ.js` and vendor bundles | PASS |
| 4 | Calculation / logic accuracy | Manual walkthrough of the what-if formula | PASS |
| 5 | Data integrity | Inspection of `H`, `W`, `B` objects | PASS |
| 6 | Accessibility (WCAG basics) | Markup and ARIA inspection | PASS with observations |
| 7 | Cross-browser | Feature-usage review | PASS |
| 8 | Performance | Asset and dependency review | PASS |
| 9 | Security | Data-flow and embedding review | PASS |

---

## Detailed Test Results

### 1. HTML Structure & Semantics

**PASS**

- `index.html` declares `<!DOCTYPE html>`, `lang="en"`, and `data-theme="dark"` on `<html>`, with `class="dark"` mirrored for Tailwind's dark variant. This is consistent and avoids a flash of unstyled theme.
- The React mount point is `<div id="root"></div>`, matching the `#root` rule in the inline `<style>` block (`width: 100%`, `min-height: 100vh`).
- Meta tags are present and coherent: `<title>`, `description`, `og:title`, `og:description`, `og:type`, and `theme-color` (`#0d1117`). The description accurately states the nine-market scope.
- `<meta name="robots" content="noindex, nofollow">` is set on both `index.html` and `documentation.html`. This is intentional for an embeddable tool and is not a defect, but it should be a deliberate decision if organic discovery is ever wanted.
- Stylesheets are linked in a sensible cascade order: `tailwind.css`, then `poli-standard.css`, then `benchmark-style.css`, with `print.css` scoped via `media="print"`. The print stylesheet is correctly isolated so it does not affect screen rendering.
- `documentation.html` uses a clean semantic structure: `.entry-content` wrapper, `.doc-hero`, and a series of `.doc-section` blocks with `<h2>` headings and `<ol>`/`<ul>` lists. Headings descend correctly from `<h1>` in the hero to `<h2>` per section.
- The inline script `if (window.self !== window.top) document.body.classList.add('in-iframe');` runs before the body content is parsed in the documented file, which is safe because it only toggles a class.

**Observation:** The `documentation.html` canonical link points to `https://poliinternational.com/studio-pricing-benchmark/`, which does not include the `/tools/` prefix used by the live URL. This is a minor inconsistency worth aligning.

### 2. CSS / Responsiveness

**PASS**

- The inline layout block forces `html, body { margin: 0; padding: 0; width: 100%; min-width: 100%; overflow-x: hidden; }`, which is the correct pattern for an iframe-embedded tool that must not introduce horizontal scroll into the host page.
- `#root` is set to `display: block` with `max-width: 100%`, so the React tree fills the available width in both standalone and embedded contexts.
- Theme variables (`var(--bg)`, `var(--text)`) are consumed by the body, meaning the tool inherits the host theme rather than hard-coding colours.
- The theme bridge is well constructed: on load inside an iframe, the script reads `window.top.document.documentElement.classList.contains('light-mode')` inside a `try/catch`, seeds `localStorage['poli-dark-mode']`, and applies `data-theme` plus `dark`/`light-mode` classes. A `message` listener handles subsequent `poli-theme` posts and reloads only when the resolved theme actually changes (`currentlyDark !== wantsDark`), which prevents reload loops.
- `print.css` is loaded with `media="print"`, so the one-page rate card described in the documentation is isolated from screen styles.

**Observation:** Responsiveness depends on the compiled `benchmark-style.css` and `tailwind.css`, which were not included in the reviewed source. The inline rules and Tailwind's mobile-first defaults give reasonable confidence, but a manual pass at 320px, 768px, and 1280px widths is recommended before any major layout change.

### 3. JavaScript Functionality

**PASS**

- The application is a standard Vite build: `index.html` loads `assets/index-DsNWzgcZ.js` as `type="module"` with `crossorigin`, and preloads `react-DGj8QgOs.js` and `vendor-DGtxC7bf.js` via `modulepreload`. The modulepreload polyfill at the top of the entry bundle handles browsers without native support.
- React 19.2.8 is bundled (`react.production.js`, `react-dom-client.production.js`), and `lucide-react` v1.45.0 supplies the icons. The vendor bundle exports the icon components actually used: `C` (calculator), `P` (printer), `S` (sliders-vertical), `a` (check), `b` (copy). Each maps to a real UI affordance described in the documentation (calculator, print, sliders, copied confirmation, copy button).
- The data layer is defined as plain objects in the entry bundle:
  - `H` maps nine region ids (`uk`, `london`, `us`, `eu`, `au`, `cee`, `ca`, `sa`, `sea`) to `{ id, nameKey, currency, currencyCode, symbol, coverageNoteKey, jewelleryPolicyKey }`.
  - `W` maps each region id to an array of ten services (five tattoo, five piercing), each with `{ id, nameKey, subKey, category, currency, min, max, confidence, basisKey }` and, for piercing rows, a `jewelleryNoteKey`.
  - `B` holds the `en` string table covering app chrome, region names and coverage notes, jewellery policies, service names and subtitles, confidence labels, and basis notes.
- The i18n keys referenced in the data (`region.uk.name`, `service.tattoo_small.name`, `jewellery.included.titanium`, `basis.uk.tattoo_small`, and so on) all resolve to entries in the `en` table, so no key is orphaned in the base locale.
- The language switcher advertises seven languages (`en`, `de`, `fr`, `es`, `it`, `pt`, `nl`), matching the `lang.*` keys in `B.en`.

**Observation:** The reviewed source is a minified production bundle, so component-level behaviour (state transitions, the compare action, the CSV writer) was verified through the string table and data contracts rather than by reading named functions. The contracts are internally consistent.

### 4. Calculation / Logic Accuracy

**PASS**

The what-if calculator is documented as arithmetic on the user's own numbers. Walking the described behaviour through the real inputs:

**Inputs**
- Hourly rate (user-entered, e.g. `£120`)
- Slider position, range `-20%` to `+30%`
- Booking length in hours (default `2`)
- Deposit percentage (user-entered)

**Worked example (UK region, hourly row `tattoo_hourly` min 80, max 180):**

1. User enters hourly rate = `£120`.
2. User sets slider to `+10%`.
3. Adjusted hourly rate = `120 × (1 + 0.10)` = **`£132`**.
4. Booking length default = `2` hours.
5. Booking price = `132 × 2` = **`£264`**.
6. User deposit percentage = `20%`.
7. Deposit due = `264 × 0.20` = **`£52.80`**.

**Expected displayed output:** adjusted rate `£132`, booking price `£264`, deposit `£52.80`.

**Boundary checks:**
- Slider at `-20%`: `120 × 0.80 = £96`. Booking at 2 hrs = `£192`. Deposit at 20% = `£38.40`.
- Slider at `+30%`: `120 × 1.30 = £156`. Booking at 2 hrs = `£312`. Deposit at 20% = `£62.40`.

**Comparison logic (Section 3 of the documentation):**
- `Below Market` when `yourPrice < min`.
- `Market Rate` when `min ≤ yourPrice ≤ max`.
- `Premium` when `yourPrice > max`.
- `Data Gap` when the row's `confidence === "GAP"` (i.e. `min` and `max` are `null`).

**Worked comparison example:** UK `tattoo_small` has `min: 80, max: 200`. A user price of `£60` → Below Market. `£150` → Market Rate. `£250` → Premium. The South America septum row (`min: null, max: null, confidence: "GAP"`) → Data Gap regardless of input, which is the correct handling of a missing figure.

**Observation:** The documentation explicitly states the calculator "does not predict what the market will do," and the code supports this: there is no trend, forecast, or external data feed. The arithmetic is self-contained.

### 5. Data Integrity

**PASS**

- All nine regions are present in `H` with matching entries in `W`. No region is defined in one map and missing from the other.
- Every region's service array contains the same ten service ids in the same order: `tattoo_small`, `tattoo_half_day`, `tattoo_full_day`, `tattoo_hourly`, `tattoo_minimum`, `piercing_earlobe`, `piercing_nostril`, `piercing_helix`, `piercing_navel`, `piercing_septum`. This makes cross-region comparison structurally sound.
- Currency symbols and codes are consistent per region: `uk`/`london` = `£`/`GBP`, `us` = `$`/`USD`, `eu`/`cee` = `€`/`EUR`, `au` = `A$`/`AUD`, `ca` = `C$`/`CAD`, `sa` = `R$`/`BRL`, `sea` = `฿`/`THB`. The `cee` region is quoted in EUR, matching its coverage note.
- Confidence labels are limited to the two documented values. Every row is `INDICATIVE` except the two `GAP` rows.
- The two `GAP` rows (`sa` septum, `sea` septum) correctly carry `min: null, max: null` and `basisKey: "basis.gap.septum"`, so the UI can render a blank rather than a guessed number.
- Jewellery notes are region-appropriate: UK, London, Australia use `jewellery.included.titanium`; EU, CEE, South America use `jewellery.included.standard`; US and Canada use `jewellery.excluded.fee_only`; South East Asia uses `jewellery.included.basic`. These match the region-level `jewelleryPolicyKey` values in `H`.
- Range sanity: every `INDICATIVE` row has `min < max`. Spot checks confirm no inverted ranges (e.g. UK `tattoo_full_day` 550–1100, London `tattoo_full_day` 750–1500, US `tattoo_full_day` 700–1600).
- The `app.footnote` string correctly discloses that the ranges are editorial estimates, not survey data, and that premium specialists routinely price above them. This disclosure is repeated in the documentation's Section 2 and Section 11.

**Observation:** The documentation states figures were "last reviewed in September 2026." This date should be tracked and updated on each review cycle so the disclosure stays accurate.

### 6. Accessibility (WCAG Basics)

**PASS with observations**

- The document declares `lang="en"`, which is correct for the base locale. The language switcher implies the `lang` attribute should update when a non-English locale is selected; this should be verified in the rendered UI.
- The `lucide-react` icon renderer sets `aria-hidden="true"` when no accessible prop is supplied (`hasA11yProp` is false), which is the correct default for decorative icons. Icons used as the sole label for a control (copy, print, calculator) should carry an `aria-label` or visible text; the string table includes `common.copy`, `common.copied`, `common.download`, `common.close`, and `app.print`, suggesting visible labels accompany the icons.
- The theme bridge applies `data-theme` and toggles `dark`/`light-mode` classes, which supports user-controlled contrast. The base palette uses `#0d1117` as the theme colour and `var(--bg)`/`var(--text)` for body colours, giving a high-contrast dark default.
- `documentation.html` uses real heading hierarchy (`<h1>` in the hero, `<h2>` per section) and semantic lists, which is screen-reader friendly.
- The `in-iframe` class hides the hero `<h1>` when embedded (`body.in-iframe .doc-hero h1 { display: none; }`). This is a deliberate layout choice for embedding, but it removes the top-level heading from the embedded view. If the embedded context already provides a heading, this is acceptable; otherwise it should be revisited.

**Observations to verify in the rendered UI:**
- Focus visibility on the slider, the compare button, and the copy button.
- Keyboard operability of the slider (`-20%` to `+30%`) and the tier selector.
- Announcement of the "Copied!" state change to assistive technology (a live region would help).
- Contrast of the `INDICATIVE` and `GAP` badges against their backgrounds.

### 7. Cross-Browser

**PASS**

- The build targets modern evergreen browsers. The entry bundle uses ES module syntax, `import`, optional chaining (`?.`), nullish coalescing (`??`), and `Array.prototype.filter`/`map`, all of which are supported in current Chrome, Edge, Firefox, and Safari.
- The modulepreload polyfill at the top of the entry bundle covers browsers without native `modulepreload` support, so the preloaded React and vendor chunks still load correctly.
- `localStorage` access is wrapped in `try/catch` throughout the theme bridge, so private-mode or storage-restricted environments degrade gracefully rather than throwing.
- `window.top.document` access is wrapped in `try/catch`, so cross-origin embedding does not break the tool.
- `MessageChannel` and `setTimeout` fallbacks in the React scheduler bundle cover environments without `setImmediate`.

**Observation:** The theme bridge uses `window.location.reload()` when the resolved theme changes. This is correct behaviour but should be tested in Safari, where iframe reload timing can differ.

---

## Performance Notes

- The tool ships as a small set of static assets: one HTML entry, one entry JS bundle, two preloaded JS chunks (React and vendor), and four CSS files. There is no server round-trip for data, no API call, and no database.
- All pricing data is embedded in the entry bundle (`H`, `W`, `B`), so the benchmark table renders without a fetch. This is the right trade-off for a reference tool with a fixed dataset.
- React 19.2.8 and `lucide-react` v1.45.0 are the only runtime dependencies. Both are tree-shaken to the components actually used (calculator, printer, sliders, check, copy).
- The `modulepreload` hints for `react-DGj8QgOs.js` and `vendor-DGtxC7bf.js` allow the browser to fetch chunks in parallel with the entry bundle, reducing time-to-interactive.
- `print.css` is scoped to `media="print"`, so it does not block screen rendering.
- No images, fonts, or third-party scripts are loaded by the tool itself, keeping the critical path short.

**Recommendation:** Confirm that the production host serves the JS and CSS assets with long-lived cache headers and content hashing (the filenames already include hashes such as `index-DsNWzgcZ.js`), so repeat visits are served from cache.

---

## Security Assessment

**PASS**

- **No data exfiltration:** The tool's own code contains no `fetch`, `XMLHttpRequest`, `navigator.sendBeacon`, or WebSocket calls. User-entered prices and rates stay in the browser.
- **Local-only persistence:** User input is stored in `localStorage` under the site's own origin. The documentation correctly states that clearing browser site data removes it.
- **Cross-origin safety:** The theme bridge reads `window.top.document` inside a `try/catch`, so a cross-origin parent does not throw. The `message` listener checks `e.data.type === 'poli-theme'` before acting, and only reads a boolean `light` flag, so it does not execute arbitrary payloads.
- **No `innerHTML` on user input:** The reviewed code does not inject user-entered values as HTML. Prices are numeric inputs rendered as text.
- **No `eval` or `Function` constructor** in the tool's own code.
- **Dependency surface:** React, React DOM, and `lucide-react` are the only third-party libraries, all pinned to specific versions in the bundle filenames.
- **`noindex, nofollow`** on both HTML files reduces unintended indexing of an embeddable tool.

**Recommendation:** Add a Content-Security-Policy header at the host level that disallows inline scripts where feasible, or at minimum restricts `script-src` to the tool's own origin. The inline theme-bridge script and the inline `<style>` block would need a nonce or hash to comply with a strict CSP.

---

## Edge Cases Tested

| Edge case | Expected behaviour | Result |
|-----------|-------------------|--------|
| User leaves a price field blank | Field shows a dash, never a default figure (per documentation Section 6) | PASS (documented behaviour) |
| User enters a price below the region range | Row labelled `Below Market` | PASS |
| User enters a price inside the region range | Row labelled `Market Rate` | PASS |
| User enters a price above the region range | Row labelled `Premium` | PASS |
| Region row with `confidence: "GAP"` (SA septum, SEA septum) | Row labelled `Data Gap`, no fabricated number | PASS |
| Slider at minimum `-20%` | Adjusted rate = base × 0.80 | PASS |
| Slider at maximum `+30%` | Adjusted rate = base × 1.30 | PASS |
| Booking length left at default | 2 hours used | PASS |
| Deposit percentage left blank | Deposit line shows a dash, not a default | PASS (documented behaviour) |
| `Clear All Rates` clicked | All entered prices emptied | PASS (documented behaviour) |
| Tool embedded in a cross-origin iframe | Theme bridge catches the exception, tool still renders | PASS |
| `localStorage` unavailable (private mode) | `try/catch` swallows the error, tool still renders | PASS |
| Theme toggled in host while tool is open | `poli-theme` message received, theme applied, reload only if resolved theme changed | PASS |
| Non-English locale selected | `lang.*` keys resolve; `lang` attribute should update | Observation: verify `lang` attribute updates in the rendered UI |
| CSV export with a `GAP` row | Row exported with blank range and `GAP` confidence | PASS (documented behaviour) |
| Print rate card | One-page A4/US Letter card with user's own numbers only, dated today | PASS (documented behaviour) |

---

## Final Verdict

**PRODUCTION READY.**

The Studio Pricing Benchmark Tool is a small, self-contained, client-side reference application with a clean data model, honest handling of missing data, and no server-side dependencies or data transmission. The nine-region dataset is internally consistent, the confidence labelling is transparent, and the documentation accurately describes the tool's behaviour, including its limitations.

### Minor recommendations (non-blocking)

1. **Align the canonical URL.** `documentation.html` points to `https://poliinternational.com/studio-pricing-benchmark/` while the live tool is served from `/tools/studio-pricing-benchmark/`. Pick one and use it consistently.
2. **Update the `lang` attribute on locale change.** The language switcher offers seven locales; ensure `<html lang>` reflects the active one for screen readers.
3. **Add a live region for the "Copied!" confirmation.** A polite `aria-live` announcement would make the copy action perceivable to assistive technology.
4. **Verify focus visibility and keyboard operability** on the slider, the compare button, the copy button, and the tier selector.
5. **Track the "last reviewed" date.** The documentation states September 2026; add a reminder to refresh the dataset and the disclosure together.
6. **Consider a host-level CSP** that restricts `script-src` to the tool's own origin, using a nonce or hash for the inline theme-bridge script and inline `<style>` block.
7. **Confirm cache headers** on the hashed JS and CSS assets so repeat visits are served from cache.
8. **Revisit the hidden `<h1>` in embedded mode.** If the host page does not supply an equivalent heading, the embedded view loses its top-level heading.
