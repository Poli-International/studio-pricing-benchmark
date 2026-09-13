# Contributing Guide (English)

Thank you for contributing to the **Studio Pricing Benchmark** by Poli International.

## Contribution Guidelines

### 1. Data Integrity & Rate Submissions
- When submitting price updates for existing or new regions, supply verifiable evidence: studio price lists, published rate cards, or regional trade associations.
- Never submit guessed or fabricated pricing. If reliable data is not available, mark as data gap.
- All piercing references must clearly specify whether starter jewellery is included or separate.

### 2. Standards Compliance
- Cite only recognized standards by exact designation:
  - **ASTM F-136**
  - **ASTM F-138**
  - **EN 1811**
  - **ISO 10993**
  - **EU REACH Annex XVII**
- Never invent certifying bodies or credentials.

### 3. Internationalization (i18n) Rules
- When adding a new key, it MUST be added to all 7 languages simultaneously:
  - English (`en`)
  - German (`de`)
  - French (`fr`)
  - Spanish (`es`)
  - Italian (`it`)
  - Portuguese (`pt`)
  - Dutch (`nl`)
- Ensure all token placeholders match across languages (`{count}`, `{total}`).

### 4. Zero External Dependencies
- Do not add remote CDN links, remote fonts, or analytics scripts.
- Ensure all CSS custom properties maintain WCAG AA contrast (≥ 4.5:1) in both themes.
- All code must run offline with zero external network requests.

### 5. Code Quality & Automated Testing
- State and business calculations are maintained in `useStudioPricing.ts`.
- Run automated unit tests before submitting: `npm test` (`vitest run`).
- All tests must pass, verifying currency formatting, calculation bounds, and regional coverage.
