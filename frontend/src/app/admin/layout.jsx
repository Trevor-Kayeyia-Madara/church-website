import { redirect } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import SectionWrapper from "@/components/SectionWrapper";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

async function getSession() {
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/admin_token=([^;]+)/);
  
  if (!tokenMatch) return null;
  
  const token = tokenMatch[1];
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.dcutawala.org";
  
  try {
    const res = await fetch(`${baseUrl}/api/admin/auth/me`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      // Don't cache
      cache: "no-store",
    });
    
    if (!res.ok) return null;
    const data = await res.json();
    return data.authenticated ? { email: "admin@dcutawala.org" } : null;
  } catch {
    return null;
  }
}

export default async function AdminLayout({ 
  children 
}) {
  const session = await getSession();
  
  if (!session) {
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

  return <AdminShell email={session.email}>{children}</AdminShell>;
}
