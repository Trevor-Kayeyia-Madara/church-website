import { formatDate, formatDuration } from "@/lib/format";
import { Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SermonCard({ sermon }) {
  const duration = formatDuration(sermon.durationMinutes);
  const sourceBadge =
    sermon.source === "youtube"
      ? "YouTube"
      : sermon.source === "db"
        ? "Database"
        : sermon.source === "mock"
          ? "Mock"
          : null;
  return (
    <Link
      href={`/sermons/${sermon.slug || sermon.id}`}
      className="group rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors overflow-hidden"
    >
      <div className="relative aspect-video bg-secondary/25">
        {sermon.thumbnailUrl ? (
          <Image
            src={sermon.thumbnailUrl}
            alt={sermon.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        {sourceBadge ? (
          <div className="absolute right-4 top-4">
            <span className="inline-flex items-center justify-center rounded-full bg-white/10 border border-white/10 px-3 py-1 text-[11px] font-black text-white/80 backdrop-blur">
              {sourceBadge}
            </span>
          </div>
        ) : null}
        <div className="absolute left-4 bottom-4 flex items-center gap-2">
          <span className="inline-flex items-center justify-center size-10 rounded-2xl bg-primary text-black shadow-lg">
            <Play className="size-5" />
          </span>
          <div className="text-xs">
            <p className="font-black">{sermon.category?.name || "Sermon"}</p>
            <p className="text-white/70 font-bold">
              {formatDate(sermon.date)}
              {duration ? ` • ${duration}` : ""}
            </p>
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-black leading-snug max-h-[2.6em] overflow-hidden">
          {sermon.title}
        </h3>
        <p className="mt-1 text-white/70 text-sm font-bold">
          {sermon.speaker || "Deliverance Church Utawala"}
        </p>
        <div className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary text-black font-extrabold px-4 py-2.5 group-hover:bg-accent transition-colors">
          Watch
        </div>
      </div>
    </Link>
  );
}
