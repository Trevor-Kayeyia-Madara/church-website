import { NextResponse } from "next/server";
import { z } from "zod";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.dcutawala.org";

function getAdminToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "");
  }
  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(/admin_token=([^;]+)/);
  return match ? match[1] : null;
}

async function fetchBackend(path: string, options: RequestInit = {}, request?: Request) {
  const token = getAdminToken(request!) || (options.headers as any)?.["Authorization"]?.replace("Bearer ", "");
  
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

function eventSlug({ title, startAt }) {
  const d = startAt instanceof Date ? startAt : new Date(startAt);
  const date = Number.isFinite(d.getTime()) ? d.toISOString().slice(0, 10) : "event";
  const base = slugify(title) || "event";
  return `${base}-${date}`;
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

const EventSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().max(4000).optional().or(z.literal("")),
  location: z.string().max(200).optional().or(z.literal("")),
  posterUrl: UrlOrPath,
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional().or(z.literal("")),
  isPublished: z.boolean().optional(),
});

export async function GET() {
  const res = await fetchBackend("/api/admin/events?limit=50");
  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json({ ok: true, items: data.items || [] });
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = EventSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const res = await fetchBackend("/api/admin/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
