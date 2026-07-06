import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids") ?? "";
  const idList = ids.split(",").filter(Boolean);

  if (idList.length === 0) return NextResponse.json([]);

  const careers = await prisma.career.findMany({
    where: { id: { in: idList } },
    include: {
      university: { select: { id: true, name: true, city: true, province: true, type: true, reviews: { select: { rating: true } }, ranking: { select: { rank: true, rankLabel: true } } } },
      area: { select: { name: true } },
      reviews: { select: { rating: true } },
      studyPlans: {
        orderBy: { year: "asc" },
        select: {
          id: true,
          name: true,
          year: true,
          subjects: {
            orderBy: [{ semester: "asc" }, { name: "asc" }],
            select: { id: true, name: true, semester: true },
          },
        },
      },
    },
  });

  const data = careers.map((c) => {
    const { reviews, university, ...rest } = c;
    const { reviews: uReviews, ranking, ...uRest } = university;
    const rating =
      reviews.length > 0
        ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
        : null;
    const universityRating =
      uReviews.length > 0
        ? Math.round((uReviews.reduce((s, r) => s + r.rating, 0) / uReviews.length) * 10) / 10
        : null;
    return {
      ...rest,
      university: {
        ...uRest,
        rating: universityRating,
        qsRank: ranking?.rank ?? null,
        qsRankLabel: ranking?.rankLabel ?? null,
      },
      rating,
      reviewCount: reviews.length,
    };
  });

  return NextResponse.json(data);
}
