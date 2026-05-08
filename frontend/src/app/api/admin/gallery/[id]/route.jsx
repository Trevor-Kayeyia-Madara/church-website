import { NextResponse } from "next/server";

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
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
  const awaitedParams = await params;
  const id = String(awaitedParams?.id || "");
  
  const res = await fetchBackend(`/api/admin/gallery/${id}`, { method: "DELETE" });
  const data = await res.json();
  
  return NextResponse.json(data, { status: res.status });
}
