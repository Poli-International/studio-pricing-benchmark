# Studio Pricing Benchmark Tool - Technical Documentation

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Data Schemas](#data-schemas)
- [Calculation / Logic Algorithms](#calculation--logic-algorithms)
- [API Reference](#api-reference)
- [Integration Guide](#integration-guide)
- [Customization](#customization)
- [Performance](#performance)
- [Browser Compatibility](#browser-compatibility)
- [Security](#security)
- [Version History](#version-history)
- [Support and Contact](#support-and-contact)

## Architecture Overview

### Technology Stack

- **HTML5**, Semantic markup with embedded iframe detection and theme handling
- **CSS3**, Single external stylesheet (`/tools/studio-pricing-benchmark/css/style.css`)
- **Vanilla JavaScript (ES6)**, Single external script (`/tools/studio-pricing-benchmark/js/app.js`)
- **No frameworks, no libraries, no build tools**, Fully dependency-free static implementation

### File Structure

```
/tools/studio-pricing-benchmark/
├── index.html          # Main tool page (standalone, embeddable)
├── css/
│   └── style.css       # All styling
└── js/
    └── app.js          # All logic, data, and event handling
```

### Component / Logic Breakdown

The tool consists of three logical layers:

1. **Data Layer**, The `BENCHMARKS` constant object containing all pricing reference data for five regions, plus the `SYMBOLS` currency mapping.
2. **UI Rendering**, The `buildGrid()` function that dynamically generates input rows based on the selected region.
3. **Comparison Engine**, The click handler on `#compare-btn` that reads user inputs, compares them against benchmark ranges, and renders results with status badges.

## Data Schemas

### `BENCHMARKS` (Constant Object)

The primary data structure. Each key maps to an array of service objects.

```javascript
const BENCHMARKS = {
  uk: [
    {
      name: "Small tattoo (1–2 hrs)",       // string, service name
      sub: "Simple design, single colour",   // string, service description
      min: 80,                               // number, lower bound of benchmark range (in local currency)
      max: 200                               // number, upper bound of benchmark range (in local currency)
    },
    // ... 9 more service objects per region
  ],
  london: [ /* 10 service objects */ ],
  us:     [ /* 10 service objects */ ],
  eu:     [ /* 10 service objects */ ],
  au:     [ /* 10 service objects */ ]
};
```

**Supported regions:** `uk`, `london`, `us`, `eu`, `au`

**Services per region (10 total):**

| Index | Service Name | Description |
|-------|-------------|-------------|
| 0 | Small tattoo (1–2 hrs) | Simple design, single colour |
| 1 | Half-day session (4–5 hrs) | Medium-large piece |
| 2 | Full-day session (7–8 hrs) | Large / complex work |
| 3 | Hourly rate | Per hour billing |
| 4 | Minimum charge | Walk-in / tiny pieces |
| 5 | Earlobe piercing (pair) | Includes starter jewellery |
| 6 | Nostril piercing | Includes starter jewellery |
| 7 | Helix / cartilage | Includes starter jewellery |
| 8 | Navel piercing | Includes starter jewellery |
| 9 | Septum piercing | Includes starter jewellery |

### `SYMBOLS` (Constant Object)

Maps region keys to their currency symbols.

```javascript
const SYMBOLS = {
  uk:     "£",
  london: "£",
  us:     "$",
  eu:     "€",
  au:     "A$"
};
```

## Calculation / Logic Algorithms

### `buildGrid()`, UI Generation

**Purpose:** Rebuilds the service input grid when the user changes the region selector.

**Steps:**
1. Reads the current value of `#region-select` to determine the selected region key.
2. Retrieves the corresponding array from `BENCHMARKS[region]`.
3. Retrieves the currency symbol from `SYMBOLS[region]`.
4. Iterates over each service object, generating HTML for a `.service-row` div containing:
   - Service name and description
   - A number input with the currency prefix, a `data-idx` attribute set to the array index, and placeholder text "your price"
5. Sets `innerHTML` of `#services-grid` to the concatenated HTML.
6. Hides the results section (`#results`).

### Comparison Logic (Click Handler on `#compare-btn`)

**Purpose:** Evaluates each user-entered price against the selected region's benchmark ranges.

**Steps:**
1. Reads the current region and retrieves the corresponding `BENCHMARKS` array and `SYMBOLS` currency.
2. Selects all `.price-input` elements from the grid.
3. Initializes `anyFilled = false`.
4. Iterates over each service (index `i`):
   - Reads `inputs[i].value.trim()`.
   - **If empty:** Renders a result row with a "Not entered" badge.
   - **If filled:** Sets `anyFilled = true`, parses the value as a float, then applies the comparison logic:
     - **Below market:** `val < s.min` → badge class `low`, label `"Below market (£80+)"` (dynamic min value)
     - **Premium pricing:** `val > s.max` → badge class `premium`, label `"Premium pricing"`
     - **Market rate:** `s.min <= val <= s.max` → badge class `market`, label `"Market rate"`
5. Sets `innerHTML` of `#results-grid` with all result rows.
6. If no prices were entered (`!anyFilled`), shows an alert and returns without showing results.
7. Otherwise, displays the results section and scrolls it into view with smooth behavior.

### `escHtml()`, XSS Prevention

**Purpose:** Sanitizes user-facing strings before inserting into the DOM.

**Logic:** Replaces `&`, `<`, `>`, and `"` with their HTML entity equivalents.

```javascript
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
```

## API Reference

The tool exposes no public API to external consumers. All functions are scoped to the script's execution context.

### Internal Functions

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `escHtml(s)` | `s` (string) | string | Sanitizes a string for safe HTML insertion |
| `buildGrid()` | None | `undefined` | Rebuilds the service input grid based on selected region |

### Event Handlers

| Element | Event | Handler | Description |
|---------|-------|---------|-------------|
| `#region-select` | `change` | `buildGrid` | Rebuilds inputs when region changes |
| `#compare-btn` | `click` | Anonymous function | Runs comparison logic and renders results |

### Embedded Theme Detection

```javascript
if (window.self !== window.top) {
  document.documentElement.setAttribute('data-theme', 'dark');
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'poli-theme') {
      document.documentElement.setAttribute('data-theme', e.data.light ? 'light' : 'dark');
    }
  });
}
```

When loaded in an iframe, the tool:
- Defaults to dark theme (`data-theme="dark"`)
- Listens for `postMessage` events of type `poli-theme` to toggle between light and dark themes

## Integration Guide

### Standalone Embedding

The tool is fully self-contained and can be embedded in any webpage via iframe:

```html
<iframe
  src="https://poliinternational.com/tools/studio-pricing-benchmark/"
  width="100%"
  height="800"
  frameborder="0"
  title="Studio Pricing Benchmark Tool"
></iframe>
```

### Theme Control (When Embedded)

Send a `postMessage` to the iframe to control the theme:

```javascript
const iframe = document.querySelector('iframe');
iframe.contentWindow.postMessage({
  type: 'poli-theme',
  light: true   // false for dark mode
}, '*');
```

### Dependencies

Zero external dependencies. No jQuery, no React, no npm packages. The tool runs on vanilla HTML, CSS, and JavaScript.

## Customization

### Adding a New Region

1. Add a new key-value pair to the `BENCHMARKS` object in `js/app.js` with 10 service objects.
2. Add the corresponding currency symbol to the `SYMBOLS` object.
3. Add a new `<option>` element to the `#region-select` dropdown in `index.html`.

### Modifying Benchmark Ranges

Edit the `min` and `max` values for any service object within the `BENCHMARKS` object. No other changes required.

### Styling

All visual styling is in `/tools/studio-pricing-benchmark/css/style.css`. The tool uses BEM-like class naming conventions (e.g., `.tool-header`, `.tool-header__badge`, `.service-row`, `.result-badge`).

## Performance

- **Total payload:** One HTML file, one CSS file, one JS file. No external requests.
- **DOM manipulation:** Minimal, only rebuilds the grid on region change and renders results on comparison.
- **No animations, no polling, no timers.**
- **No images or fonts**, relies on system fonts and CSS-only styling.

## Browser Compatibility

The tool uses standard ES6 features (`const`, `let`, arrow functions, template literals, `forEach`, `querySelectorAll`). Compatible with:

- Chrome 49+
- Firefox 52+
- Safari 10+
- Edge 14+
- Opera 36+

No transpilation or polyfills are included.

## Security

### Input Handling

- All user-entered prices are parsed as floats using `parseFloat()`.
- Non-numeric input results in `NaN`, which will always evaluate as "Below market" (since `NaN < s.min` is `false`, but `NaN > s.max` is also `false`, so the `val < s.min` branch triggers).
- The `escHtml()` function sanitizes all service names and descriptions before rendering to prevent XSS.

### No Data Transmission

- The tool performs all calculations client-side.
- No user data is sent to any server, stored in cookies, or persisted in localStorage.
- No analytics or tracking scripts are included.

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Initial release | Core benchmarking tool with 5 regions and 10 service types |

## Support and Contact

For questions, bug reports, or customization requests:

- **Email:** support@poliinternational.com
- **Website:** https://poliinternational.com
- **Tool URL:** https://poliinternational.com/tools/studio-pricing-benchmark/
