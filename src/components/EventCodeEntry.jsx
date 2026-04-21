import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db, signInAnon } from "../firebase";
import LanguageToggle from "./LanguageToggle";
import { t } from "../i18n";

export default function EventCodeEntry({ language, setLanguage }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError(t(language, "requiredCode"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInAnon();
      const eventDoc = await getDoc(doc(db, "events", trimmed));
      if (!eventDoc.exists() || eventDoc.data()?.active === false) {
        setError(t(language, "invalidCode"));
        return;
      }
      navigate(`/event/${trimmed}`);
    } catch (err) {
      console.error(err);
      setError(t(language, "connectError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="paper-grain relative min-h-screen bg-[var(--paper)] overflow-hidden">
      {/* Top meta bar — broadsheet masthead */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between py-5 border-b border-[var(--rule)]">
          <span className="eyebrow eyebrow-accent">{t(language, "mastheadVolume")}</span>
          <span className="hidden sm:block font-display italic text-lg text-[var(--ink)]">
            SnapVault
          </span>
          <LanguageToggle language={language} onChange={setLanguage} />
        </div>
      </div>

      {/* Corner flourishes: tiny sepia marks in the corners — a printer's mark */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[7rem] left-6 sm:left-10 hidden sm:block"
      >
        <div className="flex items-center gap-3">
          <div className="w-1 h-1 rounded-full bg-[var(--sepia)]" />
          <div className="w-8 h-px bg-[var(--sepia)]" />
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-10 right-6 sm:right-10 hidden sm:block"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-px bg-[var(--sepia)]" />
          <div className="w-1 h-1 rounded-full bg-[var(--sepia)]" />
        </div>
      </div>

      {/* Central composition */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 flex flex-col items-center justify-center min-h-[calc(100svh-6rem)] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <div className="w-full max-w-xl text-center">
          <p className="eyebrow rise rise-1">— {t(language, "mastheadTagline")} —</p>

          <h1 className="rise rise-2 font-display text-[13vw] sm:text-7xl md:text-8xl font-medium text-[var(--ink)] leading-[0.95] mt-6 sm:mt-8">
            <span className="italic">{t(language, "enterHeadline1")}</span>
            <br />
            <span className="tracking-tight">{t(language, "enterHeadline2")}</span>
          </h1>

          <div className="flex items-center justify-center gap-4 mt-8 rise rise-3">
            <span className="w-10 h-px bg-[var(--rule-strong)]" />
            <span className="font-display italic text-[var(--sepia)] text-lg">
              {t(language, "appSubtitle")}
            </span>
            <span className="w-10 h-px bg-[var(--rule-strong)]" />
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-14 rise rise-4"
          >
            <label
              htmlFor="code"
              className="block eyebrow mb-5"
            >
              {t(language, "enterWeddingCode")}
            </label>

            <div className="relative mx-auto max-w-md">
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError("");
                }}
                placeholder={t(language, "codePlaceholder")}
                aria-invalid={Boolean(error)}
                className="w-full text-center font-display text-3xl sm:text-4xl tracking-[0.35em] py-3 bg-transparent border-0 border-b border-[var(--rule-strong)] focus:border-[var(--sepia)] focus:outline-none text-[var(--ink)] placeholder:text-[var(--ink-mute)] placeholder:tracking-[0.2em] placeholder:font-fancy placeholder:italic transition-colors"
                autoComplete="off"
                autoCapitalize="characters"
                autoFocus
                spellCheck="false"
              />
              {/* Decorative tick marks beneath the input */}
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-[6px] left-1/2 -translate-x-1/2 flex items-center gap-[3px]"
              >
                <span className="w-px h-[6px] bg-[var(--sepia)]" />
                <span className="w-px h-[10px] bg-[var(--sepia)]" />
                <span className="w-px h-[6px] bg-[var(--sepia)]" />
              </div>
            </div>

            <div aria-live="polite" className="min-h-6 mt-5">
              {error && (
                <p className="font-serif italic text-sm text-[var(--sepia-deep)]">
                  — {error} —
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-ink mt-6 inline-flex items-center justify-center gap-3 min-h-[48px] min-w-[14rem]"
            >
              <span>{loading ? t(language, "loading") : t(language, "enter")}</span>
              {!loading && (
                <span aria-hidden className="text-base leading-none">
                  →
                </span>
              )}
            </button>
          </form>

          {/* Footer flourish */}
          <div className="mt-20 rise rise-5">
            <div className="flex items-center justify-center gap-3 text-[var(--ink-mute)]">
              <span className="w-px h-3 bg-[var(--rule-strong)]" />
              <span className="font-display italic text-sm">
                {t(language, "appTitle")} — {t(language, "keepsakeTagline")}
              </span>
              <span className="w-px h-3 bg-[var(--rule-strong)]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
