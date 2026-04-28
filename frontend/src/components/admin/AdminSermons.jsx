"use client";

import { useEffect, useMemo, useState } from "react";

function toDatetimeLocal(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export default function AdminSermons() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
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
    speaker: "",
    date: "",
    durationMinutes: "",
    categorySlug: "",
    categoryName: "",
    thumbnailUrl: "",
    videoUrl: "",
    description: "",
    slug: "",
  });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/sermons", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load");
      setItems(Array.isArray(json.items) ? json.items : []);
      setCategories(Array.isArray(json.categories) ? json.categories : []);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function uploadThumb(file) {
    setUploading(true);
    setError("");
    setMessage("");
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/admin/upload/sermon-thumb", {
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

  async function createSermon(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const duration = Number.parseInt(String(form.durationMinutes || ""), 10);
      const res = await fetch("/api/admin/sermons", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          speaker: form.speaker,
          date: new Date(form.date).toISOString(),
          durationMinutes: Number.isFinite(duration) ? duration : undefined,
          categorySlug: form.categorySlug,
          categoryName: form.categoryName,
          thumbnailUrl: form.thumbnailUrl,
          videoUrl: form.videoUrl,
          description: form.description,
          slug: form.slug,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Create failed");
      setForm({
        title: "",
        speaker: "",
        date: "",
        durationMinutes: "",
        categorySlug: "",
        categoryName: "",
        thumbnailUrl: "",
        videoUrl: "",
        description: "",
        slug: "",
      });
      setMessage("Sermon created.");
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
      const duration = Number.parseInt(String(editing.durationMinutes ?? ""), 10);
      const res = await fetch(`/api/admin/sermons/${editing.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: editing.title,
          speaker: editing.speaker || "",
          date: new Date(editing.date).toISOString(),
          durationMinutes: Number.isFinite(duration) ? duration : undefined,
          categorySlug: editing.category?.slug || "",
          categoryName: editing.category?.name || "",
          thumbnailUrl: editing.thumbnailUrl || "",
          videoUrl: editing.videoUrl || "",
          description: editing.description || "",
          slug: editing.slug || "",
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

  async function deleteSermon(id) {
    if (!confirm("Delete this sermon?")) return;
    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/admin/sermons/${id}`, { method: "DELETE" });
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
          Sermons
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-black">Manage sermons</h1>
        <p className="mt-3 text-white/75 max-w-3xl">
          Create and edit sermon listings for the sermons page.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h2 className="text-xl font-black">Create sermon</h2>
        <form className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={createSermon}>
          <label className="block md:col-span-2">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Title
            </span>
            <input
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Speaker
            </span>
            <input
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.speaker}
              onChange={(e) => setForm((f) => ({ ...f, speaker: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Date/time
            </span>
            <input
              type="datetime-local"
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Duration (min)
            </span>
            <input
              type="number"
              min={1}
              max={1440}
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.durationMinutes}
              onChange={(e) =>
                setForm((f) => ({ ...f, durationMinutes: e.target.value }))
              }
            />
          </label>
          <label className="block">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Category (existing)
            </span>
            <select
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.categorySlug}
              onChange={(e) => {
                const slug = e.target.value;
                const cat = categories.find((c) => c.slug === slug);
                setForm((f) => ({
                  ...f,
                  categorySlug: slug,
                  categoryName: cat?.name || f.categoryName,
                }));
              }}
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Category name (optional)
            </span>
            <input
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.categoryName}
              onChange={(e) =>
                setForm((f) => ({ ...f, categoryName: e.target.value }))
              }
              placeholder="If creating/renaming"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Thumbnail URL
            </span>
            <input
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.thumbnailUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))
              }
              placeholder="https://... or upload below"
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
                    const url = await uploadThumb(file);
                    setForm((f) => ({ ...f, thumbnailUrl: url }));
                    setMessage("Thumbnail uploaded.");
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
              Video URL
            </span>
            <input
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.videoUrl}
              onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Description
            </span>
            <textarea
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60 min-h-[110px]"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Slug (optional)
            </span>
            <input
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="Auto-generated if empty"
            />
          </label>

          <div className="md:col-span-2 flex flex-wrap gap-3 items-center">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl bg-primary text-black font-extrabold px-6 py-3 hover:bg-accent transition-colors"
            >
              Create
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
          <h2 className="text-xl font-black">All sermons</h2>
          {loading ? <span className="text-white/60 font-bold">Loadingâ€¦</span> : null}
        </div>

        {items.length ? (
          <div className="mt-5 grid grid-cols-1 gap-3">
            {items.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setEditingId((cur) => (cur === s.id ? null : s.id))}
                className={[
                  "text-left rounded-2xl border px-5 py-4 transition-colors",
                  editingId === s.id
                    ? "bg-white/10 border-white/20"
                    : "bg-background/40 border-white/10 hover:bg-background/60",
                ].join(" ")}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-extrabold truncate">{s.title}</p>
                    <p className="text-sm text-white/60 font-bold truncate">
                      {s.speaker || "â€”"} â€¢ {toDatetimeLocal(s.date).replace("T", " ")}
                      {s.category?.name ? ` â€¢ ${s.category.name}` : ""}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold border bg-white/5 border-white/10 text-white/70">
                    Edit
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-white/70 font-bold">
            {error ? "Could not load sermons." : "No sermons yet."}
          </p>
        )}

        {editing ? (
          <form onSubmit={saveEdit} className="mt-6 rounded-3xl bg-background/40 border border-white/10 p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black">Edit</h3>
              <button
                type="button"
                onClick={() => deleteSermon(editing.id)}
                className="inline-flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 px-4 py-2.5 font-extrabold hover:bg-white/10 transition-colors text-red-200"
              >
                Delete
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block md:col-span-2">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Title
                </span>
                <input
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                  value={editing.title}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) => (x.id === editing.id ? { ...x, title: e.target.value } : x)),
                    )
                  }
                  required
                />
              </label>
              <label className="block">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Speaker
                </span>
                <input
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                  value={editing.speaker || ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) => (x.id === editing.id ? { ...x, speaker: e.target.value } : x)),
                    )
                  }
                />
              </label>
              <label className="block">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Date/time
                </span>
                <input
                  type="datetime-local"
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                  value={toDatetimeLocal(editing.date)}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === editing.id ? { ...x, date: new Date(e.target.value).toISOString() } : x,
                      ),
                    )
                  }
                  required
                />
              </label>
              <label className="block">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Duration (min)
                </span>
                <input
                  type="number"
                  min={1}
                  max={1440}
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                  value={editing.durationMinutes ?? ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === editing.id
                          ? { ...x, durationMinutes: e.target.value ? Number(e.target.value) : null }
                          : x,
                      ),
                    )
                  }
                />
              </label>
              <label className="block">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Category slug
                </span>
                <input
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                  value={editing.category?.slug || ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === editing.id
                          ? { ...x, category: { ...(x.category || {}), slug: e.target.value } }
                          : x,
                      ),
                    )
                  }
                  placeholder="e.g. faith"
                />
              </label>
              <label className="block">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Category name
                </span>
                <input
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                  value={editing.category?.name || ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === editing.id
                          ? { ...x, category: { ...(x.category || {}), name: e.target.value } }
                          : x,
                      ),
                    )
                  }
                  placeholder="e.g. Faith"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Thumbnail URL
                </span>
                <input
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                  value={editing.thumbnailUrl || ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === editing.id ? { ...x, thumbnailUrl: e.target.value } : x,
                      ),
                    )
                  }
                  placeholder="https://... or upload below"
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
                        const url = await uploadThumb(file);
                        setItems((prev) =>
                          prev.map((x) => (x.id === editing.id ? { ...x, thumbnailUrl: url } : x)),
                        );
                        setMessage("Thumbnail uploaded.");
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
                  Video URL
                </span>
                <input
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                  value={editing.videoUrl || ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === editing.id ? { ...x, videoUrl: e.target.value } : x,
                      ),
                    )
                  }
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Description
                </span>
                <textarea
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60 min-h-[110px]"
                  value={editing.description || ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === editing.id ? { ...x, description: e.target.value } : x,
                      ),
                    )
                  }
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Slug (optional)
                </span>
                <input
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                  value={editing.slug || ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) => (x.id === editing.id ? { ...x, slug: e.target.value } : x)),
                    )
                  }
                />
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

