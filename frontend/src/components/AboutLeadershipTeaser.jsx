"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import SectionWrapper from "@/components/SectionWrapper";

async function fetchPastors(limit) {
  const res = await fetch(`/api/pastors?limit=${encodeURIComponent(String(limit))}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load pastors");
  return res.json();
}

export default function AboutLeadershipTeaser() {
  const { data, isError } = useQuery({
    queryKey: ["pastors", "about-teaser"],
    queryFn: () => fetchPastors(1),
  });

  const hasPastors = !isError && Array.isArray(data?.items) && data.items.length > 0;
  if (!hasPastors) return null;

  return (
    <SectionWrapper className="py-12 sm:py-16">
      <div className="text-center">
        <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
          Meet Our Team
        </p>
        <h2 className="mt-3 text-3xl sm:text-4xl font-black">Leadership</h2>
        <p className="mt-3 text-white/75 max-w-xl mx-auto">
          Our pastoral team is committed to guiding you in your faith journey.
        </p>
        <Link
          href="/about/leadership"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary text-black font-extrabold px-6 py-3 hover:bg-accent transition-colors"
        >
          View Full Leadership
        </Link>
      </div>
    </SectionWrapper>
  );
}

