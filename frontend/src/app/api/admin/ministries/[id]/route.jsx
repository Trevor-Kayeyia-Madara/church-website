import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { getAdminSession } from "@/lib/adminAuth.server";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function isValidUrl(value) {
  try {
    // eslint-disable-next-line no-new
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

const UrlOrPath = z
  .string()
  .max(2048)
  .optional()
  .or(z.literal(""))
  .refine((v) => v === "" || v.startsWith("/") || isValidUrl(v), {
    message: "Invalid URL",
  });

const MinistryUpdateSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(5000).optional().or(z.literal("")),
  highlights: z.array(z.string().min(1).max(80)).max(20).optional(),
  imageUrl: UrlOrPath,
  sortOrder: z.number().int().min(0).max(10_000).optional(),
  isPublished: z.boolean().optional(),
  slug: z.string().max(191).optional().or(z.literal("")),
});

function normalizeMinistry(m) {
  return {
    id: m.id,
    slug: m.slug,
    title: m.title,
    description: m.description || null,
    highlights: Array.isArray(m.highlights) ? m.highlights : [],
    imageUrl: m.imageUrl || null,
    sortOrder: m.sortOrder ?? 0,
    isPublished: !!m.isPublished,
    createdAt: m.createdAt?.toISOString?.() || m.createdAt,
    updatedAt: m.updatedAt?.toISOString?.() || m.updatedAt,
  };
}

export async function GET(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const awaitedParams = await params;
  const id = String(awaitedParams?.id || "");
  try {
    const item = await prisma.ministry.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, item: normalizeMinistry(item) });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Database error" },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const awaitedParams = await params;
  const id = String(awaitedParams?.id || "");
  const json = await request.json().catch(() => null);
  const parsed = MinistryUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const slug = data.slug ? slugify(data.slug) : slugify(data.title);
  if (!slug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  try {
    const updated = await prisma.ministry.update({
      where: { id },
      data: {
        slug,
        title: data.title,
        description: data.description || null,
        highlights: data.highlights || [],
        imageUrl: data.imageUrl || null,
        sortOrder: data.sortOrder ?? 0,
        isPublished: data.isPublished ?? true,
      },
    });
    return NextResponse.json({ ok: true, item: normalizeMinistry(updated) });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Database error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const awaitedParams = await params;
  const id = String(awaitedParams?.id || "");
  try {
    await prisma.ministry.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Database error" },
      { status: 500 },
    );
  }
}
