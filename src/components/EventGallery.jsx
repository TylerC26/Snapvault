import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { collection, query, orderBy, onSnapshot, doc, getDoc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage, signInAnon } from "../firebase";
import PhotoUpload from "./PhotoUpload";
import PhotoGrid from "./PhotoGrid";
import LanguageToggle from "./LanguageToggle";
import { PHOTO_TAGS } from "../constants/tags";
import { t, tagLabel } from "../i18n";

const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80";

/** Extract Storage path from Firebase download URL (for photos without storagePath) */
function getStoragePathFromUrl(url) {
  try {
    const match = url.match(/\/o\/(.+?)(?:\?|$)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

export default function EventGallery({ language, setLanguage }) {
  const { code } = useParams();
  const [photos, setPhotos] = useState([]);
  const [customTags, setCustomTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTag, setFilterTag] = useState(null);
  const [showLanding, setShowLanding] = useState(true);
  const [eventData, setEventData] = useState({ title: null, heroImage: null });

  const availableTags = useMemo(() => {
    const seen = new Set();
    return [...PHOTO_TAGS, ...customTags].filter((tag) => {
      const key = tag.trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [customTags]);

  const filteredPhotos = useMemo(() => {
    if (!filterTag) return photos;
    return photos.filter((p) => p.tags?.includes(filterTag));
  }, [photos, filterTag]);

  const handleDelete = useCallback(
    async (photo, password) => {
      const expectedPassword = code.toUpperCase();
      const providedPassword = password.trim().toUpperCase();
      if (providedPassword !== expectedPassword) {
        return { success: false, error: t(language, "deleteWrongPassword") };
      }
      try {
        await signInAnon();
        const docRef = doc(db, "events", code.toUpperCase(), "photos", photo.id);
        await deleteDoc(docRef);

        const path = photo.storagePath || getStoragePathFromUrl(photo.url);
        if (path) {
          const storageRef = ref(storage, path);
          await deleteObject(storageRef);
        }
        return { success: true };
      } catch (err) {
        console.error(err);
        return { success: false, error: t(language, "deleteFailed") };
      }
    },
    [code, language]
  );

  useEffect(() => {
    if (!code) return;

    let cancelled = false;
    let unsubscribe = () => {};

    signInAnon()
      .then(() => {
        if (cancelled) return;
        const q = query(
          collection(db, "events", code.toUpperCase(), "photos"),
          orderBy("timestamp", "desc")
        );

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (cancelled) return;
            const items = snapshot.docs.map((d) => ({
              id: d.id,
              ...d.data(),
              timestamp: d.data().timestamp?.toDate?.()?.getTime() ?? 0,
            }));
            setPhotos(items);
            setLoading(false);
            setError(null);
          },
          (err) => {
            console.error(err);
            if (!cancelled) {
              setError(t(language, "loadingError"));
              setLoading(false);
            }
          }
        );
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) {
          setError(t(language, "connectError"));
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [code, language]);

  useEffect(() => {
    if (!code) return;

    let cancelled = false;
    let unsubscribe = () => {};

    signInAnon()
      .then(() => {
        if (cancelled) return;
        const tagsQuery = query(
          collection(db, "events", code.toUpperCase(), "tags"),
          orderBy("createdAt", "asc")
        );

        unsubscribe = onSnapshot(
          tagsQuery,
          (snapshot) => {
            if (cancelled) return;
            setCustomTags(
              snapshot.docs
                .map((d) => d.data()?.name)
                .filter((name) => typeof name === "string" && name.trim().length > 0)
            );
          },
          (err) => {
            console.error(err);
          }
        );
      })
      .catch((err) => console.error(err));

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [code]);

  useEffect(() => {
    setShowLanding(true);
    setFilterTag(null);
  }, [code]);

  // Fetch event metadata (title, heroImage) from Firestore
  useEffect(() => {
    if (!code) return;
    const displayCode = code.toUpperCase();
    signInAnon()
      .then(() => getDoc(doc(db, "events", displayCode)))
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setEventData({
            title: data.title || null,
            heroImage: data.heroImage || null,
          });
        }
      })
      .catch((err) => console.error("Failed to load event metadata:", err));
  }, [code]);

  if (!code) return null;

  const displayCode = code.toUpperCase();
  const navTitle = eventData.title || t(language, "appTitle");
  const heroImage = eventData.heroImage || DEFAULT_HERO_IMAGE;

  const goToHeroPage = () => {
    setShowLanding(true);
    setFilterTag(null);
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] paper-grain">
      {/* ── Masthead ── */}
      <header className="sticky top-0 z-40 bg-[var(--paper)]/95 backdrop-blur-sm border-b border-[var(--rule)] pt-[env(safe-area-inset-top)]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between gap-3 py-3 sm:py-4">
            <button
              type="button"
              onClick={goToHeroPage}
              className="group min-h-[44px] inline-flex items-center gap-2 text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
              aria-label={t(language, "back")}
            >
              <span aria-hidden className="inline-block w-5 h-px bg-current group-hover:w-7 transition-all" />
              <span className="eyebrow !text-inherit">{t(language, "back")}</span>
            </button>

            <div className="flex-1 text-center truncate">
              <div className="font-display italic text-lg sm:text-2xl text-[var(--ink)] truncate leading-tight">
                {navTitle}
              </div>
              <div className="eyebrow mt-0.5 truncate">№ {displayCode}</div>
            </div>

            <div className="flex items-center">
              <LanguageToggle language={language} onChange={setLanguage} />
            </div>
          </div>
        </div>
      </header>

      <main
        className={
          showLanding
            ? "px-4 sm:px-6 py-6 sm:py-8 min-h-[calc(100svh-5.5rem)] pb-[max(1.5rem,env(safe-area-inset-bottom))] flex items-center justify-center"
            : "max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-12 pb-[max(6rem,calc(2rem+env(safe-area-inset-bottom)))]"
        }
      >
        {showLanding && (
          <section className="w-full max-w-md mx-auto text-center">
            <p className="eyebrow eyebrow-accent rise rise-1">
              You are cordially invited
            </p>
            <h2 className="rise rise-2 font-display italic text-4xl sm:text-5xl text-[var(--ink)] mt-4 leading-[1.05]">
              {navTitle}
            </h2>
            <div className="flex items-center justify-center gap-3 mt-4 rise rise-3">
              <span className="w-10 h-px bg-[var(--sepia)]" />
              <span className="font-display italic text-sm text-[var(--sepia)]">
                {t(language, "appSubtitle")}
              </span>
              <span className="w-10 h-px bg-[var(--sepia)]" />
            </div>

            <button
              type="button"
              onClick={() => setShowLanding(false)}
              className="mt-8 group block w-full touch-manipulation rise rise-4"
              aria-label={t(language, "enterCelebration")}
            >
              <div className="relative p-3 bg-[var(--paper-card)] shadow-[0_1px_0_rgba(28,24,22,0.04),0_20px_40px_-20px_rgba(28,24,22,0.35)] border border-[var(--rule)]">
                <div className="relative aspect-[3/4] overflow-hidden bg-[var(--paper-deep)]">
                  <img
                    src={heroImage}
                    alt={navTitle}
                    className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />
                </div>
                {/* caption plate */}
                <div className="pt-4 pb-3 px-1">
                  <div className="eyebrow">The Ceremony · Plate I</div>
                  <div className="font-display italic text-[var(--ink)] mt-1 text-lg">
                    Enter the gallery
                  </div>
                </div>
              </div>
            </button>

            <p className="mt-8 text-xs text-[var(--ink-mute)] font-serif italic rise rise-5">
              Tap the plate to open
            </p>
          </section>
        )}

        {!showLanding && (
          <div className="fade-in">
            {/* ── Section title: Contribute ── */}
            <div className="mb-8">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="eyebrow eyebrow-accent">§ I</p>
                  <h2 className="font-display italic text-3xl sm:text-4xl text-[var(--ink)] mt-1">
                    Contribute a memory
                  </h2>
                </div>
                <span className="hidden sm:block flex-1 h-px bg-[var(--rule)] mb-2" />
                <span className="hidden sm:inline font-serif italic text-sm text-[var(--ink-mute)] mb-1">
                  {t(language, "appSubtitle")}
                </span>
              </div>
              <p className="font-serif text-[var(--ink-soft)] mt-3 max-w-prose leading-relaxed">
                Each photograph becomes part of this evening's record. Add a note, a tag,
                and a name — or simply upload and let the moment speak.
              </p>
            </div>

            <div className="mb-14">
              <PhotoUpload eventCode={displayCode} language={language} availableTags={availableTags} />
            </div>

            {/* ── Section title: The Plates ── */}
            <div className="mb-6">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="eyebrow eyebrow-accent">§ II</p>
                  <h2 className="font-display italic text-3xl sm:text-4xl text-[var(--ink)] mt-1">
                    The plates
                  </h2>
                </div>
                <span className="hidden sm:block flex-1 h-px bg-[var(--rule)] mb-2" />
              </div>
            </div>

            {!loading && photos.length > 0 && (
              <div className="mb-8 -mx-4 sm:mx-0">
                <div className="flex items-baseline justify-between px-4 sm:px-0 mb-3">
                  <p className="eyebrow">{t(language, "filterByTag")}</p>
                  {filterTag && (
                    <button
                      onClick={() => setFilterTag(null)}
                      className="text-xs font-serif italic text-[var(--sepia)] hover:text-[var(--sepia-deep)] underline underline-offset-4"
                    >
                      {t(language, "all")}
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto overscroll-x-contain scrollbar-hide">
                  <div className="flex gap-2 px-4 sm:px-0 sm:flex-wrap pb-2 sm:pb-0">
                    <button
                      onClick={() => setFilterTag(null)}
                      data-active={!filterTag}
                      className="tag-chip shrink-0 min-h-[40px]"
                    >
                      {t(language, "all")} · {photos.length}
                    </button>
                    {availableTags.map((tag) => {
                      const count = photos.filter((p) => p.tags?.includes(tag)).length;
                      if (count === 0) return null;
                      return (
                        <button
                          key={tag}
                          onClick={() => setFilterTag(tag)}
                          data-active={filterTag === tag}
                          className="tag-chip shrink-0 min-h-[40px]"
                        >
                          {tagLabel(language, tag)} · {count}
                        </button>
                      );
                    })}
                  </div>
                </div>
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
                <p className="eyebrow">{t(language, "loading")}</p>
              </div>
            ) : (
              <PhotoGrid photos={filteredPhotos} onDelete={handleDelete} language={language} />
            )}

            {/* Colophon */}
            <div className="mt-24 pt-8 border-t border-[var(--rule)] text-center">
              <p className="eyebrow">Colophon</p>
              <p className="font-display italic text-[var(--ink-soft)] mt-2">
                Set in Cormorant &amp; Noto Serif · Printed as it happens
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
