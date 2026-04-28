import Link from "next/link";
import SectionWrapper from "@/components/SectionWrapper";
import MinistriesClient from "@/components/MinistriesClient";

export const metadata = {
  title: "Ministries | Deliverance Church Utawala",
};

export default function MinistriesPage() {
  return (
    <div>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-background to-background" />
        <SectionWrapper className="relative py-14 sm:py-20">
          <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
            Ministries
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-black leading-tight">
            Find where you belong.
          </h1>
          <p className="mt-4 text-white/80 max-w-2xl">
            There’s a place for every age and season — serve, grow, and build
            community.
          </p>
          <div className="mt-7">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-primary text-black font-extrabold px-7 py-3.5 hover:bg-accent transition-colors"
            >
              Join a Ministry
            </Link>
          </div>
        </SectionWrapper>
      </div>

      <SectionWrapper className="py-10 sm:py-12">
        <MinistriesClient />
      </SectionWrapper>

      <SectionWrapper className="py-10 sm:py-12">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-7 sm:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
              Next Step
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-black">
              Want to serve this month?
            </h2>
            <p className="mt-3 text-white/75 max-w-2xl">
              Send us a message and we’ll connect you with a leader to get
              started.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl bg-primary text-black font-extrabold px-7 py-3.5 hover:bg-accent transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
