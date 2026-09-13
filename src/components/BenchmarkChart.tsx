import React, { useState } from 'react';
import { BenchmarkRow } from '../types';
import { t } from '../i18n';

interface BenchmarkChartProps {
  rows: BenchmarkRow[];
  userPrices: Record<string, string>;
  currency: string;
  currencyCode: string;
}

type CategoryFilter = 'all' | 'tattoo' | 'piercing';

interface ChartRowData {
  id: string;
  name: string;
  category: 'tattoo' | 'piercing';
  min: number | null;
  max: number | null;
  userPrice: number | null;
  isGap: boolean;
  positionLabel: string;
  positionType: 'below' | 'market' | 'premium' | 'none';
}

export const BenchmarkChart: React.FC<BenchmarkChartProps> = ({
  rows,
  userPrices,
  currency
}) => {
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const filteredRows = rows.filter((r) => {
    if (filter === 'all') return true;
    return r.category === filter;
  });

  const chartData: ChartRowData[] = filteredRows.map((row) => {
    const isGap = row.confidence === 'GAP' || row.min === null || row.max === null;
    const rawUserVal = userPrices[row.id];
    const userNum =
      rawUserVal && !isNaN(Number(rawUserVal)) && Number(rawUserVal) > 0
        ? Number(rawUserVal)
        : null;

    let positionLabel = t('pos.none');
    let positionType: 'below' | 'market' | 'premium' | 'none' = 'none';

    if (userNum !== null) {
      if (isGap || row.min === null || row.max === null) {
        positionLabel = t('pos.no_data');
      } else if (userNum < row.min) {
        positionType = 'below';
        positionLabel = t('pos.below');
      } else if (userNum > row.max) {
        positionType = 'premium';
        positionLabel = t('pos.premium');
      } else {
        positionType = 'market';
        positionLabel = t('pos.market');
      }
    }

    return {
      id: row.id,
      name: t(row.nameKey),
      category: row.category,
      min: isGap ? null : row.min,
      max: isGap ? null : row.max,
      userPrice: userNum,
      isGap,
      positionLabel,
      positionType
    };
  });

  const hasAnyUserPrices = Object.values(userPrices).some((v) => Number(v) > 0);

  return (
    <div
      id="benchmark-visual-chart-card"
      className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl p-3.5 sm:p-5 shadow-xs"
    >
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)] mb-4">
        <div>
          <h4 className="text-sm font-bold text-[var(--text-heading)] flex items-center gap-2">
            <span>📈</span>
            <span>{t('chart.title')}</span>
          </h4>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            {t('chart.subtitle')}
          </p>
        </div>

        {/* Category Filter Pills */}
        <div
          className="inline-flex items-center p-1 bg-[var(--surface)] rounded-lg border border-[var(--border)] self-start sm:self-auto"
          role="tablist"
          aria-label="Procedure Category"
        >
          <button
            type="button"
            id="btn-filter-category-all"
            role="tab"
            aria-selected={filter === 'all'}
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            {t('chart.filter_all')}
          </button>
          <button
            type="button"
            id="btn-filter-category-tattoo"
            role="tab"
            aria-selected={filter === 'tattoo'}
            onClick={() => setFilter('tattoo')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'tattoo'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            {t('chart.filter_tattoo')}
          </button>
          <button
            type="button"
            id="btn-filter-category-piercing"
            role="tab"
            aria-selected={filter === 'piercing'}
            onClick={() => setFilter('piercing')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'piercing'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            {t('chart.filter_piercing')}
          </button>
        </div>
      </div>

      {/* Visual Key / Legend for Interpretation and Print / Greyscale Disambiguation */}
      <div className="mb-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 text-xs text-[var(--muted)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          {/* Market Band indicator */}
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-3 rounded-xs bg-[var(--c-market)]/20 border border-[var(--c-market)] inline-block" />
            <span className="text-[var(--text)] font-medium">
              {t('chart.legend_low')} – {t('chart.legend_high')}
            </span>
          </div>

          {/* Below marker */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[var(--c-low)] font-bold text-xs">▼</span>
            <span>{t('pos.below')}</span>
          </div>

          {/* Market marker */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[var(--c-market)] font-bold text-xs">●</span>
            <span>{t('pos.market')}</span>
          </div>

          {/* Premium marker */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[var(--c-premium)] font-bold text-xs">▲</span>
            <span>{t('pos.premium')}</span>
          </div>

          {/* Data Gap indicator */}
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-2 rounded-xs border border-dashed border-[var(--border)] inline-block" />
            <span>{t('pos.no_data')}</span>
          </div>
        </div>

        <div className="text-[11px] text-[var(--muted)] font-mono">
          {t('chart.legend_your_price')}: <span className="font-bold text-[var(--text-heading)]">▼ ● ▲</span>
        </div>
      </div>

      {/* Notice if user has not entered prices yet */}
      {!hasAnyUserPrices && (
        <div className="mb-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 text-xs text-[var(--muted)] flex items-center gap-2">
          <span className="text-base" role="img" aria-label="info">
            💡
          </span>
          <span>{t('chart.empty_notice')}</span>
        </div>
      )}

      {/* Range Bands List (Inline SVG Visualizer) */}
      <div
        id="benchmark-visual-chart"
        className="space-y-3"
        role="region"
        aria-label={t('chart.title')}
      >
        {chartData.map((item) => {
          const isGap = item.isGap || item.min === null || item.max === null;
          const userPrice = item.userPrice;

          // Compute horizontal scale for non-gap rows
          let railLeft = 32;
          let railRight = 568;
          let railWidth = railRight - railLeft;
          let minX = 0;
          let maxX = 0;
          let userX = 0;
          let isBelow = false;
          let isAbove = false;
          let isInMarket = false;

          if (!isGap && item.min !== null && item.max !== null) {
            const minVal = item.min;
            const maxVal = item.max;
            const span = maxVal - minVal || 10;

            let padLow = span * 0.35;
            let padHigh = span * 0.35;

            if (userPrice !== null) {
              if (userPrice < minVal) {
                padLow = Math.max(padLow, (minVal - userPrice) * 1.3);
              } else if (userPrice > maxVal) {
                padHigh = Math.max(padHigh, (userPrice - maxVal) * 1.3);
              }
            }

            const domainMin = Math.max(0, minVal - padLow);
            const domainMax = maxVal + padHigh;
            const domainRange = domainMax - domainMin || 1;

            const getX = (val: number) => {
              const clamped = Math.max(domainMin, Math.min(domainMax, val));
              return railLeft + ((clamped - domainMin) / domainRange) * railWidth;
            };

            minX = getX(minVal);
            maxX = getX(maxVal);

            if (userPrice !== null) {
              userX = getX(userPrice);
              isBelow = userPrice < minVal;
              isAbove = userPrice > maxVal;
              isInMarket = !isBelow && !isAbove;
            }
          }

          return (
            <div
              key={`chart-row-${item.id}`}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 sm:p-3.5 space-y-2 transition-colors hover:border-[var(--primary)]/40"
            >
              {/* Row Header: Name, Category Pill, and Numeric Summary (Readable without hover) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs sm:text-sm text-[var(--text-heading)]">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--primary)] border border-[var(--border)] uppercase tracking-wider">
                    {item.category === 'tattoo'
                      ? t('table.category_tattoo')
                      : t('table.category_piercing')}
                  </span>
                </div>

                {/* Explicit numeric values and position badge */}
                <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap text-xs">
                  {/* Market Range value */}
                  <div className="text-[var(--muted)] font-mono text-[11px]">
                    {!isGap && item.min !== null && item.max !== null ? (
                      <span>
                        <span className="text-[10px] uppercase tracking-wide text-[var(--muted)] mr-1">
                          {t('chart.legend_low')}:
                        </span>
                        <strong className="text-[var(--text-heading)]">
                          {currency}{item.min.toLocaleString()}
                        </strong>
                        <span className="mx-1 text-[var(--muted)]">–</span>
                        <span className="text-[10px] uppercase tracking-wide text-[var(--muted)] mr-1">
                          {t('chart.legend_high')}:
                        </span>
                        <strong className="text-[var(--text-heading)]">
                          {currency}{item.max.toLocaleString()}
                        </strong>
                      </span>
                    ) : (
                      <span className="italic text-[var(--muted)]">
                        {t('pos.no_data')}
                      </span>
                    )}
                  </div>

                  {/* Studio Rate value */}
                  <div className="text-[11px] font-mono">
                    <span className="text-[10px] uppercase tracking-wide text-[var(--muted)] mr-1">
                      {t('chart.legend_your_price')}:
                    </span>
                    {userPrice !== null ? (
                      <strong className="text-[var(--text-heading)]">
                        {currency}{userPrice.toLocaleString()}
                      </strong>
                    ) : (
                      <span className="text-[var(--muted)] italic">
                        {t('chart.not_entered')}
                      </span>
                    )}
                  </div>

                  {/* Distinct greyscale/print badge (shape + text + border style) */}
                  <div>
                    {isGap ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border border-dashed border-[var(--border)] text-[var(--muted)] bg-[var(--surface-elevated)]">
                        ◌ {t('pos.no_data')}
                      </span>
                    ) : userPrice === null ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-[var(--border)] text-[var(--muted)] bg-[var(--surface-elevated)]">
                        {t('chart.not_entered')}
                      </span>
                    ) : item.positionType === 'below' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border border-dashed border-[var(--c-low)] text-[var(--c-low)] bg-[var(--surface-elevated)]">
                        ▼ {t('pos.below')}
                      </span>
                    ) : item.positionType === 'market' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border border-solid border-[var(--c-market)] text-[var(--c-market)] bg-[var(--surface-elevated)]">
                        ● {t('pos.market')}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border-2 border-double border-[var(--c-premium)] text-[var(--c-premium)] bg-[var(--surface-elevated)]">
                        ▲ {t('pos.premium')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Inline SVG Horizontal Range Track */}
              <div className="w-full pt-1">
                <svg
                  viewBox="0 0 600 46"
                  className="w-full h-10 sm:h-11 block overflow-visible select-none"
                  role="img"
                  aria-label={`${item.name}: ${
                    !isGap && item.min !== null && item.max !== null
                      ? `${currency}${item.min} to ${currency}${item.max}`
                      : t('pos.no_data')
                  }, ${
                    userPrice !== null
                      ? `${t('chart.legend_your_price')} ${currency}${userPrice}`
                      : t('chart.not_entered')
                  }`}
                >
                  <title>
                    {`${item.name}: ${
                      !isGap && item.min !== null && item.max !== null
                        ? `${currency}${item.min.toLocaleString()} – ${currency}${item.max.toLocaleString()}`
                        : `${t('conf.gap')}: ${t('conf.no_data')}`
                    } | ${
                      userPrice !== null
                        ? `${t('chart.legend_your_price')}: ${currency}${userPrice.toLocaleString()} (${item.positionLabel})`
                        : t('chart.not_entered')
                    }`}
                  </title>

                  {isGap ? (
                    // Gap Representation: dashed rail, no false zero bar, clear data gap indicator
                    <g>
                      <line
                        x1="20"
                        y1="22"
                        x2="580"
                        y2="22"
                        stroke="var(--border)"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                        strokeLinecap="round"
                      />
                      <rect
                        x="160"
                        y="10"
                        width="280"
                        height="24"
                        rx="4"
                        fill="var(--surface-elevated)"
                        stroke="var(--border)"
                        strokeDasharray="3 3"
                      />
                      <text
                        x="300"
                        y="26"
                        textAnchor="middle"
                        fill="var(--muted)"
                        fontSize="11"
                        fontStyle="italic"
                        fontFamily="sans-serif"
                      >
                        {t('conf.gap')}: {t('conf.no_data')}
                      </text>
                    </g>
                  ) : (
                    // Valid Range Representation
                    <g>
                      {/* Background Rail */}
                      <line
                        x1={railLeft}
                        y1="22"
                        x2={railRight}
                        y2="22"
                        stroke="var(--border)"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />

                      {/* Market Range Band */}
                      <rect
                        x={minX}
                        y="12"
                        width={Math.max(4, maxX - minX)}
                        height="20"
                        rx="4"
                        fill="var(--c-market)"
                        fillOpacity="0.18"
                        stroke="var(--c-market)"
                        strokeWidth="1.5"
                      />

                      {/* Low Market Boundary Tick & Label */}
                      <line
                        x1={minX}
                        y1="8"
                        x2={minX}
                        y2="36"
                        stroke="var(--chart-low)"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <text
                        x={minX}
                        y="7"
                        textAnchor="middle"
                        fill="var(--muted)"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="600"
                      >
                        {currency}{item.min!.toLocaleString()}
                      </text>

                      {/* High Market Boundary Tick & Label */}
                      <line
                        x1={maxX}
                        y1="8"
                        x2={maxX}
                        y2="36"
                        stroke="var(--chart-high)"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <text
                        x={maxX}
                        y="7"
                        textAnchor="middle"
                        fill="var(--muted)"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="600"
                      >
                        {currency}{item.max!.toLocaleString()}
                      </text>

                      {/* Owner Studio Rate Marker (Distinguishable by position, shape, stroke pattern & label) */}
                      {userPrice !== null && (
                        <g>
                          {isBelow && (
                            // Below market: Downward triangle, dashed stem
                            <g>
                              <line
                                x1={userX}
                                y1="6"
                                x2={userX}
                                y2="36"
                                stroke="var(--c-low)"
                                strokeWidth="2.5"
                                strokeDasharray="3 2"
                              />
                              <polygon
                                points={`${userX},14 ${userX - 5},6 ${userX + 5},6`}
                                fill="var(--c-low)"
                              />
                              <circle
                                cx={userX}
                                cy="22"
                                r="4.5"
                                fill="var(--surface-elevated)"
                                stroke="var(--c-low)"
                                strokeWidth="2"
                              />
                              <text
                                x={userX}
                                y="45"
                                textAnchor="middle"
                                fill="var(--c-low)"
                                fontSize="11"
                                fontFamily="monospace"
                                fontWeight="700"
                              >
                                {currency}{userPrice.toLocaleString()}
                              </text>
                            </g>
                          )}

                          {isInMarket && (
                            // In market: Solid circle, solid stem
                            <g>
                              <line
                                x1={userX}
                                y1="6"
                                x2={userX}
                                y2="36"
                                stroke="var(--c-market)"
                                strokeWidth="2.5"
                              />
                              <circle
                                cx={userX}
                                cy="22"
                                r="6"
                                fill="var(--c-market)"
                                stroke="var(--surface-elevated)"
                                strokeWidth="2"
                              />
                              <text
                                x={userX}
                                y="45"
                                textAnchor="middle"
                                fill="var(--c-market)"
                                fontSize="11"
                                fontFamily="monospace"
                                fontWeight="700"
                              >
                                {currency}{userPrice.toLocaleString()}
                              </text>
                            </g>
                          )}

                          {isAbove && (
                            // Above market (Premium): Upward triangle, dot-dash stem
                            <g>
                              <line
                                x1={userX}
                                y1="6"
                                x2={userX}
                                y2="36"
                                stroke="var(--c-premium)"
                                strokeWidth="2.5"
                                strokeDasharray="4 1.5"
                              />
                              <polygon
                                points={`${userX},28 ${userX - 5},36 ${userX + 5},36`}
                                fill="var(--c-premium)"
                              />
                              <circle
                                cx={userX}
                                cy="22"
                                r="4.5"
                                fill="var(--surface-elevated)"
                                stroke="var(--c-premium)"
                                strokeWidth="2"
                              />
                              <text
                                x={userX}
                                y="45"
                                textAnchor="middle"
                                fill="var(--c-premium)"
                                fontSize="11"
                                fontFamily="monospace"
                                fontWeight="700"
                              >
                                {currency}{userPrice.toLocaleString()}
                              </text>
                            </g>
                          )}
                        </g>
                      )}
                    </g>
                  )}
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* Screen Reader Equivalent Accessible Data Table (WCAG 2.1 AA Compliance) */}
      <div
        className="sr-only"
        role="region"
        aria-label={`${t('chart.title')} data summary`}
      >
        <table>
          <caption>
            {t('chart.title')}: {t('chart.subtitle')} (
            {filter === 'all'
              ? t('chart.filter_all')
              : filter === 'tattoo'
              ? t('chart.filter_tattoo')
              : t('chart.filter_piercing')}
            )
          </caption>
          <thead>
            <tr>
              <th scope="col">{t('table.service')}</th>
              <th scope="col">{t('chart.legend_low')}</th>
              <th scope="col">{t('chart.legend_high')}</th>
              <th scope="col">{t('chart.legend_your_price')}</th>
              <th scope="col">{t('table.position')}</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((item) => (
              <tr key={`sr-row-${item.id}`}>
                <th scope="row">{item.name}</th>
                <td>
                  {item.min !== null
                    ? `${currency}${item.min.toLocaleString()}`
                    : t('conf.no_data')}
                </td>
                <td>
                  {item.max !== null
                    ? `${currency}${item.max.toLocaleString()}`
                    : t('conf.no_data')}
                </td>
                <td>
                  {item.userPrice !== null
                    ? `${currency}${item.userPrice.toLocaleString()}`
                    : t('chart.not_entered')}
                </td>
                <td>{item.positionLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
