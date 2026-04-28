import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/app/providers.jsx";
import { SITE as DEFAULT_SITE } from "@/lib/siteConfig";
import { useEffect, useState } from "react";

export default function RootLayout() {
  const [site, setSite] = useState(DEFAULT_SITE);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/site")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.site) setSite(data.site);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Providers site={site}>
      <div className="min-h-dvh flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </Providers>
  );
}
