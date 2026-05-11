import SectionWrapper from "@/components/SectionWrapper";
import ContactForm from "@/components/ContactForm";
import ServiceTimesCard from "@/components/ServiceTimesCard";
import GivingSection from "@/components/GivingSection";
import { Suspense } from "react";
import { useSite } from "@/lib/siteContext";

export const metadata = {
  title: "Contact | Deliverance Church Utawala",
};

export default function ContactPage() {
  const site = useSite();
  const googleMapsUrl = "https://maps.app.goo.gl/zYKi7pvCj3Fm9suJ9";
  return (
    <div>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-darkAccent/60 via-background to-background" />
        <SectionWrapper className="relative py-14 sm:py-20">
          <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
            Contact
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-black leading-tight">
            We’d love to hear from you.
          </h1>
          <p className="mt-4 text-white/80 max-w-2xl">
            Reach out for prayer, partnership, or any questions about church
            life.
          </p>
        </SectionWrapper>
      </div>

      <SectionWrapper className="py-10 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-secondary/15 border border-secondary/25 p-6 sm:p-8">
              <h2 className="text-2xl font-black">Send a message</h2>
              <p className="mt-2 text-white/75">
                We typically respond within 24–48 hours.
              </p>
              <div className="mt-6">
                <Suspense
                  fallback={
                    <div className="rounded-2xl border border-white/10 bg-background/40 p-5 text-white/70 font-bold">
                      Loading form…
                    </div>
                  }
                >
                  <ContactForm />
                </Suspense>
              </div>
            </div>

            <div className="mt-6 rounded-3xl overflow-hidden border border-white/10 bg-white/5">
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-black">Visit Us</h3>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="rounded-2xl bg-background/60 border border-white/10 p-4">
                    <p className="text-white/60 font-bold">Address</p>
                    <p className="mt-1 font-extrabold">
                      {site.contact.addressLine1}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-background/60 border border-white/10 p-4">
                    <p className="text-white/60 font-bold">Phone</p>
                    <a
                      href={`tel:${site.contact.phoneTel}`}
                      className="mt-1 inline-block font-extrabold hover:text-accent"
                    >
                      {site.contact.phoneDisplay}
                    </a>
                  </div>
                  <div className="rounded-2xl bg-background/60 border border-white/10 p-4">
                    <p className="text-white/60 font-bold">Email</p>
                    <div className="mt-1 flex flex-col gap-1">
                      <a
                        href="mailto:info@dcutawala.org"
                        className="inline-block font-extrabold hover:text-accent"
                      >
                        info@dcutawala.org
                      </a>
                      <a
                        href="mailto:dcutawala@gmail.com"
                        className="inline-block font-extrabold hover:text-accent"
                      >
                        dcutawala@gmail.com
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-6 py-3 font-bold hover:bg-white/10 transition-colors"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
              <iframe
                title="Map"
                className="w-full h-[320px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  "Deliverance Church Utawala",
                )}&output=embed`}
              />
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <ServiceTimesCard site={site} />
          </div>
        </div>

        <div className="mt-6">
          <GivingSection site={site} />
        </div>
      </SectionWrapper>
    </div>
  );
}
