"use client";

import { useState } from "react";

export default function AdminYouTubeSync() {
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);

  async function syncNow() {
    setStatus("loading");
    setResult(null);
    try {
      const res = await fetch("/api/sermons/sync-youtube", { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Sync failed");
      }
      setResult(json);
      setStatus("success");
    } catch (e) {
      setResult({ error: e?.message || "Sync failed" });
      setStatus("error");
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-7 sm:p-10">
      <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
        Sync
      </p>
      <h2 className="mt-3 text-2xl sm:text-3xl font-black">
        Import sermons from YouTube
      </h2>
      <p className="mt-3 text-white/75 max-w-3xl">
        This pulls the latest videos from your configured{" "}
        <span className="font-extrabold">playlist</span> or{" "}
        <span className="font-extrabold">channel uploads</span> and upserts them
        into the database.
      </p>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={syncNow}
          disabled={status === "loading"}
          className="inline-flex items-center justify-center rounded-xl bg-primary text-black font-extrabold px-7 py-3.5 hover:bg-accent transition-colors disabled:opacity-60"
        >
          {status === "loading" ? "Syncing…" : "Sync Now"}
        </button>
        <a
          className="inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-7 py-3.5 font-bold hover:bg-white/10 transition-colors"
          href="/api/sermons?limit=3"
          target="_blank"
          rel="noreferrer"
        >
          Test API
        </a>
      </div>

      {result ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-background/40 p-5 text-sm">
          <pre className="whitespace-pre-wrap text-white/80">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

