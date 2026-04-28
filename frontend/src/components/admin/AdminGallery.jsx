"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const editing = useMemo(
    () => items.find((i) => i.id === editingId) || null,
    [items, editingId],
  );

  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    altText: "",
    caption: "",
    category: "",
    sortOrder: 0,
    isPublished: true,
  });

  async function uploadImage(file) {
    setUploading(true);
    setError("");
    setMessage("");
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/admin/upload/gallery", {
        method: "POST",
        body,
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Upload failed");
      return json.url;
    } finally {
      setUploading(false);
    }
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/gallery", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load");
      setItems(Array.isArray(json.items) ? json.items : []);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createImage(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          sortOrder: Number(form.sortOrder) || 0,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Create failed");
      setForm({
        title: "",
        imageUrl: "",
        altText: "",
        caption: "",
        category: "",
        sortOrder: 0,
        isPublished: true,
      });
      setMessage("Image added.");
      await load();
    } catch (e2) {
      setError(e2?.message || "Create failed");
    }
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editing) return;
    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/admin/gallery/${editing.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: editing.title || "",
          imageUrl: editing.imageUrl,
          altText: editing.altText || "",
          caption: editing.caption || "",
          category: editing.category || "",
          sortOrder: Number(editing.sortOrder) || 0,
          isPublished: !!editing.isPublished,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Save failed");
      setMessage("Saved.");
      await load();
    } catch (e2) {
      setError(e2?.message || "Save failed");
    }
  }

  async function deleteImage(id) {
    if (!confirm("Delete this image?")) return;
    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Delete failed");
      setEditingId(null);
      setMessage("Deleted.");
      await load();
    } catch (e) {
      setError(e?.message || "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
          Media
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-black">Gallery</h1>
        <p className="mt-3 text-white/75 max-w-3xl">
          Manage church gallery images for the website.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h2 className="text-xl font-black">Add image</h2>
        <form className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={createImage}>
          <label className="block">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Title
            </span>
            <input
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Optional title"
            />
          </label>
          <label className="block">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Category
            </span>
            <input
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="e.g., services, events, youth"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Image
            </span>
            <input
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              placeholder="https://... or upload below"
              required
            />
            <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:items-center">
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  try {
                    const url = await uploadImage(file);
                    setForm((f) => ({ ...f, imageUrl: url }));
                    setMessage("Image uploaded.");
                  } catch (err) {
                    setError(err?.message || "Upload failed");
                  }
                }}
              />
              <p className="text-xs text-white/50 font-bold">
                Upload from device (JPG/PNG/WebP/GIF, max 8MB).
              </p>
            </div>
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Alt Text
            </span>
            <input
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.altText}
              onChange={(e) => setForm((f) => ({ ...f, altText: e.target.value }))}
              placeholder="Accessibility text"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Caption (optional)
            </span>
            <textarea
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60 min-h-[80px]"
              value={form.caption}
              onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Sort order
            </span>
            <input
              type="number"
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
              min={0}
            />
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              className="size-4"
              checked={form.isPublished}
              onChange={(e) =>
                setForm((f) => ({ ...f, isPublished: e.target.checked }))
              }
            />
            <span className="font-extrabold">Published</span>
          </label>

          <div className="md:col-span-2 flex flex-wrap gap-3 items-center">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl bg-primary text-black font-extrabold px-6 py-3 hover:bg-accent transition-colors"
            >
              Add Image
            </button>
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 px-6 py-3 font-extrabold hover:bg-white/10 transition-colors"
            >
              Refresh
            </button>
            {message ? <span className="text-sm text-accent font-bold">{message}</span> : null}
            {error ? <span className="text-sm text-red-300 font-bold">{error}</span> : null}
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">All images</h2>
          {loading ? <span className="text-white/60 font-bold">Loading…</span> : null}
        </div>

        {items.length ? (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {items.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setEditingId((cur) => (cur === img.id ? null : img.id))}
                className={[
                  "relative aspect-square rounded-2xl overflow-hidden border-2 transition-colors",
                  editingId === img.id
                    ? "border-primary"
                    : "border-white/10 hover:border-white/30",
                ].join(" ")}
              >
                <Image
                  src={img.imageUrl}
                  alt={img.altText || img.title || "Gallery image"}
                  fill
                  className="object-cover"
                  sizes="150px"
                />
                {!img.isPublished && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-xs font-extrabold">Draft</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-white/70 font-bold">
            {error ? "Could not load images." : "No images yet."}
          </p>
        )}

        {editing ? (
          <form onSubmit={saveEdit} className="mt-6 rounded-3xl bg-background/40 border border-white/10 p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black">Edit</h3>
              <button
                type="button"
                onClick={() => deleteImage(editing.id)}
                className="inline-flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 px-4 py-2.5 font-extrabold hover:bg-white/10 transition-colors text-red-200"
              >
                Delete
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Title
                </span>
                <input
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                  value={editing.title || ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) => (x.id === editing.id ? { ...x, title: e.target.value } : x)),
                    )
                  }
                />
              </label>
              <label className="block">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Category
                </span>
                <input
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                  value={editing.category || ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) => (x.id === editing.id ? { ...x, category: e.target.value } : x)),
                    )
                  }
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Image URL
                </span>
                <input
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                  value={editing.imageUrl || ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) => (x.id === editing.id ? { ...x, imageUrl: e.target.value } : x)),
                    )
                  }
                />
              </label>
              <label className="block">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Alt Text
                </span>
                <input
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                  value={editing.altText || ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) => (x.id === editing.id ? { ...x, altText: e.target.value } : x)),
                    )
                  }
                />
              </label>
              <label className="block">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Sort order
                </span>
                <input
                  type="number"
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                  value={editing.sortOrder ?? 0}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === editing.id
                          ? { ...x, sortOrder: Number(e.target.value) || 0 }
                          : x,
                      ),
                    )
                  }
                  min={0}
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Caption
                </span>
                <textarea
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60 min-h-[80px]"
                  value={editing.caption || ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) => (x.id === editing.id ? { ...x, caption: e.target.value } : x)),
                    )
                  }
                />
              </label>
              <label className="flex items-center gap-3 md:col-span-2">
                <input
                  type="checkbox"
                  className="size-4"
                  checked={!!editing.isPublished}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === editing.id ? { ...x, isPublished: e.target.checked } : x,
                      ),
                    )
                  }
                />
                <span className="font-extrabold">Published</span>
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-3 items-center">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl bg-primary text-black font-extrabold px-6 py-3 hover:bg-accent transition-colors"
              >
                Save
              </button>
              {message ? <span className="text-sm text-accent font-bold">{message}</span> : null}
              {error ? <span className="text-sm text-red-300 font-bold">{error}</span> : null}
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}