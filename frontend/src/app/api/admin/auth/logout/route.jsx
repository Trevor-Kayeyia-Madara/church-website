import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.dcutawala.org";

export async function POST(request: Request) {
  // Get token from cookie
  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(/admin_token=([^;]+)/);
  const token = match ? match[1] : null;
  
  if (token) {
    await fetch(`${BACKEND_URL}/api/admin/auth/logout`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
    });
  }
  
  // Clear cookie
  const cookie = `admin_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  
  return NextResponse.json({ ok: true }, {
    headers: { "Set-Cookie": cookie },
  });
}
