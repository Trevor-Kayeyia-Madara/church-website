import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import SectionWrapper from "@/components/SectionWrapper";
import DesignCompareClient from "@/components/DesignCompareClient";

function readManifest() {
  const p = path.join(process.cwd(), "design", "manifest.json");
  const raw = fs.readFileSync(p, "utf-8");
  return JSON.parse(raw);
}

export const metadata = {
  title: "Design Compare",
};

export default function DesignComparePage() {
  if (process.env.NEXT_PUBLIC_SHOW_DESIGN_REF !== "true") notFound();

  const manifest = readManifest();
  const assets = (manifest?.assets || []).map((a, i) => ({
    ...a,
    publicSrc: `/design/reference/img_${String(i).padStart(3, "0")}.jpg`,
  }));

  return (
    <div>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-darkAccent/60 via-background to-background" />
        <SectionWrapper className="relative py-10 sm:py-14">
          <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
            Reference
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black leading-tight">
            Screen Compare
          </h1>
          <p className="mt-4 text-white/80 max-w-3xl">
            Use this view to match the live pages to the extracted PDF screens.
          </p>
        </SectionWrapper>
      </div>

      <SectionWrapper className="py-10 sm:py-12">
        <DesignCompareClient assets={assets} />
      </SectionWrapper>
    </div>
  );
}

