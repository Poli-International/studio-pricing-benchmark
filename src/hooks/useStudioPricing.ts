import { useState, useEffect, useMemo, useCallback } from 'react';
import { BenchmarkRow, ComparisonPosition, RegionId, StudioRates } from '../types';
import { REGIONS_METADATA, BENCHMARK_DATA } from '../data/benchmarkData';
import { t } from '../i18n';

export const BENCHMARK_STORAGE_KEY = 'poli_benchmark_user_prices_v1';
export const BENCHMARK_RATES_STORAGE_KEY = 'poli_benchmark_studio_rates_v1';

const DEFAULT_RATES: StudioRates = {
  hourlyRate: '',
  minimumCharge: '',
  shopMinimum: '',
  depositPercent: '25',
  tier: 'resident',
};

/**
 * Validates and sanitizes a raw price string input.
 * Allows digits and a single decimal point, removing any negative signs, spaces, or letters.
 */
export function sanitizePriceInput(input: string): string {
  if (!input) return '';
  // Keep only numbers and period
  let clean = input.replace(/[^0-9.]/g, '');
  // Allow at most one decimal point
  const parts = clean.split('.');
  if (parts.length > 2) {
    clean = parts[0] + '.' + parts.slice(1).join('');
  }
  return clean;
}

/**
 * Parses a sanitized price string into a valid positive number or null.
 */
export function parsePrice(val: string | number | null | undefined): number | null {
  if (val === null || val === undefined) return null;
  const num = typeof val === 'number' ? val : Number(String(val).trim());
  if (isNaN(num) || num <= 0 || !isFinite(num)) return null;
  return num;
}

/**
 * Core pricing calculation formula determining market position against reference boundaries.
 */
export function calculatePosition(
  userPrice: number | null,
  min: number | null,
  max: number | null,
  confidence?: string
): { position: ComparisonPosition; diffPercent: number | null } {
  if (userPrice === null || userPrice <= 0) {
    return { position: 'none', diffPercent: null };
  }

  // Data gap check: missing boundaries or gap confidence level
  if (min === null || max === null || confidence === 'GAP') {
    return { position: 'none', diffPercent: null };
  }

  if (userPrice < min) {
    const diff = Math.round(((userPrice - min) / min) * 100);
    return { position: 'below', diffPercent: diff };
  }

  if (userPrice > max) {
    const diff = Math.round(((userPrice - max) / max) * 100);
    return { position: 'premium', diffPercent: diff };
  }

  return { position: 'market', diffPercent: 0 };
}

/**
 * Calculates aggregate studio positioning statistics for a collection of benchmark rows.
 */
export function calculatePricingMetrics(
  rows: BenchmarkRow[],
  userPrices: Record<string, string>
): {
  evaluatedCount: number;
  belowCount: number;
  marketCount: number;
  premiumCount: number;
} {
  let evaluatedCount = 0;
  let belowCount = 0;
  let marketCount = 0;
  let premiumCount = 0;

  for (const row of rows) {
    const priceNum = parsePrice(userPrices[row.id]);
    if (priceNum !== null) {
      evaluatedCount++;
      const { position } = calculatePosition(priceNum, row.min, row.max, row.confidence);
      if (position === 'below') belowCount++;
      else if (position === 'market') marketCount++;
      else if (position === 'premium') premiumCount++;
    }
  }

  return { evaluatedCount, belowCount, marketCount, premiumCount };
}

/**
 * Formats a currency value with regional symbol.
 */
export function formatCurrencyValue(
  value: number | null,
  symbol: string,
  options?: { fallback?: string }
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return options?.fallback ?? 'N/A';
  }
  return `${symbol}${value.toLocaleString()}`;
}

export interface UseStudioPricingReturn {
  userPrices: Record<string, string>;
  studioRates: StudioRates;
  evaluated: boolean;
  exportSuccess: boolean;
  evaluatedCount: number;
  alignmentStats: {
    belowCount: number;
    marketCount: number;
    premiumCount: number;
  };
  handlePriceChange: (serviceId: string, val: string) => void;
  handleRatesChange: (updated: StudioRates) => void;
  handleClear: () => void;
  handleEvaluate: () => void;
  handleExportCSV: () => void;
  getPosition: (row: BenchmarkRow) => {
    position: ComparisonPosition;
    label: string;
    diffPercent: number | null;
  };
}

export function useStudioPricing(selectedRegion: RegionId): UseStudioPricingReturn {
  const regionMeta = REGIONS_METADATA[selectedRegion];
  const rows = BENCHMARK_DATA[selectedRegion] || [];

  // Lazy initialize state from localStorage for instantaneous initial render
  const [userPrices, setUserPrices] = useState<Record<string, string>>(() => {
    try {
      const savedRaw = localStorage.getItem(BENCHMARK_STORAGE_KEY);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        return parsed[selectedRegion] || {};
      }
    } catch (e) {
      console.error('Failed to load initial benchmark prices:', e);
    }
    return {};
  });

  const [evaluated, setEvaluated] = useState<boolean>(() => {
    try {
      const savedRaw = localStorage.getItem(BENCHMARK_STORAGE_KEY);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        const regionPrices = parsed[selectedRegion] || {};
        return Object.values(regionPrices).some((v) => parsePrice(v as string) !== null);
      }
    } catch (e) {}
    return false;
  });

  const [exportSuccess, setExportSuccess] = useState(false);

  const [studioRates, setStudioRates] = useState<StudioRates>(() => {
    try {
      const saved = localStorage.getItem(BENCHMARK_RATES_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_RATES, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load studio rates:', e);
    }
    return DEFAULT_RATES;
  });

  const handleRatesChange = useCallback((updated: StudioRates) => {
    setStudioRates(updated);
    try {
      localStorage.setItem(BENCHMARK_RATES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save studio rates:', e);
    }
  }, []);

  // Sync state with localStorage on region switch
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(BENCHMARK_STORAGE_KEY);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        const regionPrices = parsed[selectedRegion] || {};
        setUserPrices(regionPrices);
        const hasValues = Object.values(regionPrices).some((v) => parsePrice(v as string) !== null);
        if (hasValues) {
          setEvaluated(true);
        }
      } else {
        setUserPrices({});
      }
    } catch (e) {
      console.error('Failed to load benchmark prices on region switch:', e);
    }
  }, [selectedRegion]);

  const savePricesToStorage = useCallback(
    (updatedPrices: Record<string, string>) => {
      try {
        const savedRaw = localStorage.getItem(BENCHMARK_STORAGE_KEY);
        const allPrices = savedRaw ? JSON.parse(savedRaw) : {};
        allPrices[selectedRegion] = updatedPrices;
        localStorage.setItem(BENCHMARK_STORAGE_KEY, JSON.stringify(allPrices));
      } catch (e) {
        console.error('Failed to save benchmark prices to localStorage:', e);
      }
    },
    [selectedRegion]
  );

  const handlePriceChange = useCallback(
    (serviceId: string, val: string) => {
      const sanitized = sanitizePriceInput(val);
      setUserPrices((prev) => {
        const next = { ...prev, [serviceId]: sanitized };
        savePricesToStorage(next);
        return next;
      });
    },
    [savePricesToStorage]
  );

  const handleClear = useCallback(() => {
    setUserPrices({});
    setEvaluated(false);
    savePricesToStorage({});
  }, [savePricesToStorage]);

  const handleEvaluate = useCallback(() => {
    setEvaluated(true);
    setTimeout(() => {
      const resultsEl = document.getElementById('benchmark-results-view');
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  }, []);

  const getPosition = useCallback(
    (row: BenchmarkRow): { position: ComparisonPosition; label: string; diffPercent: number | null } => {
      const priceNum = parsePrice(userPrices[row.id]);
      if (priceNum === null) {
        return { position: 'none', label: t('pos.none'), diffPercent: null };
      }

      if (row.min === null || row.max === null || row.confidence === 'GAP') {
        return { position: 'none', label: t('pos.no_data'), diffPercent: null };
      }

      const { position, diffPercent } = calculatePosition(priceNum, row.min, row.max, row.confidence);
      if (position === 'below') {
        return { position: 'below', label: t('pos.below'), diffPercent };
      }
      if (position === 'premium') {
        return { position: 'premium', label: t('pos.premium'), diffPercent };
      }
      return { position: 'market', label: t('pos.market'), diffPercent };
    },
    [userPrices]
  );

  const { evaluatedCount, belowCount, marketCount, premiumCount } = useMemo(() => {
    return calculatePricingMetrics(rows, userPrices);
  }, [rows, userPrices]);

  const handleExportCSV = useCallback(() => {
    const escapeCsv = (str: string | number | null | undefined): string => {
      if (str === null || str === undefined) return '""';
      const text = String(str).replace(/"/g, '""');
      return `"${text}"`;
    };

    const headers = [
      t('csv.col_region'),
      t('csv.col_category'),
      t('csv.col_service'),
      t('csv.col_scope'),
      t('csv.col_currency'),
      t('csv.col_min'),
      t('csv.col_max'),
      t('csv.col_confidence'),
      t('csv.col_basis'),
      t('csv.col_jewellery'),
      t('csv.col_your_price'),
      t('csv.col_position')
    ];

    const csvRows = [headers.map(escapeCsv).join(',')];

    rows.forEach((row) => {
      const pos = getPosition(row);
      const isGap = row.confidence === 'GAP' || row.min === null || row.max === null;
      const jewelleryPolicy = row.jewelleryNoteKey
        ? t(row.jewelleryNoteKey)
        : t(regionMeta.jewelleryPolicyKey);

      const rowData = [
        t(regionMeta.nameKey),
        row.category === 'tattoo' ? t('table.category_tattoo') : t('table.category_piercing'),
        t(row.nameKey),
        t(row.subKey),
        regionMeta.currencyCode,
        isGap ? 'N/A' : String(row.min),
        isGap ? 'N/A' : String(row.max),
        row.confidence,
        t(row.basisKey),
        jewelleryPolicy,
        userPrices[row.id] ? String(userPrices[row.id]) : '',
        pos.label
      ];

      csvRows.push(rowData.map(escapeCsv).join(','));
    });

    const csvString = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `studio-pricing-benchmark-${selectedRegion}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 4000);
  }, [rows, selectedRegion, userPrices, regionMeta, getPosition]);

  return {
    userPrices,
    studioRates,
    evaluated,
    exportSuccess,
    evaluatedCount,
    alignmentStats: {
      belowCount,
      marketCount,
      premiumCount
    },
    handlePriceChange,
    handleRatesChange,
    handleClear,
    handleEvaluate,
    handleExportCSV,
    getPosition
  };
}
