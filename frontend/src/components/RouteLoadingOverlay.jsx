"use client";

import Spinner from "@/components/Spinner";
import { useRouteLoading } from "@/lib/routeLoadingContext";

export default function RouteLoadingOverlay() {
  const { isLoading } = useRouteLoading();
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background/65 backdrop-blur-sm">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-3xl border border-white/10 bg-background/70 px-6 py-5 flex items-center gap-3">
          <Spinner className="size-6" />
          <span className="font-extrabold text-white/80">Loading…</span>
        </div>
      </div>
    </div>
  );
}

