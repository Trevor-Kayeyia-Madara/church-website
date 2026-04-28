import Spinner from "@/components/Spinner";

export default function Loading() {
  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 flex items-center gap-3">
        <Spinner className="size-6" />
        <span className="font-extrabold text-white/80">Loading…</span>
      </div>
    </div>
  );
}

