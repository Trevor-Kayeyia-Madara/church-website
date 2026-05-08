import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function getAdminSession(request) {
  // Validate session by calling backend /api/admin/auth/me with cookies
  const cookieHeader = request.headers.get("Cookie") || "";
  
  const res = await fetch(`${BACKEND_URL}/api/admin/auth/me`, {
    headers: {
      Cookie: cookieHeader,
    },
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.user || null;
}

export async function checkAdminSession() {
  // Alternative for use in server components where no request is available
  // This is async since we'd need to get headers via next/headers
  return null;
}


