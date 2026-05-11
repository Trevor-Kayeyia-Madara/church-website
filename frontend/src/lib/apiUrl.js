function trimTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function isAbsoluteUrl(value) {
  return /^(https?:)?\/\//i.test(String(value || ""));
}

/**
 * Build an absolute URL to the backend API when `VITE_API_BASE_URL` is set.
 * Falls back to relative URLs (useful for local dev with Vite proxy).
 */
export function apiUrl(pathname) {
  let base = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL);
  if (!base && typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
    if (!isLocal) {
      const rootHost = hostname.startsWith("www.") ? hostname.slice(4) : hostname;
      if (rootHost.startsWith("api.")) {
        base = `${protocol}//${rootHost}`;
      } else {
        base = `${protocol}//api.${rootHost}`;
      }
    }
  }
  const path = String(pathname || "");
  if (!base) return path;
  if (!path.startsWith("/")) return `${base}/${path}`;
  return `${base}${path}`;
}

/**
 * Resolve backend-served media (e.g. `/uploads/...`) to the configured API host.
 * - If `VITE_API_BASE_URL` is set, `/uploads/...` becomes `${VITE_API_BASE_URL}/uploads/...`.
 * - Otherwise, returns the input unchanged (works when frontend+backend share the same origin,
 *   or when Vite dev server proxies `/uploads` to the backend).
 */
export function backendAssetUrl(value) {
  const raw = String(value || "");
  if (!raw) return raw;
  if (isAbsoluteUrl(raw) || raw.startsWith("data:") || raw.startsWith("blob:")) return raw;
  const normalized = raw.startsWith("uploads/") ? `/${raw}` : raw;
  if (!normalized.startsWith("/uploads/")) return raw;

  const base = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL);
  if (!base) return normalized;
  return `${base}${normalized}`;
}
