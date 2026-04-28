import { Clock } from "lucide-react";

export default function ServiceTimesCard({ site }) {
  const { serviceTimes = [], microChurches = [], sundaySchool } = site || {};
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-7">
      <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
        Service Times
      </p>
      <h3 className="mt-3 text-2xl font-black leading-tight">
        Join us every week.
      </h3>
      <div className="mt-5 flex flex-col gap-3">
        {serviceTimes.map((s, i) => (
          <div
            key={`${s.day}-${s.label}-${i}`}
            className="rounded-2xl border border-white/10 bg-background/60 p-4 flex items-start gap-3"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-primary/15 border border-primary/25 text-primary">
              <Clock className="size-5" />
            </span>
            <div>
              <p className="font-extrabold">{s.day}</p>
              <p className="text-white/70 text-sm font-bold">
                {s.time} &bull; {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {microChurches && microChurches.length > 0 && (
        <>
          <p className="mt-6 text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
            Micro Churches
          </p>
          <div className="mt-3 flex flex-col gap-3">
            {microChurches.map((m, i) => (
              <div
                key={`micro-${m.day}-${i}`}
                className="rounded-2xl border border-secondary/25 bg-secondary/5 p-4 flex items-start gap-3"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-secondary/15 border border-secondary/25 text-secondary">
                  <Clock className="size-5" />
                </span>
                <div>
                  <p className="font-extrabold">{m.day}</p>
                  <p className="text-white/70 text-sm font-bold">
                    {m.time} &bull; {m.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {sundaySchool && (
        <>
          <p className="mt-6 text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
            Sunday School
          </p>
          <div className="mt-3 rounded-2xl border border-accent/25 bg-accent/5 p-4 flex items-start gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-accent/15 border border-accent/25 text-accent">
              <Clock className="size-5" />
            </span>
            <div>
              <p className="font-extrabold">{sundaySchool.day}</p>
              <p className="text-white/70 text-sm font-bold">
                {sundaySchool.time} &bull; {sundaySchool.label}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
