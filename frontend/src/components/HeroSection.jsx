"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PhoneCall, Play } from "lucide-react";
import { useSite } from "@/lib/siteContext";

export default function HeroSection() {
  const site = useSite();
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/uploads/DCU%202026%20Theme.png"
          alt="Deliverance Church Utawala 2026 theme background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/55 to-background" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-accent/15" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase"
          >
            {site.tagline}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mt-4 text-5xl sm:text-6xl font-black leading-[1.05] tracking-tight"
          >
            A place to belong,
            <span className="block text-white/90">grow, and serve.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mt-6 text-white/80 text-lg leading-relaxed max-w-2xl"
          >
            Join us for powerful worship, the Word, and a community that walks
            with you through every season.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-9 flex flex-col sm:flex-row gap-3"
          >
            <Link
              href="/sermons"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-black font-extrabold px-7 py-3.5 hover:bg-accent transition-colors shadow-lg shadow-black/20"
            >
              <Play className="size-5" />
              Watch Sermons
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-7 py-3.5 font-bold hover:bg-white/10 transition-colors"
            >
              <PhoneCall className="size-5" />
              Contact Us
            </Link>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                k: "Service",
                v: site.serviceTimes[0]?.time
                  ? `${site.serviceTimes[0].day} ${site.serviceTimes[0].time}`
                  : "Service Times",
              },
              { k: "Location", v: site.location.replace(", Kenya", "") },
              { k: "Live", v: "Weekly Stream" },
            ].map((stat) => (
              <div
                key={stat.k}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
                  {stat.k}
                </p>
                <p className="mt-1 font-extrabold">{stat.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
