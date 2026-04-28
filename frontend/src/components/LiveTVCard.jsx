"use client";

import { Tv } from "lucide-react";
import { useSite } from "@/lib/siteContext";

export default function LiveTVCard() {
  const site = useSite();
  const embedUrl = site.liveEmbedUrl || process.env.NEXT_PUBLIC_LIVE_EMBED_URL;
  return (
    <div className="rounded-3xl bg-darkAccent/25 border border-darkAccent/35 overflow-hidden">
      <div className="p-6 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
            Live TV
          </p>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 border border-primary/25 px-3 py-1 text-xs font-extrabold text-accent">
            <span className="size-2 rounded-full bg-primary" />
            Live
          </span>
        </div>
        <h3 className="mt-3 text-2xl font-black leading-tight">
          Watch the service online.
        </h3>
        <p className="mt-3 text-white/75">
          Join our live stream and share the link with friends and family.
        </p>
      </div>
      <div className="aspect-video bg-background/40 border-t border-darkAccent/30">
        {embedUrl ? (
          <iframe
            title="Live Stream"
            className="h-full w-full"
            src={embedUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center px-6">
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary text-black mx-auto">
                <Tv className="size-6" />
              </span>
              <p className="mt-3 font-extrabold">Live stream embed</p>
              <p className="mt-1 text-sm text-white/60">
                Set `NEXT_PUBLIC_LIVE_EMBED_URL` or update it in Admin â†’ Settings.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
