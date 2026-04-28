import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { MOCK_SERMONS } from "@/lib/mockData";
import { getYouTubeSermonById, hasYouTubeRuntimeSource } from "@/lib/sermonsData";

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

export async function GET(_request, { params }) {
  const awaitedParams = await params;
  const id = awaitedParams?.id;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  if (hasYouTubeRuntimeSource()) {
    try {
      const sermon = await getYouTubeSermonById(id);
      if (sermon) return NextResponse.json(sermon);
    } catch {
      // Fall through to DB/mock data.
    }
  }

  try {
    const sermon =
      (await prisma.sermon.findUnique({
        where: { id },
        include: { category: true },
      })) ||
      (await prisma.sermon.findUnique({
        where: { slug: id },
        include: { category: true },
      }));

    if (!sermon) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(normalizeSermon(sermon));
  } catch {
    const sermon = MOCK_SERMONS.find((s) => s.id === id || s.slug === id);
    if (!sermon) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(sermon);
  }
}
