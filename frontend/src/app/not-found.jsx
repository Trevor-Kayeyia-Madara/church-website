import Link from "next/link";
import SectionWrapper from "@/components/SectionWrapper";

export default function NotFound() {
  return (
    <SectionWrapper className="py-20">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
        <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
          404
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-black">Page not found</h1>
        <p className="mt-3 text-white/75">
          The page you’re looking for doesn’t exist.
        </p>
        <div className="mt-7">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary text-black font-extrabold px-6 py-3 hover:bg-accent transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}

