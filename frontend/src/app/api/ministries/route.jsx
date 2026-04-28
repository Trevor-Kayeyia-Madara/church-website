import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { SITE } from "@/lib/siteConfig";

function safeInt(value, fallback) {
  const n = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function normalizeMinistry(m) {
  const highlights = Array.isArray(m.highlights)
    ? m.highlights
    : Array.isArray(m.highlights?.value)
      ? m.highlights.value
      : m.highlights
        ? m.highlights
        : [];

  return {
    id: m.id ?? m.slug,
    slug: m.slug,
    title: m.title,
    description: m.description || null,
    highlights: Array.isArray(highlights) ? highlights.filter(Boolean) : [],
    imageUrl: m.imageUrl || null,
    sortOrder: m.sortOrder ?? 0,
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(safeInt(searchParams.get("limit"), 50), 200);

  try {
    const items = await prisma.ministry.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      take: limit,
    });
    return NextResponse.json({ ok: true, items: items.map(normalizeMinistry) });
  } catch {
    const fallback = (SITE.ministries || []).slice(0, limit).map((m) =>
      normalizeMinistry({
        ...m,
        id: m.slug,
        sortOrder: 0,
        isPublished: true,
      }),
    );
    return NextResponse.json({ ok: true, items: fallback, mocked: true });
  }
}

