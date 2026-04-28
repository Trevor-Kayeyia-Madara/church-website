import { NextResponse } from "next/server";
import prisma from "@/lib/db";

function normalizeEvent(e) {
  return {
    id: e.id,
    slug: e.slug,
    title: e.title,
    description: e.description || null,
    location: e.location || null,
    posterUrl: e.posterUrl || null,
    startAt: typeof e.startAt === "string" ? e.startAt : e.startAt.toISOString(),
    endAt: e.endAt ? (typeof e.endAt === "string" ? e.endAt : e.endAt.toISOString()) : null,
    isPublished: !!e.isPublished,
  };
}

export async function GET(_request, { params }) {
  const awaitedParams = await params;
  const id = awaitedParams?.id;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const item =
      (await prisma.event.findUnique({ where: { id } })) ||
      (await prisma.event.findUnique({ where: { slug: id } }));

    if (!item || !item.isPublished) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item: normalizeEvent(item) });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Database error" },
      { status: 500 },
    );
  }
}
