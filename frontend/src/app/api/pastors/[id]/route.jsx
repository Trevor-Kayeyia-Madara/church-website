import { NextResponse } from "next/server";
import prisma from "@/lib/db";

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

export async function GET(_request, { params }) {
  const awaitedParams = await params;
  const id = awaitedParams?.id;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const item =
      (await prisma.pastor.findUnique({ where: { id } })) ||
      (await prisma.pastor.findUnique({ where: { slug: id } }));

    if (!item || !item.isPublished) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item: normalizePastor(item) });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Database error" },
      { status: 500 },
    );
  }
}
