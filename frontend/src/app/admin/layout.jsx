import { headers } from "next/headers";
import Link from "next/link";
import SectionWrapper from "@/components/SectionWrapper";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }) {
  // Check auth by calling the backend's /api/admin/auth/me endpoint
  // Forward the Cookie header from the incoming request so httpOnly cookie is sent
  const cookieHeader = (await headers()).get("cookie") || "";
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  
  const sessionRes = await fetch(`${backendUrl}/api/admin/auth/me`, {
    headers: {
      Cookie: cookieHeader,
    },
  });

  const session = await sessionRes.json();

  if (!session.ok || !session.user) {
    return (
      <SectionWrapper className="py-14 sm:py-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-7 sm:p-10">
          <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
            Admin
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black leading-tight">
            Authentication Required
          </h1>
          <p className="mt-4 text-white/80 max-w-3xl">
            You need to sign in to access the admin dashboard.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center rounded-xl bg-primary text-black font-extrabold px-7 py-3.5 hover:bg-accent transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </SectionWrapper>
    );
  }

  return <AdminShell email={session.user.email}>{children}</AdminShell>;
}
