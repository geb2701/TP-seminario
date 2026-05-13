import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UniversityType } from "@/lib/generated/prisma/enums";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = (searchParams.get("search") ?? "").trim();
  const shortCodeSearch = search.toUpperCase();
  const type = searchParams.get("type") ?? "";

  const universities = await prisma.university.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search } },
                { shortCode: { equals: shortCodeSearch } },
                { shortCode: { startsWith: shortCodeSearch } },
              ],
            }
          : {},
        type ? { type: type as UniversityType } : {},
      ],
    },
    include: {
      _count: { select: { careers: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: { name: "asc" },
  });

  const data = universities.map((u) => {
    const { reviews, _count, ...rest } = u;
    const rating =
      reviews.length > 0
        ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
        : null;
    return { ...rest, careerCount: _count.careers, rating };
  });

  return NextResponse.json(data);
}
