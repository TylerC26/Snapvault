import { useState, useRef, useEffect } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "../firebase";
import { signInAnon } from "../firebase";
import { compressImage } from "../utils/imageCompression";
import { t, tagLabel } from "../i18n";

export default function PhotoUpload({ eventCode, language, availableTags }) {
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const [guestName, setGuestName] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [toast, setToast] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const appendRef = useRef(false);

  useEffect(() => {
    if (previewFile) {
      const url = URL.createObjectURL(previewFile);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setPreviewUrl(null);
      };
    }
    setPreviewUrl(null);
  }, [previewFile]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileSelect = (files, append = false) => {
    const imageFiles = Array.from(files).filter((f) =>
      /^image\/(jpeg|jpg|png|webp|gif)$/i.test(f.type)
    );
    if (imageFiles.length === 0) {
      showToast(t(language, "chooseImageErr"), "error");
      return;
    }
    if (append) {
      setPendingFiles((prev) => [...prev, ...imageFiles]);
    } else {
      setPendingFiles(imageFiles);
    }
  };

  const clearSelection = () => {
    setPendingFiles([]);
    setGuestName('');
    setCaption('');
    setSelectedTags([]);
    setPreviewFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return;

    const files = [...pendingFiles];
    const guestNameToUse = guestName.trim() || null;
    const captionToUse = caption;
    const tagsToUse = [...selectedTags];
    const imageFiles = Array.from(files).filter((f) =>
      /^image\/(jpeg|jpg|png|webp|gif)$/i.test(f.type)
    );
    if (imageFiles.length === 0) {
      showToast(t(language, "chooseImageErr"), "error");
      return;
    }

    setPendingFiles([]);
    setGuestName('');
    setCaption('');
    setSelectedTags([]);
    setPreviewFile(null);
    setUploading(true);

    try {
      await signInAnon();
    } catch (err) {
      showToast(t(language, "connectError"), "error");
      setUploading(false);
      return;
    }

    let successCount = 0;
    const progressMap = {};

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const key = `${file.name}-${i}`;
      progressMap[key] = 0;
      setProgress({ ...progressMap });

      try {
        const compressed = await compressImage(file);
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `events/${eventCode}/${timestamp}-${safeName}`;
        const storageRef = ref(storage, path);

        await new Promise((resolve, reject) => {
          const uploadTask = uploadBytesResumable(storageRef, compressed);

          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              progressMap[key] = pct;
              setProgress({ ...progressMap });
            },
            (err) => reject(err),
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              await addDoc(collection(db, 'events', eventCode, 'photos'), {
                url,
                storagePath: path,
                guestName: guestNameToUse,
                caption: captionToUse || null,
                tags: tagsToUse.length > 0 ? tagsToUse : [],
                timestamp: serverTimestamp(),
              });
              successCount++;
              progressMap[key] = 100;
              setProgress({ ...progressMap });
              resolve();
            }
          );
        });
      } catch (err) {
        console.error(err);
        showToast(t(language, "uploadFailed"), "error");
        break;
      }
    }

    setUploading(false);
    setProgress({});

    if (successCount > 0) {
      showToast(
        successCount === 1
          ? t(language, "photoUploaded")
          : t(language, "photosUploaded", { count: successCount })
      );
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onFileInputChange = (e) => {
    if (e.target.files?.length) {
      handleFileSelect(e.target.files, appendRef.current);
      appendRef.current = false;
    }
    e.target.value = '';
  };

  const showReviewStep = pendingFiles.length > 0 && !uploading;

  return (
    <div className="space-y-5">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={onFileInputChange}
      />

      {/* ── Drop zone / upload state ── */}
      {!showReviewStep && (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`
            relative cursor-pointer touch-manipulation transition-colors
            bg-[var(--paper-card)]
            ${uploading ? 'pointer-events-none' : 'hover:bg-[#fff]'}
          `}
          style={{
            backgroundImage:
              'linear-gradient(to right, var(--rule-strong) 50%, transparent 50%), linear-gradient(to right, var(--rule-strong) 50%, transparent 50%), linear-gradient(to bottom, var(--rule-strong) 50%, transparent 50%), linear-gradient(to bottom, var(--rule-strong) 50%, transparent 50%)',
            backgroundPosition: 'left top, left bottom, left top, right top',
            backgroundRepeat: 'repeat-x, repeat-x, repeat-y, repeat-y',
            backgroundSize: '12px 1px, 12px 1px, 1px 12px, 1px 12px',
          }}
        >
          <div
            className={`px-6 sm:px-10 py-10 sm:py-14 text-center transition-colors ${
              isDragging ? 'bg-[var(--sepia-soft)]' : ''
            }`}
          >
            {uploading ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-3">
                  <span className="w-10 h-px bg-[var(--sepia)]" />
                  <span className="eyebrow eyebrow-accent">{t(language, "uploading")}</span>
                  <span className="w-10 h-px bg-[var(--sepia)]" />
                </div>

                {Object.keys(progress).length > 0 && (
                  <div className="max-w-md mx-auto space-y-2.5 text-left">
                    {Object.entries(progress).map(([name, pct]) => {
                      const label = name.split('-').slice(0, -1).join('-') || name;
                      return (
                        <div key={name} className="space-y-1">
                          <div className="flex justify-between gap-2 text-xs text-[var(--ink-soft)] font-sans">
                            <span className="truncate italic font-serif">{label}</span>
                            <span className="tabular-nums">{pct}%</span>
                          </div>
                          <div className="h-px bg-[var(--rule)] relative overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 bg-[var(--sepia)] transition-[width] duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div aria-hidden className="text-[var(--sepia)] mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="mx-auto w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  >
                    <path d="M8 16h6l3-4h14l3 4h6v22H8z" strokeLinejoin="round" />
                    <circle cx="24" cy="26" r="7" />
                    <circle cx="24" cy="26" r="3" />
                    <circle cx="37" cy="19" r="0.7" fill="currentColor" />
                  </svg>
                </div>
                <p className="font-display italic text-2xl text-[var(--ink)]">
                  {t(language, "tapOrDrop")}
                </p>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <span className="w-8 h-px bg-[var(--rule-strong)]" />
                  <p className="eyebrow">{t(language, "fileTypes")}</p>
                  <span className="w-8 h-px bg-[var(--rule-strong)]" />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Review step ── */}
      {showReviewStep && (
        <div className="bg-[var(--paper-card)] border border-[var(--rule)] p-5 sm:p-7 space-y-6">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="eyebrow eyebrow-accent">{t(language, "reviewLabel")}</p>
              <p className="font-display italic text-xl text-[var(--ink)] mt-0.5">
                {pendingFiles.length}{" "}
                <span className="text-[var(--ink-mute)]">
                  {pendingFiles.length === 1
                    ? t(language, "selectedOne")
                    : t(language, "selectedMany")}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={clearSelection}
              className="font-serif italic text-sm text-[var(--ink-mute)] hover:text-[var(--sepia)] underline underline-offset-4 decoration-[var(--rule-strong)] hover:decoration-[var(--sepia)] touch-manipulation"
            >
              {t(language, "clear")}
            </button>
          </div>

          {/* Thumbnail strip */}
          <div className="-mx-1 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 px-1 pb-2">
              {pendingFiles.map((file, i) => (
                <button
                  key={`${file.name}-${i}`}
                  type="button"
                  onClick={() => setPreviewFile(file)}
                  className="relative shrink-0 w-20 h-20 overflow-hidden bg-[var(--paper-deep)] border border-[var(--rule)] touch-manipulation hover:border-[var(--sepia)] transition-colors"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="w-full h-full object-cover"
                    onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                  />
                  <span className="absolute bottom-0 left-0 right-0 text-[9px] font-sans tracking-[0.15em] uppercase text-white bg-black/45 py-0.5 text-center">
                    № {String(i + 1).padStart(2, '0')}
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  appendRef.current = true;
                  fileInputRef.current?.click();
                }}
                className="shrink-0 w-20 h-20 border border-dashed border-[var(--rule-strong)] flex items-center justify-center text-[var(--ink-mute)] hover:text-[var(--sepia)] hover:border-[var(--sepia)] transition-colors touch-manipulation"
                aria-label={t(language, "addMoreAria")}
              >
                <span className="text-2xl font-light leading-none">+</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-5">
            <div>
              <label className="eyebrow block mb-1.5">
                {t(language, "yourName")}
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder={t(language, "yourName")}
                className="input-editorial"
              />
            </div>

            <div>
              <label className="eyebrow block mb-1.5">
                {t(language, "guestNoteLabel")}
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={t(language, "captionPlaceholder")}
                rows={3}
                className="input-editorial !py-2 resize-none leading-relaxed"
              />
            </div>

            <div>
              <p className="eyebrow mb-3">{t(language, "tagsOptional")}</p>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    data-active={selectedTags.includes(tag)}
                    className="tag-chip touch-manipulation min-h-[40px]"
                  >
                    {tagLabel(language, tag)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
            <span className="eyebrow">{t(language, "readyWhenYouAre")}</span>
            <button
              type="button"
              onClick={handleUpload}
              className="btn-ink inline-flex items-center gap-3 min-h-[48px] w-full sm:w-auto justify-center"
            >
              <span>{t(language, "upload")}</span>
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Preview overlay ── */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 bg-[#17120f]/95 backdrop-blur-md flex items-center justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] fade-in"
          onClick={() => setPreviewFile(null)}
        >
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 sm:px-8 pt-[max(1rem,env(safe-area-inset-top))] pb-4">
            <span className="eyebrow !text-[#c79a5c]">{t(language, "previewLabel")}</span>
            <button
              onClick={() => setPreviewFile(null)}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-[#e9dfc9]/80 hover:text-white text-2xl font-light touch-manipulation"
              aria-label={t(language, "close")}
            >
              <span aria-hidden className="font-display">×</span>
            </button>
          </div>
          {previewUrl && (
            <img
              src={previewUrl}
              alt={t(language, "previewAlt")}
              className="max-w-full max-h-[85vh] object-contain shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-4 right-4 mx-auto max-w-sm px-5 py-3 border z-50 fade-in flex items-center gap-3 ${
            toast.type === 'error'
              ? 'bg-[#3a1f1c] border-[#7a2f2a] text-[#f4d8d5]'
              : 'bg-[var(--paper-card)] border-[var(--sepia)] text-[var(--ink)]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              toast.type === 'error' ? 'bg-[#d8847a]' : 'bg-[var(--sepia)]'
            }`}
            aria-hidden
          />
          <span className="font-serif italic text-sm flex-1">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
