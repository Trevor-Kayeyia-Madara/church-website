import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, formatDuration } from "@/lib/format";
import { toYouTubeEmbedUrl } from "@/lib/youtube";
import { getRequestOrigin } from "@/lib/origin.server";

async function getSermon(id) {
  const origin = getRequestOrigin();
  const res = await fetch(`${origin}/api/sermons/${encodeURIComponent(id)}`, {
    cache: "no-store",
  }).catch(() => null);

  if (!res) return null;
  if (res.status === 404) return null;
  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  if (!data) return null;
  return data;
}

export async function generateMetadata({ params }) {
  const sermon = await getSermon(params.id);
  if (!sermon) return { title: "Sermon Not Found" };
  return { title: `${sermon.title} | Sermons` };
}

export default async function SermonDetailPage({ params }) {
  const sermon = await getSermon(params.id);
  if (!sermon) notFound();

  const embed = toYouTubeEmbedUrl(sermon.videoUrl);
  const duration = formatDuration(sermon.durationMinutes);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/sermons"
          className="inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 font-bold hover:bg-white/10 transition-colors"
        >
          Back to Sermons
        </Link>
        {sermon.videoUrl ? (
          <a
            href={sermon.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-primary text-black font-extrabold px-5 py-2.5 hover:bg-accent transition-colors"
          >
            Watch on YouTube
          </a>
        ) : null}
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="aspect-video bg-background/40">
          {embed ? (
            <iframe
              title={sermon.title}
              className="h-full w-full"
              src={embed}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/70 font-bold">
              Video not available
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8">
          <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
            {sermon.category?.name || "Sermon"}
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black leading-tight">
            {sermon.title}
          </h1>
          <p className="mt-3 text-white/70 font-bold">
            {formatDate(sermon.date)}
            {duration ? ` | ${duration}` : ""}
            {sermon.speaker ? ` | ${sermon.speaker}` : ""}
          </p>
          {sermon.description ? (
            <p className="mt-5 max-w-3xl text-white/80 leading-relaxed">
              {sermon.description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
