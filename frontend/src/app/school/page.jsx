import Link from "next/link";
import SectionWrapper from "@/components/SectionWrapper";
import { useSite } from "@/lib/siteContext";

export const metadata = {
  title: "School | Deliverance Church Utawala",
};

export default function SchoolPage() {
  const site = useSite();
  const school = site.school;

  return (
    <div>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-darkAccent/60 via-background to-background" />
        <SectionWrapper className="relative py-14 sm:py-20">
          <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
            Dominion Center
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-black leading-tight">
            {school.heroTitle || school.name}
          </h1>
          {school.heroSubtitle ? (
            <p className="mt-4 text-white/80 max-w-2xl">{school.heroSubtitle}</p>
          ) : null}
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link
              href={school.cta?.primaryHref || "/contact?subject=Dominion%20Center%20Admissions"}
              className="inline-flex items-center justify-center rounded-xl bg-primary text-black font-extrabold px-7 py-3.5 hover:bg-accent transition-colors"
            >
              {school.cta?.primaryLabel || "Apply Now"}
            </Link>
            <Link
              href={
                school.cta?.secondaryHref || "/contact?subject=Schedule%20a%20School%20Visit"
              }
              className="inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-7 py-3.5 font-bold hover:bg-white/10 transition-colors"
            >
              {school.cta?.secondaryLabel || "Schedule Visit"}
            </Link>
          </div>
        </SectionWrapper>
      </div>

      <SectionWrapper className="py-10 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-white/5 p-7 sm:p-10">
            <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
              Kids School
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-black">
              {school.tagline || "Faith-based learning for the next generation."}
            </h2>
            {school.heroSubtitle ? (
              <p className="mt-4 text-white/80 leading-relaxed">{school.heroSubtitle}</p>
            ) : null}

            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(school.programs || []).map((program) => (
                <div
                  key={program.key || program.title}
                  className="rounded-3xl bg-background/60 border border-white/10 p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
                        {program.title}
                      </p>
                      <h3 className="mt-2 text-xl font-black">{program.subtitle}</h3>
                    </div>
                    <Link
                      href={
                        school.cta?.primaryHref ||
                        "/contact?subject=Dominion%20Center%20Admissions"
                      }
                      className="shrink-0 inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-4 py-2 font-extrabold hover:bg-white/10 transition-colors"
                    >
                      Learn More
                    </Link>
                  </div>

                  {program.offers?.length ? (
                    <div className="mt-4 space-y-2 text-sm">
                      <p className="text-white/60 font-black tracking-[0.25em] uppercase text-xs">
                        What We Offer
                      </p>
                      <ul className="mt-2 grid grid-cols-1 gap-2">
                        {program.offers.map((item) => (
                          <li
                            key={item}
                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-bold text-white/80"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="rounded-3xl bg-secondary/25 border border-secondary/35 p-7">
              <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
                Admissions
              </p>
              <h3 className="mt-3 text-2xl font-black leading-tight">
                {school.cta?.title || "Ready to Enroll Your Child?"}
              </h3>
              {school.cta?.body ? <p className="mt-3 text-white/75">{school.cta.body}</p> : null}

              <Link
                href={school.cta?.primaryHref || "/contact?subject=Dominion%20Center%20Admissions"}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-primary text-black font-extrabold px-6 py-3.5 hover:bg-accent transition-colors"
              >
                {school.cta?.primaryLabel || "Apply Now"}
              </Link>
              <Link
                href={
                  school.cta?.secondaryHref || "/contact?subject=Schedule%20a%20School%20Visit"
                }
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-white/5 border border-white/10 px-6 py-3.5 font-extrabold hover:bg-white/10 transition-colors"
              >
                {school.cta?.secondaryLabel || "Schedule Visit"}
              </Link>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="p-6">
                <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
                  Location
                </p>
                <h3 className="mt-3 text-2xl font-black leading-tight">Visit the campus.</h3>
                <p className="mt-3 text-white/75">{site.location}</p>
              </div>
              <iframe
                title="School Map"
                className="w-full h-[280px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(site.location)}&output=embed`}
              />
            </div>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
