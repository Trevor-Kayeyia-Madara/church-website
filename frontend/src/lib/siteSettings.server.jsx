import prisma from "@/lib/db";
import { SITE as DEFAULT_SITE } from "@/lib/siteConfig";

function withFallback(value, fallback) {
  return value === null || value === undefined || value === "" ? fallback : value;
}

function withJsonFallback(value, fallback) {
  return value === null || value === undefined ? fallback : value;
}

export async function getSiteSettings() {
  if (!process.env.DATABASE_URL) return DEFAULT_SITE;

  try {
    const row = await prisma.siteSettings.findFirst({ orderBy: { id: "asc" } });
    if (!row) return DEFAULT_SITE;

    return {
      ...DEFAULT_SITE,
      name: withFallback(row.siteName, DEFAULT_SITE.name),
      shortName: withFallback(row.shortName, DEFAULT_SITE.shortName),
      tagline: withFallback(row.tagline, DEFAULT_SITE.tagline),
      location: withFallback(row.location, DEFAULT_SITE.location),
      logoUrl: withFallback(row.logoUrl, DEFAULT_SITE.logoUrl),
      liveEmbedUrl: withFallback(row.liveEmbedUrl, DEFAULT_SITE.liveEmbedUrl),
      serviceTimes: withJsonFallback(row.serviceTimes, DEFAULT_SITE.serviceTimes),
      school: withJsonFallback(row.school, DEFAULT_SITE.school),
      giving: withJsonFallback(row.giving, DEFAULT_SITE.giving),
      contact: {
        ...DEFAULT_SITE.contact,
        addressLine1: withFallback(row.addressLine1, DEFAULT_SITE.contact.addressLine1),
        addressLine2: withFallback(row.addressLine2, DEFAULT_SITE.contact.addressLine2),
        phoneDisplay: withFallback(row.phoneDisplay, DEFAULT_SITE.contact.phoneDisplay),
        phoneTel: withFallback(row.phoneTel, DEFAULT_SITE.contact.phoneTel),
        email: withFallback(row.email, DEFAULT_SITE.contact.email),
      },
      social: {
        ...DEFAULT_SITE.social,
        youtube: withFallback(row.youtubeUrl, DEFAULT_SITE.social.youtube),
        facebook: withFallback(row.facebookUrl, DEFAULT_SITE.social.facebook),
        instagram: withFallback(row.instagramUrl, DEFAULT_SITE.social.instagram),
        tiktok: withFallback(row.tiktokUrl, DEFAULT_SITE.social.tiktok),
        linktree: withFallback(row.linktreeUrl, DEFAULT_SITE.social.linktree),
      },
    };
  } catch {
    return DEFAULT_SITE;
  }
}
