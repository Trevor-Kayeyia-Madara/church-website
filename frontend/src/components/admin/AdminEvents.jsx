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

export default function AdminEvents() {
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
    startAt: "",
    endAt: "",
    location: "",
    posterUrl: "",
    description: "",
    isPublished: true,
  });

  async function uploadPoster(file) {
    setUploading(true);
    setError("");
    setMessage("");
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/admin/upload/event-poster", {
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
      const res = await fetch("/api/admin/events", { cache: "no-store" });
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

  async function createEvent(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          startAt: new Date(form.startAt).toISOString(),
          endAt: form.endAt ? new Date(form.endAt).toISOString() : "",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Create failed");
      setForm({
        title: "",
        startAt: "",
        endAt: "",
        location: "",
        posterUrl: "",
        description: "",
        isPublished: true,
      });
      setMessage("Event created.");
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
      const res = await fetch(`/api/admin/events/${editing.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: editing.title,
          startAt: new Date(editing.startAt).toISOString(),
          endAt: editing.endAt ? new Date(editing.endAt).toISOString() : "",
          location: editing.location || "",
          posterUrl: editing.posterUrl || "",
          description: editing.description || "",
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

  async function deleteEvent(id) {
    if (!confirm("Delete this event?")) return;
    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
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
          Events
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-black">Manage events</h1>
        <p className="mt-3 text-white/75 max-w-3xl">
          Add or edit upcoming events shown on the homepage.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h2 className="text-xl font-black">Create event</h2>
        <form className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={createEvent}>
          <label className="block">
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
              Start
            </span>
            <input
              type="datetime-local"
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.startAt}
              onChange={(e) => setForm((f) => ({ ...f, startAt: e.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              End (optional)
            </span>
            <input
              type="datetime-local"
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.endAt}
              onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Location (optional)
            </span>
            <input
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Poster URL (optional)
            </span>
            <input
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.posterUrl}
              onChange={(e) => setForm((f) => ({ ...f, posterUrl: e.target.value }))}
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
                    const url = await uploadPoster(file);
                    setForm((f) => ({ ...f, posterUrl: url }));
                    setMessage("Poster uploaded.");
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
              Description (optional)
            </span>
            <textarea
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60 min-h-[96px]"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </label>
          <label className="flex items-center gap-3 md:col-span-2">
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
          <h2 className="text-xl font-black">All events</h2>
          {loading ? <span className="text-white/60 font-bold">Loadingâ€¦</span> : null}
        </div>

        {items.length ? (
          <div className="mt-5 grid grid-cols-1 gap-3">
            {items.map((ev) => (
              <button
                key={ev.id}
                type="button"
                onClick={() => setEditingId((cur) => (cur === ev.id ? null : ev.id))}
                className={[
                  "text-left rounded-2xl border px-5 py-4 transition-colors",
                  editingId === ev.id
                    ? "bg-white/10 border-white/20"
                    : "bg-background/40 border-white/10 hover:bg-background/60",
                ].join(" ")}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-extrabold">{ev.title}</p>
                    <p className="text-sm text-white/60 font-bold">
                      {toDatetimeLocal(ev.startAt).replace("T", " ")}
                      {ev.location ? ` â€¢ ${ev.location}` : ""}
                      {ev.posterUrl ? " â€¢ Poster" : ""}
                    </p>
                  </div>
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold border",
                      ev.isPublished
                        ? "bg-primary/15 border-primary/25 text-accent"
                        : "bg-white/5 border-white/10 text-white/60",
                    ].join(" ")}
                  >
                    {ev.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-white/70 font-bold">
            {error ? "Could not load events." : "No events yet."}
          </p>
        )}

        {editing ? (
          <form onSubmit={saveEdit} className="mt-6 rounded-3xl bg-background/40 border border-white/10 p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black">Edit</h3>
              <button
                type="button"
                onClick={() => deleteEvent(editing.id)}
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
                  Start
                </span>
                <input
                  type="datetime-local"
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                  value={toDatetimeLocal(editing.startAt)}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === editing.id ? { ...x, startAt: new Date(e.target.value).toISOString() } : x,
                      ),
                    )
                  }
                  required
                />
              </label>
              <label className="block">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  End
                </span>
                <input
                  type="datetime-local"
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                  value={editing.endAt ? toDatetimeLocal(editing.endAt) : ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === editing.id
                          ? { ...x, endAt: e.target.value ? new Date(e.target.value).toISOString() : null }
                          : x,
                      ),
                    )
                  }
                />
              </label>
              <label className="block">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Location
                </span>
                <input
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                  value={editing.location || ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === editing.id ? { ...x, location: e.target.value } : x,
                      ),
                    )
                  }
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Poster URL
                </span>
                <input
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                  value={editing.posterUrl || ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === editing.id ? { ...x, posterUrl: e.target.value } : x,
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
                        const url = await uploadPoster(file);
                        setItems((prev) =>
                          prev.map((x) => (x.id === editing.id ? { ...x, posterUrl: url } : x)),
                        );
                        setMessage("Poster uploaded.");
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
                  Description
                </span>
                <textarea
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60 min-h-[96px]"
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
