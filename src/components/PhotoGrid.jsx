import { useState, useCallback, useEffect } from "react";
import PhotoModal from "./PhotoModal";
import { t, tagLabel } from "../i18n";

export default function PhotoGrid({ photos, onDelete, language }) {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [failedIds, setFailedIds] = useState(new Set());

  const handleImageError = useCallback((photoId) => {
    setFailedIds((prev) => new Set([...prev, photoId]));
  }, []);

  // Remove failedIds for photos no longer in the list (e.g. deleted from Firestore)
  useEffect(() => {
    const photoIds = new Set(photos.map((p) => p.id));
    setFailedIds((prev) => {
      const next = new Set([...prev].filter((id) => photoIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [photos]);

  const visiblePhotos = photos.filter((p) => !failedIds.has(p.id));

  useEffect(() => {
    if (selectedIndex < 0) return;
    if (visiblePhotos.length === 0) {
      setSelectedIndex(-1);
      return;
    }
    if (selectedIndex >= visiblePhotos.length) {
      setSelectedIndex(visiblePhotos.length - 1);
    }
  }, [selectedIndex, visiblePhotos.length]);

  if (!photos?.length) {
    return (
      <div className="text-center py-20">
        <span className="rule inline-block" />
        <p className="font-display italic text-3xl text-[var(--ink)] mt-6">
          {t(language, "noPhotosYet")}
        </p>
        <p className="font-serif italic text-[var(--ink-mute)] mt-2 text-base">
          {t(language, "beFirst")}
        </p>
        <span className="rule rule-ink inline-block mt-6 opacity-40" />
      </div>
    );
  }

  const plateNum = (i) => String(i + 1).padStart(3, "0");

  return (
    <>
      <p className="eyebrow mb-5">
        {visiblePhotos.length}{" "}
        {visiblePhotos.length === 1
          ? t(language, "photoSharedOne")
          : t(language, "photosSharedMany")}
      </p>

      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4 [column-fill:_balance]">
        {visiblePhotos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => setSelectedIndex(index)}
            className="group mb-3 sm:mb-4 block w-full break-inside-avoid touch-manipulation text-left"
            aria-label={photo.caption || t(language, "weddingPhoto")}
          >
            <figure className="tile">
              <img
                src={photo.url}
                alt={photo.caption || t(language, "weddingPhoto")}
                className="w-full h-auto block"
                loading="lazy"
                onError={() => handleImageError(photo.id)}
              />

              {/* Bottom caption plate — appears on hover */}
              <figcaption
                className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out
                           bg-[var(--paper-card)]/96 backdrop-blur-sm border-t border-[var(--rule)] px-3 py-2.5"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="eyebrow">Plate № {plateNum(index)}</span>
                  {photo.tags?.[0] && (
                    <span className="font-display italic text-xs text-[var(--sepia)] truncate">
                      {tagLabel(language, photo.tags[0])}
                    </span>
                  )}
                </div>
              </figcaption>

              {/* Persistent plate number in corner — always visible for editorial touch */}
              <span
                aria-hidden
                className="absolute top-2 left-2 font-display italic text-xs text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] group-hover:opacity-0 transition-opacity duration-300"
              >
                № {plateNum(index)}
              </span>
            </figure>
          </button>
        ))}
      </div>

      <PhotoModal
        photos={visiblePhotos}
        currentIndex={selectedIndex}
        onClose={() => setSelectedIndex(-1)}
        onNavigate={setSelectedIndex}
        onDelete={onDelete}
        language={language}
      />
    </>
  );
}
