const BENCHMARKS = {
  uk: [
    { name: 'Small tattoo (1–2 hrs)', sub: 'Simple design, single colour', min: 80, max: 200 },
    { name: 'Half-day session (4–5 hrs)', sub: 'Medium-large piece', min: 300, max: 600 },
    { name: 'Full-day session (7–8 hrs)', sub: 'Large / complex work', min: 550, max: 1100 },
    { name: 'Hourly rate', sub: 'Per hour billing', min: 80, max: 180 },
    { name: 'Minimum charge', sub: 'Walk-in / tiny pieces', min: 50, max: 100 },
    { name: 'Earlobe piercing (pair)', sub: 'Includes starter jewellery', min: 30, max: 70 },
    { name: 'Nostril piercing', sub: 'Includes starter jewellery', min: 35, max: 65 },
    { name: 'Helix / cartilage', sub: 'Includes starter jewellery', min: 30, max: 65 },
    { name: 'Navel piercing', sub: 'Includes starter jewellery', min: 35, max: 75 },
    { name: 'Septum piercing', sub: 'Includes starter jewellery', min: 40, max: 80 },
  ],
  london: [
    { name: 'Small tattoo (1–2 hrs)', sub: 'Simple design, single colour', min: 100, max: 280 },
    { name: 'Half-day session (4–5 hrs)', sub: 'Medium-large piece', min: 400, max: 800 },
    { name: 'Full-day session (7–8 hrs)', sub: 'Large / complex work', min: 750, max: 1500 },
    { name: 'Hourly rate', sub: 'Per hour billing', min: 120, max: 250 },
    { name: 'Minimum charge', sub: 'Walk-in / tiny pieces', min: 80, max: 150 },
    { name: 'Earlobe piercing (pair)', sub: 'Includes starter jewellery', min: 40, max: 90 },
    { name: 'Nostril piercing', sub: 'Includes starter jewellery', min: 50, max: 90 },
    { name: 'Helix / cartilage', sub: 'Includes starter jewellery', min: 40, max: 85 },
    { name: 'Navel piercing', sub: 'Includes starter jewellery', min: 50, max: 100 },
    { name: 'Septum piercing', sub: 'Includes starter jewellery', min: 55, max: 110 },
  ],
  us: [
    { name: 'Small tattoo (1–2 hrs)', sub: 'Simple design, single colour', min: 100, max: 250 },
    { name: 'Half-day session (4–5 hrs)', sub: 'Medium-large piece', min: 400, max: 900 },
    { name: 'Full-day session (7–8 hrs)', sub: 'Large / complex work', min: 700, max: 1600 },
    { name: 'Hourly rate', sub: 'Per hour billing', min: 100, max: 250 },
    { name: 'Minimum charge', sub: 'Walk-in / tiny pieces', min: 50, max: 100 },
    { name: 'Earlobe piercing (pair)', sub: 'Includes starter jewellery', min: 40, max: 80 },
    { name: 'Nostril piercing', sub: 'Includes starter jewellery', min: 40, max: 80 },
    { name: 'Helix / cartilage', sub: 'Includes starter jewellery', min: 40, max: 80 },
    { name: 'Navel piercing', sub: 'Includes starter jewellery', min: 40, max: 85 },
    { name: 'Septum piercing', sub: 'Includes starter jewellery', min: 45, max: 90 },
  ],
  eu: [
    { name: 'Small tattoo (1–2 hrs)', sub: 'Simple design, single colour', min: 80, max: 200 },
    { name: 'Half-day session (4–5 hrs)', sub: 'Medium-large piece', min: 300, max: 650 },
    { name: 'Full-day session (7–8 hrs)', sub: 'Large / complex work', min: 500, max: 1200 },
    { name: 'Hourly rate', sub: 'Per hour billing', min: 80, max: 180 },
    { name: 'Minimum charge', sub: 'Walk-in / tiny pieces', min: 40, max: 80 },
    { name: 'Earlobe piercing (pair)', sub: 'Includes starter jewellery', min: 30, max: 70 },
    { name: 'Nostril piercing', sub: 'Includes starter jewellery', min: 30, max: 65 },
    { name: 'Helix / cartilage', sub: 'Includes starter jewellery', min: 30, max: 65 },
    { name: 'Navel piercing', sub: 'Includes starter jewellery', min: 35, max: 70 },
    { name: 'Septum piercing', sub: 'Includes starter jewellery', min: 35, max: 75 },
  ],
  au: [
    { name: 'Small tattoo (1–2 hrs)', sub: 'Simple design, single colour', min: 150, max: 350 },
    { name: 'Half-day session (4–5 hrs)', sub: 'Medium-large piece', min: 500, max: 900 },
    { name: 'Full-day session (7–8 hrs)', sub: 'Large / complex work', min: 900, max: 1600 },
    { name: 'Hourly rate', sub: 'Per hour billing', min: 150, max: 300 },
    { name: 'Minimum charge', sub: 'Walk-in / tiny pieces', min: 100, max: 150 },
    { name: 'Earlobe piercing (pair)', sub: 'Includes starter jewellery', min: 60, max: 110 },
    { name: 'Nostril piercing', sub: 'Includes starter jewellery', min: 60, max: 110 },
    { name: 'Helix / cartilage', sub: 'Includes starter jewellery', min: 60, max: 110 },
    { name: 'Navel piercing', sub: 'Includes starter jewellery', min: 70, max: 130 },
    { name: 'Septum piercing', sub: 'Includes starter jewellery', min: 70, max: 130 },
  ],
};

const SYMBOLS = { uk: '£', london: '£', us: '$', eu: '€', au: 'A$' };

const regionSelect = document.getElementById('region-select');
const servicesGrid = document.getElementById('services-grid');
const compareBtn = document.getElementById('compare-btn');
const results = document.getElementById('results');
const resultsGrid = document.getElementById('results-grid');

function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function buildGrid() {
  const region = regionSelect.value;
  const services = BENCHMARKS[region];
  const sym = SYMBOLS[region];
  servicesGrid.innerHTML = services.map((s, i) => `
    <div class="service-row">
      <div>
        <div class="service-name">${escHtml(s.name)}</div>
        <div class="service-sub">${escHtml(s.sub)}</div>
      </div>
      <div class="price-input-wrap">
        <span class="price-prefix">${sym}</span>
        <input type="number" class="price-input" data-idx="${i}" placeholder="your price" min="0" step="1">
      </div>
    </div>`).join('');
  results.style.display = 'none';
}

regionSelect.addEventListener('change', buildGrid);
buildGrid();

compareBtn.addEventListener('click', () => {
  const region = regionSelect.value;
  const services = BENCHMARKS[region];
  const sym = SYMBOLS[region];
  const inputs = servicesGrid.querySelectorAll('.price-input');
  let anyFilled = false;

  resultsGrid.innerHTML = services.map((s, i) => {
    const raw = inputs[i].value.trim();
    if (!raw) {
      return `<div class="result-row">
        <div><div class="result-service">${escHtml(s.name)}</div><div class="result-range">${sym}${s.min}–${sym}${s.max} benchmark</div></div>
        <span class="result-badge blank">Not entered</span>
      </div>`;
    }
    anyFilled = true;
    const val = parseFloat(raw);
    let cls, label;
    if (val < s.min) { cls = 'low'; label = `Below market (${sym}${s.min}+)`; }
    else if (val > s.max) { cls = 'premium'; label = 'Premium pricing'; }
    else { cls = 'market'; label = 'Market rate'; }
    return `<div class="result-row">
      <div><div class="result-service">${escHtml(s.name)} — <strong>${sym}${val.toFixed(0)}</strong></div><div class="result-range">Benchmark: ${sym}${s.min}–${sym}${s.max}</div></div>
      <span class="result-badge ${cls}">${label}</span>
    </div>`;
  }).join('');

  if (!anyFilled) { alert('Enter at least one price to compare.'); return; }
  results.style.display = '';
  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
