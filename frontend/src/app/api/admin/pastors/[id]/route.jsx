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
  .max(500)
  .optional()
  .or(z.literal(""))
  .refine((v) => v === "" || v.startsWith("/") || isValidUrl(v), {
    message: "Invalid URL",
  });

const PastorUpdateSchema = z.object({
  name: z.string().min(2).max(120),
  roleTitle: z.string().max(120).optional().or(z.literal("")),
  bio: z.string().max(5000).optional().or(z.literal("")),
  photoUrl: UrlOrPath,
  sortOrder: z.number().int().min(0).max(10_000).optional(),
  isPublished: z.boolean().optional(),
});

export async function GET(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const awaitedParams = await params;
  const id = String(awaitedParams?.id || "");
  try {
    const item = await prisma.pastor.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, item });
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
  const parsed = PastorUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const slug = slugify(data.name) || `pastor-${Date.now()}`;

  try {
    const updated = await prisma.pastor.update({
      where: { id },
      data: {
        slug,
        name: data.name,
        roleTitle: data.roleTitle || null,
        bio: data.bio || null,
        photoUrl: data.photoUrl || null,
        sortOrder: data.sortOrder ?? 0,
        isPublished: data.isPublished ?? true,
      },
    });
    return NextResponse.json({ ok: true, item: updated });
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
    await prisma.pastor.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Database error" },
      { status: 500 },
    );
  }
}
