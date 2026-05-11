import SectionWrapper from "@/components/SectionWrapper";
import LeadershipClient from "@/components/LeadershipClient";

export const metadata = {
  title: "Leadership - Deliverance Church Utawala",
  description: "Meet our pastoral team and leadership serving Deliverance Church Utawala.",
};

export default function LeadershipPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
            About Us
          </p>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
            Leadership
          </h1>
          <p className="mt-6 text-white/75 text-lg leading-relaxed max-w-2xl">
            Meet our pastoral team committed to guiding you in your faith journey 
            and equipping you for the mission of God.
          </p>
        </div>
      </section>

      <SectionWrapper>
        <LeadershipClient limit={12} />
      </SectionWrapper>
    </div>
  );
}
