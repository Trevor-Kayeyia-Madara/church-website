"use client";

import { useEffect, useMemo, useState } from "react";

export default function AdminPastors() {
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
    name: "",
    roleTitle: "",
    photoUrl: "",
    bio: "",
    sortOrder: 0,
    isPublished: true,
  });

  async function uploadPastorPhoto(file) {
    setUploading(true);
    setError("");
    setMessage("");
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/admin/upload/pastor-photo", {
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
      const res = await fetch("/api/admin/pastors", { cache: "no-store" });
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

  async function createPastor(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/admin/pastors", {
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
        name: "",
        roleTitle: "",
        photoUrl: "",
        bio: "",
        sortOrder: 0,
        isPublished: true,
      });
      setMessage("Pastor created.");
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
      const res = await fetch(`/api/admin/pastors/${editing.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: editing.name,
          roleTitle: editing.roleTitle || "",
          photoUrl: editing.photoUrl || "",
          bio: editing.bio || "",
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

  async function deletePastor(id) {
    if (!confirm("Delete this pastor card?")) return;
    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/admin/pastors/${id}`, { method: "DELETE" });
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
          Pastors
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-black">Manage pastor cards</h1>
        <p className="mt-3 text-white/75 max-w-3xl">
          Add, reorder, and publish the leadership section on the homepage.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h2 className="text-xl font-black">Create pastor</h2>
        <form className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={createPastor}>
          <label className="block">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Name
            </span>
            <input
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Role/Title
            </span>
            <input
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.roleTitle}
              onChange={(e) => setForm((f) => ({ ...f, roleTitle: e.target.value }))}
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Photo URL
            </span>
            <input
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.photoUrl}
              onChange={(e) => setForm((f) => ({ ...f, photoUrl: e.target.value }))}
              placeholder="https://..."
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
                    const url = await uploadPastorPhoto(file);
                    setForm((f) => ({ ...f, photoUrl: url }));
                    setMessage("Photo uploaded.");
                  } catch (err) {
                    setError(err?.message || "Upload failed");
                  }
                }}
              />
              <p className="text-xs text-white/50 font-bold">
                Upload from device (JPG/PNG/WebP/GIF, max 5MB).
              </p>
            </div>
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Bio (optional)
            </span>
            <textarea
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60 min-h-[110px]"
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
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
          <h2 className="text-xl font-black">All pastors</h2>
          {loading ? <span className="text-white/60 font-bold">Loadingâ€¦</span> : null}
        </div>

        {items.length ? (
          <div className="mt-5 grid grid-cols-1 gap-3">
            {items.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setEditingId((cur) => (cur === p.id ? null : p.id))}
                className={[
                  "text-left rounded-2xl border px-5 py-4 transition-colors",
                  editingId === p.id
                    ? "bg-white/10 border-white/20"
                    : "bg-background/40 border-white/10 hover:bg-background/60",
                ].join(" ")}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-extrabold">{p.name}</p>
                    <p className="text-sm text-white/60 font-bold">
                      {p.roleTitle || "â€”"} â€¢ Sort {p.sortOrder ?? 0}
                    </p>
                  </div>
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold border",
                      p.isPublished
                        ? "bg-primary/15 border-primary/25 text-accent"
                        : "bg-white/5 border-white/10 text-white/60",
                    ].join(" ")}
                  >
                    {p.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-white/70 font-bold">
            {error ? "Could not load pastors." : "No pastor cards yet."}
          </p>
        )}

        {editing ? (
          <form onSubmit={saveEdit} className="mt-6 rounded-3xl bg-background/40 border border-white/10 p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black">Edit</h3>
              <button
                type="button"
                onClick={() => deletePastor(editing.id)}
                className="inline-flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 px-4 py-2.5 font-extrabold hover:bg-white/10 transition-colors text-red-200"
              >
                Delete
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Name
                </span>
                <input
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                  value={editing.name}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) => (x.id === editing.id ? { ...x, name: e.target.value } : x)),
                    )
                  }
                  required
                />
              </label>
              <label className="block">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Role/Title
                </span>
                <input
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                  value={editing.roleTitle || ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === editing.id ? { ...x, roleTitle: e.target.value } : x,
                      ),
                    )
                  }
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Photo URL
                </span>
                <input
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                  value={editing.photoUrl || ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === editing.id ? { ...x, photoUrl: e.target.value } : x,
                      ),
                    )
                  }
                  placeholder="https://..."
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
                        const url = await uploadPastorPhoto(file);
                        setItems((prev) =>
                          prev.map((x) => (x.id === editing.id ? { ...x, photoUrl: url } : x)),
                        );
                        setMessage("Photo uploaded.");
                      } catch (err) {
                        setError(err?.message || "Upload failed");
                      }
                    }}
                  />
                  <p className="text-xs text-white/50 font-bold">
                    Upload from device (JPG/PNG/WebP/GIF, max 5MB).
                  </p>
                </div>
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Bio
                </span>
                <textarea
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60 min-h-[110px]"
                  value={editing.bio || ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === editing.id ? { ...x, bio: e.target.value } : x,
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
