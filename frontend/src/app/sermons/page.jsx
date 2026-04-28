import SectionWrapper from "@/components/SectionWrapper";
import SermonsClient from "@/components/SermonsClient";
import FeaturedSermon from "@/components/FeaturedSermon";

export const metadata = {
  title: "Sermons | Deliverance Church Utawala",
};

export default function SermonsPage() {
  return (
    <div>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-background to-background" />
        <SectionWrapper className="relative py-14 sm:py-20">
          <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
            Watch & Learn
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-black leading-tight">
            Sermons that build faith.
          </h1>
          <p className="mt-4 text-white/80 max-w-2xl">
            Browse messages by category, and watch on-demand anytime.
          </p>
        </SectionWrapper>
      </div>

      <SectionWrapper className="py-10 sm:py-12">
        <div className="mb-8">
          <FeaturedSermon />
        </div>
        <SermonsClient />
      </SectionWrapper>
    </div>
  );
}
