import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.dcutawala.org";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(/admin_token=([^;]+)/);
  const token = match ? match[1] : null;
  
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(`${BACKEND_URL}/api/admin/auth/me`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
