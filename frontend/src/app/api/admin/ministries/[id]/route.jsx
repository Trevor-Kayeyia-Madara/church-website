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
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const awaitedParams = await params;
  const id = String(awaitedParams?.id || "");
  
  const res = await fetchBackend(`/api/admin/ministries/${id}`, { method: "GET" });
  const data = await res.json();
  
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const awaitedParams = await params;
  const id = String(awaitedParams?.id || "");
  
  const json = await request.json().catch(() => null);
  
  const res = await fetchBackend(`/api/admin/ministries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
  });
  
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const awaitedParams = await params;
  const id = String(awaitedParams?.id || "");
  
  const res = await fetchBackend(`/api/admin/ministries/${id}`, { method: "DELETE" });
  const data = await res.json();
  
  return NextResponse.json(data, { status: res.status });
}
