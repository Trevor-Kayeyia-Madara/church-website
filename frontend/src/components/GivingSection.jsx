import {
  Banknote,
  Building2,
  HandHeart,
  Landmark,
  Smartphone,
} from "lucide-react";

const methodIcon = {
  mpesa: Smartphone,
  bank: Landmark,
  development: Building2,
};

export default function GivingSection({ site }) {
  const giving = site?.giving;
  if (!giving) return null;

  return (
    <section id="give" className="scroll-mt-24">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-7 sm:p-10">
        <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
          {giving.title || "Giving"}
        </p>
        <div className="mt-3 flex items-start justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl font-black leading-tight">
            {giving.headline || "Generous Hearts"}
          </h2>
          <div className="hidden sm:flex items-center justify-center rounded-2xl border border-white/10 bg-background/60 p-3">
            <HandHeart className="size-6 text-accent" aria-hidden="true" />
          </div>
        </div>
        {giving.body ? <p className="mt-4 text-white/80 max-w-3xl">{giving.body}</p> : null}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-background/40 p-6 sm:p-7">
            <p className="text-white/60 text-xs font-black tracking-[0.25em] uppercase">
              Choose Your Giving Type
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(giving.types || []).map((t) => (
                <div
                  key={t.key || t.title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                      <Banknote className="size-5 text-accent" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-black text-lg leading-tight">{t.title}</p>
                      {t.description ? (
                        <p className="mt-1 text-sm text-white/70 font-bold">{t.description}</p>
                      ) : null}
                    </div>
                  </div>
                  {t.verse ? (
                    <p className="mt-4 text-sm text-white/70 italic border-l-2 border-accent/60 pl-4">
                      {t.verse}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-background/40 p-6 sm:p-7">
            <p className="text-white/60 text-xs font-black tracking-[0.25em] uppercase">
              Payment Methods
            </p>
            <div className="mt-4 space-y-4">
              {(giving.paymentMethods || []).map((m) => {
                const Icon = methodIcon[m.key] || Smartphone;
                return (
                  <div
                    key={m.key || m.title}
                    className="rounded-3xl border border-white/10 bg-white/5 p-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                        <Icon className="size-5 text-accent" aria-hidden="true" />
                      </div>
                      <p className="font-black text-lg">{m.title}</p>
                    </div>
                    {m.lines?.length ? (
                      <ul className="mt-4 space-y-2 text-sm font-bold text-white/75">
                        {m.lines.map((line) => (
                          <li key={line} className="rounded-2xl bg-background/60 border border-white/10 px-4 py-2">
                            {line}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

