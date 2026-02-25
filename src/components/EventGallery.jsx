import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage, signInAnon } from '../firebase';
import PhotoUpload from './PhotoUpload';
import PhotoGrid from './PhotoGrid';
import { PHOTO_TAGS } from '../constants/tags';

const DELETE_PASSWORD = import.meta.env.VITE_DELETE_PASSWORD || '';

/** Extract Storage path from Firebase download URL (for photos without storagePath) */
function getStoragePathFromUrl(url) {
  try {
    const match = url.match(/\/o\/(.+?)(?:\?|$)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

export default function EventGallery() {
  const { code } = useParams();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTag, setFilterTag] = useState(null);

  const filteredPhotos = useMemo(() => {
    if (!filterTag) return photos;
    return photos.filter((p) => p.tags?.includes(filterTag));
  }, [photos, filterTag]);

  const handleDelete = useCallback(
    async (photo, password) => {
      if (!DELETE_PASSWORD) {
        return { success: false, error: 'Delete is not configured. Set VITE_DELETE_PASSWORD.' };
      }
      if (password !== DELETE_PASSWORD) {
        return { success: false, error: 'Wrong password' };
      }
      try {
        await signInAnon();
        const docRef = doc(db, 'events', code.toUpperCase(), 'photos', photo.id);
        await deleteDoc(docRef);

        const path = photo.storagePath || getStoragePathFromUrl(photo.url);
        if (path) {
          const storageRef = ref(storage, path);
          await deleteObject(storageRef);
        }
        return { success: true };
      } catch (err) {
        console.error(err);
        return { success: false, error: 'Failed to delete' };
      }
    },
    [code]
  );

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
              setError('Could not load photos. Check your connection?');
              setLoading(false);
            }
          }
        );
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) {
          setError('Could not connect. Check your connection?');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [code]);

  if (!code) return null;

  const displayCode = code.toUpperCase();

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur border-b border-[#e8d9a8]/50 pt-[env(safe-area-inset-top)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <Link to="/" className="min-h-[44px] min-w-[44px] flex items-center justify-center -m-2 text-[#8a8a8a] text-sm hover:text-[#4a4a4a] touch-manipulation">
            ← Back
          </Link>
          <h1 className="font-display text-lg sm:text-xl font-serif text-[#4a4a4a] truncate">
            SnapVault
          </h1>
          <span className="text-[#8a8a8a] text-xs sm:text-sm font-mono shrink-0">{displayCode}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-[max(6rem,calc(1.5rem+env(safe-area-inset-bottom)))]">
        <h2 className="font-display text-2xl font-serif text-[#4a4a4a] mb-6 text-center">
          Wedding Memories
        </h2>

        <div className="mb-8">
          <PhotoUpload eventCode={displayCode} />
        </div>

        <div className="flex justify-center mb-4">
          <button
            onClick={() => window.location.reload()}
            className="min-h-[44px] px-4 py-2 text-sm text-[#8a8a8a] hover:text-[#4a4a4a] underline touch-manipulation"
          >
            Refresh
          </button>
        </div>

        {!loading && photos.length > 0 && (
          <div className="mb-6 -mx-4 sm:mx-0 overflow-x-auto overscroll-x-contain scrollbar-hide">
            <p className="text-sm font-medium text-[#4a4a4a] mb-2 px-4 sm:px-0">Filter by tag</p>
            <div className="flex gap-2 px-4 sm:px-0 sm:flex-wrap pb-2 sm:pb-0">
              <button
                onClick={() => setFilterTag(null)}
                className={`min-h-[44px] shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition touch-manipulation ${
                  !filterTag
                    ? 'bg-[#c9a227] text-white'
                    : 'bg-white border border-[#e8d9a8] text-[#4a4a4a] hover:border-[#c9a227]'
                }`}
              >
                All
              </button>
              {PHOTO_TAGS.map((tag) => {
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
                    {tag} ({count})
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
          <PhotoGrid photos={filteredPhotos} onDelete={handleDelete} />
        )}
      </main>
    </div>
  );
}
