"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

const defaultMappings = [
  { label: "Homepage", path: "/" },
  { label: "Sermons", path: "/sermons" },
  { label: "Sermon Detail", path: "/sermons/growing-strong-in-faith-2026-03-23" },
  { label: "Contact", path: "/contact" },
];

export default function DesignCompareClient({ assets }) {
  const [screenIndex, setScreenIndex] = useState(0);
  const [pagePath, setPagePath] = useState(defaultMappings[0].path);

  const screen = useMemo(() => assets?.[screenIndex] || null, [assets, screenIndex]);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
            Compare
          </p>
          <p className="mt-1 text-white/70 text-sm font-bold">
            Left: extracted screen • Right: live page
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="text-xs font-bold text-white/60">
            <span className="block mb-2">Screen</span>
            <select
              value={String(screenIndex)}
              onChange={(e) => setScreenIndex(Number(e.target.value))}
              className="w-full sm:w-[220px] rounded-xl border border-white/10 bg-background/60 px-3 py-2.5 text-sm font-bold outline-none"
            >
              {assets.map((a, i) => (
                <option key={a.publicSrc} value={String(i)}>
                  Screen {i + 1} ({a.width}×{a.height})
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-white/60">
            <span className="block mb-2">Page</span>
            <select
              value={pagePath}
              onChange={(e) => setPagePath(e.target.value)}
              className="w-full sm:w-[240px] rounded-xl border border-white/10 bg-background/60 px-3 py-2.5 text-sm font-bold outline-none"
            >
              {defaultMappings.map((m) => (
                <option key={m.path} value={m.path}>
                  {m.label} ({m.path})
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="border-b lg:border-b-0 lg:border-r border-white/10 bg-background/40">
          {screen ? (
            <Image
              src={screen.publicSrc}
              alt="Design screen"
              width={screen.width || 1488}
              height={screen.height || 4000}
              sizes="100vw"
              className="w-full h-auto"
            />
          ) : null}
        </div>
        <div className="bg-background/20">
          <iframe
            title="Live page"
            src={pagePath}
            className="w-full h-[80vh]"
          />
        </div>
      </div>
    </div>
  );
}
