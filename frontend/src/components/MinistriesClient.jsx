"use client";

import { useQuery } from "@tanstack/react-query";
import MinistryCard from "@/components/MinistryCard";

async function fetchMinistries() {
  const res = await fetch("/api/ministries", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load ministries");
  return res.json();
}

export default function MinistriesClient() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["ministries"],
    queryFn: fetchMinistries,
  });

  const items = Array.isArray(data?.items) ? data.items : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-3xl bg-secondary/15 border border-secondary/25 p-6 sm:p-7 animate-pulse h-[220px]"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white/80">
        Unable to load ministries right now.
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white/80">
        No ministries available yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {items.map((m) => (
        <MinistryCard key={m.slug} ministry={m} />
      ))}
    </div>
  );
}

