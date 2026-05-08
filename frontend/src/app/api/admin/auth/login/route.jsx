import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.dcutawala.org";

export async function POST(request) {
  const json = await request.json().catch(() => null);

  const res = await fetch(`${BACKEND_URL}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
    // Important: forward cookies from backend response
    credentials: "include",
  });

  const data = await res.json();

  // Forward whatever the backend returns (it sets httpOnly cookie)
  const response = NextResponse.json(data, { status: res.status });

  // Forward the Set-Cookie header from backend
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    response.headers.set("Set-Cookie", setCookie);
  }

  return response;
}
