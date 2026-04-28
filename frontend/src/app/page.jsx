import HeroSection from "@/components/HeroSection";
import PastorsWelcomeSection from "@/components/PastorsWelcomeSection";
import SectionWrapper from "@/components/SectionWrapper";
import LiveTVCard from "@/components/LiveTVCard";
import SermonsPreview from "@/components/SermonsPreview";
import QuickActions from "@/components/QuickActions";
import Link from "next/link";
import EventsSection from "@/components/EventsSection";
import PastorsSection from "@/components/PastorsSection";
import OnlinePresenceSection from "@/components/OnlinePresenceSection";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <PastorsWelcomeSection />

      <SectionWrapper className="py-10 sm:py-14">
        <QuickActions />
      </SectionWrapper>

      <SectionWrapper className="py-12 sm:py-16" id="featured-sermons">
        <SermonsPreview />
      </SectionWrapper>

      <SectionWrapper className="py-12 sm:py-16" id="events">
        <EventsSection />
        {/*
        <div className="rounded-3xl border border-white/10 bg-white/5 p-7 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
                Events
              </p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black">
                What’s happening this week.
              </h2>
              <p className="mt-3 text-white/75 max-w-2xl">
                From worship nights to discipleship classes — there’s a place
                for you.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-6 py-3 font-bold hover:bg-white/10 transition-colors"
            >
              Ask for Details
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Sunday Service", meta: "Sun • 10:00 AM" },
              { title: "Midweek Service", meta: "Wed • 6:00 PM" },
              { title: "Prayer & Worship", meta: "Fri • 6:00 PM" },
            ].map((e) => (
              <div
                key={e.title}
                className="rounded-3xl bg-background/60 border border-white/10 p-6"
              >
                <p className="text-primary text-xs font-black tracking-[0.25em] uppercase">
                  Upcoming
                </p>
                <h3 className="mt-3 text-xl font-black">{e.title}</h3>
                <p className="mt-2 text-white/70 font-bold text-sm">{e.meta}</p>
              </div>
            ))}
          </div>
        </div>
        */}
      </SectionWrapper>

      <SectionWrapper className="py-12 sm:py-16" id="pastors">
        <PastorsSection />
      </SectionWrapper>

      <SectionWrapper className="py-12 sm:py-16" id="ministries">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-white/5 p-7 sm:p-10">
            <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
              Ministries
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black leading-tight">
              Find where you belong.
            </h2>
            <p className="mt-4 text-white/75">
              Kids, youth, worship, outreach, discipleship — there’s a ministry
              for every season.
            </p>
            <Link
              href="/ministries"
              className="mt-7 inline-flex items-center justify-center rounded-xl bg-primary text-black font-extrabold px-6 py-3 hover:bg-accent transition-colors"
            >
              Explore Ministries
            </Link>
          </div>
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Children", desc: "A safe place to grow" },
              { title: "Youth", desc: "Purpose, faith, community" },
              { title: "Worship", desc: "Serve with your gifts" },
              { title: "Outreach", desc: "Love in action" },
            ].map((m) => (
              <div
                key={m.title}
                className="rounded-3xl bg-secondary/15 border border-secondary/25 p-6 hover:bg-secondary/20 transition-colors"
              >
                <p className="text-primary text-xs font-black tracking-[0.25em] uppercase">
                  Ministry
                </p>
                <h3 className="mt-3 text-xl font-black">{m.title}</h3>
                <p className="mt-2 text-white/75">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper className="py-12 sm:py-16">
        <div className="rounded-3xl bg-darkAccent/25 border border-darkAccent/35 overflow-hidden">
          <div className="p-7 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8">
              <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
                Church School
              </p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black leading-tight">
                Building strong foundations for learners.
              </h2>
              <p className="mt-4 text-white/80 max-w-2xl">
                Our school complements church life by nurturing character,
                discipline, and excellence.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-stretch">
              <Link
                href="/school"
                className="inline-flex items-center justify-center rounded-xl bg-primary text-black font-extrabold px-6 py-3.5 hover:bg-accent transition-colors"
              >
                View School
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-6 py-3.5 font-bold hover:bg-white/10 transition-colors"
              >
                Admissions Enquiry
              </Link>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        </div>
      </SectionWrapper>

      <SectionWrapper className="py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <OnlinePresenceSection />
            {/*
            <div className="rounded-3xl bg-secondary/20 border border-secondary/30 p-7 sm:p-10 h-full">
              <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
                Online Presence
              </p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black leading-tight">
                Stay connected throughout the week.
              </h2>
              <p className="mt-4 text-white/80 leading-relaxed max-w-2xl">
                Sermons, announcements, and live streams — all in one place.
                Subscribe and never miss what God is doing in our community.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <a
                  className="inline-flex items-center justify-center rounded-xl bg-primary text-black font-extrabold px-6 py-3 hover:bg-accent transition-colors"
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit YouTube
                </a>
                <a
                  className="inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-6 py-3 font-bold hover:bg-white/10 transition-colors"
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  Follow on Facebook
                </a>
              </div>
            </div>
            */}
          </div>
          <div className="lg:col-span-5 flex flex-col gap-6">
            <LiveTVCard />
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
