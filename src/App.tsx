import React, { useState, useEffect } from 'react';
import { StudioBenchmark } from './components/StudioBenchmark';
import { BenchmarkDocumentation } from './components/BenchmarkDocumentation';
import { BenchmarkEmbed } from './components/BenchmarkEmbed';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { RegionId } from './types';
import { t, SupportedLanguage, getLanguage, setLanguage, applyI18n } from './i18n';

type ActiveTab = 'benchmark' | 'docs' | 'embed';

export const App: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<RegionId>('uk');
  const [activeTab, setActiveTab] = useState<ActiveTab>('benchmark');
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(getLanguage());

  useEffect(() => {
    applyI18n(currentLanguage);
  }, [currentLanguage]);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    setCurrentLanguage(lang);
    applyI18n(lang);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans antialiased flex flex-col">
      {/* Top Header & Branding */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-30 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl" role="img" aria-label="chart">📊</span>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-[var(--text-heading)]">
                {t('app.title')}
              </h1>
              <p className="text-[11px] text-[var(--muted)] hidden sm:block">
                Poli International &bull; {t('app.badge')}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-[var(--surface-elevated)] p-1 rounded-lg border border-[var(--border)]">
            <button
              onClick={() => setActiveTab('benchmark')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'benchmark'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
              }`}
            >
              📊 {t('app.nav_benchmark')}
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'docs'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
              }`}
            >
              📖 {t('app.nav_docs')}
            </button>
            <button
              onClick={() => setActiveTab('embed')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'embed'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
              }`}
            >
              ⚡ {t('app.nav_embed')}
            </button>
          </nav>

          {/* Header Controls: Language Switcher & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher
              currentLanguage={currentLanguage}
              onLanguageChange={handleLanguageChange}
            />

            <button
              onClick={handlePrint}
              className="hidden md:inline-flex bg-[var(--surface-elevated)] hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border)] transition-colors cursor-pointer items-center gap-1.5"
            >
              <span>🖨️</span>
              <span>{t('app.print')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Intro Header Banner (Only visible on Benchmark tab) */}
        {activeTab === 'benchmark' && (
          <div className="mb-6 text-center max-w-3xl mx-auto print:mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
              💷 {t('app.badge')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-heading)] tracking-tight">
              {t('app.title')}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
              {t('app.subtitle')}
            </p>
          </div>
        )}

        {/* View Switcher */}
        {activeTab === 'benchmark' && (
          <StudioBenchmark
            selectedRegion={selectedRegion}
            onSelectRegion={setSelectedRegion}
            currentLanguage={currentLanguage}
          />
        )}

        {activeTab === 'docs' && (
          <BenchmarkDocumentation currentLanguage={currentLanguage} />
        )}

        {activeTab === 'embed' && <BenchmarkEmbed />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] mt-auto py-6 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--text)]">{t('app.title')}</span>
            <span>&bull;</span>
            <span>Poli International</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://poliinternational.com/tools/studio-pricing-benchmark/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline font-medium"
            >
              {t('app.open_standalone')}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
