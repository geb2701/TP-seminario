import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deriveQsSubject } from "@/lib/qs-subjects";

export async function GET(req: NextRequest) {
  try {
    const ids = req.nextUrl.searchParams.get("ids") ?? "";
    const idList = ids.split(",").filter(Boolean);

    if (idList.length === 0) return NextResponse.json([]);

    const careers = await prisma.career.findMany({
      where: { id: { in: idList } },
      include: {
        university: { select: { id: true, name: true, city: true, province: true, type: true, ranking: { select: { rank: true, rankLabel: true } }, subjectRankings: { select: { subject: true, rankLabel: true } } } },
        area: { select: { name: true } },
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
        reviews: { select: { rating: true } },
      },
    });

    const data = careers.map((c) => {
      const { university, reviews, ...rest } = c;
      const { ranking, subjectRankings, ...uRest } = university;
      const subject = deriveQsSubject(c.area.name, c.name);
      const subjectMatch = subject ? subjectRankings.find((s) => s.subject === subject) : undefined;
      return {
        ...rest,
        university: {
          ...uRest,
          qsRank: ranking?.rank ?? null,
          qsRankLabel: ranking?.rankLabel ?? null,
        },
        recommended: !!subjectMatch,
        recommendedRankLabel: subjectMatch?.rankLabel ?? null,
        avgRating: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null,
        reviewCount: reviews.length,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al comparar carreras" },
      { status: 500 }
    );
  }
}
