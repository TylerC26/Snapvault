import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  doc,
  getCountFromServer,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import AdminShell from "./AdminShell";
import { uploadHeroImage, deleteHeroImage } from "../utils/heroImage";
import {
  daysUntilExpiry,
  formatExpiryDate,
  isExpired,
  isExpiringToday,
} from "../utils/expiry";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function CreateEventForm({ onCreate, busy }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [heroFile, setHeroFile] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const heroPreview = useMemo(
    () => (heroFile ? URL.createObjectURL(heroFile) : null),
    [heroFile]
  );

  useEffect(() => {
    if (!heroPreview) return;
    return () => URL.revokeObjectURL(heroPreview);
  }, [heroPreview]);

  const reset = () => {
    setCode("");
    setTitle("");
    setExpiresAt("");
    setHeroFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFilePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|jpg|png|webp|gif)$/i.test(file.type)) {
      setError("Hero image must be a JPG, PNG, WebP, or GIF.");
      e.target.value = "";
      return;
    }
    setError("");
    setHeroFile(file);
  };

  const clearHeroFile = () => {
    setHeroFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedCode = code.trim().toUpperCase();
    const trimmedTitle = title.trim();
    if (!trimmedCode || !trimmedTitle) {
      setError("Code and title are required.");
      return;
    }
    if (!/^[A-Z0-9]+$/.test(trimmedCode)) {
      setError("Code must be letters and numbers only.");
      return;
    }
    setError("");
    try {
      await onCreate({
        code: trimmedCode,
        title: trimmedTitle,
        expiresAt: expiresAt || null,
        heroFile,
      });
      reset();
      setOpen(false);
    } catch (err) {
      setError(err?.message || "Failed to create event.");
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-ink inline-flex items-center gap-3 min-h-[44px]"
      >
        <span>+ New event</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--paper-card)] border border-[var(--rule)] p-5 sm:p-6 shadow-[0_1px_0_rgba(28,24,22,0.04),0_20px_40px_-20px_rgba(28,24,22,0.2)]"
    >
      <div className="flex items-baseline justify-between mb-4">
        <p className="eyebrow eyebrow-accent">New entry</p>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError("");
            reset();
          }}
          className="eyebrow hover:text-[var(--ink)]"
        >
          Cancel
        </button>
      </div>

      <label className="block eyebrow mb-2">Event code</label>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="e.g. CONNIEMAN"
        className="w-full font-display tracking-[0.2em] text-xl py-2 bg-transparent border-0 border-b border-[var(--rule-strong)] focus:border-[var(--sepia)] focus:outline-none text-[var(--ink)] mb-5"
        autoCapitalize="characters"
        spellCheck="false"
        autoComplete="off"
      />

      <label className="block eyebrow mb-2">Title</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Connie & Man's Wedding"
        className="w-full font-serif text-base py-2 bg-transparent border-0 border-b border-[var(--rule-strong)] focus:border-[var(--sepia)] focus:outline-none text-[var(--ink)] mb-5"
      />

      <label className="block eyebrow mb-2">
        Expires on <span className="text-[var(--ink-mute)] normal-case tracking-normal">(optional)</span>
      </label>
      <input
        type="date"
        value={expiresAt}
        onChange={(e) => setExpiresAt(e.target.value)}
        className="w-full font-serif text-base py-2 bg-transparent border-0 border-b border-[var(--rule-strong)] focus:border-[var(--sepia)] focus:outline-none text-[var(--ink)] mb-1"
      />
      <p className="font-serif italic text-xs text-[var(--ink-mute)] mb-5">
        After this date you'll be prompted to pause uploads.
      </p>

      <label className="block eyebrow mb-2">
        Hero image <span className="text-[var(--ink-mute)] normal-case tracking-normal">(optional)</span>
      </label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFilePick}
      />
      <div className="flex items-start gap-4 mb-4">
        <div className="shrink-0 w-20 aspect-[3/4] bg-[var(--paper-deep)] border border-[var(--rule)] overflow-hidden">
          {heroPreview && (
            <img src={heroPreview} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[36px] px-3 font-serif italic text-sm border border-[var(--rule-strong)] text-[var(--ink-soft)] hover:border-[var(--sepia)] hover:text-[var(--sepia)] transition-colors"
          >
            {heroFile ? "Choose a different file" : "Choose file…"}
          </button>
          {heroFile && (
            <div className="flex items-center gap-3">
              <span className="font-serif italic text-xs text-[var(--ink-mute)] truncate max-w-[12rem]">
                {heroFile.name}
              </span>
              <button
                type="button"
                onClick={clearHeroFile}
                className="eyebrow hover:text-[var(--sepia)]"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="font-serif italic text-sm text-[var(--sepia-deep)] mb-3">
          — {error} —
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="btn-ink inline-flex items-center gap-3 min-h-[44px]"
      >
        {busy ? "Saving…" : "Create event"}
      </button>
    </form>
  );
}

function EventRow({ event }) {
  const [photoCount, setPhotoCount] = useState(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCountFromServer(collection(db, "events", event.code, "photos"))
      .then((snap) => {
        if (!cancelled) setPhotoCount(snap.data().count);
      })
      .catch(() => {
        if (!cancelled) setPhotoCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [event.code]);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await updateDoc(doc(db, "events", event.code), {
        active: !event.active,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to update event. Check your Firestore rules.");
    } finally {
      setToggling(false);
    }
  };

  const expired = isExpired(event.expiresAt);
  const expiringToday = isExpiringToday(event.expiresAt);
  const daysLeft = daysUntilExpiry(event.expiresAt);
  const expiringSoon =
    !expired && !expiringToday && daysLeft !== null && daysLeft <= 7;
  const needsPauseNotice = expired && event.active;

  let expiryLabel = null;
  let expiryClass = "text-[var(--ink-mute)]";
  if (event.expiresAt) {
    if (expired) {
      expiryLabel = `Expired ${formatExpiryDate(event.expiresAt)}`;
      expiryClass = "text-[var(--sepia-deep)]";
    } else if (expiringToday) {
      expiryLabel = `Expires today (${formatExpiryDate(event.expiresAt)})`;
      expiryClass = "text-[var(--sepia)]";
    } else if (expiringSoon) {
      expiryLabel = `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`;
      expiryClass = "text-[var(--sepia)]";
    } else {
      expiryLabel = `Expires ${formatExpiryDate(event.expiresAt)}`;
    }
  }

  return (
    <article className="border-b border-[var(--rule)] py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
      <div className="shrink-0 w-full sm:w-28 aspect-[3/4] bg-[var(--paper-deep)] overflow-hidden">
        {event.heroImage && (
          <img
            src={event.heroImage}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="eyebrow eyebrow-accent">№ {event.code}</span>
          <span
            className={
              "eyebrow " +
              (event.active ? "text-[var(--sepia)]" : "text-[var(--ink-mute)]")
            }
          >
            {event.active ? "Active" : "Paused"}
          </span>
          {expiryLabel && (
            <span className={"eyebrow " + expiryClass}>{expiryLabel}</span>
          )}
        </div>
        <h3 className="font-display italic text-2xl sm:text-3xl text-[var(--ink)] leading-tight mt-1 truncate">
          {event.title || "Untitled"}
        </h3>
        <p className="font-serif text-sm text-[var(--ink-soft)] mt-1">
          {photoCount === null ? "Counting plates…" : `${photoCount} plate${photoCount === 1 ? "" : "s"}`}
          <span className="mx-2 text-[var(--ink-mute)]">·</span>
          Created {formatDate(event.createdAt)}
        </p>
        {needsPauseNotice && (
          <div className="mt-3 flex items-center gap-3 flex-wrap border-l-2 border-[var(--sepia)] bg-[var(--sepia-soft)] px-3 py-2">
            <p className="font-serif italic text-sm text-[var(--sepia-deep)] flex-1 min-w-[12rem]">
              This event expired on {formatExpiryDate(event.expiresAt)}. Pause
              it to stop further uploads.
            </p>
            <button
              type="button"
              onClick={handleToggle}
              disabled={toggling}
              className="min-h-[36px] px-3 font-serif italic text-sm bg-[var(--sepia-deep)] text-[var(--paper)] hover:bg-[var(--ink)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {toggling ? "…" : "Pause now"}
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={handleToggle}
          disabled={toggling}
          className="min-h-[40px] px-3 font-serif italic text-sm text-[var(--ink-soft)] border border-[var(--rule-strong)] hover:border-[var(--sepia)] hover:text-[var(--sepia)] transition-colors"
        >
          {toggling ? "…" : event.active ? "Pause" : "Activate"}
        </button>
        <Link
          to={`/admin/events/${event.code}`}
          className="min-h-[40px] inline-flex items-center px-3 font-serif italic text-sm text-[var(--paper)] bg-[var(--ink)] hover:bg-[var(--sepia-deep)] transition-colors"
        >
          Manage →
        </Link>
      </div>
    </article>
  );
}

function DashboardContent({ user, signOut }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createBusy, setCreateBusy] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setEvents(
          snap.docs.map((d) => ({
            code: d.id,
            active: true,
            ...d.data(),
          }))
        );
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Failed to load events. Check your Firestore rules allow admin reads.");
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleCreate = async ({ code, title, expiresAt, heroFile }) => {
    setCreateBusy(true);
    try {
      if (events.some((e) => e.code === code)) {
        throw new Error("An event with that code already exists.");
      }

      let heroImage = "";
      let heroStoragePath = null;
      if (heroFile) {
        const uploaded = await uploadHeroImage(code, heroFile);
        heroImage = uploaded.url;
        heroStoragePath = uploaded.storagePath;
      }

      try {
        await setDoc(doc(db, "events", code), {
          title,
          heroImage,
          heroStoragePath,
          expiresAt: expiresAt || null,
          active: true,
          createdAt: new Date().toISOString(),
          createdBy: user.email,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        if (heroStoragePath) await deleteHeroImage(heroStoragePath).catch(() => {});
        throw err;
      }
    } finally {
      setCreateBusy(false);
    }
  };

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return events;
    return events.filter(
      (e) =>
        e.code.toLowerCase().includes(s) ||
        (e.title || "").toLowerCase().includes(s)
    );
  }, [events, search]);

  const activeCount = events.filter((e) => e.active).length;
  const expiredActive = events.filter(
    (e) => e.active && isExpired(e.expiresAt)
  );

  const handlePauseExpired = async (code) => {
    try {
      await updateDoc(doc(db, "events", code), { active: false });
    } catch (err) {
      console.error(err);
      alert("Failed to pause event.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] paper-grain">
      <header className="sticky top-0 z-40 bg-[var(--paper)]/95 backdrop-blur-sm border-b border-[var(--rule)] pt-[env(safe-area-inset-top)]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between gap-3 py-4">
            <div>
              <p className="eyebrow eyebrow-accent">SnapVault · Administration</p>
              <h1 className="font-display italic text-xl sm:text-2xl text-[var(--ink)] leading-tight">
                The Curator's Desk
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden sm:inline font-serif italic text-sm text-[var(--ink-mute)]">
                {user.email}
              </span>
              <button
                type="button"
                onClick={signOut}
                className="eyebrow hover:text-[var(--sepia)] transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        {expiredActive.length > 0 && (
          <section className="mb-8 border-l-2 border-[var(--sepia)] bg-[var(--sepia-soft)] px-4 py-4">
            <p className="eyebrow eyebrow-accent mb-1">Action required</p>
            <p className="font-serif italic text-sm text-[var(--sepia-deep)] mb-3">
              {expiredActive.length === 1
                ? "1 active event has passed its expiration date — pause it to stop further uploads."
                : `${expiredActive.length} active events have passed their expiration dates — pause them to stop further uploads.`}
            </p>
            <ul className="flex flex-col gap-2">
              {expiredActive.map((e) => (
                <li
                  key={e.code}
                  className="flex items-center justify-between gap-3 flex-wrap"
                >
                  <span className="font-serif text-sm text-[var(--ink)]">
                    <span className="eyebrow eyebrow-accent mr-2">№ {e.code}</span>
                    {e.title || "Untitled"}
                    <span className="mx-2 text-[var(--ink-mute)]">·</span>
                    Expired {formatExpiryDate(e.expiresAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePauseExpired(e.code)}
                    className="min-h-[36px] px-3 font-serif italic text-sm bg-[var(--sepia-deep)] text-[var(--paper)] hover:bg-[var(--ink)] transition-colors"
                  >
                    Pause now
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Stats strip */}
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8 mb-10 pb-8 border-b border-[var(--rule)]">
          <div>
            <p className="eyebrow">Events on register</p>
            <p className="font-display italic text-4xl text-[var(--ink)] mt-1">
              {events.length}
            </p>
          </div>
          <div>
            <p className="eyebrow">Active</p>
            <p className="font-display italic text-4xl text-[var(--ink)] mt-1">
              {activeCount}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="eyebrow">Paused</p>
            <p className="font-display italic text-4xl text-[var(--ink-mute)] mt-1">
              {events.length - activeCount}
            </p>
          </div>
        </section>

        {/* Actions */}
        <section className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="eyebrow eyebrow-accent">§ I</p>
            <h2 className="font-display italic text-3xl sm:text-4xl text-[var(--ink)] mt-1">
              Events
            </h2>
          </div>
          <CreateEventForm onCreate={handleCreate} busy={createBusy} />
        </section>

        {events.length > 0 && (
          <div className="mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by code or title…"
              className="w-full sm:max-w-sm font-serif text-sm py-2 bg-transparent border-0 border-b border-[var(--rule-strong)] focus:border-[var(--sepia)] focus:outline-none text-[var(--ink)]"
            />
          </div>
        )}

        {error && (
          <div className="mb-8 border-l-2 border-[var(--sepia)] bg-[var(--sepia-soft)] px-4 py-3">
            <p className="eyebrow eyebrow-accent mb-1">Notice</p>
            <p className="font-serif italic text-sm text-[var(--sepia-deep)]">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border border-[var(--sepia)] border-t-transparent rounded-full animate-spin" />
            <p className="eyebrow">Loading</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <span className="rule inline-block" />
            <p className="font-display italic text-3xl text-[var(--ink)] mt-6">
              {events.length === 0 ? "No events yet" : "Nothing matches"}
            </p>
            <p className="font-serif italic text-[var(--ink-mute)] mt-2 text-base">
              {events.length === 0
                ? "Create the first event to begin."
                : "Try a different search term."}
            </p>
          </div>
        ) : (
          <div className="border-t border-[var(--rule)]">
            {filtered.map((event) => (
              <EventRow key={event.code} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminShell>
      {({ user, signOut }) => <DashboardContent user={user} signOut={signOut} />}
    </AdminShell>
  );
}
