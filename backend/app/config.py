from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv


load_dotenv()


def _env(name: str, default: str = "") -> str:
    value = os.getenv(name)
    return default if value is None else value


def _env_int(name: str, default: int) -> int:
    raw = _env(name, "")
    try:
        return int(raw)
    except Exception:
        return default


@dataclass(frozen=True)
class Settings:
    database_url: str | None
    cors_allow_origins: str
    api_prefix: str
    frontend_dist_dir: str

    youtube_api_key: str | None
    youtube_playlist_id: str | None
    youtube_channel_id: str | None
    youtube_max_results: int

    @property
    def sqlalchemy_database_url(self) -> str | None:
        if not self.database_url:
            return None
        url = self.database_url.strip()
        if url.startswith("mysql://"):
            return "mysql+pymysql://" + url.removeprefix("mysql://")
        if url.startswith("mysql+pymysql://"):
            return url
        return url


settings = Settings(
    database_url=(_env("DATABASE_URL", "").strip() or None),
    cors_allow_origins=_env("CORS_ALLOW_ORIGINS", "*").strip() or "*",
    api_prefix=_env("API_PREFIX", "").strip(),
    frontend_dist_dir=_env("FRONTEND_DIST_DIR", "").strip(),
    youtube_api_key=(_env("YOUTUBE_API_KEY", "").strip() or None),
    youtube_playlist_id=(_env("YOUTUBE_PLAYLIST_ID", "").strip() or None),
    youtube_channel_id=(_env("YOUTUBE_CHANNEL_ID", "").strip() or None),
    youtube_max_results=_env_int("YOUTUBE_MAX_RESULTS", 50),
)

