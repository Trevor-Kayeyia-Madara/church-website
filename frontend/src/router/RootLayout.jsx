import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/app/providers.jsx";
import { SITE as DEFAULT_SITE } from "@/lib/siteConfig";
import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/apiUrl";

export default function RootLayout() {
  const [site, setSite] = useState(DEFAULT_SITE);

  useEffect(() => {
    let cancelled = false;
    fetch(apiUrl("/api/site"))
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.site) {
          setSite((current) => ({
            ...DEFAULT_SITE,
            ...current,
            ...data.site,
            contact: {
              ...(DEFAULT_SITE.contact || {}),
              ...(current.contact || {}),
              ...(data.site.contact || {}),
            },
            social: {
              ...(DEFAULT_SITE.social || {}),
              ...(current.social || {}),
              ...(data.site.social || {}),
            },
            giving: {
              ...(DEFAULT_SITE.giving || {}),
              ...(current.giving || {}),
              ...(data.site.giving || {}),
            },
            school: {
              ...(DEFAULT_SITE.school || {}),
              ...(current.school || {}),
              ...(data.site.school || {}),
            },
          }));
        }
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
