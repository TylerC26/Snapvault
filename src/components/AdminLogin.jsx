import { useState } from "react";

export default function AdminLogin({ onSignIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Both fields are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSignIn(email.trim(), password);
    } catch (err) {
      if (err?.message === "not-admin") {
        setError("That account is not authorised as an administrator.");
      } else if (err?.code === "auth/invalid-credential" || err?.code === "auth/wrong-password") {
        setError("Incorrect email or password.");
      } else if (err?.code === "auth/user-not-found") {
        setError("No account with that email.");
      } else if (err?.code === "auth/too-many-requests") {
        setError("Too many attempts. Try again shortly.");
      } else {
        console.error(err);
        setError("Sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="paper-grain relative min-h-screen bg-[var(--paper)] overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between py-5 border-b border-[var(--rule)]">
          <span className="eyebrow eyebrow-accent">SnapVault · Administration</span>
          <span className="hidden sm:block font-display italic text-lg text-[var(--ink)]">
            The Curator's Desk
          </span>
        </div>
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 flex flex-col items-center justify-center min-h-[calc(100svh-6rem)] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <div className="w-full max-w-md text-center">
          <p className="eyebrow rise rise-1">— Restricted Quarters —</p>

          <h1 className="rise rise-2 font-display italic text-5xl sm:text-6xl text-[var(--ink)] mt-6 leading-[0.95]">
            Sign in
          </h1>

          <div className="flex items-center justify-center gap-3 mt-5 rise rise-3">
            <span className="w-10 h-px bg-[var(--sepia)]" />
            <span className="font-display italic text-sm text-[var(--sepia)]">
              Administrators only
            </span>
            <span className="w-10 h-px bg-[var(--sepia)]" />
          </div>

          <form onSubmit={handleSubmit} className="mt-12 rise rise-4 text-left">
            <label htmlFor="admin-email" className="block eyebrow mb-2">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              autoComplete="email"
              autoFocus
              className="w-full font-serif text-base py-2 bg-transparent border-0 border-b border-[var(--rule-strong)] focus:border-[var(--sepia)] focus:outline-none text-[var(--ink)]"
            />

            <label htmlFor="admin-password" className="block eyebrow mt-6 mb-2">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              autoComplete="current-password"
              className="w-full font-serif text-base py-2 bg-transparent border-0 border-b border-[var(--rule-strong)] focus:border-[var(--sepia)] focus:outline-none text-[var(--ink)]"
            />

            <div aria-live="polite" className="min-h-6 mt-5 text-center">
              {error && (
                <p className="font-serif italic text-sm text-[var(--sepia-deep)]">
                  — {error} —
                </p>
              )}
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="btn-ink mt-4 inline-flex items-center justify-center gap-3 min-h-[48px] min-w-[14rem]"
              >
                <span>{loading ? "Signing in…" : "Enter"}</span>
                {!loading && <span aria-hidden className="text-base leading-none">→</span>}
              </button>
            </div>
          </form>

          <div className="mt-16 rise rise-5">
            <div className="flex items-center justify-center gap-3 text-[var(--ink-mute)]">
              <span className="w-px h-3 bg-[var(--rule-strong)]" />
              <span className="font-display italic text-sm">
                SnapVault — The Keepers' Entrance
              </span>
              <span className="w-px h-3 bg-[var(--rule-strong)]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
