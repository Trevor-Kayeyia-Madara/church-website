import { NextResponse } from "next/server";
import { z } from "zod";
import { SITE as DEFAULT_SITE } from "@/lib/siteConfig";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.dcutawala.org";

function getAdminToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "");
  }
  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(/admin_token=([^;]+)/);
  return match ? match[1] : null;
}

async function fetchBackend(path: string, options: RequestInit = {}, request?: Request) {
  const token = getAdminToken(request!) || (options.headers as any)?.["Authorization"]?.replace("Bearer ", "");
  
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  return res;
}

// Schemas for frontend validation (optional - backend also validates)
const RelativeOrUrlSchema = z
  .string()
  .max(500)
  .refine((v) => v === "" || v.startsWith("/") || (() => {
    try { new URL(v); return true; } catch { return false; }
  })(), { message: "Must be a relative path or URL" });

const ServiceTimeSchema = z.object({
  day: z.string().min(1).max(40),
  time: z.string().min(1).max(80),
  label: z.string().min(1).max(80),
});

const SchoolProgramSchema = z.object({
  key: z.string().max(80).optional().or(z.literal("")),
  title: z.string().min(1).max(120),
  subtitle: z.string().min(1).max(160),
  offers: z.array(z.string().min(1).max(80)).max(20),
});

const SchoolSchema = z.object({
  name: z.string().min(2).max(160),
  tagline: z.string().min(2).max(500),
  heroTitle: z.string().min(2).max(160),
  heroSubtitle: z.string().min(2).max(600),
  programs: z.array(SchoolProgramSchema).min(1).max(12),
  cta: z.object({
    title: z.string().min(2).max(160),
    body: z.string().min(2).max(600),
    primaryLabel: z.string().min(2).max(60),
    primaryHref: RelativeOrUrlSchema,
    secondaryLabel: z.string().min(2).max(60),
    secondaryHref: RelativeOrUrlSchema,
  }).optional(),
});

const GivingTypeSchema = z.object({
  key: z.string().max(80).optional().or(z.literal("")),
  title: z.string().min(2).max(120),
  description: z.string().min(2).max(600),
  verse: z.string().min(2).max(300).optional().or(z.literal("")),
});

const PaymentMethodSchema = z.object({
  key: z.string().max(80).optional().or(z.literal("")),
  title: z.string().min(2).max(120),
  lines: z.array(z.string().min(1).max(120)).max(10),
});

const GivingSchema = z.object({
  title: z.string().min(2).max(120),
  headline: z.string().min(2).max(160),
  body: z.string().min(2).max(800),
  types: z.array(GivingTypeSchema).min(1).max(20),
  paymentMethods: z.array(PaymentMethodSchema).min(1).max(20),
});

const SettingsSchema = z.object({
  siteName: z.string().min(2).max(160),
  shortName: z.string().min(2).max(60),
  tagline: z.string().min(2).max(160),
  location: z.string().min(2).max(200),
  logoUrl: z.string().max(500).optional().or(z.literal("")),
  addressLine1: z.string().max(200).optional().or(z.literal("")),
  addressLine2: z.string().max(200).optional().or(z.literal("")),
  phoneDisplay: z.string().max(40).optional().or(z.literal("")),
  phoneTel: z.string().max(40).optional().or(z.literal("")),
  email: z.string().email().max(200).optional().or(z.literal("")),
  youtubeUrl: z.string().url().max(500).optional().or(z.literal("")),
  facebookUrl: z.string().url().max(500).optional().or(z.literal("")),
  instagramUrl: z.string().url().max(500).optional().or(z.literal("")),
  tiktokUrl: z.string().url().max(500).optional().or(z.literal("")),
  linktreeUrl: z.string().url().max(500).optional().or(z.literal("")),
  liveEmbedUrl: z.string().url().max(500).optional().or(z.literal("")),
  serviceTimes: z.array(ServiceTimeSchema).optional(),
  school: SchoolSchema.optional(),
  giving: GivingSchema.optional(),
});

function normalizeRow(row) {
  if (!row) {
    return {
      siteName: DEFAULT_SITE.name,
      shortName: DEFAULT_SITE.shortName,
      tagline: DEFAULT_SITE.tagline,
      location: DEFAULT_SITE.location,
      logoUrl: DEFAULT_SITE.logoUrl || "",
      addressLine1: DEFAULT_SITE.contact.addressLine1,
      addressLine2: DEFAULT_SITE.contact.addressLine2,
      phoneDisplay: DEFAULT_SITE.contact.phoneDisplay,
      phoneTel: DEFAULT_SITE.contact.phoneTel,
      email: DEFAULT_SITE.contact.email,
      youtubeUrl: DEFAULT_SITE.social.youtube,
      facebookUrl: DEFAULT_SITE.social.facebook,
      instagramUrl: DEFAULT_SITE.social.instagram,
      tiktokUrl: DEFAULT_SITE.social.tiktok || "",
      linktreeUrl: DEFAULT_SITE.social.linktree || "",
      liveEmbedUrl: DEFAULT_SITE.liveEmbedUrl || "",
      serviceTimes: DEFAULT_SITE.serviceTimes || [],
      school: DEFAULT_SITE.school || null,
      giving: DEFAULT_SITE.giving || null,
    };
  }

  return {
    siteName: row.siteName,
    shortName: row.shortName,
    tagline: row.tagline,
    location: row.location,
    logoUrl: row.logoUrl || "",
    addressLine1: row.addressLine1 || "",
    addressLine2: row.addressLine2 || "",
    phoneDisplay: row.phoneDisplay || "",
    phoneTel: row.phoneTel || "",
    email: row.email || "",
    youtubeUrl: row.youtubeUrl || "",
    facebookUrl: row.facebookUrl || "",
    instagramUrl: row.instagramUrl || "",
    tiktokUrl: row.tiktokUrl || "",
    linktreeUrl: row.linktreeUrl || "",
    liveEmbedUrl: row.liveEmbedUrl || "",
    serviceTimes: row.serviceTimes || DEFAULT_SITE.serviceTimes || [],
    school: row.school || DEFAULT_SITE.school || null,
    giving: row.giving || DEFAULT_SITE.giving || null,
  };
}

export async function GET() {
  const res = await fetchBackend("/api/admin/settings");
  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  
  const settings = data.settings ? normalizeRow(data.settings) : normalizeRow(null);
  return NextResponse.json({ ok: true, settings });
}

export async function PUT(request: Request) {
  const token = getAdminToken(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = SettingsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const res = await fetchBackend("/api/admin/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  const responseData = await res.json();
  
  if (res.ok) {
    // Normalize returned settings
    const settings = responseData.settings ? normalizeRow(responseData.settings) : normalizeRow(null);
    return NextResponse.json({ ok: true, settings });
  }
  
  return NextResponse.json(responseData, { status: res.status });
}
