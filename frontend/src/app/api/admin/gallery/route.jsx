import { NextResponse } from "next/server";

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

const GalleryImageSchema = z.object({
  title: z.string().max(200).optional().or(z.literal("")),
  imageUrl: z.string().url(),
  altText: z.string().max(200).optional().or(z.literal("")),
  caption: z.string().max(500).optional().or(z.literal("")),
  category: z.string().max(100).optional().or(z.literal("")),
  sortOrder: z.number().int().min(0).max(10_000).optional(),
  isPublished: z.boolean().optional(),
});

export async function GET() {
  const res = await fetchBackend("/api/admin/gallery");
  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json({ ok: true, items: data.items || [] });
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = GalleryImageSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  
  // Map frontend fields to backend (backend uses imageUrl, caption)
  const payload = {
    imageUrl: data.imageUrl,
    caption: data.caption || data.title || null,
    sortOrder: data.sortOrder ?? 0,
    isPublished: data.isPublished ?? true,
  };

  const res = await fetchBackend("/api/admin/gallery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  const responseData = await res.json();
  return NextResponse.json(responseData, { status: res.status });
}
