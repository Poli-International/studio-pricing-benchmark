import React, { useState } from 'react';
import { getLanguage, t, SupportedLanguage } from '../i18n';
import { DOCS_BUNDLE, DocFileType } from '../data/docsContent';

interface BenchmarkDocumentationProps {
  currentLanguage?: SupportedLanguage;
}

export const BenchmarkDocumentation: React.FC<BenchmarkDocumentationProps> = ({
  currentLanguage: propLang
}) => {
  const activeLang = propLang || getLanguage();
  const [selectedFile, setSelectedFile] = useState<DocFileType>('TECHNICAL-DOCS.md');
  const [viewMode, setViewMode] = useState<'rendered' | 'markdown'>('rendered');
  const [copied, setCopied] = useState(false);

  const rawMarkdown = DOCS_BUNDLE[activeLang]?.[selectedFile] || DOCS_BUNDLE['en'][selectedFile] || '';

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(rawMarkdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = rawMarkdown;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([rawMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeLang}-${selectedFile}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 md:p-10 shadow-lg max-w-4xl mx-auto space-y-8 text-sm leading-relaxed text-[var(--text)]">
      {/* Documentation Header */}
      <header className="border-b border-[var(--border)] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
              {t('docs.badge')} &bull; {activeLang.toUpperCase()}
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text-heading)] mb-2">
              {t('docs.title')}
            </h2>
            <p className="text-xs md:text-sm text-[var(--muted)]">
              {t('docs.subtitle')}
            </p>
          </div>
        </div>

        {/* Document File Selector & Actions Bar */}
        <div className="mt-6 pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="doc-file-select" className="text-xs font-semibold text-[var(--muted)]">
              {t('docs.file_selector')}
            </label>
            <select
              id="doc-file-select"
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value as DocFileType)}
              className="bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-heading)] rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-[var(--primary)] transition-colors cursor-pointer"
            >
              <option value="TECHNICAL-DOCS.md">{t('docs.file_tech')}</option>
              <option value="USER-GUIDE.md">{t('docs.file_user')}</option>
              <option value="README.md">{t('docs.file_readme')}</option>
              <option value="CONTRIBUTING.md">{t('docs.file_contrib')}</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-[var(--surface-elevated)] p-1 rounded-lg border border-[var(--border)] flex items-center">
              <button
                onClick={() => setViewMode('rendered')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'rendered'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {t('docs.view_rendered')}
              </button>
              <button
                onClick={() => setViewMode('markdown')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'markdown'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {t('docs.view_markdown')}
              </button>
            </div>

            <button
              onClick={handleCopyMarkdown}
              className="bg-[var(--surface-elevated)] hover:bg-[var(--border)] text-[var(--text)] text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[var(--border)] transition-colors cursor-pointer inline-flex items-center gap-1.5"
              title={t('docs.copied_md')}
            >
              <span>{copied ? '✅' : '📋'}</span>
              <span>{copied ? t('common.copied') : t('common.copy')}</span>
            </button>

            <button
              onClick={handleDownload}
              className="bg-[var(--surface-elevated)] hover:bg-[var(--border)] text-[var(--text)] text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[var(--border)] transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>💾</span>
              <span>{t('common.download')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Raw Markdown Mode */}
      {viewMode === 'markdown' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span className="font-mono">docs/{activeLang}/{selectedFile}</span>
            <span>{rawMarkdown.length.toLocaleString()} bytes &bull; UTF-8</span>
          </div>
          <div className="relative">
            <pre className="w-full max-h-[600px] overflow-y-auto bg-[var(--code-bg)] text-[var(--code-text)] border border-[var(--code-border)] rounded-lg p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap select-text">
              {rawMarkdown}
            </pre>
          </div>
        </div>
      )}

      {/* Formatted Guide Mode */}
      {viewMode === 'rendered' && (
        <div className="space-y-8">
          {/* Section 1: Architecture Overview */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-[var(--text-heading)] border-b border-[var(--border)] pb-2">
              1. {t('docs.sec_overview')}
            </h3>
            <p className="text-[var(--text)] leading-relaxed">
              {t('docs.sec_overview_body')}
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[var(--muted)]">
              <li><strong>{t('docs.feature_zero_net').split(':')[0]}:</strong> {t('docs.feature_zero_net').split(':')[1]}</li>
              <li><strong>{t('docs.feature_theme').split(':')[0]}:</strong> {t('docs.feature_theme').split(':')[1]}</li>
              <li><strong>{t('docs.feature_a11y').split(':')[0]}:</strong> {t('docs.feature_a11y').split(':')[1]}</li>
            </ul>
          </section>

          {/* Section 2: Data Integrity & Confidence Methodology */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-[var(--text-heading)] border-b border-[var(--border)] pb-2">
              2. {t('docs.sec_methodology')}
            </h3>
            <p className="text-[var(--text)] leading-relaxed">
              {t('docs.sec_methodology_body')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-[var(--surface-elevated)] p-4 rounded-lg border border-dashed border-amber-500/40">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border border-dashed border-amber-500 text-amber-400 bg-amber-500/10 mb-2">
                  [INDICATIVE]
                </span>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  {t('docs.conf_ind_desc')}
                </p>
              </div>
              <div className="bg-[var(--surface-elevated)] p-4 rounded-lg border border-dotted border-[var(--border)]">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border border-dotted border-[var(--border)] text-[var(--muted)] bg-[var(--surface)] mb-2">
                  [GAP]
                </span>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  {t('docs.conf_gap_desc')}
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Regional Scope */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-[var(--text-heading)] border-b border-[var(--border)] pb-2">
              3. {t('docs.sec_regions')}
            </h3>
            <p className="text-[var(--text)] leading-relaxed">
              {t('docs.sec_regions_body')}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse mt-2">
                <thead>
                  <tr className="bg-[var(--surface-elevated)] text-[var(--text-heading)] border-b border-[var(--border)]">
                    <th className="p-2.5 font-bold">{t('docs.th_region_code')}</th>
                    <th className="p-2.5 font-bold">{t('docs.th_territory')}</th>
                    <th className="p-2.5 font-bold">{t('docs.th_currency')}</th>
                    <th className="p-2.5 font-bold">{t('docs.th_scope_basis')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-[var(--muted)]">
                  <tr>
                    <td className="p-2.5 font-mono text-[var(--text)]">uk</td>
                    <td className="p-2.5">{t('region.uk.name')}</td>
                    <td className="p-2.5">GBP (£)</td>
                    <td className="p-2.5">{t('docs.scope_uk')}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono text-[var(--text)]">london</td>
                    <td className="p-2.5">{t('region.london.name')}</td>
                    <td className="p-2.5">GBP (£)</td>
                    <td className="p-2.5">{t('docs.scope_london')}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono text-[var(--text)]">us</td>
                    <td className="p-2.5">{t('region.us.name')}</td>
                    <td className="p-2.5">USD ($)</td>
                    <td className="p-2.5">{t('docs.scope_us')}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono text-[var(--text)]">eu</td>
                    <td className="p-2.5">{t('region.eu.name')}</td>
                    <td className="p-2.5">EUR (€)</td>
                    <td className="p-2.5">{t('docs.scope_eu')}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono text-[var(--text)]">au</td>
                    <td className="p-2.5">{t('region.au.name')}</td>
                    <td className="p-2.5">AUD (A$)</td>
                    <td className="p-2.5">{t('docs.scope_au')}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono text-[var(--text)]">cee</td>
                    <td className="p-2.5">{t('region.cee.name')}</td>
                    <td className="p-2.5">EUR (€)</td>
                    <td className="p-2.5">{t('docs.scope_cee')}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono text-[var(--text)]">ca</td>
                    <td className="p-2.5">{t('region.ca.name')}</td>
                    <td className="p-2.5">CAD (C$)</td>
                    <td className="p-2.5">{t('docs.scope_ca')}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono text-[var(--text)]">sa</td>
                    <td className="p-2.5">{t('region.sa.name')}</td>
                    <td className="p-2.5">BRL (R$)</td>
                    <td className="p-2.5">{t('docs.scope_sa')}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono text-[var(--text)]">sea</td>
                    <td className="p-2.5">{t('region.sea.name')}</td>
                    <td className="p-2.5">THB (฿)</td>
                    <td className="p-2.5">{t('docs.scope_sea')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: Jewellery Inclusions */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-[var(--text-heading)] border-b border-[var(--border)] pb-2">
              4. {t('docs.sec_jewellery')}
            </h3>
            <p className="text-[var(--text)] leading-relaxed">
              {t('docs.sec_jewellery_body')}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse mt-2">
                <thead>
                  <tr className="bg-[var(--surface-elevated)] text-[var(--text-heading)] border-b border-[var(--border)]">
                    <th className="p-2.5 font-bold">{t('docs.th_territory')}</th>
                    <th className="p-2.5 font-bold">{t('docs.th_jewellery_policy')}</th>
                    <th className="p-2.5 font-bold">{t('docs.th_material_standard')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-[var(--muted)]">
                  <tr>
                    <td className="p-2.5 font-medium text-[var(--text)]">{t('region.uk.name')}</td>
                    <td className="p-2.5 text-emerald-400 font-medium">{t('docs.jewellery_inc_proc')}</td>
                    <td className="p-2.5">{t('docs.jewellery_mat_titanium')}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-[var(--text)]">{t('region.london.name')}</td>
                    <td className="p-2.5 text-emerald-400 font-medium">{t('docs.jewellery_inc_proc')}</td>
                    <td className="p-2.5">{t('docs.jewellery_mat_titanium')}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-[var(--text)]">{t('region.us.name')}</td>
                    <td className="p-2.5 text-amber-400 font-medium">{t('docs.jewellery_sep_charged')}</td>
                    <td className="p-2.5">{t('docs.jewellery_mat_client')}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-[var(--text)]">{t('region.eu.name')}</td>
                    <td className="p-2.5 text-emerald-400 font-medium">{t('docs.jewellery_std_included')}</td>
                    <td className="p-2.5">{t('docs.jewellery_mat_eu')}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-[var(--text)]">{t('region.au.name')}</td>
                    <td className="p-2.5 text-emerald-400 font-medium">{t('docs.jewellery_mat_au_inc')}</td>
                    <td className="p-2.5">{t('docs.jewellery_mat_au_std')}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-[var(--text)]">{t('region.cee.name')}</td>
                    <td className="p-2.5 text-emerald-400 font-medium">{t('docs.jewellery_mat_cee_inc')}</td>
                    <td className="p-2.5">{t('docs.jewellery_mat_cee_std')}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-[var(--text)]">{t('region.ca.name')}</td>
                    <td className="p-2.5 text-amber-400 font-medium">{t('docs.jewellery_mat_ca_sep')}</td>
                    <td className="p-2.5">{t('docs.jewellery_mat_ca_std')}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-[var(--text)]">{t('region.sa.name')}</td>
                    <td className="p-2.5 text-emerald-400 font-medium">{t('docs.jewellery_mat_sa_inc')}</td>
                    <td className="p-2.5">{t('docs.jewellery_mat_sa_std')}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-[var(--text)]">{t('region.sea.name')}</td>
                    <td className="p-2.5 text-emerald-400 font-medium">{t('docs.jewellery_mat_sea_inc')}</td>
                    <td className="p-2.5">{t('docs.jewellery_mat_sea_std')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5: Standards & Materials */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-[var(--text-heading)] border-b border-[var(--border)] pb-2">
              5. {t('docs.sec_standards_title')}
            </h3>
            <p className="text-[var(--text)] leading-relaxed">
              {t('docs.sec_standards_body')}
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[var(--muted)]">
              <li>{t('docs.std_astm_f136')}</li>
              <li>{t('docs.std_astm_f138')}</li>
              <li>{t('docs.std_iso_10993')}</li>
              <li>{t('docs.std_en_1811')}</li>
              <li>{t('docs.std_eu_reach')}</li>
            </ul>
          </section>

          {/* Section 6: Data Sovereignty */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-[var(--text-heading)] border-b border-[var(--border)] pb-2">
              6. {t('docs.sec_sovereignty_title')}
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              {t('docs.sec_sovereignty_body')}
            </p>
          </section>
        </div>
      )}
    </div>
  );
};
