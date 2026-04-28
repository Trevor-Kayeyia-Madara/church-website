"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

async function fetchPastors(limit) {
  const res = await fetch(`/api/pastors?limit=${encodeURIComponent(String(limit))}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load pastors");
  return res.json();
}

export default function LeadershipClient({ limit = 12 }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["pastors", "leadership", { limit }],
    queryFn: () => fetchPastors(limit),
  });

  const items = Array.isArray(data?.items) ? data.items : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: Math.min(limit, 12) }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden animate-pulse h-[360px]"
          />
        ))}
      </div>
    );
  }

  if (isError || !items.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-7 sm:p-10 text-center">
        <p className="text-white/60">
          Leadership information coming soon. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((pastor) => (
        <div
          key={pastor.slug}
          className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden"
        >
          <div className="aspect-[4/5] relative bg-white/5">
            {pastor.photoUrl ? (
              <Image
                src={pastor.photoUrl}
                alt={pastor.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/30 font-black text-4xl">
                {pastor.name?.charAt(0) || "P"}
              </div>
            )}
          </div>
          <div className="p-5">
            <p className="text-primary text-xs font-black tracking-[0.25em] uppercase">
              {pastor.roleTitle || "Pastor"}
            </p>
            <h3 className="mt-2 text-lg font-black">{pastor.name}</h3>
            {pastor.bio ? (
              <p className="mt-3 text-white/70 text-sm leading-relaxed line-clamp-3">
                {pastor.bio}
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

