import { LANGUAGES } from "../i18n";

export default function LanguageToggle({ language, onChange }) {
  const entries = Object.entries(LANGUAGES);

  return (
    <div className="inline-flex items-center text-[0.72rem] font-sans font-semibold tracking-[0.18em] uppercase text-[var(--ink-mute)]">
      {entries.map(([code, label], i) => (
        <span key={code} className="inline-flex items-center">
          {i > 0 && (
            <span
              aria-hidden
              className="mx-2 inline-block w-[1px] h-3 bg-[var(--rule-strong)]"
            />
          )}
          <button
            type="button"
            onClick={() => onChange(code)}
            className={`min-h-[32px] px-1 transition-colors ${
              language === code
                ? "text-[var(--ink)] underline underline-offset-[6px] decoration-[var(--sepia)] decoration-[1.5px]"
                : "hover:text-[var(--ink)]"
            }`}
            aria-pressed={language === code}
          >
            {label}
          </button>
        </span>
      ))}
    </div>
  );
}
