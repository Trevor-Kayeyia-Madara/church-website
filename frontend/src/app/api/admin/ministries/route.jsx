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

const MinistrySchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(5000).optional().or(z.literal("")),
  highlights: z.array(z.string().min(1).max(80)).max(20).optional(),
  imageUrl: UrlOrPath,
  sortOrder: z.number().int().min(0).max(10_000).optional(),
  isPublished: z.boolean().optional(),
  slug: z.string().max(191).optional().or(z.literal("")),
});

export async function GET() {
  const res = await fetchBackend("/api/admin/ministries");
  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json({ ok: true, items: data.items || [] });
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = MinistrySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const res = await fetchBackend("/api/admin/ministries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
