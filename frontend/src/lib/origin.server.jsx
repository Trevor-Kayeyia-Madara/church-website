import { headers } from "next/headers";

function trimTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

export function getRequestOrigin() {
  const configured = trimTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL);
  if (configured) return configured;

  try {
    const h = headers();
    const proto = h.get("x-forwarded-proto") || "http";
    const host = h.get("x-forwarded-host") || h.get("host");
    if (host) return `${proto}://${host}`;
  } catch {
    // No request context (e.g. build-time).
  }

  return "http://localhost:3000";
}

