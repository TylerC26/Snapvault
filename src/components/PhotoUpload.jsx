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
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={onFileInputChange}
      />

      {!showReviewStep && (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-2xl p-6 sm:p-8 min-h-[120px] text-center cursor-pointer transition touch-manipulation
            ${isDragging ? 'border-[#c9a227] bg-[#f5e6e8]/50' : 'border-[#e8d9a8] bg-white/80 hover:bg-[#faf8f5] active:bg-[#f5e6e8]/30'}
            ${uploading ? 'pointer-events-none opacity-80' : ''}
          `}
        >
          {uploading ? (
            <div className="space-y-3">
              <div className="w-10 h-10 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-[#4a4a4a] font-medium">{t(language, "uploading")}</p>
              {Object.keys(progress).length > 0 && (
                <div className="space-y-1 text-sm text-[#8a8a8a]">
                  {Object.entries(progress).map(([name, pct]) => (
                    <div key={name} className="flex justify-between gap-2">
                      <span className="truncate">{name.split('-')[0]}</span>
                      <span>{pct}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="text-4xl mb-2">📸</div>
              <p className="text-[#4a4a4a] font-semibold">{t(language, "tapOrDrop")}</p>
              <p className="text-sm text-[#8a8a8a] mt-1">{t(language, "fileTypes")}</p>
            </>
          )}
        </div>
      )}

      {showReviewStep && (
        <div className="space-y-4 rounded-2xl border border-[#e8d9a8] bg-white/80 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#4a4a4a]">
              {pendingFiles.length}{" "}
              {pendingFiles.length === 1
                ? t(language, "selectedOne")
                : t(language, "selectedMany")}
            </p>
            <button
              type="button"
              onClick={clearSelection}
              className="text-sm text-[#8a8a8a] hover:text-[#4a4a4a] underline touch-manipulation"
            >
              {t(language, "clear")}
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1">
            {pendingFiles.map((file, i) => (
              <button
                key={`${file.name}-${i}`}
                type="button"
                onClick={() => setPreviewFile(file)}
                className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-[#e8f0e8]/50 touch-manipulation"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="w-full h-full object-cover"
                  onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                />
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                appendRef.current = true;
                fileInputRef.current?.click();
              }}
              className="shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-[#e8d9a8] flex items-center justify-center text-[#8a8a8a] hover:border-[#c9a227] hover:text-[#c9a227] transition touch-manipulation"
              aria-label={t(language, "addMoreAria")}
            >
              <span className="text-2xl leading-none">+</span>
            </button>
          </div>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder={t(language, "yourName")}
            className="w-full min-h-[48px] px-4 py-3 rounded-xl border border-[#e8d9a8] bg-white focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] outline-none text-base"
          />
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={t(language, "captionOptional")}
            className="w-full min-h-[48px] px-4 py-3 rounded-xl border border-[#e8d9a8] bg-white focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] outline-none text-base"
          />
          <div className="-mx-1 overflow-x-auto overscroll-x-contain scrollbar-hide">
            <p className="text-sm font-medium text-[#4a4a4a] mb-2">{t(language, "tagsOptional")}</p>
            <div className="flex flex-wrap gap-2 pb-1">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`
                    min-h-[44px] px-4 py-2.5 rounded-full text-sm font-medium transition touch-manipulation shrink-0
                    ${selectedTags.includes(tag)
                      ? 'bg-[#c9a227] text-white'
                      : 'bg-white border border-[#e8d9a8] text-[#4a4a4a] hover:border-[#c9a227] active:border-[#c9a227]'}
                  `}
                >
                  {tagLabel(language, tag)}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handleUpload}
            className="w-full min-h-[48px] py-2.5 rounded-xl bg-[#c9a227] text-white font-semibold hover:bg-[#b8911f] active:scale-[0.98] transition touch-manipulation"
          >
            {t(language, "upload")}
          </button>
        </div>
      )}

      {previewFile && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
          onClick={() => setPreviewFile(null)}
        >
          <button
            className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 min-h-[48px] min-w-[48px] flex items-center justify-center text-white/80 hover:text-white text-3xl touch-manipulation"
            onClick={() => setPreviewFile(null)}
            aria-label="Close"
          >
            ×
          </button>
          {previewUrl && (
            <img
              src={previewUrl}
              alt={t(language, "previewAlt")}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-4 right-4 mx-auto max-w-sm py-3 px-4 rounded-xl shadow-lg text-white font-medium text-center z-50 ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-[#c9a227]'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
