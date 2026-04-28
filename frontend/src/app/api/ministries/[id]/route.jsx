import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { SITE } from "@/lib/siteConfig";

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

export async function GET(_request, { params }) {
  const awaitedParams = await params;
  const id = awaitedParams?.id;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const item =
      (await prisma.ministry.findUnique({ where: { id } })) ||
      (await prisma.ministry.findUnique({ where: { slug: id } }));

    if (!item || !item.isPublished) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item: normalizeMinistry(item) });
  } catch {
    const fallback = (SITE.ministries || []).find((m) => m.slug === id);
    if (!fallback) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, item: normalizeMinistry({ ...fallback, id: fallback.slug }) });
  }
}
