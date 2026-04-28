import { NextResponse } from "next/server";
import prisma from "@/lib/db";

function safeInt(value, fallback) {
  const n = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(safeInt(searchParams.get("limit"), 3), 50);
  const upcoming = (searchParams.get("upcoming") || "true").toLowerCase() !== "false";

  try {
    const now = new Date();
    const items = await prisma.event.findMany({
      where: {
        isPublished: true,
        ...(upcoming
          ? { startAt: { gte: new Date(now.getTime() - 6 * 60 * 60 * 1000) } }
          : {}),
      },
      orderBy: { startAt: upcoming ? "asc" : "desc" },
      take: limit,
    });

    return NextResponse.json({ ok: true, items: items.map(normalizeEvent) });
  } catch (e) {
    return NextResponse.json(
      { ok: true, items: [], error: e?.message || undefined },
      { status: 200 },
    );
  }
}

