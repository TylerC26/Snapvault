import JSZip from "jszip";

const EXT_FROM_MIME = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
};

function sanitize(name) {
  return (name || "")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

function extFromUrl(url) {
  try {
    const path = new URL(url).pathname;
    const match = path.match(/\.([a-zA-Z0-9]{2,5})$/);
    return match ? match[1].toLowerCase() : null;
  } catch {
    return null;
  }
}

function extFromStoragePath(path) {
  if (!path) return null;
  const match = path.match(/\.([a-zA-Z0-9]{2,5})$/);
  return match ? match[1].toLowerCase() : null;
}

function pickExt(photo, blob) {
  return (
    EXT_FROM_MIME[blob?.type] ||
    extFromStoragePath(photo.storagePath) ||
    extFromUrl(photo.url) ||
    "jpg"
  );
}

function filenameFor(photo, index, blob) {
  const num = String(index + 1).padStart(3, "0");
  const guest = sanitize(photo.guestName);
  const ext = pickExt(photo, blob);
  const suffix = guest ? `-${guest}` : "";
  return `plate-${num}${suffix}.${ext}`;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Fetch every photo, pack into a zip, download.
 *
 * @param {Array<{id,url,storagePath?,guestName?}>} photos
 * @param {string} zipName - filename without extension
 * @param {(done:number,total:number,phase:'fetching'|'zipping')=>void} [onProgress]
 * @returns {Promise<{ok:number,failed:Array<{photo:object,error:Error}>}>}
 */
export async function downloadPhotosAsZip(photos, zipName, onProgress) {
  if (!photos?.length) return { ok: 0, failed: [] };

  const zip = new JSZip();
  const failed = [];
  const total = photos.length;
  const usedNames = new Set();
  let done = 0;

  onProgress?.(done, total, "fetching");

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    try {
      const res = await fetch(photo.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      let name = filenameFor(photo, i, blob);
      // Dedup collisions
      if (usedNames.has(name)) {
        const [base, ext] = name.split(/\.(?=[^.]+$)/);
        let n = 2;
        while (usedNames.has(`${base}-${n}.${ext}`)) n++;
        name = `${base}-${n}.${ext}`;
      }
      usedNames.add(name);
      zip.file(name, blob);
    } catch (error) {
      failed.push({ photo, error });
    }
    done++;
    onProgress?.(done, total, "fetching");
  }

  onProgress?.(done, total, "zipping");
  const archive = await zip.generateAsync({ type: "blob" });
  triggerDownload(archive, `${zipName}.zip`);

  return { ok: total - failed.length, failed };
}
