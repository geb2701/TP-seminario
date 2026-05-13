import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids") ?? "";
  const idList = ids.split(",").filter(Boolean);

  if (idList.length === 0) return NextResponse.json([]);

  const careers = await prisma.career.findMany({
    where: { id: { in: idList } },
    include: {
      university: { select: { name: true, city: true, province: true, type: true } },
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
    const { reviews, ...rest } = c;
    const rating =
      reviews.length > 0
        ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
        : null;
    return { ...rest, rating, reviewCount: reviews.length };
  });

  return NextResponse.json(data);
}
