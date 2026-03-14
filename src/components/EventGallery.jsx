import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
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
  CONNIEMAN: "/connieman-hero.png",
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

function normalizeTagKey(name) {
  return name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function EventGallery({ language, setLanguage }) {
  const { code } = useParams();
  const [photos, setPhotos] = useState([]);
  const [customTags, setCustomTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTag, setFilterTag] = useState(null);
  const [viewMode, setViewMode] = useState(null); // null | upload | album | message
  const [showLanding, setShowLanding] = useState(true);
  const [messageName, setMessageName] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageStatus, setMessageStatus] = useState({ type: "", text: "" });

  const availableTags = useMemo(() => {
    const seen = new Set();
    const merged = [...PHOTO_TAGS, ...customTags].filter((tag) => {
      const key = tag.trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return merged;
  }, [customTags]);

  const filteredPhotos = useMemo(() => {
    if (!filterTag) return photos;
    return photos.filter((p) => p.tags?.includes(filterTag));
  }, [photos, filterTag]);

  const handleCreateTag = useCallback(
    async (tagName) => {
      const name = tagName.trim();
      if (!name) return { success: false, error: t(language, "tagRequired") };
      const exists = availableTags.some((tag) => tag.toLowerCase() === name.toLowerCase());
      if (exists) return { success: false, error: t(language, "tagExists") };
      try {
        await signInAnon();
        const key = normalizeTagKey(name);
        if (!key) return { success: false, error: t(language, "createTagFailed") };
        await setDoc(
          doc(db, "events", code.toUpperCase(), "tags", key),
          { name, createdAt: serverTimestamp() },
          { merge: true }
        );
        return { success: true, tag: name };
      } catch (err) {
        console.error(err);
        return { success: false, error: t(language, "createTagFailed") };
      }
    },
    [availableTags, code, language]
  );

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

  const handleSendMessage = useCallback(async () => {
    const trimmedName = messageName.trim();
    const trimmedMessage = messageBody.trim();
    if (!trimmedName) {
      setMessageStatus({ type: "error", text: t(language, "nameRequired") });
      return;
    }
    if (!trimmedMessage) {
      setMessageStatus({ type: "error", text: t(language, "messageRequired") });
      return;
    }
    setSendingMessage(true);
    setMessageStatus({ type: "", text: "" });
    try {
      await signInAnon();
      await addDoc(collection(db, "events", code.toUpperCase(), "messages"), {
        name: trimmedName,
        message: trimmedMessage,
        timestamp: serverTimestamp(),
      });
      setMessageName("");
      setMessageBody("");
      setMessageStatus({ type: "success", text: t(language, "messageSent") });
    } catch (err) {
      console.error(err);
      setMessageStatus({ type: "error", text: t(language, "connectError") });
    } finally {
      setSendingMessage(false);
    }
  }, [code, language, messageBody, messageName]);

  useEffect(() => {
    if (!code) return;

    let cancelled = false;
    let unsubscribe = () => {};

    signInAnon()
      .then(() => {
        if (cancelled) return;
        const q = query(
          collection(db, 'events', code.toUpperCase(), 'photos'),
          orderBy('timestamp', 'desc')
        );

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (cancelled) return;
            const items = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              timestamp: doc.data().timestamp?.toDate?.()?.getTime() ?? 0,
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
    setViewMode(null);
  }, [code]);

  if (!code) return null;

  const displayCode = code.toUpperCase();
  const navTitle = EVENT_TITLES[displayCode] || t(language, "appTitle");
  const heroImage = EVENT_HERO_IMAGES[displayCode]
    || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80";
  const goToEventMainMenu = () => {
    setShowLanding(true);
    setViewMode(null);
    setFilterTag(null);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur border-b border-[#e8d9a8]/50 pt-[env(safe-area-inset-top)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={goToEventMainMenu}
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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-[max(6rem,calc(1.5rem+env(safe-area-inset-bottom)))]">
        {showLanding && (
          <section className="py-2">
            <button
              type="button"
              onClick={() => setShowLanding(false)}
              className="relative w-full h-[clamp(380px,72svh,860px)] rounded-2xl overflow-hidden border-2 border-[#e8d9a8] touch-manipulation"
            >
              <img
                src={heroImage}
                alt={navTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex items-end justify-center p-6 sm:p-8">
                <h2 className="font-fancy text-4xl sm:text-5xl text-white text-center drop-shadow-lg">
                  {t(language, "eventWelcome", { event: navTitle })}
                </h2>
              </div>
            </button>
          </section>
        )}

        {!showLanding && (
          <>
            <h2 className="font-display text-2xl font-serif text-[#4a4a4a] mb-6 text-center">
              {t(language, "appSubtitle")}
            </h2>

            {!viewMode && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
              <button
                type="button"
                onClick={() => setViewMode("upload")}
                className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border-2 border-[#e8d9a8] hover:border-[#c9a227] touch-manipulation transition bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80')",
                }}
              >
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                  <span className="font-fancy text-5xl sm:text-6xl leading-none text-white drop-shadow-lg tracking-wide">
                    {t(language, "photoUpload")}
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("album")}
                className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border-2 border-[#e8d9a8] hover:border-[#c9a227] touch-manipulation transition bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80')",
                }}
              >
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                  <span className="font-fancy text-5xl sm:text-6xl leading-none text-white drop-shadow-lg tracking-wide">
                    {t(language, "album")}
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("message")}
                className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border-2 border-[#e8d9a8] hover:border-[#c9a227] touch-manipulation transition bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1516589091380-5d8e87df6999?auto=format&fit=crop&w=1400&q=80')",
                }}
              >
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                  <span className="font-fancy text-5xl sm:text-6xl leading-none text-white drop-shadow-lg tracking-wide">
                    {t(language, "leaveMessage")}
                  </span>
                </div>
              </button>
                </div>
              </div>
            )}

            {viewMode === "upload" && (
              <>
            <div className="mb-4 flex items-center">
              <button
                type="button"
                onClick={() => setViewMode(null)}
                className="text-sm text-[#8a8a8a] hover:text-[#4a4a4a] underline"
              >
                {t(language, "backToMenu")}
              </button>
            </div>
            <div className="mb-8">
              <PhotoUpload
                eventCode={displayCode}
                language={language}
                availableTags={availableTags}
              />
              <button
                type="button"
                onClick={() => setViewMode("album")}
                className="w-full mt-4 min-h-[52px] rounded-xl bg-[#c9a227] text-white font-semibold text-base hover:bg-[#b8911f] active:scale-[0.98] transition touch-manipulation"
              >
                {t(language, "openAlbum")}
              </button>
            </div>
              </>
            )}

            {viewMode === "message" && (
              <>
            <div className="mb-4 flex items-center">
              <button
                type="button"
                onClick={() => setViewMode(null)}
                className="text-sm text-[#8a8a8a] hover:text-[#4a4a4a] underline"
              >
                {t(language, "backToMenu")}
              </button>
            </div>
            <div className="rounded-2xl border border-[#e8d9a8] bg-white/80 p-4 space-y-4">
              <h3 className="font-display text-2xl text-[#4a4a4a]">
                {t(language, "leaveMessageTitle")}
              </h3>
              <input
                type="text"
                value={messageName}
                onChange={(e) => setMessageName(e.target.value)}
                placeholder={t(language, "senderNameOptional")}
                className="w-full min-h-[48px] px-4 py-3 rounded-xl border border-[#e8d9a8] bg-white focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] outline-none text-base"
              />
              <textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder={t(language, "messagePlaceholder")}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-[#e8d9a8] bg-white focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] outline-none text-base resize-y"
              />
              {messageStatus.text && (
                <p
                  className={`text-sm font-medium ${
                    messageStatus.type === "error" ? "text-red-600" : "text-green-700"
                  }`}
                >
                  {messageStatus.text}
                </p>
              )}
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={sendingMessage}
                className="w-full min-h-[52px] rounded-xl bg-[#c9a227] text-white font-semibold text-base hover:bg-[#b8911f] active:scale-[0.98] transition touch-manipulation disabled:opacity-60"
              >
                {sendingMessage ? t(language, "sending") : t(language, "sendMessage")}
              </button>
            </div>
              </>
            )}

            {viewMode === "album" && (
              <>
            <div className="mb-4 flex items-center">
              <button
                type="button"
                onClick={() => setViewMode(null)}
                className="text-sm text-[#8a8a8a] hover:text-[#4a4a4a] underline"
              >
                {t(language, "backToMenu")}
              </button>
            </div>

            {!loading && photos.length > 0 && (
              <div className="mb-6 -mx-4 sm:mx-0 overflow-x-auto overscroll-x-contain scrollbar-hide">
                <p className="text-sm font-medium text-[#4a4a4a] mb-2 px-4 sm:px-0">{t(language, "filterByTag")}</p>
                <div className="flex gap-2 px-4 sm:px-0 sm:flex-wrap pb-2 sm:pb-0">
                  <button
                    onClick={() => setFilterTag(null)}
                    className={`min-h-[44px] shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition touch-manipulation ${
                      !filterTag
                        ? 'bg-[#c9a227] text-white'
                        : 'bg-white border border-[#e8d9a8] text-[#4a4a4a] hover:border-[#c9a227]'
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
                            ? 'bg-[#c9a227] text-white'
                            : 'bg-white border border-[#e8d9a8] text-[#4a4a4a] hover:border-[#c9a227]'
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

            <button
              type="button"
              onClick={() => setViewMode("upload")}
              className="w-full mt-4 min-h-[52px] rounded-xl bg-[#c9a227] text-white font-semibold text-base hover:bg-[#b8911f] active:scale-[0.98] transition touch-manipulation"
            >
              {t(language, "openUpload")}
            </button>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
