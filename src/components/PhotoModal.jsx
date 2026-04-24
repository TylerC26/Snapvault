import { useEffect, useRef, useState } from "react";
import { t, tagLabel } from "../i18n";

export default function PhotoModal({ photos, currentIndex, onClose, onNavigate, onDelete, language }) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteError, setDeleteError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const touchStartX = useRef(null);

  const hasPhoto = currentIndex >= 0 && currentIndex < photos.length;
  const photo = hasPhoto ? photos[currentIndex] : null;
  const hasMultiple = photos.length > 1;

  const goPrev = () => {
    if (!hasMultiple || currentIndex < 0) return;
    onNavigate((currentIndex - 1 + photos.length) % photos.length);
  };

  const goNext = () => {
    if (!hasMultiple || currentIndex < 0) return;
    onNavigate((currentIndex + 1) % photos.length);
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        showPassword ? setShowPassword(false) : onClose();
      }
      if (showPassword) return;
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, showPassword, currentIndex, photos.length]);

  useEffect(() => {
    if (!showPassword) {
      setPassword('');
      setDeleteError(null);
    }
  }, [showPassword]);

  const handleDeleteClick = () => {
    if (!onDelete) return;
    setShowPassword(true);
  };

  const handleDeleteConfirm = async () => {
    if (!onDelete || !photo) return;
    setDeleting(true);
    setDeleteError(null);
    const result = await onDelete(photo, password);
    setDeleting(false);
    if (result.success) {
      onClose();
    } else {
      setDeleteError(result.error || t(language, "deleteFailed"));
    }
  };

  if (!photo) return null;

  const plateNum = String(currentIndex + 1).padStart(3, "0");
  const totalPlates = String(photos.length).padStart(3, "0");

  return (
    <div
      className="fixed inset-0 z-50 bg-[#17120f]/97 backdrop-blur-md fade-in"
      onClick={!showPassword ? onClose : undefined}
    >
      {/* Plate counter — top left */}
      <div
        className="absolute top-0 left-0 flex items-center gap-3 px-5 sm:px-8 pt-[max(1rem,env(safe-area-inset-top))] pb-4 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="w-6 h-px bg-[#c79a5c]" />
        <span className="eyebrow !text-[#c79a5c]">
          Plate № {plateNum} / {totalPlates}
        </span>
      </div>

      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-4 pt-16 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        onClick={!showPassword ? onClose : undefined}
        onTouchStart={(e) => {
          touchStartX.current = e.changedTouches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current == null || showPassword || !hasMultiple) return;
          const delta = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(delta) > 40) {
            if (delta < 0) goNext();
            if (delta > 0) goPrev();
          }
          touchStartX.current = null;
        }}
      >
        {hasMultiple && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label={t(language, "previousPhoto")}
            className="group absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 text-[#e9dfc9]/70 hover:text-[#c79a5c] transition-colors touch-manipulation p-2"
          >
            <span aria-hidden className="font-display text-3xl leading-none">‹</span>
            <span className="hidden sm:block w-px h-12 bg-current" />
          </button>
        )}

        <img
          src={photo.url}
          alt={photo.caption || t(language, "weddingPhoto")}
          className="max-w-full max-h-[65vh] sm:max-h-[72vh] object-contain shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]"
          onError={onClose}
          onClick={(e) => e.stopPropagation()}
        />

        {hasMultiple && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label={t(language, "nextPhoto")}
            className="group absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 text-[#e9dfc9]/70 hover:text-[#c79a5c] transition-colors touch-manipulation p-2"
          >
            <span aria-hidden className="font-display text-3xl leading-none">›</span>
            <span className="hidden sm:block w-px h-12 bg-current" />
          </button>
        )}

        {/* Caption plate */}
        <div
          className="mt-6 max-w-lg w-full mx-auto text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {photo.tags?.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2 justify-center">
              {photo.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-sans text-[10px] tracking-[0.18em] uppercase text-[#c79a5c] border border-[#c79a5c]/40 px-2.5 py-1"
                >
                  {tagLabel(language, tag)}
                </span>
              ))}
            </div>
          )}

          {photo.caption && (
            <div className="px-2">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="w-8 h-px bg-[#c79a5c]/60" />
                <span className="eyebrow !text-[#c79a5c]">
                  {t(language, "guestNoteLabel")}
                </span>
                <span className="w-8 h-px bg-[#c79a5c]/60" />
              </div>
              <p className="font-display italic text-[#f4efe6] text-lg sm:text-xl leading-snug">
                “{photo.caption}”
              </p>
              {photo.guestName && (
                <p className="font-serif italic text-sm text-[#e9dfc9]/65 mt-3">
                  — {photo.guestName}
                </p>
              )}
            </div>
          )}

          {!photo.caption && photo.guestName && (
            <p className="font-display italic text-[#e9dfc9]/80 text-base">
              {t(language, "sharedBy", { name: photo.guestName })}
            </p>
          )}

          <div className="mt-5 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase text-[#e9dfc9]/70 hover:text-white border border-[#e9dfc9]/30 hover:border-white/60 px-4 py-2 transition-colors touch-manipulation"
            >
              <span aria-hidden>✕</span>
              {t(language, "close")}
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleDeleteClick(); }}
                className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase text-[#e9dfc9]/50 hover:text-[#d8847a] border-b border-transparent hover:border-[#d8847a]/60 pb-0.5 transition-colors touch-manipulation"
              >
                {t(language, "deletePhoto")}
              </button>
            )}
          </div>
        </div>
      </div>

      {showPassword && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-[#17120f]/85 backdrop-blur-sm p-4 fade-in"
          onClick={() => setShowPassword(false)}
        >
          <div
            className="bg-[var(--paper-card)] max-w-sm w-full shadow-2xl border border-[var(--rule)] p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="eyebrow eyebrow-accent mb-2">{t(language, "confirmDeletion")}</p>
            <p className="font-display italic text-xl text-[var(--ink)] mb-4">
              {t(language, "enterPasswordToDelete")}
            </p>
            <div className="h-px bg-[var(--rule)] mb-5" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t(language, "password")}
              className="input-editorial mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleDeleteConfirm()}
            />
            {deleteError && (
              <p className="font-serif italic text-sm text-[var(--sepia-deep)] mb-4">
                — {deleteError} —
              </p>
            )}
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowPassword(false)}
                className="btn-ghost flex-1 touch-manipulation"
              >
                {t(language, "cancel")}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting || !password}
                className="btn-ink flex-1 !bg-[#7a2f2a] !border-[#7a2f2a] hover:!bg-[#5a1f1a] hover:!border-[#5a1f1a] touch-manipulation"
              >
                {deleting ? t(language, "deleting") : t(language, "delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
