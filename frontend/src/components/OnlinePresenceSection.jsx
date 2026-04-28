"use client";

import { useSite } from "@/lib/siteContext";
import { Facebook, Instagram, Link2, Music2, Youtube } from "lucide-react";

const items = [
  { key: "youtube", label: "YouTube", Icon: Youtube },
  { key: "facebook", label: "Facebook", Icon: Facebook },
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "tiktok", label: "TikTok", Icon: Music2 },
  { key: "linktree", label: "Linktree", Icon: Link2 },
];

export default function OnlinePresenceSection() {
  const site = useSite();

  return (
    <div className="rounded-3xl bg-secondary/20 border border-secondary/30 p-7 sm:p-10 h-full">
      <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
        Online Presence
      </p>
      <h2 className="mt-3 text-3xl sm:text-4xl font-black leading-tight">
        Stay connected throughout the week.
      </h2>
      <p className="mt-4 text-white/80 leading-relaxed max-w-2xl">
        Sermons, announcements, and live streams — all in one place. Follow and stay connected
        throughout the week.
      </p>

      <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map(({ key, label, Icon }) => {
          const href = site?.social?.[key];
          if (!href) return null;
          const primary = key === "youtube";
          return (
            <a
              key={key}
              className={[
                "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-extrabold transition-colors",
                primary
                  ? "bg-primary text-black hover:bg-accent"
                  : "bg-white/5 border border-white/10 text-white/85 hover:bg-white/10",
              ].join(" ")}
              href={href}
              target="_blank"
              rel="noreferrer"
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </a>
          );
        })}
      </div>
    </div>
  );
}

