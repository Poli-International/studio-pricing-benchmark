import React, { useState } from 'react';
import { t } from '../i18n';

export const BenchmarkEmbed: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const embedSnippet = `<iframe src="https://poliinternational.com/tools/studio-pricing-benchmark/index.html" width="100%" height="850" frameborder="0" style="border-radius:12px; border:1px solid var(--border); overflow:hidden;" title="Studio Pricing Benchmark"></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedSnippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = embedSnippet;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 md:p-10 shadow-lg max-w-4xl mx-auto space-y-6 text-sm leading-relaxed text-[var(--text)]">
      <header className="border-b border-[var(--border)] pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
          Integration Guide
        </div>
        <h2 className="text-2xl font-extrabold text-[var(--text-heading)] mb-2">
          {t('embed.title')}
        </h2>
        <p className="text-xs md:text-sm text-[var(--muted)]">
          {t('embed.subtitle')}
        </p>
      </header>

      <div className="space-y-4">
        <p className="text-xs text-[var(--muted)] leading-relaxed">
          {t('embed.instructions')}
        </p>

        <div className="relative">
          <textarea
            readOnly
            value={embedSnippet}
            className="w-full h-32 bg-[var(--code-bg)] text-[var(--code-text)] border border-[var(--code-border)] rounded-lg p-4 font-mono text-xs focus:outline-none resize-none leading-relaxed select-all"
          />
        </div>

        <div>
          <button
            onClick={handleCopy}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2 shadow-sm"
          >
            <span>{copied ? '✅' : '📋'}</span>
            <span>{copied ? t('embed.copied') : t('embed.copy_btn')}</span>
          </button>
        </div>
      </div>

      <div className="bg-[var(--surface-elevated)] p-4 rounded-lg border border-[var(--border)] text-xs text-[var(--muted)] space-y-2">
        <strong className="text-[var(--text-heading)] block">Integration Notes:</strong>
        <p>• The embedded iframe automatically inherits the host website's dark or light theme via standard postMessage events or data-theme attributes.</p>
        <p>• Requires zero third-party scripts or API keys to function.</p>
      </div>
    </div>
  );
};
