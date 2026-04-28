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

const MinistrySchema = z.object({
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

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const items = await prisma.ministry.findMany({
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });
    return NextResponse.json({ ok: true, items: items.map(normalizeMinistry) });
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
  const parsed = MinistrySchema.safeParse(json);
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
    const created = await prisma.ministry.create({
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
    return NextResponse.json({ ok: true, item: normalizeMinistry(created) });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Database error" },
      { status: 500 },
    );
  }
}

