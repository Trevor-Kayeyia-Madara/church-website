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

function sermonSlug({ title, date }) {
  const d = date instanceof Date ? date : new Date(date);
  const yyyyMmDd = Number.isFinite(d.getTime()) ? d.toISOString().slice(0, 10) : null;
  const base = slugify(title) || "sermon";
  return yyyyMmDd ? `${base}-${yyyyMmDd}` : base;
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

const SermonSchema = z.object({
  title: z.string().min(2).max(255),
  description: z.string().max(5000).optional().or(z.literal("")),
  speaker: z.string().max(255).optional().or(z.literal("")),
  date: z.string().datetime(),
  durationMinutes: z.number().int().min(1).max(24 * 60).optional(),
  thumbnailUrl: UrlOrPath,
  videoUrl: z.string().url().max(2048).optional().or(z.literal("")),
  categorySlug: z.string().max(191).optional().or(z.literal("")),
  categoryName: z.string().max(255).optional().or(z.literal("")),
  slug: z.string().max(191).optional().or(z.literal("")),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [items, categories] = await Promise.all([
      prisma.sermon.findMany({
        orderBy: { date: "desc" },
        include: { category: true },
      }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
    ]);
    return NextResponse.json({ ok: true, items, categories });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Database error" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = SermonSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const date = new Date(data.date);
  const slug = data.slug ? slugify(data.slug) : sermonSlug({ title: data.title, date });

  let categoryId = null;
  const categorySlug = data.categorySlug ? slugify(data.categorySlug) : "";
  const categoryName = String(data.categoryName || "").trim();

  if (categorySlug) {
    try {
      const category = await prisma.category.upsert({
        where: { slug: categorySlug },
        update: { ...(categoryName ? { name: categoryName } : {}) },
        create: { slug: categorySlug, name: categoryName || categorySlug },
      });
      categoryId = category.id;
    } catch {
      categoryId = null;
    }
  }

  try {
    const created = await prisma.sermon.create({
      data: {
        slug,
        title: data.title,
        description: data.description || null,
        speaker: data.speaker || null,
        date,
        durationMinutes: data.durationMinutes ?? null,
        thumbnailUrl: data.thumbnailUrl || null,
        videoUrl: data.videoUrl || null,
        categoryId,
      },
    });
    return NextResponse.json({ ok: true, item: created });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Database error" },
      { status: 500 },
    );
  }
}
