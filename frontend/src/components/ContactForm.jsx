"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ContactForm() {
  const [status, setStatus] = useState("idle");
  const searchParams = useSearchParams();
  const defaultSubject = searchParams.get("subject") || "";
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: defaultSubject,
    message: "",
  });

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-white/60">Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-background/60 px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:border-primary/60"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-white/60">Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-background/60 px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:border-primary/60"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-white/60">
            Phone (optional)
          </label>
          <input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-background/60 px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:border-primary/60"
            placeholder="+254…"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-white/60">
            Subject (optional)
          </label>
          <input
            value={form.subject}
            onChange={(e) => update("subject", e.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-background/60 px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:border-primary/60"
            placeholder="Prayer request / Partnership / …"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-white/60">Message</label>
        <textarea
          required
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          rows={6}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-background/60 px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:border-primary/60"
          placeholder="Type your message…"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-primary text-black font-extrabold px-7 py-3.5 hover:bg-accent transition-colors disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Send Message"}
      </button>

      {status === "success" ? (
        <p className="text-sm text-accent font-bold">Message sent. Thank you!</p>
      ) : status === "error" ? (
        <p className="text-sm text-red-300 font-bold">
          Something went wrong. Please try again.
        </p>
      ) : null}
    </form>
  );
}
