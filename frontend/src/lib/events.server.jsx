import prisma from "@/lib/db";

export async function getUpcomingEvents({ limit = 3 } = {}) {
  if (!process.env.DATABASE_URL) return null;

  try {
    const now = new Date();
    const items = await prisma.event.findMany({
      where: {
        isPublished: true,
        startAt: { gte: new Date(now.getTime() - 6 * 60 * 60 * 1000) },
      },
      orderBy: { startAt: "asc" },
      take: limit,
    });
    return items;
  } catch {
    return null;
  }
}
