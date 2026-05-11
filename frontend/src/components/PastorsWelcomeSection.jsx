"use client";

import { useQuery } from "@tanstack/react-query";
import PastorsWelcomeClient from "./PastorsWelcomeClient";
import { apiUrl } from "@/lib/apiUrl";

async function fetchPastors(limit) {
  const res = await fetch(apiUrl(`/api/pastors?limit=${encodeURIComponent(String(limit))}`), {
    cache: "no-store",
  });
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : { ok: false, error: "Non-JSON response from API" };
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || `Failed to load pastors (${res.status})`);
  }
  return data;
}

export default function PastorsWelcomeSection() {
  const { data } = useQuery({
    queryKey: ["pastors", "welcome", { limit: 1 }],
    queryFn: () => fetchPastors(1),
    retry: 1,
  });

  const leadPastor = Array.isArray(data?.items) ? data.items[0] : null;
  return <PastorsWelcomeClient pastor={leadPastor} />;
}
