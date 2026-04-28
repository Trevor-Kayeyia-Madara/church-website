import { NextResponse } from "next/server";
import prisma from "@/lib/db";

function safeInt(value, fallback) {
  const n = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function normalizePastor(p) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    roleTitle: p.roleTitle || null,
    bio: p.bio || null,
    photoUrl: p.photoUrl || null,
    sortOrder: p.sortOrder ?? 0,
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(safeInt(searchParams.get("limit"), 8), 50);

  try {
    const items = await prisma.pastor.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: limit,
    });
    return NextResponse.json({ ok: true, items: items.map(normalizePastor) });
  } catch (e) {
    return NextResponse.json(
      { ok: true, items: [], error: e?.message || undefined },
      { status: 200 },
    );
  }
}

