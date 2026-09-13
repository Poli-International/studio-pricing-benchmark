import { describe, it, expect } from 'vitest';
import { REGIONS_METADATA, BENCHMARK_DATA } from '../data/benchmarkData';
import { RegionId, BenchmarkRow } from '../types';
import {
  sanitizePriceInput,
  parsePrice,
  calculatePosition,
  calculatePricingMetrics,
  formatCurrencyValue
} from '../hooks/useStudioPricing';

describe('Pricing Calculation Formulas', () => {
  describe('sanitizePriceInput', () => {
    it('allows clean integers and decimal numbers', () => {
      expect(sanitizePriceInput('150')).toBe('150');
      expect(sanitizePriceInput('85.50')).toBe('85.50');
      expect(sanitizePriceInput('0.99')).toBe('0.99');
    });

    it('removes letters, currency symbols, and spaces', () => {
      expect(sanitizePriceInput('£120')).toBe('120');
      expect(sanitizePriceInput('$ 250.00 USD')).toBe('250.00');
      expect(sanitizePriceInput('  75  ')).toBe('75');
      expect(sanitizePriceInput('abc45xyz')).toBe('45');
    });

    it('disallows negative signs and strips duplicate decimals', () => {
      expect(sanitizePriceInput('-50')).toBe('50');
      expect(sanitizePriceInput('10.50.25')).toBe('10.5025');
    });

    it('handles empty and nullish inputs', () => {
      expect(sanitizePriceInput('')).toBe('');
    });
  });

  describe('parsePrice', () => {
    it('converts valid strings and numbers to positive float values', () => {
      expect(parsePrice('120')).toBe(120);
      expect(parsePrice('85.5')).toBe(85.5);
      expect(parsePrice(250)).toBe(250);
    });

    it('returns null for zero, negative, or invalid non-numeric values', () => {
      expect(parsePrice('0')).toBeNull();
      expect(parsePrice(0)).toBeNull();
      expect(parsePrice('-40')).toBeNull();
      expect(parsePrice('invalid')).toBeNull();
      expect(parsePrice(null)).toBeNull();
      expect(parsePrice(undefined)).toBeNull();
    });
  });

  describe('calculatePosition', () => {
    it('identifies rates below the regional mid-market threshold', () => {
      const res = calculatePosition(60, 80, 150, 'INDICATIVE');
      expect(res.position).toBe('below');
      expect(res.diffPercent).toBe(-25); // ((60 - 80) / 80) * 100
    });

    it('identifies rates within the mid-market range', () => {
      const lowerBound = calculatePosition(80, 80, 150, 'INDICATIVE');
      expect(lowerBound.position).toBe('market');
      expect(lowerBound.diffPercent).toBe(0);

      const midVal = calculatePosition(110, 80, 150, 'INDICATIVE');
      expect(midVal.position).toBe('market');
      expect(midVal.diffPercent).toBe(0);

      const upperBound = calculatePosition(150, 80, 150, 'INDICATIVE');
      expect(upperBound.position).toBe('market');
      expect(upperBound.diffPercent).toBe(0);
    });

    it('identifies premium specialist rates above the upper threshold', () => {
      const res = calculatePosition(200, 80, 160, 'INDICATIVE');
      expect(res.position).toBe('premium');
      expect(res.diffPercent).toBe(25); // ((200 - 160) / 160) * 100
    });

    it('flags data gaps when reference boundaries are missing or GAP', () => {
      const nullMin = calculatePosition(100, null, 150, 'INDICATIVE');
      expect(nullMin.position).toBe('none');
      expect(nullMin.diffPercent).toBeNull();

      const nullMax = calculatePosition(100, 80, null, 'INDICATIVE');
      expect(nullMax.position).toBe('none');
      expect(nullMax.diffPercent).toBeNull();

      const gapResult = calculatePosition(100, 80, 150, 'GAP');
      expect(gapResult.position).toBe('none');
      expect(gapResult.diffPercent).toBeNull();
    });

    it('returns position none for empty or non-positive user inputs', () => {
      expect(calculatePosition(null, 80, 150, 'INDICATIVE').position).toBe('none');
      expect(calculatePosition(0, 80, 150, 'INDICATIVE').position).toBe('none');
      expect(calculatePosition(-10, 80, 150, 'INDICATIVE').position).toBe('none');
    });
  });

  describe('calculatePricingMetrics', () => {
    const mockRows: BenchmarkRow[] = [
      {
        id: 'serv_1',
        nameKey: 's1',
        subKey: 'sub1',
        category: 'tattoo',
        currency: '£',
        min: 80,
        max: 150,
        confidence: 'INDICATIVE',
        basisKey: 'b1'
      },
      {
        id: 'serv_2',
        nameKey: 's2',
        subKey: 'sub2',
        category: 'tattoo',
        currency: '£',
        min: 100,
        max: 200,
        confidence: 'INDICATIVE',
        basisKey: 'b2'
      },
      {
        id: 'serv_3',
        nameKey: 's3',
        subKey: 'sub3',
        category: 'piercing',
        currency: '£',
        min: 30,
        max: 50,
        confidence: 'INDICATIVE',
        basisKey: 'b3'
      },
      {
        id: 'serv_gap',
        nameKey: 'sg',
        subKey: 'subg',
        category: 'piercing',
        currency: '£',
        min: null,
        max: null,
        confidence: 'GAP',
        basisKey: 'bg'
      }
    ];

    it('aggregates evaluated, below, market, and premium counts accurately', () => {
      const userPrices = {
        serv_1: '60',  // below (min 80)
        serv_2: '150', // market (100-200)
        serv_3: '70',  // premium (max 50)
        serv_gap: '40' // gap row -> evaluated but not below/market/premium
      };

      const metrics = calculatePricingMetrics(mockRows, userPrices);
      expect(metrics.evaluatedCount).toBe(4);
      expect(metrics.belowCount).toBe(1);
      expect(metrics.marketCount).toBe(1);
      expect(metrics.premiumCount).toBe(1);
    });

    it('handles empty pricing records gracefully', () => {
      const metrics = calculatePricingMetrics(mockRows, {});
      expect(metrics.evaluatedCount).toBe(0);
      expect(metrics.belowCount).toBe(0);
      expect(metrics.marketCount).toBe(0);
      expect(metrics.premiumCount).toBe(0);
    });
  });

  describe('formatCurrencyValue', () => {
    it('formats valid numbers with currency symbol and thousands separator', () => {
      expect(formatCurrencyValue(1500, '£')).toBe('£1,500');
      expect(formatCurrencyValue(85, '$')).toBe('$85');
    });

    it('returns fallback string for null or NaN values', () => {
      expect(formatCurrencyValue(null, '£')).toBe('N/A');
      expect(formatCurrencyValue(NaN, '£', { fallback: 'N/A' })).toBe('N/A');
    });
  });
});

describe('Regional Data Mapping across all 9 Markets', () => {
  const ALL_MARKETS: RegionId[] = [
    'uk',
    'london',
    'us',
    'eu',
    'au',
    'cee',
    'ca',
    'sa',
    'sea'
  ];

  it('defines metadata for all 9 markets without omission', () => {
    expect(Object.keys(REGIONS_METADATA).sort()).toEqual(ALL_MARKETS.sort());
    for (const regionId of ALL_MARKETS) {
      const meta = REGIONS_METADATA[regionId];
      expect(meta).toBeDefined();
      expect(meta.id).toBe(regionId);
      expect(typeof meta.nameKey).toBe('string');
      expect(typeof meta.currency).toBe('string');
      expect(typeof meta.currencyCode).toBe('string');
      expect(typeof meta.symbol).toBe('string');
      expect(typeof meta.coverageNoteKey).toBe('string');
      expect(typeof meta.jewelleryPolicyKey).toBe('string');
    }
  });

  it('has benchmark procedure rows for every market', () => {
    expect(Object.keys(BENCHMARK_DATA).sort()).toEqual(ALL_MARKETS.sort());
    for (const regionId of ALL_MARKETS) {
      const rows = BENCHMARK_DATA[regionId];
      expect(Array.isArray(rows)).toBe(true);
      expect(rows.length).toBeGreaterThan(0);

      // Verify presence of both tattoo and piercing categories
      const tattooProcedures = rows.filter((r) => r.category === 'tattoo');
      const piercingProcedures = rows.filter((r) => r.category === 'piercing');
      expect(tattooProcedures.length).toBeGreaterThan(0);
      expect(piercingProcedures.length).toBeGreaterThan(0);
    }
  });

  it('validates procedure row integrity and range consistency across all markets', () => {
    for (const regionId of ALL_MARKETS) {
      const meta = REGIONS_METADATA[regionId];
      const rows = BENCHMARK_DATA[regionId];

      for (const row of rows) {
        expect(typeof row.id).toBe('string');
        expect(['tattoo', 'piercing']).toContain(row.category);
        expect(['INDICATIVE', 'GAP']).toContain(row.confidence);
        expect(row.currency).toBe(meta.currency);

        if (row.confidence === 'GAP') {
          // Data gaps must have null bounds
          expect(row.min).toBeNull();
          expect(row.max).toBeNull();
        } else {
          // Indicative rows must have positive bounds with min <= max
          expect(row.min).not.toBeNull();
          expect(row.max).not.toBeNull();
          expect(typeof row.min).toBe('number');
          expect(typeof row.max).toBe('number');
          expect(row.min!).toBeGreaterThan(0);
          expect(row.max!).toBeGreaterThanOrEqual(row.min!);
        }
      }
    }
  });

  it('verifies ISO currency codes and symbols for each specific market', () => {
    expect(REGIONS_METADATA.uk.currencyCode).toBe('GBP');
    expect(REGIONS_METADATA.uk.currency).toBe('£');

    expect(REGIONS_METADATA.london.currencyCode).toBe('GBP');
    expect(REGIONS_METADATA.london.currency).toBe('£');

    expect(REGIONS_METADATA.us.currencyCode).toBe('USD');
    expect(REGIONS_METADATA.us.currency).toBe('$');

    expect(REGIONS_METADATA.eu.currencyCode).toBe('EUR');
    expect(REGIONS_METADATA.eu.currency).toBe('€');

    expect(REGIONS_METADATA.au.currencyCode).toBe('AUD');
    expect(REGIONS_METADATA.au.currency).toBe('A$');

    expect(REGIONS_METADATA.cee.currencyCode).toBe('EUR');
    expect(REGIONS_METADATA.cee.currency).toBe('€');

    expect(REGIONS_METADATA.ca.currencyCode).toBe('CAD');
    expect(REGIONS_METADATA.ca.currency).toBe('C$');

    expect(REGIONS_METADATA.sa.currencyCode).toBe('BRL');
    expect(REGIONS_METADATA.sa.currency).toBe('R$');

    expect(REGIONS_METADATA.sea.currencyCode).toBe('THB');
    expect(REGIONS_METADATA.sea.currency).toBe('฿');
  });

  it('confirms London benchmark ranges reflect capital premium over UK national ranges', () => {
    const ukRows = BENCHMARK_DATA.uk;
    const londonRows = BENCHMARK_DATA.london;

    const ukSmallTattoo = ukRows.find((r) => r.id === 'tattoo_small');
    const londonSmallTattoo = londonRows.find((r) => r.id === 'tattoo_small');

    expect(ukSmallTattoo).toBeDefined();
    expect(londonSmallTattoo).toBeDefined();
    expect(londonSmallTattoo!.min!).toBeGreaterThanOrEqual(ukSmallTattoo!.min!);
    expect(londonSmallTattoo!.max!).toBeGreaterThanOrEqual(ukSmallTattoo!.max!);
  });
});
