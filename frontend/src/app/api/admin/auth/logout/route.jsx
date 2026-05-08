import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.dcutawala.org";

export async function POST(request) {
  // Forward the request to backend with cookies included
  const cookieHeader = request.headers.get("Cookie") || "";

  const res = await fetch(`${BACKEND_URL}/api/admin/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    credentials: "include",
  });

  const data = await res.json();

  // Clear cookie by forwarding backend's Set-Cookie or setting our own
  const response = NextResponse.json(data, { status: res.status });

  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    response.headers.set("Set-Cookie", setCookie);
  } else {
    response.headers.set(
      "Set-Cookie",
      "admin_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
    );
  }

  return response;
}
