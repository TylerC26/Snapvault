import { useEffect, useState } from 'react';

export default function PhotoModal({ photo, onClose, onDelete }) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteError, setDeleteError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && (showPassword ? setShowPassword(false) : onClose());
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, showPassword]);

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
      setDeleteError(result.error || 'Delete failed');
    }
  };

  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
      onClick={!showPassword ? onClose : undefined}
    >
      <button
        className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 min-h-[48px] min-w-[48px] flex items-center justify-center text-white/80 hover:text-white text-3xl touch-manipulation"
        onClick={showPassword ? () => setShowPassword(false) : onClose}
        aria-label="Close"
      >
        ×
      </button>
      <div
        className="max-w-full max-h-[85vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.url}
          alt={photo.caption || 'Wedding photo'}
          className="max-w-full max-h-[70vh] sm:max-h-[75vh] object-contain rounded-lg"
          onError={onClose}
        />
        {photo.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            {photo.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full bg-white/20 text-white font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {photo.guestName && (
          <p className="mt-2 text-white/70 text-center text-sm">
            Shared by {photo.guestName}
          </p>
        )}
        {photo.caption && (
          <p className="mt-4 text-white/90 text-center max-w-md font-medium">
            {photo.caption}
          </p>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={handleDeleteClick}
            className="mt-4 px-4 py-2 rounded-lg border border-red-400/60 text-red-300 hover:bg-red-500/20 text-sm font-medium touch-manipulation"
          >
            Delete photo
          </button>
        )}
      </div>

      {showPassword && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowPassword(false)}
        >
          <div
            className="bg-[#2a2a2a] rounded-2xl p-6 max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white font-medium mb-2">Enter password to delete</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#444] text-white placeholder-[#888] focus:border-[#c9a227] outline-none text-base mb-3"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleDeleteConfirm()}
            />
            {deleteError && (
              <p className="text-red-400 text-sm mb-3">{deleteError}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowPassword(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#555] text-white/90 font-medium touch-manipulation"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting || !password}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-500 disabled:opacity-50 touch-manipulation"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
