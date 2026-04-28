import Link from "next/link";
import SectionWrapper from "@/components/SectionWrapper";
import AboutLeadershipTeaser from "@/components/AboutLeadershipTeaser";

export const metadata = {
  title: "About Us - Deliverance Church Utawala",
  description: "Discover what makes our church family special and how you can grow in your faith journey with us.",
};

export default async function AboutPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
            About Us
          </p>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
            Rooted in Faith,<br />
            <span className="text-white/90">Building the Kingdom.</span>
          </h1>
          <p className="mt-6 text-white/75 text-lg leading-relaxed max-w-2xl">
            Discover what makes our church family special and how you can grow 
            in your faith journey with us.
          </p>
        </div>
      </section>

      <SectionWrapper>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Mission & Vision",
              desc: "Our purpose and the future we're building together.",
              href: "/about/mission-vision",
              icon: "🎯",
            },
            {
              title: "Leadership",
              desc: "Meet the team guiding our spiritual journey.",
              href: "/about/leadership",
              icon: "🧑‍⚖️",
            },
            {
              title: "Our Journey",
              desc: "The story of how God has led us to where we are.",
              href: "/about/journey",
              icon: "🛤️",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-3xl border border-white/10 bg-white/5 p-7 hover:bg-white/10 transition-colors"
            >
              <span className="text-4xl">{item.icon}</span>
              <h3 className="mt-4 text-xl font-black">{item.title}</h3>
              <p className="mt-2 text-white/70">{item.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-primary font-bold group-hover:gap-2 transition-all">
                Learn more →
              </span>
            </Link>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper className="py-12 sm:py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-7 sm:p-10">
          <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
            Our Values
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black">Values We Stand By</h2>
          
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { emoji: "❤️", title: "Love", desc: "Demonstrating Christ-like love to all" },
              { emoji: "🤝", title: "Fellowship", desc: "Building authentic relationships" },
              { emoji: "🧠", title: "Wisdom", desc: "Applying God's truth to life" },
              { emoji: "✨", title: "Holiness", desc: "Pursuing a life like Christ's" },
              { emoji: "🌟", title: "Excellence", desc: "Striving to honor God in all" },
            ].map((v) => (
              <div
                key={v.title}
                className="rounded-2xl bg-background/40 border border-white/10 p-5 text-center"
              >
                <span className="text-3xl">{v.emoji}</span>
                <h3 className="mt-3 font-black">{v.title}</h3>
                <p className="mt-1 text-white/60 text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      <AboutLeadershipTeaser />
    </div>
  );
}
