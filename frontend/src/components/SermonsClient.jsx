"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import SermonCard from "./SermonCard";

async function fetchSermons({ page, category, q }) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", "9");
  if (category) params.set("category", category);
  if (q) params.set("q", q);

  const res = await fetch(`/api/sermons?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to load sermons");
  return res.json();
}

export default function SermonsClient() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");

  const queryKey = useMemo(
    () => ["sermons", { page, category, q }],
    [page, category, q],
  );

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey,
    queryFn: () => fetchSermons({ page, category, q }),
  });

  const categories = data?.categories || [];
  const total = data?.total || 0;
  const limit = data?.limit || 9;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const items = Array.isArray(data?.items) ? data.items : [];

  const sourcesLabel = useMemo(() => {
    const sources = Array.isArray(data?.sources) ? data.sources : [];
    if (!sources.length) return null;
    const labels = sources.map((s) => {
      if (s === "db") return "Database";
      if (s === "youtube") return "YouTube";
      if (s === "mock") return "Mock";
      return s;
    });
    return labels.join(" + ");
  }, [data?.sources]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-white/80 text-sm font-black tracking-wide">Filters</p>

          <div className="mt-4">
            <label className="text-xs font-bold text-white/60">Search</label>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-background/60 px-4 py-3">
              <Search className="size-4 text-white/50" />
              <input
                value={q}
                onChange={(event) => {
                  setPage(1);
                  setQ(event.target.value);
                }}
                placeholder="Title or speaker..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-white/40"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="text-xs font-bold text-white/60">Category</label>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setPage(1);
                  setCategory("");
                }}
                className={[
                  "px-3 py-2 rounded-xl text-sm font-extrabold border transition-colors",
                  !category
                    ? "bg-primary text-black border-primary"
                    : "bg-white/5 border-white/10 text-white/75 hover:bg-white/10",
                ].join(" ")}
              >
                All
              </button>
              {categories.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setCategory(item.slug);
                  }}
                  className={[
                    "px-3 py-2 rounded-xl text-sm font-extrabold border transition-colors",
                    category === item.slug
                      ? "bg-primary text-black border-primary"
                      : "bg-white/5 border-white/10 text-white/75 hover:bg-white/10",
                  ].join(" ")}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-xs text-white/50">
            {isFetching ? "Updating..." : `${total} sermon${total === 1 ? "" : "s"} found`}
            {sourcesLabel ? (
              <span className="block mt-1">Sources: {sourcesLabel}</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="lg:col-span-9">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, index) => (
              <div
                key={index}
                className="h-[320px] rounded-3xl border border-white/10 bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white/80">
            Unable to load sermons right now.
          </div>
        ) : items.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {items.map((sermon) => (
              <SermonCard key={sermon.id} sermon={sermon} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white/80">
            No sermons match your filters.
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-extrabold transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            Previous
          </button>
          <div className="text-sm text-white/60 font-bold">
            Page {page} of {totalPages}
          </div>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() =>
              setPage((currentPage) => Math.min(totalPages, currentPage + 1))
            }
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-extrabold transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
