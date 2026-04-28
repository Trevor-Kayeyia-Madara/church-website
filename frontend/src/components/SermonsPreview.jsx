"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import SermonCard from "./SermonCard";

async function fetchSermons() {
  const res = await fetch("/api/sermons?limit=3&source=youtube", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load sermons");
  return res.json();
}

export default function SermonsPreview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["sermons", "preview"],
    queryFn: fetchSermons,
  });

  const items = Array.isArray(data?.items) ? data.items : [];

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
            Featured Sermons
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black">
            Catch up on the latest.
          </h2>
          <p className="mt-3 text-white/75 max-w-2xl">
            Watch recent messages and share with someone who needs encouragement.
          </p>
        </div>
        <Link
          href="/sermons"
          className="hidden sm:inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 font-bold hover:bg-white/10 transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-5">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-white/10 bg-white/5 h-[320px] animate-pulse"
            />
          ))
        ) : isError ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/80">
            Unable to load sermons right now.
          </div>
        ) : !items.length ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/80 md:col-span-3">
            No sermons available yet.
          </div>
        ) : (
          items.map((s) => <SermonCard key={s.id} sermon={s} />)
        )}
      </div>

      <div className="mt-7 sm:hidden">
        <Link
          href="/sermons"
          className="inline-flex w-full items-center justify-center rounded-xl bg-white/5 border border-white/10 px-5 py-3 font-bold hover:bg-white/10 transition-colors"
        >
          View All Sermons
        </Link>
      </div>
    </div>
  );
}
