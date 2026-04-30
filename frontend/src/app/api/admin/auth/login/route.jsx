import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.dcutawala.org";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  
  const res = await fetch(`${BACKEND_URL}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
  });
  
  const data = await res.json();
  
  if (res.ok && data.ok && data.token) {
    // Set cookie for subsequent requests (24h expiry)
    const cookie = `admin_token=${data.token}; Path=/; HttpOnly; Max-Age=86400`;
    return NextResponse.json(data, {
      status: res.status,
      headers: { "Set-Cookie": cookie },
    });
  }
  
  return NextResponse.json(data, { status: res.status });
}
