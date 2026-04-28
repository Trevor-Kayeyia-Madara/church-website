from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime, timezone

import requests

from app.config import settings


@dataclass(frozen=True)
class YouTubeVideo:
    videoId: str
    title: str
    description: str | None
    publishedAt: str | None
    thumbnailUrl: str | None
    videoUrl: str
    durationMinutes: int | None


_DUR_RE = re.compile(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?")


def _parse_duration_minutes(iso8601: str | None) -> int | None:
    if not iso8601:
        return None
    m = _DUR_RE.fullmatch(iso8601)
    if not m:
        return None
    h = int(m.group(1) or 0)
    mi = int(m.group(2) or 0)
    s = int(m.group(3) or 0)
    total = h * 3600 + mi * 60 + s
    return max(1, round(total / 60)) if total else None


def _youtube_get(url: str, params: dict) -> dict:
    res = requests.get(url, params=params, timeout=12)
    res.raise_for_status()
    return res.json()


def _pick_thumb(thumbnails: dict | None) -> str | None:
    if not thumbnails:
        return None
    for key in ("maxres", "standard", "high", "medium", "default"):
        if key in thumbnails and thumbnails[key].get("url"):
            return thumbnails[key]["url"]
    return None


def _now_iso() -> str:
    return datetime.now(tz=timezone.utc).isoformat().replace("+00:00", "Z")


def _resolve_uploads_playlist(api_key: str, channel_id: str) -> str:
    data = _youtube_get(
        "https://www.googleapis.com/youtube/v3/channels",
        {"part": "contentDetails", "id": channel_id, "key": api_key},
    )
    items = data.get("items") or []
    uploads = (
        (items[0].get("contentDetails") or {})
        .get("relatedPlaylists", {})
        .get("uploads")
        if items
        else None
    )
    if not uploads:
        raise RuntimeError("Unable to resolve uploads playlist for channel")
    return uploads


def fetch_playlist_videos(*, api_key: str, playlist_id: str, max_results: int) -> list[YouTubeVideo]:
    videos: list[dict] = []
    page_token: str | None = None

    while len(videos) < max_results:
        data = _youtube_get(
            "https://www.googleapis.com/youtube/v3/playlistItems",
            {
                "part": "snippet,contentDetails",
                "playlistId": playlist_id,
                "maxResults": min(50, max_results - len(videos)),
                "pageToken": page_token or "",
                "key": api_key,
            },
        )
        videos.extend(data.get("items") or [])
        page_token = data.get("nextPageToken")
        if not page_token:
            break

    ids = [
        (v.get("contentDetails") or {}).get("videoId")
        for v in videos
        if (v.get("contentDetails") or {}).get("videoId")
    ]
    durations = fetch_video_durations(api_key=api_key, video_ids=ids)

    out: list[YouTubeVideo] = []
    for item in videos:
        snippet = item.get("snippet") or {}
        video_id = (item.get("contentDetails") or {}).get("videoId")
        if not video_id:
            continue
        out.append(
            YouTubeVideo(
                videoId=video_id,
                title=snippet.get("title") or "",
                description=snippet.get("description") or None,
                publishedAt=snippet.get("publishedAt") or _now_iso(),
                thumbnailUrl=_pick_thumb(snippet.get("thumbnails")),
                videoUrl=f"https://www.youtube.com/watch?v={video_id}",
                durationMinutes=_parse_duration_minutes(durations.get(video_id)),
            )
        )
    return out


def fetch_video_durations(*, api_key: str, video_ids: list[str]) -> dict[str, str]:
    out: dict[str, str] = {}
    for i in range(0, len(video_ids), 50):
        chunk = video_ids[i : i + 50]
        if not chunk:
            continue
        data = _youtube_get(
            "https://www.googleapis.com/youtube/v3/videos",
            {"part": "contentDetails", "id": ",".join(chunk), "key": api_key},
        )
        for item in data.get("items") or []:
            vid = item.get("id")
            dur = (item.get("contentDetails") or {}).get("duration")
            if vid and dur:
                out[vid] = dur
    return out


def has_youtube_source() -> bool:
    return bool(
        settings.youtube_api_key
        and (settings.youtube_playlist_id or settings.youtube_channel_id)
    )


def get_youtube_videos(max_results: int) -> list[YouTubeVideo]:
    api_key = settings.youtube_api_key
    if not api_key:
        raise RuntimeError("Missing YOUTUBE_API_KEY")
    playlist_id = settings.youtube_playlist_id
    channel_id = settings.youtube_channel_id
    if not playlist_id and not channel_id:
        raise RuntimeError("Missing YOUTUBE_PLAYLIST_ID or YOUTUBE_CHANNEL_ID")

    resolved_playlist = playlist_id or _resolve_uploads_playlist(api_key, channel_id)  # type: ignore[arg-type]
    return fetch_playlist_videos(api_key=api_key, playlist_id=resolved_playlist, max_results=max_results)

