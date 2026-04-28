import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import SectionWrapper from "@/components/SectionWrapper";
import Link from "next/link";

function readManifest() {
  const p = path.join(process.cwd(), "design", "manifest.json");
  const raw = fs.readFileSync(p, "utf-8");
  return JSON.parse(raw);
}

export const metadata = {
  title: "Design Reference",
};

export default function DesignPage() {
  if (process.env.NEXT_PUBLIC_SHOW_DESIGN_REF !== "true") notFound();

  const manifest = readManifest();
  const labels = ["Homepage", "Sermons", "Contact", "Other"];
  const assets = (manifest?.assets || []).map((a, i) => ({
    ...a,
    label: labels[i] || `Screen ${i + 1}`,
    publicSrc: `/design/reference/img_${String(i).padStart(3, "0")}.jpg`,
  }));

  return (
    <div>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-background to-background" />
        <SectionWrapper className="relative py-10 sm:py-14">
          <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
            Reference
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black leading-tight">
            PDF Screens (Extracted)
          </h1>
          <p className="mt-4 text-white/80 max-w-3xl">
            These images were extracted from{" "}
            <span className="font-extrabold">{manifest?.pdf}</span>. Use this
            page to visually compare spacing, colors, and layout while we tune
            the app UI.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-xl bg-primary text-black font-extrabold px-6 py-3 hover:bg-accent transition-colors"
              href="/"
            >
              Open Homepage
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-6 py-3 font-bold hover:bg-white/10 transition-colors"
              href="/sermons"
            >
              Open Sermons
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-6 py-3 font-bold hover:bg-white/10 transition-colors"
              href="/contact"
            >
              Open Contact
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-6 py-3 font-bold hover:bg-white/10 transition-colors"
              href="/design/compare"
            >
              Compare View
            </Link>
          </div>
        </SectionWrapper>
      </div>

      <SectionWrapper className="py-10 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {assets.map((a) => (
            <div
              key={a.file}
              className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden"
            >
              <div className="p-5 flex items-center justify-between gap-3">
                <div className="text-sm">
                  <p className="font-black">{a.label}</p>
                  <p className="text-white/60 font-bold">
                    {a.width}×{a.height}px
                  </p>
                </div>
                <a
                  href={a.publicSrc}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 font-bold hover:bg-white/10 transition-colors"
                >
                  Open Image
                </a>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.publicSrc}
                alt="Design screen"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
