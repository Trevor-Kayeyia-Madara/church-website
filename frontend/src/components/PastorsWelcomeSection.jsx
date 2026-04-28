"use client";

import { useQuery } from "@tanstack/react-query";
import PastorsWelcomeClient from "./PastorsWelcomeClient";

async function fetchPastors(limit) {
  const res = await fetch(`/api/pastors?limit=${encodeURIComponent(String(limit))}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load pastors");
  return res.json();
}

export default function PastorsWelcomeSection() {
  const { data } = useQuery({
    queryKey: ["pastors", "welcome", { limit: 1 }],
    queryFn: () => fetchPastors(1),
  });

  const leadPastor = Array.isArray(data?.items) ? data.items[0] : null;
  return <PastorsWelcomeClient pastor={leadPastor} />;
}
