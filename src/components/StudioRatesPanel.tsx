import React, { useState, useMemo, useCallback } from 'react';
import { Sliders, Calculator, Copy, Check, Printer } from 'lucide-react';
import { StudioRates, StudioTier, BenchmarkRow, RegionMetadata } from '../types';
import { parsePrice, sanitizePriceInput } from '../hooks/useStudioPricing';
import { t, getLanguage } from '../i18n';

interface StudioRatesPanelProps {
  rates: StudioRates;
  onRatesChange: (updated: StudioRates) => void;
  regionMeta: RegionMetadata;
  rows: BenchmarkRow[];
  userPrices: Record<string, string>;
  onPriceChange: (serviceId: string, val: string) => void;
}

export const StudioRatesPanel: React.FC<StudioRatesPanelProps> = ({
  rates,
  onRatesChange,
  regionMeta,
  rows,
  userPrices,
  onPriceChange
}) => {
  // What-If Calculator state (-20% to +30%, default 0%; booking hours default 2)
  const [adjustmentPercent, setAdjustmentPercent] = useState<number>(0);
  const [bookingHours, setBookingHours] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);
  // Translated memos must recompute on a language switch, or they stay in the old language.
  const lang = getLanguage();

  // Hourly and minimum benchmark reference rows
  const hourlyRow = useMemo(() => rows.find((r) => r.id === 'tattoo_hourly'), [rows]);
  const minRow = useMemo(() => rows.find((r) => r.id === 'tattoo_minimum'), [rows]);

  const handleFieldChange = (field: keyof StudioRates, val: string) => {
    const updated = { ...rates, [field]: val };
    onRatesChange(updated);

    // Synchronize tattoo_hourly with hourlyRate if user entered it
    if (field === 'hourlyRate') {
      onPriceChange('tattoo_hourly', val);
    }
    // Synchronize tattoo_minimum with shopMinimum if user entered it
    if (field === 'shopMinimum') {
      onPriceChange('tattoo_minimum', val);
    }
  };

  const handleTierChange = (tier: StudioTier) => {
    onRatesChange({ ...rates, tier });
  };

  // Status for hourly rate
  const hourlyStatus = useMemo(() => {
    const num = parsePrice(rates.hourlyRate);
    if (!hourlyRow || hourlyRow.min === null || hourlyRow.max === null || num === null) {
      return null;
    }
    if (num < hourlyRow.min) return 'below';
    if (num > hourlyRow.max) return 'above';
    return 'within';
  }, [rates.hourlyRate, hourlyRow]);

  // Status for shop minimum
  const minStatus = useMemo(() => {
    const num = parsePrice(rates.shopMinimum);
    if (!minRow || minRow.min === null || minRow.max === null || num === null) {
      return null;
    }
    if (num < minRow.min) return 'below';
    if (num > minRow.max) return 'above';
    return 'within';
  }, [rates.shopMinimum, minRow]);

  // Tier descriptive text
  const tierDescription = useMemo(() => {
    switch (rates.tier) {
      case 'apprentice':
        return t('rates.tier_desc_apprentice');
      case 'resident':
        return t('rates.tier_desc_resident');
      case 'established':
        return t('rates.tier_desc_established');
      case 'specialist':
        return t('rates.tier_desc_specialist');
      default:
        return t('rates.tier_desc_resident');
    }
  }, [rates.tier, lang]);

  const tierLabel = useMemo(() => {
    switch (rates.tier) {
      case 'apprentice':
        return t('rates.tier_apprentice');
      case 'resident':
        return t('rates.tier_resident');
      case 'established':
        return t('rates.tier_established');
      case 'specialist':
        return t('rates.tier_specialist');
      default:
        return t('rates.tier_resident');
    }
  }, [rates.tier, lang]);

  // What-If calculations: Arithmetic on owner input only
  const hourlyNum = parsePrice(rates.hourlyRate);
  // The owner's own figure only. `Number(x) || 25` turned a deliberate 0% deposit
  // into 25%, putting the tool's number into the owner's settings.
  const depositRaw = String(rates.depositPercent ?? '').trim();
  const depositPct = depositRaw === '' || isNaN(Number(depositRaw)) ? 0 : Math.max(0, Math.min(100, Number(depositRaw)));
  const depositLabel = depositRaw === '' ? '—' : `${depositPct}%`;

  const whatIfCalculations = useMemo(() => {
    if (hourlyNum === null) return null;
    const factor = 1 + adjustmentPercent / 100;
    const projectedHourly = Math.round(hourlyNum * factor * 100) / 100;
    const bookingTotal = Math.round(projectedHourly * bookingHours * 100) / 100;
    const depositDue = Math.round(bookingTotal * (depositPct / 100) * 100) / 100;

    return {
      projectedHourly,
      bookingTotal,
      depositDue
    };
  }, [hourlyNum, adjustmentPercent, bookingHours, depositPct]);

  // Handoff text block
  const handoffText = useMemo(() => {
    const lines = [
      t('handoff.title'),
      t('handoff.decision_notice'),
      '',
      `${t('rates.hourly')}: ${rates.hourlyRate ? `${regionMeta.currency}${rates.hourlyRate}/hr` : '—'}`,
      `${t('rates.min_charge')}: ${rates.minimumCharge ? `${regionMeta.currency}${rates.minimumCharge}` : '—'}`,
      `${t('rates.shop_min')}: ${rates.shopMinimum ? `${regionMeta.currency}${rates.shopMinimum}` : '—'}`,
      `${t('rates.deposit')}: ${depositLabel}`,
      `${t('rates.tier_label')}: ${tierLabel}`
    ];
    return lines.join('\n');
  }, [rates, regionMeta, tierLabel, depositLabel, lang]);

  const handleCopyHandoff = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(handoffText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        // Fallback
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [handoffText]);

  const handlePrintCard = useCallback(() => {
    window.print();
  }, []);

  const todayDate = useMemo(() => {
    return new Date().toLocaleDateString('en-CA'); // local date; toISOString() is UTC
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. YOUR RATES PANEL */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm no-print">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
              <Sliders className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-heading)]">
                {t('rates.title')}
              </h2>
              <p className="text-xs text-[var(--muted)]">
                {t('rates.subtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handlePrintCard}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface)] text-[var(--text-heading)] border border-[var(--border)] transition-colors cursor-pointer"
            aria-label={t('card.print_btn')}
          >
            <Printer className="w-4 h-4 text-[var(--primary)]" aria-hidden="true" />
            <span>{t('card.print_btn')}</span>
          </button>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Hourly Rate */}
          <div className="space-y-1.5">
            <label htmlFor="input-hourly-rate" className="block text-xs font-semibold text-[var(--text-heading)]">
              {t('rates.hourly')} ({regionMeta.currency}/hr)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] font-mono">
                {regionMeta.currency}
              </span>
              <input
                id="input-hourly-rate"
                type="text"
                inputMode="decimal"
                value={rates.hourlyRate}
                onChange={(e) => handleFieldChange('hourlyRate', sanitizePriceInput(e.target.value))}
                placeholder="100"
                className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          {/* Minimum Charge */}
          <div className="space-y-1.5">
            <label htmlFor="input-min-charge" className="block text-xs font-semibold text-[var(--text-heading)]">
              {t('rates.min_charge')} ({regionMeta.currency})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] font-mono">
                {regionMeta.currency}
              </span>
              <input
                id="input-min-charge"
                type="text"
                inputMode="decimal"
                value={rates.minimumCharge}
                onChange={(e) => handleFieldChange('minimumCharge', sanitizePriceInput(e.target.value))}
                placeholder="60"
                className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          {/* Shop Minimum */}
          <div className="space-y-1.5">
            <label htmlFor="input-shop-min" className="block text-xs font-semibold text-[var(--text-heading)]">
              {t('rates.shop_min')} ({regionMeta.currency})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] font-mono">
                {regionMeta.currency}
              </span>
              <input
                id="input-shop-min"
                type="text"
                inputMode="decimal"
                value={rates.shopMinimum}
                onChange={(e) => handleFieldChange('shopMinimum', sanitizePriceInput(e.target.value))}
                placeholder="50"
                className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          {/* Deposit Percentage */}
          <div className="space-y-1.5">
            <label htmlFor="input-deposit-pct" className="block text-xs font-semibold text-[var(--text-heading)]">
              {t('rates.deposit')} (%)
            </label>
            <div className="relative">
              <input
                id="input-deposit-pct"
                type="number"
                min="0"
                max="100"
                value={rates.depositPercent}
                onChange={(e) => handleFieldChange('depositPercent', e.target.value)}
                placeholder="25"
                className="w-full pl-3 pr-8 py-2 text-sm font-semibold rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] font-mono">
                %
              </span>
            </div>
          </div>
        </div>

        {/* Studio Tier Selector & Dynamic Descriptive Note */}
        <div className="border-t border-[var(--border)] pt-4 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
            <label htmlFor="studio-tier-select" className="text-xs font-semibold text-[var(--text-heading)]">
              {t('rates.tier_label')}
            </label>
            <div className="inline-flex rounded-lg border border-[var(--border)] p-1 bg-[var(--surface-elevated)]">
              {(['apprentice', 'resident', 'established', 'specialist'] as StudioTier[]).map((tierKey) => (
                <button
                  key={tierKey}
                  type="button"
                  onClick={() => handleTierChange(tierKey)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    rates.tier === tierKey
                      ? 'bg-[var(--surface)] text-[var(--text-heading)] shadow-xs font-semibold'
                      : 'text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {tierKey === 'apprentice' && t('rates.tier_apprentice')}
                  {tierKey === 'resident' && t('rates.tier_resident')}
                  {tierKey === 'established' && t('rates.tier_established')}
                  {tierKey === 'specialist' && t('rates.tier_specialist')}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-[var(--muted)] leading-relaxed bg-[var(--surface-elevated)] p-3 rounded-lg border border-[var(--border)]">
            {tierDescription}
          </p>
        </div>

        {/* Regional Reference Ranges Comparison (Shows range, never a correct number) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* Hourly Rate vs Region */}
          <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-semibold text-[var(--text-heading)]">
                {t('rates.hourly')}
              </span>
              {hourlyStatus === 'below' && (
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/30">
                  {t('rates.status_below')}
                </span>
              )}
              {hourlyStatus === 'within' && (
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {t('rates.status_within')}
                </span>
              )}
              {hourlyStatus === 'above' && (
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  {t('rates.status_above')}
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--muted)]">
              {hourlyRow && hourlyRow.min !== null && hourlyRow.max !== null
                ? t('rates.hourly_vs_region')
                    .replace('{min}', `${regionMeta.currency}${hourlyRow.min}`)
                    .replace('{max}', `${regionMeta.currency}${hourlyRow.max}`)
                : t('conf.gap_desc')}
            </p>
          </div>

          {/* Shop Minimum vs Region */}
          <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-semibold text-[var(--text-heading)]">
                {t('rates.shop_min')}
              </span>
              {minStatus === 'below' && (
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/30">
                  {t('rates.status_below')}
                </span>
              )}
              {minStatus === 'within' && (
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {t('rates.status_within')}
                </span>
              )}
              {minStatus === 'above' && (
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  {t('rates.status_above')}
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--muted)]">
              {minRow && minRow.min !== null && minRow.max !== null
                ? t('rates.min_vs_region')
                    .replace('{min}', `${regionMeta.currency}${minRow.min}`)
                    .replace('{max}', `${regionMeta.currency}${minRow.max}`)
                : t('conf.gap_desc')}
            </p>
          </div>
        </div>
      </section>

      {/* 2. WHAT-IF RATE CALCULATOR */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm no-print">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
            <Calculator className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-heading)]">
              {t('whatif.title')}
            </h2>
            <p className="text-xs text-[var(--muted)]">
              {t('whatif.subtitle')}
            </p>
          </div>
        </div>

        {hourlyNum === null ? (
          <div className="p-4 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] text-xs text-[var(--muted)]">
            {t('whatif.prompt_hourly')}
          </div>
        ) : (
          <div className="space-y-5">
            {/* Controls: -20% to +30% & Booking Duration N hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Rate Adjustment Slider & Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="whatif-range-slider" className="text-xs font-semibold text-[var(--text-heading)]">
                    {t('whatif.rate_adjustment')}
                  </label>
                  <span className="text-xs font-mono font-bold text-[var(--primary)]">
                    {adjustmentPercent >= 0 ? `+${adjustmentPercent}%` : `${adjustmentPercent}%`}
                  </span>
                </div>
                <input
                  id="whatif-range-slider"
                  type="range"
                  min="-20"
                  max="30"
                  step="1"
                  value={adjustmentPercent}
                  onChange={(e) => setAdjustmentPercent(Number(e.target.value))}
                  className="w-full accent-[var(--primary)] cursor-pointer"
                />
                <div className="flex items-center justify-between gap-1 pt-1">
                  {[-20, -10, 0, 10, 20, 30].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setAdjustmentPercent(pct)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                        adjustmentPercent === pct
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-[var(--surface-elevated)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
                      }`}
                    >
                      {pct > 0 ? `+${pct}%` : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Booking Duration N (hours, default 2) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="whatif-booking-hours" className="text-xs font-semibold text-[var(--text-heading)]">
                    {t('whatif.booking_hours')}
                  </label>
                  <span className="text-xs font-mono font-bold text-[var(--text-heading)]">
                    {bookingHours} hrs
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="whatif-booking-hours"
                    type="number"
                    min="0.5"
                    max="24"
                    step="0.5"
                    value={bookingHours}
                    onChange={(e) => setBookingHours(Math.max(0.5, Number(e.target.value) || 1))}
                    className="w-full px-3 py-1.5 text-sm font-semibold rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)]"
                  />
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setBookingHours(h)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                          bookingHours === h
                            ? 'bg-[var(--primary)] text-white'
                            : 'bg-[var(--surface-elevated)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
                        }`}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Arithmetic Projection Cards */}
            {whatIfCalculations && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg p-3.5">
                  <span className="text-[11px] text-[var(--muted)] block mb-1">
                    {t('whatif.projected_hourly')}
                  </span>
                  <div className="text-base font-bold text-[var(--text-heading)] font-mono">
                    {regionMeta.currency}{whatIfCalculations.projectedHourly}/hr
                  </div>
                </div>

                <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg p-3.5">
                  <span className="text-[11px] text-[var(--muted)] block mb-1">
                    {t('whatif.booking_total').replace('{hours}', String(bookingHours))}
                  </span>
                  <div className="text-base font-bold text-[var(--text-heading)] font-mono">
                    {regionMeta.currency}{whatIfCalculations.bookingTotal}
                  </div>
                </div>

                <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg p-3.5">
                  <span className="text-[11px] text-[var(--muted)] block mb-1">
                    {t('whatif.deposit_due').replace('{percent}', String(depositPct))}
                  </span>
                  <div className="text-base font-bold text-[var(--primary)] font-mono">
                    {regionMeta.currency}{whatIfCalculations.depositDue}
                  </div>
                </div>
              </div>
            )}

            <div className="text-right">
              <span className="text-[11px] text-[var(--muted)] italic">
                {t('whatif.disclaimer')}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* 3. SETTINGS HANDOFF */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm no-print">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-[var(--text-heading)]">
              {t('handoff.title')}
            </h2>
            <p className="text-xs text-[var(--muted)]">
              {t('handoff.decision_notice')}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyHandoff}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--primary)] text-white hover:opacity-90 transition-opacity cursor-pointer"
            aria-label={t('handoff.copy_btn')}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('handoff.copied')}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('handoff.copy_btn')}</span>
              </>
            )}
          </button>
        </div>

        <pre className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg p-4 font-mono text-xs text-[var(--text)] whitespace-pre-wrap leading-relaxed select-all">
          {handoffText}
        </pre>
      </section>

      {/* 4. PRINTABLE RATE CARD (A4 / US Letter Single Page) */}
      <section id="printable-rate-card" className="bg-white text-black p-6 md:p-8 rounded-xl border border-[var(--border)] shadow-xs print:border-0 print:p-0 print:m-0 print:shadow-none">
        <div className="flex items-start justify-between border-b pb-4 mb-5 border-gray-200">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900">
              {t('card.studio_card_header')}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {tierLabel} • {regionMeta.name}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-gray-400">
              {todayDate}
            </span>
          </div>
        </div>

        {/* Studio Baseline Numbers */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
            {t('card.baseline_rates')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-2.5 rounded bg-gray-50 border border-gray-100">
              <span className="text-[10px] text-gray-500 block">{t('rates.hourly')}</span>
              <span className="text-sm font-bold font-mono text-gray-900">
                {rates.hourlyRate ? `${regionMeta.currency}${rates.hourlyRate}/hr` : '—'}
              </span>
            </div>
            <div className="p-2.5 rounded bg-gray-50 border border-gray-100">
              <span className="text-[10px] text-gray-500 block">{t('rates.min_charge')}</span>
              <span className="text-sm font-bold font-mono text-gray-900">
                {rates.minimumCharge ? `${regionMeta.currency}${rates.minimumCharge}` : '—'}
              </span>
            </div>
            <div className="p-2.5 rounded bg-gray-50 border border-gray-100">
              <span className="text-[10px] text-gray-500 block">{t('rates.shop_min')}</span>
              <span className="text-sm font-bold font-mono text-gray-900">
                {rates.shopMinimum ? `${regionMeta.currency}${rates.shopMinimum}` : '—'}
              </span>
            </div>
            <div className="p-2.5 rounded bg-gray-50 border border-gray-100">
              <span className="text-[10px] text-gray-500 block">{t('rates.deposit')}</span>
              <span className="text-sm font-bold font-mono text-gray-900">
                {depositLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Service Rates Table (No region ranges on the card) */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
            {t('card.service_rates')}
          </h3>
          <div className="overflow-hidden border border-gray-200 rounded">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-2 px-3 font-semibold text-gray-700">{t('table.service')}</th>
                  <th className="py-2 px-3 font-semibold text-gray-700 text-right">{t('table.your_price')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map((row) => {
                  const price = userPrices[row.id];
                  return (
                    <tr key={row.id}>
                      <td className="py-2 px-3 text-gray-900 font-medium">
                        {t(row.nameKey)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-gray-900">
                        {price ? `${regionMeta.currency}${price}` : t('card.price_on_consultation')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="pt-3 border-t border-gray-200 text-center">
          <p className="text-[10px] text-gray-400">
            {t('card.footer_notice')}
          </p>
        </div>
      </section>
    </div>
  );
};
