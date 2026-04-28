import prisma from "@/lib/db";
import { fetchChannelUploadsVideos, fetchPlaylistVideos } from "@/lib/youtubeDataApi";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sermonSlugFromVideo({ title, publishedAt, videoId }) {
  const date = publishedAt ? new Date(publishedAt).toISOString().slice(0, 10) : null;
  const base = slugify(title) || (videoId ? `video-${videoId}` : "sermon");
  return date ? `${base}-${date}` : base;
}

export async function syncYouTubeSermons({
  apiKey,
  playlistId,
  channelId,
  max = 50,
  categorySlug = "sermons",
  categoryName = "Sermons",
} = {}) {
  if (!apiKey) throw new Error("Missing YOUTUBE_API_KEY");
  if (!playlistId && !channelId)
    throw new Error("Missing YOUTUBE_PLAYLIST_ID or YOUTUBE_CHANNEL_ID");

  const videos = playlistId
    ? await fetchPlaylistVideos({ apiKey, playlistId, max })
    : await fetchChannelUploadsVideos({ apiKey, channelId, max });

  const category = await prisma.category.upsert({
    where: { slug: categorySlug },
    update: { name: categoryName },
    create: { slug: categorySlug, name: categoryName },
  });

  let created = 0;
  let updated = 0;

  for (const v of videos) {
    const slug = sermonSlugFromVideo(v);
    const date = v.publishedAt ? new Date(v.publishedAt) : new Date();

    const existing = await prisma.sermon.findUnique({ where: { slug } });
    if (existing) {
      await prisma.sermon.update({
        where: { id: existing.id },
        data: {
          title: v.title,
          description: v.description || null,
          date,
          durationMinutes: v.durationMinutes ?? null,
          thumbnailUrl: v.thumbnailUrl || null,
          videoUrl: v.videoUrl || null,
          categoryId: category.id,
        },
      });
      updated += 1;
      continue;
    }

    await prisma.sermon.create({
      data: {
        slug,
        title: v.title,
        description: v.description || null,
        date,
        durationMinutes: v.durationMinutes ?? null,
        thumbnailUrl: v.thumbnailUrl || null,
        videoUrl: v.videoUrl || null,
        categoryId: category.id,
      },
    });
    created += 1;
  }

  return { created, updated, totalFetched: videos.length };
}
