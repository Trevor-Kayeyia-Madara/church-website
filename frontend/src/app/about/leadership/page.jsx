import SectionWrapper from "@/components/SectionWrapper";
import LeadershipClient from "@/components/LeadershipClient";

export const metadata = {
  title: "Leadership - Deliverance Church Utawala",
  description: "Meet our pastoral team and leadership serving Deliverance Church Utawala.",
};

export default async function LeadershipPage() {
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

      <SectionWrapper className="py-12 sm:py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-7 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-black text-center">
            Church Boards & Committees
          </h2>
          <p className="mt-3 text-white/75 text-center max-w-xl mx-auto">
            Our church is governed by dedicated boards and committees ensuring 
            transparency and good stewardship.
          </p>
          
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: "Church Board",
                desc: "Overseeing church operations and strategic direction",
              },
              {
                title: "Finance Committee",
                desc: "Managing church finances with integrity",
              },
              {
                title: "Pastoral Council",
                desc: "Spiritual guidance and discipleship",
              },
              {
                title: "Youth & Children",
                desc: "Nurturing the next generation",
              },
            ].map((board) => (
              <div
                key={board.title}
                className="rounded-2xl bg-background/40 border border-white/10 p-5"
              >
                <h3 className="font-black">{board.title}</h3>
                <p className="mt-2 text-white/60 text-sm">{board.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
