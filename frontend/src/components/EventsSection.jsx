"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

async function fetchEvents(limit) {
  const res = await fetch(
    `/api/events?limit=${encodeURIComponent(String(limit))}&upcoming=true`,
    {
      cache: "no-store",
    },
  );
  if (!res.ok) throw new Error("Failed to load events");
  const json = await res.json();
  if (!json?.ok) throw new Error(json?.error || "Failed to load events");
  return json;
}

function formatEventMeta(date) {
  try {
    const day = new Intl.DateTimeFormat("en", {
      weekday: "short",
      timeZone: "Africa/Nairobi",
    }).format(date);
    const time = new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Africa/Nairobi",
    }).format(date);
    return `${day} \u2022 ${time}`;
  } catch {
    return date.toISOString();
  }
}

export default function EventsSection() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["events", { limit: 3 }],
    queryFn: () => fetchEvents(3),
    staleTime: 30_000,
    retry: 1,
  });

  const events = Array.isArray(data?.items) ? data.items : [];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-7 sm:p-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
            Events
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black">
            What&apos;s happening this week.
          </h2>
          <p className="mt-3 text-white/75 max-w-2xl">
            From worship nights to discipleship classes — there&apos;s a place for
            you.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-6 py-3 font-bold hover:bg-white/10 transition-colors"
        >
          Ask for Details
        </Link>
      </div>

      <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="rounded-3xl bg-background/60 border border-white/10 p-6 animate-pulse"
              >
                <div className="h-32 rounded-2xl border border-white/10 bg-white/5" />
                <div className="mt-5 h-3 w-20 rounded bg-white/10" />
                <div className="mt-4 h-5 w-3/4 rounded bg-white/10" />
                <div className="mt-3 h-4 w-1/2 rounded bg-white/10" />
              </div>
            ))
          : null}

        {!isLoading && !isError && events.length
          ? events.map((e) => (
              <div
                key={e.id || e.slug || e.title}
                className="rounded-3xl bg-background/60 border border-white/10 p-6"
              >
                {e.posterUrl ? (
                  <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-background/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={e.title}
                      src={e.posterUrl}
                      className="h-32 w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <p className="text-primary text-xs font-black tracking-[0.25em] uppercase">
                  Upcoming
                </p>
                <h3 className="mt-3 text-xl font-black">{e.title}</h3>
                <p className="mt-2 text-white/70 font-bold text-sm">
                  {formatEventMeta(new Date(e.startAt))}
                </p>
              </div>
            ))
          : null}

        {!isLoading && (isError || !events.length) ? (
          <div className="md:col-span-3 rounded-3xl bg-background/60 border border-white/10 p-6">
            <p className="text-white/70 font-bold">
              No upcoming events right now. Please check back soon.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
