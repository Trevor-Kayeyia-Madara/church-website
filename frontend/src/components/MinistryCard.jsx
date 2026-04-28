export default function MinistryCard({ ministry }) {
  return (
    <div className="rounded-3xl bg-secondary/15 border border-secondary/25 p-6 sm:p-7 hover:bg-secondary/20 transition-colors">
      <p className="text-primary text-xs font-black tracking-[0.25em] uppercase">
        Ministry
      </p>
      <h3 className="mt-3 text-xl font-black">{ministry.title}</h3>
      <p className="mt-2 text-white/75 leading-relaxed">{ministry.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {ministry.highlights.map((h) => (
          <span
            key={h}
            className="inline-flex items-center rounded-full bg-background/60 border border-white/10 px-3 py-1 text-xs font-extrabold text-white/80"
          >
            {h}
          </span>
        ))}
      </div>
    </div>
  );
}

