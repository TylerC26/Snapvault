import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage, signInAnon } from "../firebase";
import PhotoUpload from "./PhotoUpload";
import PhotoGrid from "./PhotoGrid";
import LanguageToggle from "./LanguageToggle";
import { PHOTO_TAGS } from "../constants/tags";
import { t, tagLabel } from "../i18n";

const EVENT_TITLES = {
  CONNIEMAN: "Connie & Man's Wedding",
};

const EVENT_HERO_IMAGES = {
  CONNIEMAN: "/connieman-hero-v2.png",
};

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

  if (!code) return null;

  const displayCode = code.toUpperCase();
  const navTitle = EVENT_TITLES[displayCode] || t(language, "appTitle");
  const heroImage =
    EVENT_HERO_IMAGES[displayCode] ||
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80";

  const goToHeroPage = () => {
    setShowLanding(true);
    setFilterTag(null);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur border-b border-[#e8d9a8]/50 pt-[env(safe-area-inset-top)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={goToHeroPage}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center -m-2 text-[#8a8a8a] text-sm hover:text-[#4a4a4a] touch-manipulation"
          >
            ← {t(language, "back")}
          </button>
          <h1 className="font-display text-lg sm:text-xl font-serif text-[#4a4a4a] truncate">
            {navTitle}
          </h1>
          <div className="flex items-center">
            <LanguageToggle language={language} onChange={setLanguage} />
          </div>
        </div>
      </header>

      <main
        className={
          showLanding
            ? "px-4 sm:px-6 py-4 sm:py-6 h-[calc(100svh-6rem)] sm:h-[calc(100svh-6.5rem)] pb-[max(1rem,env(safe-area-inset-bottom))]"
            : "max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-[max(6rem,calc(1.5rem+env(safe-area-inset-bottom)))]"
        }
      >
        {showLanding && (
          <section className="h-full flex items-center justify-center">
            <button
              type="button"
              onClick={() => setShowLanding(false)}
              className="relative h-full max-h-full max-w-full aspect-[691/1024] rounded-2xl overflow-hidden border-2 border-[#e8d9a8] touch-manipulation"
            >
              <img src={heroImage} alt={navTitle} className="w-full h-full object-cover" />
            </button>
          </section>
        )}

        {!showLanding && (
          <>
            <h2 className="font-display text-2xl font-serif text-[#4a4a4a] mb-6 text-center">
              {t(language, "appSubtitle")}
            </h2>

            <div className="mb-8">
              <PhotoUpload eventCode={displayCode} language={language} availableTags={availableTags} />
            </div>

            {!loading && photos.length > 0 && (
              <div className="mb-6 -mx-4 sm:mx-0 overflow-x-auto overscroll-x-contain scrollbar-hide">
                <p className="text-sm font-medium text-[#4a4a4a] mb-2 px-4 sm:px-0">{t(language, "filterByTag")}</p>
                <div className="flex gap-2 px-4 sm:px-0 sm:flex-wrap pb-2 sm:pb-0">
                  <button
                    onClick={() => setFilterTag(null)}
                    className={`min-h-[44px] shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition touch-manipulation ${
                      !filterTag
                        ? "bg-[#c9a227] text-white"
                        : "bg-white border border-[#e8d9a8] text-[#4a4a4a] hover:border-[#c9a227]"
                    }`}
                  >
                    {t(language, "all")}
                  </button>
                  {availableTags.map((tag) => {
                    const count = photos.filter((p) => p.tags?.includes(tag)).length;
                    if (count === 0) return null;
                    return (
                      <button
                        key={tag}
                        onClick={() => setFilterTag(tag)}
                        className={`min-h-[44px] shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition touch-manipulation ${
                          filterTag === tag
                            ? "bg-[#c9a227] text-white"
                            : "bg-white border border-[#e8d9a8] text-[#4a4a4a] hover:border-[#c9a227]"
                        }`}
                      >
                        {tagLabel(language, tag)} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <PhotoGrid photos={filteredPhotos} onDelete={handleDelete} language={language} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
