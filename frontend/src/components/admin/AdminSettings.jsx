"use client";

import { useEffect, useState } from "react";

function splitLines(value) {
  return String(value || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function joinLines(lines) {
  return (lines || []).join("\n");
}

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/site-settings", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load");
      setSettings(json.settings);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Save failed");
      setSettings(json.settings);
      setMessage("Saved.");
    } catch (e2) {
      setError(e2?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const disabled = loading || saving || !settings;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">Settings</p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-black">Site settings</h1>
        <p className="mt-3 text-white/75 max-w-3xl">
          Update church details, social links, giving, and school content.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">Edit</h2>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 px-5 py-2.5 font-extrabold hover:bg-white/10 transition-colors"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="mt-4 text-white/70 font-bold">Loading…</p>
        ) : error ? (
          <p className="mt-4 text-red-300 font-bold">{error}</p>
        ) : settings ? (
          <form onSubmit={save} className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                Site name
              </span>
              <input
                className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                value={settings.siteName}
                onChange={(e) => setSettings((s) => ({ ...s, siteName: e.target.value }))}
                disabled={disabled}
                required
              />
            </label>

            <label className="block">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                Short name
              </span>
              <input
                className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                value={settings.shortName}
                onChange={(e) => setSettings((s) => ({ ...s, shortName: e.target.value }))}
                disabled={disabled}
                required
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                Tagline
              </span>
              <input
                className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                value={settings.tagline}
                onChange={(e) => setSettings((s) => ({ ...s, tagline: e.target.value }))}
                disabled={disabled}
                required
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                Location
              </span>
              <input
                className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                value={settings.location}
                onChange={(e) => setSettings((s) => ({ ...s, location: e.target.value }))}
                disabled={disabled}
                required
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                Logo URL
              </span>
              <input
                className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                value={settings.logoUrl || ""}
                onChange={(e) => setSettings((s) => ({ ...s, logoUrl: e.target.value }))}
                disabled={disabled}
                placeholder="/logo.png"
              />
              <p className="mt-2 text-xs text-white/50 font-bold">
                Use a path in `public/` (example: /logo.png) or a full URL.
              </p>
            </label>

            <div className="md:col-span-2 mt-2">
              <p className="text-xs font-black tracking-[0.25em] uppercase text-white/50">
                Contact
              </p>
            </div>

            <label className="block">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                Address line 1
              </span>
              <input
                className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                value={settings.addressLine1}
                onChange={(e) => setSettings((s) => ({ ...s, addressLine1: e.target.value }))}
                disabled={disabled}
              />
            </label>

            <label className="block">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                Address line 2
              </span>
              <input
                className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                value={settings.addressLine2}
                onChange={(e) => setSettings((s) => ({ ...s, addressLine2: e.target.value }))}
                disabled={disabled}
              />
            </label>

            <label className="block">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                Phone (display)
              </span>
              <input
                className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                value={settings.phoneDisplay}
                onChange={(e) => setSettings((s) => ({ ...s, phoneDisplay: e.target.value }))}
                disabled={disabled}
              />
            </label>

            <label className="block">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                Phone (tel)
              </span>
              <input
                className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                value={settings.phoneTel}
                onChange={(e) => setSettings((s) => ({ ...s, phoneTel: e.target.value }))}
                disabled={disabled}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                Email
              </span>
              <input
                type="email"
                className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                value={settings.email}
                onChange={(e) => setSettings((s) => ({ ...s, email: e.target.value }))}
                disabled={disabled}
              />
            </label>

            <div className="md:col-span-2 mt-2">
              <p className="text-xs font-black tracking-[0.25em] uppercase text-white/50">
                Social + Live
              </p>
            </div>

            <label className="block md:col-span-2">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                Live embed URL (YouTube embed)
              </span>
              <input
                className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                value={settings.liveEmbedUrl}
                onChange={(e) => setSettings((s) => ({ ...s, liveEmbedUrl: e.target.value }))}
                disabled={disabled}
                placeholder="https://www.youtube.com/embed/VIDEO_ID"
              />
              <p className="mt-2 text-xs text-white/50 font-bold">
                Use the embed URL (not the watch URL).
              </p>
            </label>

            <label className="block">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                YouTube
              </span>
              <input
                className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                value={settings.youtubeUrl}
                onChange={(e) => setSettings((s) => ({ ...s, youtubeUrl: e.target.value }))}
                disabled={disabled}
                placeholder="https://..."
              />
            </label>

            <label className="block">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                Facebook
              </span>
              <input
                className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                value={settings.facebookUrl}
                onChange={(e) => setSettings((s) => ({ ...s, facebookUrl: e.target.value }))}
                disabled={disabled}
                placeholder="https://..."
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                Instagram
              </span>
              <input
                className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                value={settings.instagramUrl}
                onChange={(e) => setSettings((s) => ({ ...s, instagramUrl: e.target.value }))}
                disabled={disabled}
                placeholder="https://..."
              />
            </label>

            <label className="block">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                TikTok
              </span>
              <input
                className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                value={settings.tiktokUrl || ""}
                onChange={(e) => setSettings((s) => ({ ...s, tiktokUrl: e.target.value }))}
                disabled={disabled}
                placeholder="https://..."
              />
            </label>

            <label className="block">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                Linktree
              </span>
              <input
                className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                value={settings.linktreeUrl || ""}
                onChange={(e) => setSettings((s) => ({ ...s, linktreeUrl: e.target.value }))}
                disabled={disabled}
                placeholder="https://linktr.ee/..."
              />
            </label>

            <div className="md:col-span-2 mt-2">
              <p className="text-xs font-black tracking-[0.25em] uppercase text-white/50">
                Service Times
              </p>
            </div>

            <div className="md:col-span-2 rounded-3xl border border-white/10 bg-background/40 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-extrabold text-white/80">Weekly services</p>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    setSettings((s) => ({
                      ...s,
                      serviceTimes: [
                        ...(s.serviceTimes || []),
                        { day: "Sunday", label: "Service", time: "10:00 AM" },
                      ],
                    }))
                  }
                  className="inline-flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 px-4 py-2 font-extrabold hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Add
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3">
                {(settings.serviceTimes || []).map((t, idx) => (
                  <div
                    key={`${t.day}-${t.label}-${idx}`}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 grid grid-cols-1 md:grid-cols-10 gap-3 items-end"
                  >
                    <label className="md:col-span-3 block">
                      <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                        Day
                      </span>
                      <input
                        className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                        value={t.day || ""}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            serviceTimes: (s.serviceTimes || []).map((x, i) =>
                              i === idx ? { ...x, day: e.target.value } : x,
                            ),
                          }))
                        }
                        disabled={disabled}
                      />
                    </label>
                    <label className="md:col-span-4 block">
                      <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                        Label
                      </span>
                      <input
                        className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                        value={t.label || ""}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            serviceTimes: (s.serviceTimes || []).map((x, i) =>
                              i === idx ? { ...x, label: e.target.value } : x,
                            ),
                          }))
                        }
                        disabled={disabled}
                      />
                    </label>
                    <label className="md:col-span-3 block">
                      <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                        Time
                      </span>
                      <input
                        className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                        value={t.time || ""}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            serviceTimes: (s.serviceTimes || []).map((x, i) =>
                              i === idx ? { ...x, time: e.target.value } : x,
                            ),
                          }))
                        }
                        disabled={disabled}
                      />
                    </label>
                    <div className="md:col-span-10 flex justify-end">
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          setSettings((s) => ({
                            ...s,
                            serviceTimes: (s.serviceTimes || []).filter((_, i) => i !== idx),
                          }))
                        }
                        className="inline-flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 px-4 py-2 font-extrabold hover:bg-white/10 transition-colors disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 mt-2">
              <p className="text-xs font-black tracking-[0.25em] uppercase text-white/50">
                School (Dominion Center)
              </p>
            </div>

            <label className="block md:col-span-2">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                School name
              </span>
              <input
                className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                value={settings.school?.name || ""}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    school: { ...(s.school || {}), name: e.target.value },
                  }))
                }
                disabled={disabled}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                Hero title
              </span>
              <input
                className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                value={settings.school?.heroTitle || ""}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    school: { ...(s.school || {}), heroTitle: e.target.value },
                  }))
                }
                disabled={disabled}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                Tagline
              </span>
              <textarea
                className="mt-2 w-full min-h-24 rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                value={settings.school?.tagline || ""}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    school: { ...(s.school || {}), tagline: e.target.value },
                  }))
                }
                disabled={disabled}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                Hero subtitle
              </span>
              <textarea
                className="mt-2 w-full min-h-28 rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                value={settings.school?.heroSubtitle || ""}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    school: { ...(s.school || {}), heroSubtitle: e.target.value },
                  }))
                }
                disabled={disabled}
              />
            </label>

            <div className="md:col-span-2 rounded-3xl border border-white/10 bg-background/40 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-extrabold text-white/80">Programs</p>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    setSettings((s) => ({
                      ...s,
                      school: {
                        ...(s.school || {}),
                        programs: [
                          ...((s.school?.programs || []) ?? []),
                          { key: "", title: "Program", subtitle: "Details", offers: [] },
                        ],
                      },
                    }))
                  }
                  className="inline-flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 px-4 py-2 font-extrabold hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Add
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4">
                {(settings.school?.programs || []).map((p, idx) => (
                  <div
                    key={`${p.key || p.title}-${idx}`}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <label className="block">
                        <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                          Title
                        </span>
                        <input
                          className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                          value={p.title || ""}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              school: {
                                ...(s.school || {}),
                                programs: (s.school?.programs || []).map((x, i) =>
                                  i === idx ? { ...x, title: e.target.value } : x,
                                ),
                              },
                            }))
                          }
                          disabled={disabled}
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                          Subtitle
                        </span>
                        <input
                          className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                          value={p.subtitle || ""}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              school: {
                                ...(s.school || {}),
                                programs: (s.school?.programs || []).map((x, i) =>
                                  i === idx ? { ...x, subtitle: e.target.value } : x,
                                ),
                              },
                            }))
                          }
                          disabled={disabled}
                        />
                      </label>
                      <label className="block md:col-span-2">
                        <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                          What we offer (one per line)
                        </span>
                        <textarea
                          className="mt-2 w-full min-h-28 rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                          value={joinLines(p.offers || [])}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              school: {
                                ...(s.school || {}),
                                programs: (s.school?.programs || []).map((x, i) =>
                                  i === idx ? { ...x, offers: splitLines(e.target.value) } : x,
                                ),
                              },
                            }))
                          }
                          disabled={disabled}
                        />
                      </label>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          setSettings((s) => ({
                            ...s,
                            school: {
                              ...(s.school || {}),
                              programs: (s.school?.programs || []).filter((_, i) => i !== idx),
                            },
                          }))
                        }
                        className="inline-flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 px-4 py-2 font-extrabold hover:bg-white/10 transition-colors disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 mt-2">
              <p className="text-xs font-black tracking-[0.25em] uppercase text-white/50">
                Giving
              </p>
            </div>

            <label className="block md:col-span-2">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                Giving headline
              </span>
              <input
                className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                value={settings.giving?.headline || ""}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    giving: { ...(s.giving || {}), headline: e.target.value },
                  }))
                }
                disabled={disabled}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                Giving message
              </span>
              <textarea
                className="mt-2 w-full min-h-28 rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                value={settings.giving?.body || ""}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    giving: { ...(s.giving || {}), body: e.target.value },
                  }))
                }
                disabled={disabled}
              />
            </label>

            <div className="md:col-span-2 rounded-3xl border border-white/10 bg-background/40 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-extrabold text-white/80">Giving types</p>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    setSettings((s) => ({
                      ...s,
                      giving: {
                        ...(s.giving || {}),
                        types: [
                          ...((s.giving?.types || []) ?? []),
                          { key: "", title: "New Type", description: "Describe this giving type.", verse: "" },
                        ],
                      },
                    }))
                  }
                  className="inline-flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 px-4 py-2 font-extrabold hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Add
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4">
                {(settings.giving?.types || []).map((t, idx) => (
                  <div
                    key={`${t.key || t.title}-${idx}`}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <label className="block">
                        <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                          Title
                        </span>
                        <input
                          className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                          value={t.title || ""}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              giving: {
                                ...(s.giving || {}),
                                types: (s.giving?.types || []).map((x, i) =>
                                  i === idx ? { ...x, title: e.target.value } : x,
                                ),
                              },
                            }))
                          }
                          disabled={disabled}
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                          Verse (optional)
                        </span>
                        <input
                          className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                          value={t.verse || ""}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              giving: {
                                ...(s.giving || {}),
                                types: (s.giving?.types || []).map((x, i) =>
                                  i === idx ? { ...x, verse: e.target.value } : x,
                                ),
                              },
                            }))
                          }
                          disabled={disabled}
                        />
                      </label>
                      <label className="block md:col-span-2">
                        <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                          Description
                        </span>
                        <textarea
                          className="mt-2 w-full min-h-24 rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                          value={t.description || ""}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              giving: {
                                ...(s.giving || {}),
                                types: (s.giving?.types || []).map((x, i) =>
                                  i === idx ? { ...x, description: e.target.value } : x,
                                ),
                              },
                            }))
                          }
                          disabled={disabled}
                        />
                      </label>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          setSettings((s) => ({
                            ...s,
                            giving: {
                              ...(s.giving || {}),
                              types: (s.giving?.types || []).filter((_, i) => i !== idx),
                            },
                          }))
                        }
                        className="inline-flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 px-4 py-2 font-extrabold hover:bg-white/10 transition-colors disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 rounded-3xl border border-white/10 bg-background/40 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-extrabold text-white/80">Payment methods</p>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    setSettings((s) => ({
                      ...s,
                      giving: {
                        ...(s.giving || {}),
                        paymentMethods: [
                          ...((s.giving?.paymentMethods || []) ?? []),
                          { key: "", title: "New Method", lines: [] },
                        ],
                      },
                    }))
                  }
                  className="inline-flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 px-4 py-2 font-extrabold hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Add
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4">
                {(settings.giving?.paymentMethods || []).map((m, idx) => (
                  <div
                    key={`${m.key || m.title}-${idx}`}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5"
                  >
                    <label className="block">
                      <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                        Title
                      </span>
                      <input
                        className="mt-2 w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                        value={m.title || ""}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            giving: {
                              ...(s.giving || {}),
                              paymentMethods: (s.giving?.paymentMethods || []).map((x, i) =>
                                i === idx ? { ...x, title: e.target.value } : x,
                              ),
                            },
                          }))
                        }
                        disabled={disabled}
                      />
                    </label>
                    <label className="block mt-3">
                      <span className="text-xs font-black tracking-[0.25em] uppercase text-white/60">
                        Lines (one per line)
                      </span>
                      <textarea
                        className="mt-2 w-full min-h-28 rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60"
                        value={joinLines(m.lines || [])}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            giving: {
                              ...(s.giving || {}),
                              paymentMethods: (s.giving?.paymentMethods || []).map((x, i) =>
                                i === idx ? { ...x, lines: splitLines(e.target.value) } : x,
                              ),
                            },
                          }))
                        }
                        disabled={disabled}
                      />
                    </label>

                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          setSettings((s) => ({
                            ...s,
                            giving: {
                              ...(s.giving || {}),
                              paymentMethods: (s.giving?.paymentMethods || []).filter(
                                (_, i) => i !== idx,
                              ),
                            },
                          }))
                        }
                        className="inline-flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 px-4 py-2 font-extrabold hover:bg-white/10 transition-colors disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-3 items-center mt-2">
              <button
                type="submit"
                disabled={disabled}
                className={[
                  "inline-flex items-center justify-center rounded-2xl font-extrabold px-6 py-3 transition-colors",
                  disabled
                    ? "bg-white/5 border border-white/10 text-white/40 cursor-not-allowed"
                    : "bg-primary text-black hover:bg-accent",
                ].join(" ")}
              >
                {saving ? "Saving…" : "Save"}
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

