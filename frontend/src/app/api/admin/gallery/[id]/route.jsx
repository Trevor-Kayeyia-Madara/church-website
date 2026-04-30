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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = getAdminToken(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const awaitedParams = await params;
  const id = String(awaitedParams?.id || "");
  
  const json = await request.json().catch(() => null);
  
  // Map frontend fields to backend
  const payload = {
    imageUrl: json.imageUrl,
    caption: json.caption || json.title || null,
    sortOrder: json.sortOrder ?? 0,
    isPublished: json.isPublished ?? true,
  };

  const res = await fetchBackend(`/api/admin/gallery/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = getAdminToken(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const awaitedParams = await params;
  const id = String(awaitedParams?.id || "");
  
  const res = await fetchBackend(`/api/admin/gallery/${id}`, { method: "DELETE" });
  const data = await res.json();
  
  return NextResponse.json(data, { status: res.status });
}
