import { LANGUAGES } from "../i18n";

export default function LanguageToggle({ language, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-[#e8d9a8] bg-white overflow-hidden">
      {Object.entries(LANGUAGES).map(([code, label]) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          className={`px-2.5 py-1.5 text-xs font-semibold transition ${
            language === code
              ? "bg-[#c9a227] text-white"
              : "text-[#4a4a4a] hover:bg-[#faf8f5]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
