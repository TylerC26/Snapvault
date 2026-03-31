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
    <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-sm px-2">
        <div className="flex justify-end mb-4">
          <LanguageToggle language={language} onChange={setLanguage} />
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-serif text-center text-[#4a4a4a] mb-2">
          {t(language, "appTitle")}
        </h1>
        <p className="text-center text-[#8a8a8a] mb-8 font-medium">
          {t(language, "appSubtitle")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="code" className="block text-sm font-medium text-[#4a4a4a]">
            {t(language, "enterWeddingCode")}
          </label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError("");
            }}
            placeholder={t(language, "codePlaceholder")}
            className="w-full px-4 py-4 text-lg rounded-xl border-2 border-[#e8d9a8] bg-white focus:border-[#c9a227] focus:ring-2 focus:ring-[#c9a227]/30 outline-none transition"
            autoComplete="off"
            autoFocus
          />
          {error && (
            <p className="text-red-500 text-sm font-medium">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] py-4 rounded-xl bg-[#c9a227] text-white font-semibold text-lg shadow-md hover:bg-[#b8911f] active:scale-[0.98] transition touch-manipulation disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? t(language, "loading") : t(language, "enter")}
          </button>
        </form>
      </div>
    </div>
  );
}
