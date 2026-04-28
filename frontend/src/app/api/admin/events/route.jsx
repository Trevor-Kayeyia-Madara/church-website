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

function eventSlug({ title, startAt }) {
  const d = startAt instanceof Date ? startAt : new Date(startAt);
  const date = Number.isFinite(d.getTime()) ? d.toISOString().slice(0, 10) : "event";
  const base = slugify(title) || "event";
  return `${base}-${date}`;
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

const EventSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().max(4000).optional().or(z.literal("")),
  location: z.string().max(200).optional().or(z.literal("")),
  posterUrl: UrlOrPath,
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional().or(z.literal("")),
  isPublished: z.boolean().optional(),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const items = await prisma.event.findMany({ orderBy: { startAt: "desc" } });
    return NextResponse.json({ ok: true, items });
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
  const parsed = EventSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const startAt = new Date(data.startAt);
  const endAt = data.endAt ? new Date(data.endAt) : null;
  const slug = eventSlug({ title: data.title, startAt });

  try {
    const created = await prisma.event.create({
      data: {
        slug,
        title: data.title,
        description: data.description || null,
        location: data.location || null,
        posterUrl: data.posterUrl || null,
        startAt,
        endAt,
        isPublished: data.isPublished ?? true,
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
