"use client";

import { useEffect, useMemo, useState } from "react";

function formatWhen(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(d.getTime())) return "";
  return d.toLocaleString();
}

export default function AdminMessages() {
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
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/messages", { cache: "no-store" });
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

  async function createMessage(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Create failed");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      setMessage("Message saved.");
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
      const res = await fetch(`/api/admin/messages/${editing.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: editing.name,
          email: editing.email,
          phone: editing.phone || "",
          subject: editing.subject || "",
          message: editing.message,
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

  async function deleteMessage(id) {
    if (!confirm("Delete this message?")) return;
    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
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
          Messages
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-black">Contact messages</h1>
        <p className="mt-3 text-white/75 max-w-3xl">
          View, create, edit, and delete messages submitted via the contact form.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h2 className="text-xl font-black">Create message</h2>
        <form className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={createMessage}>
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
              Email
            </span>
            <input
              type="email"
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Phone (optional)
            </span>
            <input
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Subject (optional)
            </span>
            <input
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
              Message
            </span>
            <textarea
              className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60 min-h-[120px]"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              required
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
          <h2 className="text-xl font-black">All messages</h2>
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
                    <p className="font-extrabold truncate">
                      {m.subject ? m.subject : `Message from ${m.name}`}
                    </p>
                    <p className="text-sm text-white/60 font-bold truncate">
                      {m.email}
                      {m.phone ? ` • ${m.phone}` : ""}
                      {m.createdAt ? ` • ${formatWhen(m.createdAt)}` : ""}
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
            {error ? "Could not load messages." : "No messages yet."}
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
                onClick={() => deleteMessage(editing.id)}
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
                  Email
                </span>
                <input
                  type="email"
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                  value={editing.email}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) => (x.id === editing.id ? { ...x, email: e.target.value } : x)),
                    )
                  }
                  required
                />
              </label>
              <label className="block">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Phone
                </span>
                <input
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                  value={editing.phone || ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === editing.id ? { ...x, phone: e.target.value } : x,
                      ),
                    )
                  }
                />
              </label>
              <label className="block">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Subject
                </span>
                <input
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                  value={editing.subject || ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === editing.id ? { ...x, subject: e.target.value } : x,
                      ),
                    )
                  }
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                  Message
                </span>
                <textarea
                  className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60 min-h-[140px]"
                  value={editing.message}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === editing.id ? { ...x, message: e.target.value } : x,
                      ),
                    )
                  }
                  required
                />
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

