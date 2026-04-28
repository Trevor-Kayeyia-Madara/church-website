import prisma from "@/lib/db";

export async function getPastors({ limit = 8 } = {}) {
  if (!process.env.DATABASE_URL) return null;

  try {
    const items = await prisma.pastor.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: limit,
    });
    return items;
  } catch {
    return null;
  }
}

