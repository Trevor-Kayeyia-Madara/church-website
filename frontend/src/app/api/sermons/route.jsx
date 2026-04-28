import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { MOCK_CATEGORIES, MOCK_SERMONS } from "@/lib/mockData";
import { getYouTubeSermonsList, hasYouTubeRuntimeSource } from "@/lib/sermonsData";
import { getYouTubeId } from "@/lib/youtube";

function safeInt(value, fallback) {
  const n = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function safeMaxResults(value, fallback) {
  const n = safeInt(value, fallback);
  return Math.min(Math.max(n, 1), 500);
}

function normalizeSermon(s) {
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    description: s.description || null,
    speaker: s.speaker || null,
    date: typeof s.date === "string" ? s.date : s.date.toISOString(),
    durationMinutes: s.durationMinutes ?? null,
    thumbnailUrl: s.thumbnailUrl || null,
    videoUrl: s.videoUrl || null,
    category: s.category
      ? { id: s.category.id, name: s.category.name, slug: s.category.slug }
      : null,
    source: "db",
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = safeInt(searchParams.get("page"), 1);
  const limit = Math.min(safeInt(searchParams.get("limit"), 9), 48);
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const source = (searchParams.get("source") || "").toLowerCase(); // "db" | "youtube" | "all" (default)

  const needCount = page * limit;
  const includeYouTube =
    source !== "db" &&
    hasYouTubeRuntimeSource() &&
    (!category || category === "sermons");

  const where = {
    ...(category ? { category: { slug: category } } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { speaker: { contains: q } },
          ],
        }
      : {}),
  };

  let dbCategories = null;
  let dbTotal = 0;
  let dbItems = [];
  let usedMock = false;

  if (source !== "youtube") {
    try {
      const [categories, total, items] = await Promise.all([
        prisma.category.findMany({ orderBy: { name: "asc" } }),
        prisma.sermon.count({ where }),
        prisma.sermon.findMany({
          where,
          include: { category: true },
          orderBy: { date: "desc" },
          take: needCount,
        }),
      ]);

      dbCategories = categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
      dbTotal = total;
      dbItems = items.map(normalizeSermon);
    } catch {
      // Fallback when DATABASE_URL isn't configured yet.
      const filtered = MOCK_SERMONS.filter((s) => {
        if (category && s.category?.slug !== category) return false;
        if (q) {
          const needle = q.toLowerCase();
          const hay = `${s.title} ${s.speaker || ""}`.toLowerCase();
          if (!hay.includes(needle)) return false;
        }
        return true;
      });

      usedMock = true;
      dbCategories = MOCK_CATEGORIES;
      dbTotal = filtered.length;
      dbItems = filtered.slice(0, needCount).map((s) => ({ ...s, source: "mock" }));
    }
  } else {
    dbCategories = [];
  }

  let youtubeTotal = 0;
  let youtubeItems = [];

  if (includeYouTube) {
    try {
      const { total, items } = await getYouTubeSermonsList({
        max: Math.max(needCount, safeMaxResults(process.env.YOUTUBE_MAX_RESULTS, 50)),
        q,
      });
      youtubeTotal = total;
      youtubeItems = items;
    } catch {
      // Ignore YouTube errors so the page still loads from DB/mock data.
    }
  }

  const dbYouTubeIds = new Set(
    dbItems.map((s) => getYouTubeId(s.videoUrl)).filter(Boolean),
  );

  let dedupedYouTubeTotal = 0;
  const dedupedYouTubeItems = [];
  for (const item of youtubeItems) {
    if (dbYouTubeIds.has(item.id)) continue;
    dedupedYouTubeItems.push(item);
    dedupedYouTubeTotal += 1;
  }

  const merged = [...dbItems, ...dedupedYouTubeItems].sort((a, b) => {
    const ad = Date.parse(a.date);
    const bd = Date.parse(b.date);
    if (Number.isFinite(ad) && Number.isFinite(bd)) return bd - ad;
    return String(b.date || "").localeCompare(String(a.date || ""));
  });

  const start = (page - 1) * limit;
  const items = merged.slice(start, start + limit);

  const categoriesBySlug = new Map((dbCategories || []).map((c) => [c.slug, c]));
  if (includeYouTube || source === "youtube") {
    categoriesBySlug.set("sermons", categoriesBySlug.get("sermons") || {
      id: "sermons",
      name: "Sermons",
      slug: "sermons",
    });
  }

  const dbSource = usedMock ? "mock" : "db";
  const sources =
    source === "youtube"
      ? includeYouTube && dedupedYouTubeItems.length
        ? ["youtube"]
        : []
      : [
          dbSource,
          ...(includeYouTube && dedupedYouTubeItems.length ? ["youtube"] : []),
        ];

  return NextResponse.json({
    categories: Array.from(categoriesBySlug.values()),
    page,
    limit,
    total: dbTotal + dedupedYouTubeTotal,
    items,
    mocked: usedMock ? true : undefined,
    sources,
  });
}
