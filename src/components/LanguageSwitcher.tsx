import React from 'react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, t } from '../i18n';

interface LanguageSwitcherProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLanguage,
  onLanguageChange
}) => {
  return (
    <div className="relative inline-flex items-center">
      <label
        htmlFor="header-lang-switcher"
        className="sr-only"
        data-i18n="lang.switcher_label"
      >
        {t('lang.switcher_label')}
      </label>
      <div className="flex items-center gap-1.5 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text)] transition-colors hover:border-[var(--primary)] focus-within:border-[var(--primary)]">
        <span className="text-sm" aria-hidden="true">🌐</span>
        <select
          id="header-lang-switcher"
          value={currentLanguage}
          onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
          className="bg-transparent text-[var(--text-heading)] font-medium text-xs focus:outline-none cursor-pointer pr-1"
          aria-label={t('lang.switcher_label')}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option
              key={lang.code}
              value={lang.code}
              className="bg-[var(--surface)] text-[var(--text)] py-1"
            >
              {lang.flag} {lang.label} ({lang.code.toUpperCase()})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
