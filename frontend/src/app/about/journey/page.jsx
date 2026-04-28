import SectionWrapper from "@/components/SectionWrapper";

export const metadata = {
  title: "Our Journey - Deliverance Church Utawala",
  description: "The story of how God has led Deliverance Church Utawala to where we are today.",
};

export default function JourneyPage() {
  const milestones = [
    {
      year: "Foundation",
      title: "A Humble Beginning",
      desc: "Deliverance Church Utawala was planted with a vision to reach the Utawala community and beyond with the transformative power of the gospel.",
    },
    {
      year: "Growth",
      title: "Building Community",
      desc: "The church grew from a small gathering to a vibrant community of believers, establishing key ministries to serve different demographics.",
    },
    {
      year: "Expansion",
      title: "Reaching More Souls",
      desc: "Launched outreach programs, community services, and the church school to impact the wider community and disciple the next generation.",
    },
    {
      year: "Present",
      title: "Transforming Nations",
      desc: "Today, we continue to equip believers for the mission of God, expanding our vision to transform and empower Africa and beyond.",
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
            About Us
          </p>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
            Our Journey
          </h1>
          <p className="mt-6 text-white/75 text-lg leading-relaxed max-w-2xl">
            The story of how God has led us to where we are — and where He&apos;s 
            taking us next.
          </p>
        </div>
      </section>

      <SectionWrapper>
        <div className="relative">
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary" />
          
          <div className="space-y-12">
            {milestones.map((m, i) => (
              <div
                key={m.year}
                className={`relative flex items-center ${
                  i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                }`}
              >
                <div className="absolute left-4 sm:left-1/2 w-4 h-4 rounded-full bg-primary -translate-x-1/2 ring-4 ring-background" />
                
                <div className={`pl-12 sm:pl-0 sm:w-1/2 ${
                  i % 2 === 0 ? "sm:pr-12 text-right" : "sm:pl-12"
                }`}>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
                    <p className="text-primary text-xs font-black tracking-[0.25em] uppercase">
                      {m.year}
                    </p>
                    <h3 className="mt-2 text-xl font-black">{m.title}</h3>
                    <p className="mt-3 text-white/70">{m.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper className="py-12 sm:py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-7 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-black text-center">
            Looking Forward
          </h2>
          <p className="mt-3 text-white/75 text-center max-w-xl mx-auto">
            We believe the best is yet to come. Join us as we continue 
            our journey of faith and transformation.
          </p>
          
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { number: "01", title: "Discipleship", desc: "Raising up mature believers" },
              { number: "02", title: "Expansion", desc: "Reaching new communities" },
              { number: "03", title: "Impact", desc: "Transforming nations for Christ" },
            ].map((item) => (
              <div
                key={item.number}
                className="rounded-2xl bg-background/40 border border-white/10 p-5 text-center"
              >
                <p className="text-primary text-3xl font-black">{item.number}</p>
                <h3 className="mt-2 font-black">{item.title}</h3>
                <p className="mt-1 text-white/60 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}