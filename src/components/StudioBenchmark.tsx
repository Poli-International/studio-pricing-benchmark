import React from 'react';
import { BENCHMARK_DATA, REGIONS_METADATA } from '../data/benchmarkData';
import { BenchmarkRow, RegionId } from '../types';
import { t, SupportedLanguage, getLanguage } from '../i18n';
import { HeaderTooltip } from './HeaderTooltip';
import { BenchmarkChart } from './BenchmarkChart';
import { StudioRatesPanel } from './StudioRatesPanel';
import { useStudioPricing } from '../hooks/useStudioPricing';

interface StudioBenchmarkProps {
  selectedRegion: RegionId;
  onSelectRegion: (id: RegionId) => void;
  currentLanguage?: SupportedLanguage;
}

export const StudioBenchmark: React.FC<StudioBenchmarkProps> = ({
  selectedRegion,
  onSelectRegion,
  currentLanguage: _propLang
}) => {
  // Consolidate pricing state, localStorage synchronization, validation, and calculations into custom hook
  const {
    userPrices,
    studioRates,
    evaluated,
    exportSuccess,
    evaluatedCount,
    alignmentStats,
    handlePriceChange,
    handleRatesChange,
    handleClear,
    handleEvaluate,
    handleExportCSV,
    getPosition
  } = useStudioPricing(selectedRegion);

  // Active language reference ensures re-renders when language switches
  const _activeLang = _propLang || getLanguage();

  const regionMeta = REGIONS_METADATA[selectedRegion];
  const rows = BENCHMARK_DATA[selectedRegion] || [];

  const tattooRows = rows.filter((r) => r.category === 'tattoo');
  const piercingRows = rows.filter((r) => r.category === 'piercing');

  return (
    <div className="space-y-6">
      {/* Region Selector and Regional Details Card */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 md:p-6 shadow-md" role="region" aria-label={t('region.label')}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div>
            <label htmlFor="region-select" className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-1">
              {t('region.label')}
            </label>
            <div className="relative inline-block">
              <select
                id="region-select"
                value={selectedRegion}
                onChange={(e) => onSelectRegion(e.target.value as RegionId)}
                aria-label={`${t('region.label')} (${regionMeta.currencyCode})`}
                className="bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-heading)] rounded-lg px-3.5 py-2 text-sm font-semibold pr-8 focus:outline-none focus:border-[var(--primary)] transition-colors cursor-pointer"
              >
                <option value="uk">{t('region.uk.name')} (£)</option>
                <option value="london">{t('region.london.name')} (£)</option>
                <option value="us">{t('region.us.name')} ($)</option>
                <option value="eu">{t('region.eu.name')} (€)</option>
                <option value="au">{t('region.au.name')} (A$)</option>
                <option value="cee">{t('region.cee.name')} (€)</option>
                <option value="ca">{t('region.ca.name')} (C$)</option>
                <option value="sa">{t('region.sa.name')} (R$)</option>
                <option value="sea">{t('region.sea.name')} (฿)</option>
              </select>
            </div>
            <div className="text-xs text-[var(--muted)] mt-1.5 flex items-center gap-1.5 font-medium">
              {t('region.last_reviewed')}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-mono font-semibold bg-[var(--surface-elevated)] text-[var(--text)] border border-[var(--border)]" aria-label={`${t('common.currency')}: ${regionMeta.currencyCode}`}>
              {t('common.currency')}: {regionMeta.currencyCode} ({regionMeta.currency})
            </span>
          </div>
        </div>

        {/* Regional Coverage Note & Jewellery Policy Note */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
          <div className="bg-[var(--surface-elevated)] rounded-lg p-3 border border-[var(--border)]">
            <span className="font-bold text-[var(--text-heading)] block mb-1">{t('region.coverage_scope')}</span>
            <p className="text-[var(--muted)] leading-relaxed">{t(regionMeta.coverageNoteKey)}</p>
          </div>
          <div className="bg-[var(--surface-elevated)] rounded-lg p-3 border border-[var(--border)]">
            <span className="font-bold text-[var(--text-heading)] block mb-1">{t('jewellery.policy_label')}</span>
            <p className="text-[var(--muted)] leading-relaxed">{t(regionMeta.jewelleryPolicyKey)}</p>
          </div>
        </div>
      </div>

      {/* Studio Rates & Pricing Operations Panel */}
      <StudioRatesPanel
        rates={studioRates}
        onRatesChange={handleRatesChange}
        regionMeta={regionMeta}
        rows={rows}
        userPrices={userPrices}
        onPriceChange={handlePriceChange}
      />

      {/* Main Benchmark Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-md overflow-hidden" role="region" aria-label={t('app.title')}>
        <div className="p-4 md:p-6 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-[var(--text-heading)]">
              {t(regionMeta.nameKey)}: {t('app.title')}
            </h2>
            <p className="text-xs text-[var(--muted)] mt-1">
              {t('app.subtitle')}
            </p>
            {evaluatedCount > 0 && (
              <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 mt-2" aria-live="polite">
                <span aria-hidden="true">💾</span>
                <span>{t('calc.saved_notice')}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="btn-export-csv"
              onClick={handleExportCSV}
              className="bg-[var(--surface-elevated)] hover:bg-[var(--border)] text-[var(--text)] text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer border border-[var(--border)] inline-flex items-center gap-1.5 shadow-xs"
              title={t('csv.btn_export')}
              aria-label={t('csv.btn_export')}
            >
              <span aria-hidden="true">📥</span>
              <span>{t('csv.btn_export')}</span>
            </button>
            <button
              type="button"
              id="btn-evaluate-rates"
              onClick={handleEvaluate}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
              aria-label={t('calc.btn_evaluate')}
            >
              {t('calc.btn_evaluate')}
            </button>
            {evaluatedCount > 0 && (
              <button
                type="button"
                id="btn-clear-rates"
                onClick={handleClear}
                className="bg-[var(--surface-elevated)] hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer border border-[var(--border)]"
                aria-label={t('calc.btn_clear')}
              >
                {t('calc.btn_clear')}
              </button>
            )}
          </div>
        </div>

        {/* Export Success Notification Banner */}
        {exportSuccess && (
          <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-6 py-2.5 text-xs text-emerald-400 font-medium flex items-center gap-2" role="status" aria-live="polite">
            <span aria-hidden="true">✅</span>
            <span>{t('csv.export_success')}</span>
          </div>
        )}

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse" role="table" aria-label={`${t(regionMeta.nameKey)} ${t('app.title')}`}>
            <thead>
              <tr className="bg-[var(--surface-elevated)] border-b border-[var(--border)] text-[var(--muted)] font-bold uppercase tracking-wider">
                <th scope="col" className="py-3 px-4 min-w-[200px]">{t('table.service')}</th>
                <th scope="col" className="py-3 px-4 min-w-[150px]">
                  <div className="flex items-center gap-1.5">
                    <span>{t('table.range')}</span>
                    <HeaderTooltip id="range" title={t('tooltip.range_title')}>
                      <div>
                        <strong className="text-[var(--text-heading)] block font-semibold mb-0.5">
                          {t('tooltip.mid_market_label')}:
                        </strong>
                        <span>{t('tooltip.mid_market_desc')}</span>
                      </div>
                      <div className="pt-1.5 border-t border-[var(--border)]">
                        <strong className="text-[var(--text-heading)] block font-semibold mb-0.5">
                          {t('tooltip.premium_label')}:
                        </strong>
                        <span>{t('tooltip.premium_desc')}</span>
                      </div>
                    </HeaderTooltip>
                  </div>
                </th>
                <th scope="col" className="py-3 px-4 min-w-[120px] text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span>{t('table.confidence')}</span>
                    <HeaderTooltip id="confidence" title={t('tooltip.confidence_title')}>
                      <p>{t('tooltip.confidence_desc')}</p>
                    </HeaderTooltip>
                  </div>
                </th>
                <th scope="col" className="py-3 px-4 min-w-[260px]">{t('table.basis')}</th>
                <th scope="col" className="py-3 px-4 min-w-[130px]">{t('table.your_price')}</th>
                {evaluated && (
                  <th scope="col" className="py-3 px-4 min-w-[130px] text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span>{t('table.position')}</span>
                      <HeaderTooltip id="position" title={t('tooltip.position_title')}>
                        <p>{t('tooltip.position_desc')}</p>
                      </HeaderTooltip>
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {/* Category 1: Tattoo Services */}
              <tr className="bg-[var(--surface-elevated)]/60 font-extrabold text-[var(--text-heading)]">
                <td colSpan={evaluated ? 6 : 5} className="py-2 px-4 text-[11px] uppercase tracking-wider text-[var(--primary)] border-y border-[var(--border)]">
                  {t('table.category_tattoo')}
                </td>
              </tr>
              {tattooRows.map((row) => renderRow(row))}

              {/* Category 2: Piercing Services */}
              <tr className="bg-[var(--surface-elevated)]/60 font-extrabold text-[var(--text-heading)]">
                <td colSpan={evaluated ? 6 : 5} className="py-2 px-4 text-[11px] uppercase tracking-wider text-[var(--primary)] border-y border-[var(--border)]">
                  {t('table.category_piercing')}
                </td>
              </tr>
              {piercingRows.map((row) => renderRow(row))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integrated Results View (Position Metrics and Recharts Bar Chart by Service Category) */}
      {evaluated && (
        <div
          id="benchmark-results-view"
          role="region"
          aria-label={t('calc.results_heading')}
          aria-live="polite"
          className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 md:p-6 shadow-md space-y-6"
        >
          {/* Header & Service Evaluation Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
            <div>
              <h3 className="text-base font-extrabold text-[var(--text-heading)] flex items-center gap-2">
                <span aria-hidden="true">📊</span>
                <span>{t('calc.results_heading')}</span>
              </h3>
              <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">
                {t('calc.results_sub')}
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg text-xs font-mono text-[var(--text)]">
              <span className="font-bold text-[var(--primary)]">{evaluatedCount}</span>
              <span className="text-[var(--muted)]">/ {rows.length} {t('table.service')}</span>
            </div>
          </div>

          {/* Pricing Alignment KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="bg-[var(--surface-elevated)] border border-[var(--border)] p-3.5 rounded-lg">
              <span className="block text-2xl font-extrabold text-red-400 font-mono">
                {alignmentStats.belowCount}
              </span>
              <span className="text-xs text-[var(--muted)] font-medium mt-0.5 block">{t('pos.below')}</span>
            </div>
            <div className="bg-[var(--surface-elevated)] border border-[var(--border)] p-3.5 rounded-lg">
              <span className="block text-2xl font-extrabold text-emerald-400 font-mono">
                {alignmentStats.marketCount}
              </span>
              <span className="text-xs text-[var(--muted)] font-medium mt-0.5 block">{t('pos.market')}</span>
            </div>
            <div className="bg-[var(--surface-elevated)] border border-[var(--border)] p-3.5 rounded-lg">
              <span className="block text-2xl font-extrabold text-blue-400 font-mono">
                {alignmentStats.premiumCount}
              </span>
              <span className="text-xs text-[var(--muted)] font-medium mt-0.5 block">{t('pos.premium')}</span>
            </div>
          </div>

          {/* Visual Recharts Bar Chart Comparing User Inputs vs Regional Low and High Market Ranges */}
          <BenchmarkChart
            rows={rows}
            userPrices={userPrices}
            currency={regionMeta.currency}
            currencyCode={regionMeta.currencyCode}
          />
        </div>
      )}

      {/* Footnote Card */}
      <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg p-4 text-xs text-[var(--muted)] leading-relaxed">
        <strong className="text-[var(--text-heading)]">{t('table.notes_header')}: </strong>
        {t('app.footnote')}
      </div>
    </div>
  );

  function renderRow(row: BenchmarkRow) {
    const isGap = row.confidence === 'GAP' || row.min === null || row.max === null;
    const pos = getPosition(row);
    const rangeDescription = isGap
      ? t('conf.no_data')
      : `${row.currency}${row.min?.toLocaleString()} - ${row.currency}${row.max?.toLocaleString()}`;

    return (
      <tr key={row.id} className="hover:bg-[var(--surface-elevated)]/40 transition-colors">
        {/* Service Name & Subtitle */}
        <td className="py-3 px-4 align-top">
          <div className="font-bold text-[var(--text-heading)]">{t(row.nameKey)}</div>
          <div className="text-[11px] text-[var(--muted)] leading-snug mt-0.5">{t(row.subKey)}</div>
        </td>

        {/* Benchmark Range */}
        <td className="py-3 px-4 align-top font-mono">
          {isGap ? (
            <span className="italic text-[var(--muted)] font-sans font-medium text-[11px]">
              {t('conf.no_data')}
            </span>
          ) : (
            <span className="font-bold text-[var(--text-heading)]">
              {row.currency}{row.min?.toLocaleString()} – {row.currency}{row.max?.toLocaleString()}
            </span>
          )}
        </td>

        {/* Confidence Marker Badge (Greyscale readable with distinct borders and shapes) */}
        <td className="py-3 px-4 align-top text-center">
          {row.confidence === 'INDICATIVE' && (
            <span
              title={t('conf.indicative_desc')}
              className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border border-dashed border-amber-500 text-amber-400 bg-amber-500/10 dark:text-amber-300"
            >
              [{t('conf.indicative')}]
            </span>
          )}
          {row.confidence === 'GAP' && (
            <span
              title={t('conf.gap_desc')}
              className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border border-dotted border-[var(--border)] text-[var(--muted)] bg-[var(--surface-elevated)]"
            >
              [{t('conf.gap')}]
            </span>
          )}
        </td>

        {/* Basis Note & Jewellery Inclusion */}
        <td className="py-3 px-4 align-top text-[11px] leading-relaxed text-[var(--muted)]">
          <div>{t(row.basisKey)}</div>
          {row.jewelleryNoteKey && (
            <div className="mt-1 text-[10px] font-medium text-[var(--primary)] flex items-center gap-1">
              <span className="font-bold">•</span> {t(row.jewelleryNoteKey)}
            </div>
          )}
        </td>

        {/* Your Rate Input with Comprehensive Accessible Labels and Descriptions */}
        <td className="py-3 px-4 align-top">
          <div className="flex items-center gap-1">
            <span className="text-xs text-[var(--muted)] font-mono" aria-hidden="true">{regionMeta.currency}</span>
            <input
              type="text"
              id={`input-rate-${row.id}`}
              inputMode="decimal"
              autoComplete="off"
              placeholder="0"
              aria-label={`${t(row.nameKey)} (${t(row.subKey)}) - ${t('table.your_rate')} in ${regionMeta.currencyCode}`}
              aria-describedby={`rate-range-desc-${row.id}`}
              value={userPrices[row.id] || ''}
              onChange={(e) => handlePriceChange(row.id, e.target.value)}
              className="w-20 bg-[var(--surface-elevated)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text)] font-mono focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
            {/* Visually Hidden Description for Screen Readers */}
            <span id={`rate-range-desc-${row.id}`} className="sr-only">
              {t('table.range')}: {rangeDescription}
            </span>
          </div>
        </td>

        {/* Position Column (when evaluated) */}
        {evaluated && (
          <td className="py-3 px-4 align-top text-center">
            {pos.position === 'below' && (
              <span
                className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30"
                aria-label={`${t('table.position')}: ${pos.label}${pos.diffPercent !== null ? ` (${pos.diffPercent}%)` : ''}`}
              >
                {pos.label}
              </span>
            )}
            {pos.position === 'market' && (
              <span
                className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                aria-label={`${t('table.position')}: ${pos.label}`}
              >
                {pos.label}
              </span>
            )}
            {pos.position === 'premium' && (
              <span
                className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30"
                aria-label={`${t('table.position')}: ${pos.label}${pos.diffPercent !== null ? ` (+${pos.diffPercent}%)` : ''}`}
              >
                {pos.label}
              </span>
            )}
            {pos.position === 'none' && (
              <span className="text-[10px] text-[var(--muted)]" aria-label={`${t('table.position')}: ${t('pos.none')}`}>N/A</span>
            )}
          </td>
        )}
      </tr>
    );
  }
};

