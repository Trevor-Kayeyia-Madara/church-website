import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative size-14 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <Image
            src="/logo.png"
            alt="Deliverance Church Utawala"
            fill
            sizes="56px"
            className="object-contain p-2"
            priority
          />
        </div>
        <div className="flex items-center gap-3 text-white/70 font-bold">
          <span className="inline-flex size-5 rounded-full border-2 border-white/15 border-t-accent animate-spin" />
          <span>Loading…</span>
        </div>
      </div>
    </div>
  );
}

