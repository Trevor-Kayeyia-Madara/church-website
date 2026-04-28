import SectionWrapper from "@/components/SectionWrapper";

export const metadata = {
  title: "Mission & Vision - Deliverance Church Utawala",
  description: "Our mission to equip mankind for the mission of God and our vision to be the apostolic church of choice.",
};

export default function MissionVisionPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
            About Us
          </p>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
            Mission & Vision
          </h1>
        </div>
      </section>

      <SectionWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 sm:p-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-black text-2xl font-black">
              🎯
            </div>
            <h2 className="mt-6 text-2xl sm:text-3xl font-black">Our Mission</h2>
            <p className="mt-4 text-white/75 text-lg leading-relaxed font-semibold italic">
              &ldquo;To Equip Mankind For The Mission Of God.&rdquo;
            </p>
            <p className="mt-4 text-white/60">
              We believe every believer is called to participate in God&apos;s great commission. 
              Our mission is to equip individuals with the tools, knowledge, and spiritual foundation 
              needed to fulfill their calling in ministry and daily life.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 sm:p-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent text-black text-2xl font-black">
              👁️
            </div>
            <h2 className="mt-6 text-2xl sm:text-3xl font-black">Our Vision</h2>
            <p className="mt-4 text-white/75 text-lg leading-relaxed font-semibold italic">
              &ldquo;The Apostolic Church Of Choice transforming &amp; empowering mankind in Africa and beyond.&rdquo;
            </p>
            <p className="mt-4 text-white/60">
              We envision a church that serves as a beacon of hope, transformation, and empowerment 
              across Africa and the nations. Through excellence in worship, teaching, and service, 
              we aim to be the church of choice for families seeking spiritual growth.
            </p>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper className="py-12 sm:py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-7 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-black text-center">Strategic Pillars</h2>
          
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Worship",
                desc: "Excellence in praise and worship that honors God",
              },
              {
                title: "Discipleship",
                desc: "Building spiritual maturity through biblical teaching",
              },
              {
                title: "Fellowship",
                desc: "Community that nurtures and supports",
              },
              {
                title: "Outreach",
                desc: "Reaching the lost and serving the community",
              },
            ].map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-2xl bg-background/40 border border-white/10 p-5"
              >
                <h3 className="font-black text-primary">{pillar.title}</h3>
                <p className="mt-2 text-white/60 text-sm">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}