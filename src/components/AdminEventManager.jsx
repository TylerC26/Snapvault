import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "../firebase";
import AdminShell from "./AdminShell";
import { PHOTO_TAGS } from "../constants/tags";
import { downloadPhotosAsZip } from "../utils/downloadPhotos";

function getStoragePathFromUrl(url) {
  try {
    const match = url.match(/\/o\/(.+?)(?:\?|$)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

async function deletePhotoDoc(eventCode, photo) {
  await deleteDoc(doc(db, "events", eventCode, "photos", photo.id));
  const path = photo.storagePath || getStoragePathFromUrl(photo.url);
  if (path) {
    try {
      await deleteObject(ref(storage, path));
    } catch (err) {
      if (err?.code !== "storage/object-not-found") throw err;
    }
  }
}

function MetadataEditor({ code, eventData, onSaved }) {
  const [title, setTitle] = useState(eventData.title || "");
  const [heroImage, setHeroImage] = useState(eventData.heroImage || "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setTitle(eventData.title || "");
    setHeroImage(eventData.heroImage || "");
  }, [eventData.title, eventData.heroImage]);

  const dirty =
    title !== (eventData.title || "") ||
    heroImage !== (eventData.heroImage || "");

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      await updateDoc(doc(db, "events", code), {
        title: title.trim(),
        heroImage: heroImage.trim(),
        updatedAt: serverTimestamp(),
      });
      setStatus("Saved.");
      onSaved?.();
    } catch (err) {
      console.error(err);
      setStatus("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-[1fr,18rem] gap-6 items-start">
      <div>
        <label className="block eyebrow mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full font-display italic text-2xl py-2 bg-transparent border-0 border-b border-[var(--rule-strong)] focus:border-[var(--sepia)] focus:outline-none text-[var(--ink)] mb-6"
        />

        <label className="block eyebrow mb-2">Hero image URL</label>
        <input
          type="text"
          value={heroImage}
          onChange={(e) => setHeroImage(e.target.value)}
          placeholder="https://… or /local-path.png"
          className="w-full font-serif text-sm py-2 bg-transparent border-0 border-b border-[var(--rule-strong)] focus:border-[var(--sepia)] focus:outline-none text-[var(--ink)] mb-5"
        />

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={!dirty || saving}
            className="btn-ink inline-flex items-center gap-3 min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          {status && (
            <span className="font-serif italic text-sm text-[var(--sepia-deep)]">
              {status}
            </span>
          )}
        </div>
      </div>

      <div className="order-first lg:order-last">
        <p className="eyebrow mb-2">Preview</p>
        <div className="aspect-[3/4] bg-[var(--paper-deep)] overflow-hidden border border-[var(--rule)]">
          {heroImage && (
            <img src={heroImage} alt="" className="w-full h-full object-cover" />
          )}
        </div>
      </div>
    </form>
  );
}

function TagsManager({ code, customTags }) {
  const [newTag, setNewTag] = useState("");
  const [busy, setBusy] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    const name = newTag.trim();
    if (!name) return;
    setBusy(true);
    try {
      await addDoc(collection(db, "events", code, "tags"), {
        name,
        createdAt: new Date().toISOString(),
      });
      setNewTag("");
    } catch (err) {
      console.error(err);
      alert("Failed to add tag.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (id) => {
    if (!confirm("Remove this tag? Existing photos that use it keep the label.")) return;
    try {
      await deleteDoc(doc(db, "events", code, "tags", id));
    } catch (err) {
      console.error(err);
      alert("Failed to remove tag.");
    }
  };

  return (
    <div>
      <form onSubmit={handleAdd} className="flex gap-3 mb-5">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add a custom tag…"
          className="flex-1 font-serif text-sm py-2 bg-transparent border-0 border-b border-[var(--rule-strong)] focus:border-[var(--sepia)] focus:outline-none text-[var(--ink)]"
        />
        <button
          type="submit"
          disabled={busy || !newTag.trim()}
          className="btn-ink min-h-[40px] px-4 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </form>

      <div>
        <p className="eyebrow mb-2">Built-in</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {PHOTO_TAGS.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center min-h-[36px] px-3 font-serif italic text-sm text-[var(--ink-soft)] border border-[var(--rule)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="eyebrow mb-2">Custom</p>
        {customTags.length === 0 ? (
          <p className="font-serif italic text-sm text-[var(--ink-mute)]">
            No custom tags yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {customTags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-2 min-h-[36px] pl-3 pr-2 font-serif italic text-sm text-[var(--ink)] border border-[var(--rule-strong)]"
              >
                {tag.name}
                <button
                  type="button"
                  onClick={() => handleRemove(tag.id)}
                  className="w-6 h-6 inline-flex items-center justify-center text-[var(--ink-mute)] hover:text-[var(--sepia-deep)]"
                  aria-label={`Remove ${tag.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PhotoModeration({ code, photos }) {
  const [selected, setSelected] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const [download, setDownload] = useState(null); // { done, total, phase } | null

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected = photos.length > 0 && selected.size === photos.length;

  const handleSelectAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(photos.map((p) => p.id)));
  };

  const handleDeleteSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} photo${selected.size === 1 ? "" : "s"}? This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    try {
      const toDelete = photos.filter((p) => selected.has(p.id));
      for (const photo of toDelete) {
        await deletePhotoDoc(code, photo);
      }
      setSelected(new Set());
    } catch (err) {
      console.error(err);
      alert("Some photos failed to delete. Check the console.");
    } finally {
      setBusy(false);
    }
  };

  const runDownload = async (subset, zipName) => {
    if (!subset.length || download) return;
    setDownload({ done: 0, total: subset.length, phase: "fetching" });
    try {
      const result = await downloadPhotosAsZip(subset, zipName, (done, total, phase) => {
        setDownload({ done, total, phase });
      });
      if (result.failed.length > 0) {
        alert(
          `Downloaded ${result.ok} of ${subset.length} photos. ${result.failed.length} could not be fetched — check the console.`
        );
        console.warn("Failed downloads:", result.failed);
      }
    } catch (err) {
      console.error(err);
      alert("Download failed. Check the console.");
    } finally {
      setDownload(null);
    }
  };

  const handleDownloadSelected = () => {
    const subset = photos.filter((p) => selected.has(p.id));
    runDownload(subset, `${code}-selected-${subset.length}`);
  };

  const handleDownloadAll = () => {
    runDownload(photos, `${code}-all-${photos.length}`);
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="rule inline-block" />
        <p className="font-display italic text-2xl text-[var(--ink)] mt-6">
          No plates yet
        </p>
        <p className="font-serif italic text-[var(--ink-mute)] mt-2">
          Guests haven't uploaded anything.
        </p>
      </div>
    );
  }

  const downloading = download !== null;
  const downloadLabel = downloading
    ? download.phase === "zipping"
      ? "Packaging…"
      : `Fetching ${download.done}/${download.total}…`
    : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleSelectAll}
            className="eyebrow hover:text-[var(--ink)]"
          >
            {allSelected ? "Clear selection" : "Select all"}
          </button>
          <span className="eyebrow text-[var(--ink-mute)]">
            {selected.size} of {photos.length} selected
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleDownloadSelected}
            disabled={selected.size === 0 || busy || downloading}
            className="min-h-[40px] px-4 font-serif italic text-sm border border-[var(--rule-strong)] text-[var(--ink-soft)] hover:border-[var(--sepia)] hover:text-[var(--sepia)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ↓ Download selected
          </button>
          <button
            type="button"
            onClick={handleDownloadAll}
            disabled={busy || downloading}
            className="min-h-[40px] px-4 font-serif italic text-sm bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--sepia-deep)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ↓ Download all ({photos.length})
          </button>
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={selected.size === 0 || busy || downloading}
            className="min-h-[40px] px-4 font-serif italic text-sm border border-[var(--sepia)] text-[var(--sepia-deep)] hover:bg-[var(--sepia-soft)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {busy ? "Deleting…" : "Delete selected"}
          </button>
        </div>
      </div>

      {downloading && (
        <div className="mb-5 border-l-2 border-[var(--sepia)] bg-[var(--sepia-soft)] px-4 py-3">
          <p className="eyebrow eyebrow-accent mb-1">{downloadLabel}</p>
          <div className="h-1 bg-[var(--paper-deep)] overflow-hidden">
            <div
              className="h-full bg-[var(--sepia)] transition-all duration-200"
              style={{
                width:
                  download.phase === "zipping"
                    ? "100%"
                    : `${(download.done / Math.max(1, download.total)) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {photos.map((photo) => {
          const isSelected = selected.has(photo.id);
          return (
            <label
              key={photo.id}
              className="relative block cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(photo.id)}
                className="sr-only"
              />
              <figure className="relative overflow-hidden bg-[var(--paper-deep)] aspect-square">
                <img
                  src={photo.url}
                  alt={photo.caption || "photo"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div
                  className={
                    "absolute inset-0 border-2 transition-all pointer-events-none " +
                    (isSelected
                      ? "border-[var(--sepia)] bg-[var(--sepia)]/15"
                      : "border-transparent group-hover:border-[var(--rule-strong)]")
                  }
                />
                <div
                  className={
                    "absolute top-2 left-2 w-6 h-6 rounded-full border flex items-center justify-center text-xs " +
                    (isSelected
                      ? "bg-[var(--sepia)] border-[var(--sepia)] text-[var(--paper)]"
                      : "bg-[var(--paper-card)]/90 border-[var(--rule-strong)] text-transparent")
                  }
                >
                  ✓
                </div>
              </figure>
              <div className="mt-1.5 flex items-baseline justify-between gap-2">
                <span className="font-serif italic text-xs text-[var(--ink-soft)] truncate">
                  {photo.guestName || "Anonymous"}
                </span>
                {photo.tags?.[0] && (
                  <span className="eyebrow text-[var(--sepia)] truncate">
                    {photo.tags[0]}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function DangerZone({ code, photos, onDeleted }) {
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== code) return;
    if (!confirm(`Permanently delete ${code} and all ${photos.length} photos?`)) {
      return;
    }
    setBusy(true);
    try {
      for (const photo of photos) {
        await deletePhotoDoc(code, photo);
      }
      const tagsSnap = await getDocs(collection(db, "events", code, "tags"));
      const batch = writeBatch(db);
      tagsSnap.docs.forEach((d) => batch.delete(d.ref));
      batch.delete(doc(db, "events", code));
      await batch.commit();
      onDeleted?.();
    } catch (err) {
      console.error(err);
      alert("Delete failed. Check the console.");
      setBusy(false);
    }
  };

  return (
    <div className="border border-[var(--sepia)] bg-[var(--sepia-soft)] p-5 sm:p-6">
      <p className="eyebrow eyebrow-accent mb-2">Irrevocable</p>
      <h3 className="font-display italic text-2xl text-[var(--ink)] mb-2">
        Delete this event
      </h3>
      <p className="font-serif text-sm text-[var(--ink-soft)] mb-4 max-w-prose">
        Removes the event, every photo, and every custom tag. The event code
        becomes available for reuse. There is no undo.
      </p>
      <p className="font-serif italic text-sm text-[var(--ink-soft)] mb-2">
        Type <strong className="not-italic">{code}</strong> to confirm:
      </p>
      <div className="flex gap-3 items-center flex-wrap">
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
          className="font-display tracking-[0.2em] text-base py-1.5 px-2 bg-[var(--paper-card)] border border-[var(--rule-strong)] focus:border-[var(--sepia)] focus:outline-none text-[var(--ink)]"
        />
        <button
          type="button"
          onClick={handleDelete}
          disabled={confirmText !== code || busy}
          className="min-h-[40px] px-4 font-serif italic text-sm bg-[var(--sepia-deep)] text-[var(--paper)] hover:bg-[var(--ink)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {busy ? "Deleting…" : "Delete event"}
        </button>
      </div>
    </div>
  );
}

function EventManagerContent({ signOut }) {
  const { code: rawCode } = useParams();
  const code = (rawCode || "").toUpperCase();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [customTags, setCustomTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    let cancelled = false;
    getDoc(doc(db, "events", code))
      .then((snap) => {
        if (cancelled) return;
        if (!snap.exists()) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setEventData({ active: true, ...snap.data() });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(
        collection(db, "events", code, "photos"),
        orderBy("timestamp", "desc")
      ),
      (snap) => {
        setPhotos(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            timestamp: d.data().timestamp?.toDate?.()?.getTime() ?? 0,
          }))
        );
      }
    );
    return () => unsub();
  }, [code]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "events", code, "tags"), orderBy("createdAt", "asc")),
      (snap) => {
        setCustomTags(
          snap.docs
            .map((d) => ({ id: d.id, name: d.data()?.name }))
            .filter((t) => typeof t.name === "string" && t.name.trim())
        );
      }
    );
    return () => unsub();
  }, [code]);

  const handleToggleActive = async () => {
    setToggling(true);
    try {
      const next = !(eventData?.active ?? true);
      await updateDoc(doc(db, "events", code), { active: next });
      setEventData((prev) => ({ ...prev, active: next }));
    } catch (err) {
      console.error(err);
      alert("Failed to toggle.");
    } finally {
      setToggling(false);
    }
  };

  const refreshEvent = () => {
    getDoc(doc(db, "events", code)).then((snap) => {
      if (snap.exists()) setEventData({ active: true, ...snap.data() });
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--paper)] paper-grain flex items-center justify-center">
        <div className="w-8 h-8 border border-[var(--sepia)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[var(--paper)] paper-grain flex flex-col items-center justify-center px-6">
        <p className="eyebrow eyebrow-accent">Not found</p>
        <h1 className="font-display italic text-4xl text-[var(--ink)] mt-2">
          No event with code {code}
        </h1>
        <Link
          to="/admin"
          className="btn-ink mt-8 inline-flex items-center gap-3 min-h-[44px]"
        >
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  const tabs = [
    { key: "details", label: "Details" },
    { key: "photos", label: `Photos (${photos.length})` },
    { key: "tags", label: "Tags" },
    { key: "danger", label: "Danger" },
  ];

  return (
    <div className="min-h-screen bg-[var(--paper)] paper-grain">
      <header className="sticky top-0 z-40 bg-[var(--paper)]/95 backdrop-blur-sm border-b border-[var(--rule)] pt-[env(safe-area-inset-top)]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between gap-3 py-4">
            <Link
              to="/admin"
              className="group min-h-[44px] inline-flex items-center gap-2 text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
            >
              <span aria-hidden className="inline-block w-5 h-px bg-current group-hover:w-7 transition-all" />
              <span className="eyebrow !text-inherit">Dashboard</span>
            </Link>

            <div className="flex-1 text-center truncate">
              <div className="font-display italic text-lg sm:text-xl text-[var(--ink)] truncate leading-tight">
                {eventData.title || "Untitled"}
              </div>
              <div className="eyebrow mt-0.5">№ {code}</div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={`/event/${code}`}
                target="_blank"
                rel="noreferrer"
                className="eyebrow hover:text-[var(--sepia)]"
              >
                View ↗
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="eyebrow hover:text-[var(--sepia)]"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        {/* Status strip */}
        <section className="mb-8 pb-6 border-b border-[var(--rule)] flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-baseline gap-4 flex-wrap">
            <span
              className={
                "eyebrow " +
                (eventData.active
                  ? "text-[var(--sepia)]"
                  : "text-[var(--ink-mute)]")
              }
            >
              {eventData.active ? "● Active" : "○ Paused"}
            </span>
            <span className="font-serif text-sm text-[var(--ink-soft)]">
              {photos.length} photo{photos.length === 1 ? "" : "s"}
            </span>
            <span className="font-serif text-sm text-[var(--ink-soft)]">
              {customTags.length} custom tag{customTags.length === 1 ? "" : "s"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleActive}
            disabled={toggling}
            className="min-h-[40px] px-4 font-serif italic text-sm border border-[var(--rule-strong)] hover:border-[var(--sepia)] hover:text-[var(--sepia)] transition-colors"
          >
            {toggling ? "…" : eventData.active ? "Pause event" : "Activate event"}
          </button>
        </section>

        {/* Tabs */}
        <nav className="mb-8 border-b border-[var(--rule)] flex gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={
                "min-h-[44px] px-4 sm:px-5 font-display italic text-lg whitespace-nowrap border-b-2 transition-colors " +
                (activeTab === tab.key
                  ? "border-[var(--sepia)] text-[var(--ink)]"
                  : "border-transparent text-[var(--ink-mute)] hover:text-[var(--ink)]")
              }
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === "details" && (
          <section>
            <div className="mb-6">
              <p className="eyebrow eyebrow-accent">§ I</p>
              <h2 className="font-display italic text-3xl text-[var(--ink)] mt-1">
                Details
              </h2>
            </div>
            <MetadataEditor code={code} eventData={eventData} onSaved={refreshEvent} />
          </section>
        )}

        {activeTab === "photos" && (
          <section>
            <div className="mb-6">
              <p className="eyebrow eyebrow-accent">§ II</p>
              <h2 className="font-display italic text-3xl text-[var(--ink)] mt-1">
                Photos
              </h2>
              <p className="font-serif text-sm text-[var(--ink-soft)] mt-2 max-w-prose">
                Select photos to remove in bulk. Both the Firestore record and the
                Storage file are deleted.
              </p>
            </div>
            <PhotoModeration code={code} photos={photos} />
          </section>
        )}

        {activeTab === "tags" && (
          <section>
            <div className="mb-6">
              <p className="eyebrow eyebrow-accent">§ III</p>
              <h2 className="font-display italic text-3xl text-[var(--ink)] mt-1">
                Tags
              </h2>
              <p className="font-serif text-sm text-[var(--ink-soft)] mt-2 max-w-prose">
                Built-in tags are always available. Custom tags appear in the
                upload picker and gallery filter.
              </p>
            </div>
            <TagsManager code={code} customTags={customTags} />
          </section>
        )}

        {activeTab === "danger" && (
          <section>
            <div className="mb-6">
              <p className="eyebrow eyebrow-accent">§ IV</p>
              <h2 className="font-display italic text-3xl text-[var(--ink)] mt-1">
                Danger zone
              </h2>
            </div>
            <DangerZone
              code={code}
              photos={photos}
              onDeleted={() => navigate("/admin")}
            />
          </section>
        )}
      </main>
    </div>
  );
}

export default function AdminEventManager() {
  return (
    <AdminShell>
      {({ signOut }) => <EventManagerContent signOut={signOut} />}
    </AdminShell>
  );
}
