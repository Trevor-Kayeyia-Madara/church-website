"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/sermons", label: "Sermons" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/pastors", label: "Pastors" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/ministries", label: "Ministries" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/youtube", label: "YouTube Sync" },
];

export default function AdminShell({ email, children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-[calc(100dvh-4rem)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
                Admin
              </p>
              <p className="mt-2 text-sm text-white/70 font-bold break-words">
                {email}
              </p>

              <nav className="mt-5 flex flex-col gap-2">
                {nav.map((n) => {
                  const active = pathname === n.href;
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      className={[
                        "rounded-2xl px-4 py-3 font-extrabold transition-colors",
                        active
                          ? "bg-white/10 text-white"
                          : "text-white/70 hover:text-white hover:bg-white/5",
                      ].join(" ")}
                    >
                      {n.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-5 pt-5 border-t border-white/10">
                <Link
                  href="/api/auth/signout?callbackUrl=/"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-primary text-black font-extrabold px-4 py-3 hover:bg-accent transition-colors"
                >
                  Sign Out
                </Link>
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
