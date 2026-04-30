import { NextResponse } from "next/server";
import { z } from "zod";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.dcutawala.org";

function getAdminToken(request: Request): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "");
  }
  // Fallback to cookie
  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(/admin_token=([^;]+)/);
  return match ? match[1] : null;
}

async function fetchBackend(path: string, options: RequestInit = {}) {
  const token = getAdminToken(options.request as Request) || options.headers?.["Authorization"]?.replace("Bearer ", "");
  
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  return res;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sermonSlug({ title, date }) {
  const d = date instanceof Date ? date : new Date(date);
  const yyyyMmDd = Number.isFinite(d.getTime()) ? d.toISOString().slice(0, 10) : null;
  const base = slugify(title) || "sermon";
  return yyyyMmDd ? `${base}-${yyyyMmDd}` : base;
}

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

const UrlOrPath = z
  .string()
  .max(2048)
  .optional()
  .or(z.literal(""))
  .refine((v) => v === "" || v.startsWith("/") || isValidUrl(v), {
    message: "Invalid URL",
  });

const SermonSchema = z.object({
  title: z.string().min(2).max(255),
  description: z.string().max(5000).optional().or(z.literal("")),
  speaker: z.string().max(255).optional().or(z.literal("")),
  date: z.string().datetime(),
  durationMinutes: z.number().int().min(1).max(24 * 60).optional(),
  thumbnailUrl: UrlOrPath,
  videoUrl: z.string().url().max(2048).optional().or(z.literal("")),
  categorySlug: z.string().max(191).optional().or(z.literal("")),
  categoryName: z.string().max(255).optional().or(z.literal("")),
  slug: z.string().max(191).optional().or(z.literal("")),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.toString();
  const path = `/api/admin/sermons${query ? `?${query}` : ""}`;

  const res = await fetchBackend(path, { request, method: "GET" });
  const data = await res.json();
  
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }
  
  // Transform backend response to match frontend expectations
  const items = (data.items || []).map((s: any) => ({
    ...s,
    category: s.category ? { id: s.category.id, name: s.category.name, slug: s.category.slug } : null,
  }));
  
  return NextResponse.json({ ok: true, items, categories: data.categories || [] });
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = SermonSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const res = await fetchBackend("/api/admin/sermons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  
  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }
  
  return NextResponse.json(data);
}
