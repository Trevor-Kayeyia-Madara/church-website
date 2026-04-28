import { fetchChannelUploadsVideos, fetchPlaylistVideos } from "@/lib/youtubeDataApi";

function safeInt(value, fallback) {
  const n = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function safeMaxResults(value, fallback) {
  const n = safeInt(value, fallback);
  return Math.min(Math.max(n, 1), 500);
}

export function hasYouTubeRuntimeSource() {
  return !!(
    process.env.YOUTUBE_API_KEY &&
    (process.env.YOUTUBE_PLAYLIST_ID || process.env.YOUTUBE_CHANNEL_ID)
  );
}

export function normalizeYouTubeSermon(video) {
  return {
    id: video.videoId,
    slug: video.videoId,
    title: video.title,
    description: video.description || null,
    speaker: null,
    date: video.publishedAt || new Date().toISOString(),
    durationMinutes: video.durationMinutes ?? null,
    thumbnailUrl: video.thumbnailUrl || null,
    videoUrl: video.videoUrl || null,
    category: { id: "sermons", name: "Sermons", slug: "sermons" },
    source: "youtube",
  };
}

async function fetchRawYouTubeSermons(max) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const playlistId = process.env.YOUTUBE_PLAYLIST_ID;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey) throw new Error("Missing YOUTUBE_API_KEY");
  if (!playlistId && !channelId) {
    throw new Error("Missing YOUTUBE_PLAYLIST_ID or YOUTUBE_CHANNEL_ID");
  }

  if (playlistId) {
    return fetchPlaylistVideos({ apiKey, playlistId, max });
  }

  return fetchChannelUploadsVideos({ apiKey, channelId, max });
}

export async function getYouTubeSermonsList({ max = 50, q = "" } = {}) {
  const fetchCount = Math.max(
    safeInt(max, 50),
    safeMaxResults(process.env.YOUTUBE_MAX_RESULTS, 50),
  );

  const videos = await fetchRawYouTubeSermons(fetchCount);
  const needle = q.trim().toLowerCase();
  const filtered = !needle
    ? videos
    : videos.filter((video) =>
        `${video.title} ${video.description}`.toLowerCase().includes(needle),
      );

  return {
    total: filtered.length,
    items: filtered.map(normalizeYouTubeSermon),
  };
}

export async function getYouTubeSermonsCollection({ page = 1, limit = 9, q = "" } = {}) {
  const currentPage = safeInt(page, 1);
  const pageSize = Math.min(safeInt(limit, 9), 48);
  const fetchCount = Math.max(
    pageSize * currentPage,
    safeInt(process.env.YOUTUBE_MAX_RESULTS, 50),
  );

  const videos = await fetchRawYouTubeSermons(fetchCount);
  const needle = q.trim().toLowerCase();
  const filtered = !needle
    ? videos
    : videos.filter((video) =>
        `${video.title} ${video.description}`.toLowerCase().includes(needle),
      );

  const start = (currentPage - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map(normalizeYouTubeSermon);

  return {
    categories: [{ id: "sermons", name: "Sermons", slug: "sermons" }],
    page: currentPage,
    limit: pageSize,
    total: filtered.length,
    items,
    source: "youtube",
  };
}

export async function getYouTubeSermonById(id) {
  const fetchCount = safeInt(process.env.YOUTUBE_MAX_RESULTS, 50);
  const videos = await fetchRawYouTubeSermons(fetchCount);
  const match = videos.find((video) => video.videoId === id);
  return match ? normalizeYouTubeSermon(match) : null;
}
