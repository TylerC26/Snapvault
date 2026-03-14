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
      <div className="text-center py-16 text-[#8a8a8a]">
        <p className="text-lg font-medium">{t(language, "noPhotosYet")}</p>
        <p className="text-sm mt-1">{t(language, "beFirst")}</p>
      </div>
    );
  }

  return (
    <>
      <p className="text-[#8a8a8a] text-sm mb-4">
        {visiblePhotos.length}{" "}
        {visiblePhotos.length === 1
          ? t(language, "photoSharedOne")
          : t(language, "photosSharedMany")}
      </p>
      <div className="columns-2 sm:columns-3 gap-2 sm:gap-3 space-y-2 sm:space-y-3">
        {visiblePhotos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => setSelectedIndex(index)}
            className="block w-full break-inside-avoid touch-manipulation"
          >
            <div className="relative aspect-square overflow-hidden rounded-xl bg-[#e8f0e8]/50">
              <img
                src={photo.url}
                alt={photo.caption || t(language, "weddingPhoto")}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => handleImageError(photo.id)}
              />
              {photo.tags?.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <div className="flex flex-wrap gap-1">
                    {photo.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/90 text-[#4a4a4a] font-medium"
                      >
                        {tagLabel(language, tag)}
                      </span>
                    ))}
                    {photo.tags.length > 2 && (
                      <span className="text-[10px] text-white/90">+{photo.tags.length - 2}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
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
