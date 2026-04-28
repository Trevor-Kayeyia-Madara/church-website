"use client";

import { useEffect, useMemo, useState } from "react";

function parseHighlights(raw) {
  return String(raw || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export default function AdminMinistries() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const editing = useMemo(
    () => items.find((i) => i.id === editingId) || null,
    [items, editingId],
  );

  const [form, setForm] = useState({
    title: "",
    description: "",
    highlights: "",
    imageUrl: "",
    sortOrder: 0,
    isPublished: true,
    slug: "",
  });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/ministries", { cache: "no-store" });
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

  async function createMinistry(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/admin/ministries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          highlights: parseHighlights(form.highlights),
          imageUrl: form.imageUrl,
          sortOrder: Number(form.sortOrder) || 0,
          isPublished: !!form.isPublished,
          slug: form.slug,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Create failed");
      setForm({
        title: "",
        description: "",
        highlights: "",
        imageUrl: "",
        sortOrder: 0,
        isPublished: true,
        slug: "",
      });
      setMessage("Ministry created.");
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
      const res = await fetch(`/api/admin/ministries/${editing.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: editing.title,
          description: editing.description || "",
          highlights: Array.isArray(editing.highlights) ? editing.highlights : [],
          imageUrl: editing.imageUrl || "",
          sortOrder: Number(editing.sortOrder) || 0,
          isPublished: !!editing.isPublished,
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

  async function deleteMinistry(id) {
    if (!confirm("Delete this ministry?")) return;
    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/admin/ministries/${id}`, { method: "DELETE" });
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
          Ministries
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-black">Manage ministries</h1>
        <p className="mt-3 text-white/75 max-w-3xl">
          Create and update ministries shown on the public ministries page.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h2 className="text-xl font-black">Create ministry</h2>
        <form className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={createMinistry}>
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

          <label className="block md:col-span-2">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Description (optional)
            </span>
            <textarea
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60 min-h-[110px]"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Highlights (one per line)
            </span>
            <textarea
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60 min-h-[96px]"
              value={form.highlights}
              onChange={(e) => setForm((f) => ({ ...f, highlights: e.target.value }))}
              placeholder={"Choir\nBand\nMedia support"}
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Image URL (optional)
            </span>
            <input
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              placeholder="https://... or /images/..."
            />
          </label>

          <label className="block">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Sort order
            </span>
            <input
              type="number"
              min={0}
              max={10000}
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
            />
          </label>

          <label className="block">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Slug (optional)
            </span>
            <input
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="auto-generated if empty"
            />
          </label>

          <label className="flex items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              className="size-4"
              checked={form.isPublished}
              onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
            />
            <span className="font-extrabold">Published</span>
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
          <h2 className="text-xl font-black">All ministries</h2>
          {loading ? <span className="text-white/60 font-bold">Loading…</span> : null}
        </div>

        {items.length ? (
          <div className="mt-5 grid grid-cols-1 gap-3">
            {items.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setEditingId((cur) => (cur === m.id ? null : m.id))}
                className={[
                  "text-left rounded-2xl border px-5 py-4 transition-colors",
                  editingId === m.id
                    ? "bg-white/10 border-white/20"
                    : "bg-background/40 border-white/10 hover:bg-background/60",
                ].join(" ")}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-extrabold truncate">{m.title}</p>
                    <p className="text-sm text-white/60 font-bold truncate">
                      {m.slug}
                      {m.isPublished ? " • Published" : " • Draft"}
                      {m.imageUrl ? " • Image" : ""}
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
            {error ? "Could not load ministries." : "No ministries yet."}
          </p>
        )}

        {editing ? (
          <form
            onSubmit={saveEdit}
            className="mt-6 rounded-3xl bg-background/40 border border-white/10 p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black">Edit</h3>
              <button
                type="button"
                onClick={() => deleteMinistry(editing.id)}
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
                  Highlights (one per line)
                </span>
                <textarea
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60 min-h-[96px]"
                  value={(Array.isArray(editing.highlights) ? editing.highlights : []).join("\n")}
                  onChange={(e) => {
                    const highlights = parseHighlights(e.target.value);
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === editing.id ? { ...x, highlights } : x,
                      ),
                    );
                  }}
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
                      prev.map((x) =>
                        x.id === editing.id ? { ...x, imageUrl: e.target.value } : x,
                      ),
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
                  min={0}
                  max={10000}
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
                />
              </label>

              <label className="block">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Slug
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

            <div className="mt-4 flex flex-wrap gap-3 items-center">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl bg-primary text-black font-extrabold px-6 py-3 hover:bg-accent transition-colors"
              >
                Save changes
              </button>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="inline-flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 px-6 py-3 font-extrabold hover:bg-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}

