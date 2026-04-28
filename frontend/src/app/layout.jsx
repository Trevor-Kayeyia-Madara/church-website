import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "./providers";
import { getSiteSettings } from "@/lib/siteSettings.server";

export async function generateMetadata() {
  const site = await getSiteSettings();
  const title = site?.name || "Deliverance Church Utawala";
  const description = site?.tagline || "Worship. Word. Community. Service.";

  const base =
    process.env.NEXT_PUBLIC_SITE_URL && /^https?:\/\//.test(process.env.NEXT_PUBLIC_SITE_URL)
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
      : null;

  const logo = site?.logoUrl || "/logo.png";

  return {
    ...(base ? { metadataBase: base } : {}),
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    keywords: [
      "Deliverance Church Utawala",
      "Church in Utawala",
      "Christian Church Nairobi",
      "Sermons",
      "Giving",
      "Dominion Center Kids School",
    ],
    alternates: base ? { canonical: "/" } : undefined,
    openGraph: {
      type: "website",
      title,
      description,
      siteName: title,
      images: [{ url: logo, width: 512, height: 512, alt: `${title} logo` }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [logo],
    },
    icons: {
      icon: [
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: logo },
      ],
      apple: [{ url: "/apple-touch-icon.png" }],
    },
  };
}

export default async function RootLayout({ children }) {
  const site = await getSiteSettings();
  return (
    <html lang="en">
      <body>
        <Providers site={site}>
          <div className="min-h-dvh flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
