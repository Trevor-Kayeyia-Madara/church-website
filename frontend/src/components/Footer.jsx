"use client";

import Image from "next/image";
import { Mail, MapPin, Phone, Youtube, Facebook, Instagram, Music2, Link2 } from "lucide-react";
import { useSite } from "@/lib/siteContext";
import AppLink from "@/components/AppLink";

const socialItems = [
  { key: "youtube", label: "YouTube", Icon: Youtube },
  { key: "facebook", label: "Facebook", Icon: Facebook },
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "tiktok", label: "TikTok", Icon: Music2 },
  { key: "linktree", label: "Linktree", Icon: Link2 },
];

export default function Footer() {
  const site = useSite();
  const siteName = site?.name || "Deliverance Church Utawala";
  const logoUrl = site?.logoUrl || "/logo.png";

  return (
    <footer className="border-t border-white/10 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <AppLink href="/" className="flex items-center gap-3 font-black tracking-tight">
              <span className="relative size-10 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <Image
                  src={logoUrl}
                  alt={`${siteName} logo`}
                  fill
                  sizes="40px"
                  className="object-contain p-1"
                />
              </span>
              <span className="leading-tight">
                <span className="block">{siteName.split(" Utawala")[0] || "Deliverance Church"}</span>
                <span className="block text-accent">{siteName.includes("Utawala") ? "Utawala" : site.shortName}</span>
              </span>
            </AppLink>
            <p className="mt-4 text-white/70 max-w-md leading-relaxed">
              {site?.tagline || "The Church of Choice"}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {socialItems.map(({ key, label, Icon }) => {
                const href = site?.social?.[key];
                if (!href) return null;
                return (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-extrabold text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Icon className="size-4 text-accent" aria-hidden="true" />
                    <span className="text-sm">{label}</span>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2">
            <p className="text-xs font-black tracking-[0.25em] uppercase text-accent/80">
              Quick Links
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <AppLink className="text-white/75 hover:text-white" href="/">
                Home
              </AppLink>
              <AppLink className="text-white/75 hover:text-white" href="/about">
                About Us
              </AppLink>
              <AppLink className="text-white/75 hover:text-white" href="/sermons">
                Sermons
              </AppLink>
              <AppLink className="text-white/75 hover:text-white" href="/about/leadership">
                Leadership
              </AppLink>
              <AppLink className="text-white/75 hover:text-white" href="/ministries">
                Departments
              </AppLink>
              <AppLink className="text-white/75 hover:text-white" href="/school">
                Dominion Center
              </AppLink>
              <AppLink className="text-white/75 hover:text-white" href="/contact#give">
                Giving
              </AppLink>
            </div>
          </div>

          <div className="lg:col-span-3">
            <p className="text-xs font-black tracking-[0.25em] uppercase text-accent/80">
              Service Times
            </p>
            <div className="mt-4 space-y-3 text-sm">
              {(site?.serviceTimes || []).map((t, idx) => (
                <div key={`${t.day}-${t.label}-${idx}`}>
                  <p className="font-extrabold text-white/85">
                    {t.day} {t.label}
                  </p>
                  <p className="text-white/70 font-bold">{t.time}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <p className="text-xs font-black tracking-[0.25em] uppercase text-accent/80">
              Contact Info
            </p>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-4 text-accent" aria-hidden="true" />
                <div>
                  <p className="font-extrabold text-white/85">Address</p>
                  <p className="text-white/70 font-bold">
                    {site?.contact?.addressLine2 || ""}
                    {site?.contact?.addressLine2 ? <br /> : null}
                    {site?.contact?.addressLine1 || site?.location}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Phone className="mt-0.5 size-4 text-accent" aria-hidden="true" />
                <div>
                  <p className="font-extrabold text-white/85">Phone</p>
                  <a
                    className="text-white/70 font-bold hover:text-white"
                    href={`tel:${site?.contact?.phoneTel || ""}`}
                  >
                    {site?.contact?.phoneDisplay || ""}
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <Mail className="mt-0.5 size-4 text-accent" aria-hidden="true" />
                <div>
                  <p className="font-extrabold text-white/85">Email</p>
                  <a
                    className="text-white/70 font-bold hover:text-white"
                    href={`mailto:${site?.contact?.email || ""}`}
                  >
                    {site?.contact?.email || ""}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-xs text-white/50 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <p className="text-white/40">Built with Next.js</p>
        </div>
      </div>
    </footer>
  );
}
