import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { getAdminSession } from "@/lib/adminAuth.server";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

function extFromType(type) {
  const t = String(type || "").toLowerCase();
  if (t === "image/jpeg" || t === "image/jpg") return ".jpg";
  if (t === "image/png") return ".png";
  if (t === "image/webp") return ".webp";
  if (t === "image/gif") return ".gif";
  return null;
}

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const ext = extFromType(file.type);
  if (!ext) {
    return NextResponse.json(
      { error: "Unsupported image type. Use JPG/PNG/WebP/GIF." },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File too large (max 8MB)." },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
  const relDir = path.join("public", "uploads", "events");
  const absDir = path.join(process.cwd(), relDir);
  const absPath = path.join(absDir, fileName);

  await mkdir(absDir, { recursive: true });
  await writeFile(absPath, bytes);

  return NextResponse.json({ ok: true, url: `/uploads/events/${fileName}` });
}

