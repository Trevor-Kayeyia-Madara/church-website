import { NextResponse } from "next/server";
import { z } from "zod";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.dcutawala.org";

async function fetchBackend(path: string, options: RequestInit = {}, request?: Request) {
  const cookieHeader = request?.headers.get("Cookie") || "";
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
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
  .max(500)
  .optional()
  .or(z.literal(""))
  .refine((v) => v === "" || v.startsWith("/") || isValidUrl(v), {
    message: "Invalid URL",
  });

const PastorSchema = z.object({
  name: z.string().min(2).max(120),
  roleTitle: z.string().max(120).optional().or(z.literal("")),
  bio: z.string().max(5000).optional().or(z.literal("")),
  photoUrl: UrlOrPath,
  sortOrder: z.number().int().min(0).max(10000).optional(),
  isPublished: z.boolean().optional(),
});

export async function GET() {
  const res = await fetchBackend("/api/admin/pastors");
  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json({ ok: true, items: data.items || [] });
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = PastorSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const res = await fetchBackend("/api/admin/pastors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}