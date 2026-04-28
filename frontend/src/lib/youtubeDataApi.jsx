function parseIso8601DurationToMinutes(iso) {
  if (!iso) return null;
  const m = String(iso).match(
    /^P(?:\d+Y)?(?:\d+M)?(?:\d+D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i,
  );
  if (!m) return null;
  const hours = Number(m[1] || 0);
  const minutes = Number(m[2] || 0);
  const seconds = Number(m[3] || 0);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return null;
  return Math.max(1, Math.round(totalSeconds / 60));
}

function pickBestThumb(thumbnails) {
  if (!thumbnails) return null;
  return (
    thumbnails.maxres?.url ||
    thumbnails.standard?.url ||
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url ||
    null
  );
}

async function ytFetch(url) {
  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      json?.error?.message ||
      `YouTube request failed (${res.status} ${res.statusText})`;
    throw new Error(msg);
  }
  return json;
}

export async function fetchUploadsPlaylistId({ apiKey, channelId }) {
  if (!apiKey) throw new Error("Missing YouTube apiKey");
  if (!channelId) throw new Error("Missing YouTube channelId");
  const params = new URLSearchParams({
    part: "contentDetails",
    id: channelId,
    key: apiKey,
  });
  const url = `https://www.googleapis.com/youtube/v3/channels?${params.toString()}`;
  const data = await ytFetch(url);
  const uploads =
    data?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads || null;
  if (!uploads) throw new Error("Could not resolve uploads playlist for channel");
  return uploads;
}

export async function fetchPlaylistVideoIds({ apiKey, playlistId, max = 50 }) {
  const ids = [];
  let pageToken = null;
  while (ids.length < max) {
    const batchSize = Math.min(50, max - ids.length);
    const params = new URLSearchParams({
      part: "contentDetails,snippet",
      playlistId,
      maxResults: String(batchSize),
      key: apiKey,
    });
    if (pageToken) params.set("pageToken", pageToken);
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`;
    const data = await ytFetch(url);

    for (const item of data.items || []) {
      const id = item?.contentDetails?.videoId;
      if (id) ids.push(id);
    }

    pageToken = data.nextPageToken || null;
    if (!pageToken) break;
  }
  return ids;
}

export async function fetchVideosByIds({ apiKey, ids }) {
  if (!ids?.length) return [];
  const params = new URLSearchParams({
    part: "snippet,contentDetails",
    id: ids.join(","),
    key: apiKey,
  });
  const url = `https://www.googleapis.com/youtube/v3/videos?${params.toString()}`;
  const data = await ytFetch(url);

  return (data.items || []).map((v) => {
    const videoId = v.id;
    const snippet = v.snippet || {};
    const contentDetails = v.contentDetails || {};
    return {
      videoId,
      title: snippet.title || "Untitled",
      description: snippet.description || "",
      publishedAt: snippet.publishedAt || null,
      thumbnailUrl: pickBestThumb(snippet.thumbnails),
      durationMinutes: parseIso8601DurationToMinutes(contentDetails.duration),
      videoUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null,
    };
  });
}

export async function fetchPlaylistVideos({ apiKey, playlistId, max = 50 }) {
  const ids = await fetchPlaylistVideoIds({ apiKey, playlistId, max });
  const videos = [];
  for (let i = 0; i < ids.length; i += 50) {
    const slice = ids.slice(i, i + 50);
    const batch = await fetchVideosByIds({ apiKey, ids: slice });
    videos.push(...batch);
  }
  // Newest first
  videos.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
  return videos;
}

export async function fetchChannelUploadsVideos({ apiKey, channelId, max = 50 }) {
  const uploadsPlaylistId = await fetchUploadsPlaylistId({ apiKey, channelId });
  return fetchPlaylistVideos({ apiKey, playlistId: uploadsPlaylistId, max });
}
