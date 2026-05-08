import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.dcutawala.org";

export async function GET(request) {
  // Forward cookies to backend for session validation
  const cookieHeader = request.headers.get("Cookie") || "";

  const res = await fetch(`${BACKEND_URL}/api/admin/auth/me`, {
    headers: {
      Cookie: cookieHeader,
    },
    credentials: "include",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
