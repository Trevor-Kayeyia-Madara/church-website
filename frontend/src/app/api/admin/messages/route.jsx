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
export async function GET() {
  const res = await fetchBackend("/api/admin/messages");
  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json({ ok: true, items: data.items || [] });
}

// POST for messages (contact submissions from frontend) - optional admin create
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  
  const res = await fetchBackend("/api/contact", {  // Public contact endpoint
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
  });
  
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
