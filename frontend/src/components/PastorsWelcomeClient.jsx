"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

export default function PastorsWelcomeClient({ pastor }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-white/5 border border-white/10">
              {pastor?.photoUrl ? (
                <Image
                  src={pastor.photoUrl}
                  alt={pastor.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30">
                  <span className="font-black text-6xl">
                    {pastor?.name?.charAt(0) || "DC"}
                  </span>
                  <span className="mt-2 text-sm text-white/20">Pastor Photo</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-primary text-xs font-black tracking-[0.25em] uppercase">
                  {pastor ? "Lead Pastor" : "Our Church"}
                </p>
                <h3 className="text-white text-xl font-black mt-1">
                  {pastor?.name || "Deliverance Church Utawala"}
                </h3>
                {pastor?.roleTitle && (
                  <p className="text-white/70 text-sm mt-1">
                    {pastor.roleTitle}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-7"
          >
            <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
              Welcome
            </p>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
              A place to belong,<br/>
              <span className="text-white/90">grow, and serve.</span>
            </h2>
            
            <div className="mt-6 space-y-4 text-white/75 text-lg leading-relaxed">
              <p>
                Welcome to Deliverance Church Utawala — we&apos;re glad you&apos;re here. 
                Our doors are open for worship, fellowship, and growing together 
                in faith.
              </p>
              <p>
                Whether you&apos;re exploring faith for the first time or deepening your 
                walk with God, you&apos;ll find a community that embraces you as family.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl bg-primary text-black font-extrabold px-6 py-3.5 hover:bg-accent transition-colors"
              >
                Visit Us This Sunday
              </Link>
              <Link
                href="/sermons"
                className="inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-6 py-3.5 font-bold hover:bg-white/10 transition-colors"
              >
                Watch Sermons
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}