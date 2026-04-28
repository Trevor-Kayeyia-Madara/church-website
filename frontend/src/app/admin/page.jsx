import Link from "next/link";

export const metadata = {
  title: "Admin | Deliverance Church Utawala",
};

export default function AdminHomePage() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
      <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
        Admin
      </p>
      <h1 className="mt-3 text-3xl sm:text-4xl font-black">Dashboard</h1>
      <p className="mt-3 text-white/75 max-w-3xl">
        Manage homepage content and website settings.
      </p>

      <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { href: "/admin/sermons", title: "Sermons", desc: "Edit sermon listings" },
          { href: "/admin/events", title: "Events", desc: "Homepage events" },
          { href: "/admin/pastors", title: "Pastors", desc: "Leadership cards" },
          { href: "/admin/gallery", title: "Gallery", desc: "Photos & captions" },
          { href: "/admin/ministries", title: "Ministries", desc: "Public ministry listings" },
          { href: "/admin/messages", title: "Messages", desc: "Contact form inbox" },
          { href: "/admin/settings", title: "Settings", desc: "Contact + social + live" },
          { href: "/admin/youtube", title: "YouTube Sync", desc: "Import sermons" },
        ].map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-3xl bg-background/40 border border-white/10 p-6 hover:bg-background/60 transition-colors"
          >
            <p className="text-primary text-xs font-black tracking-[0.25em] uppercase">
              Admin
            </p>
            <h2 className="mt-3 text-xl font-black">{c.title}</h2>
            <p className="mt-2 text-white/70 font-bold text-sm">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
