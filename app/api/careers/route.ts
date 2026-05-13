import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Modality } from "@/lib/generated/prisma/enums";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const modality = searchParams.get("modality") ?? "";
  const areaId = searchParams.get("areaId") ?? "";
  const universityId = searchParams.get("universityId") ?? "";

  const careers = await prisma.career.findMany({
    where: {
      AND: [
        modality ? { modality: modality as Modality } : {},
        areaId ? { areaId } : {},
        universityId ? { universityId } : {},
      ],
    },
    include: {
      university: { select: { name: true, city: true, province: true } },
      area: { select: { id: true, name: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: { studentCount: "desc" },
  });

  const normalized = (s: string) =>
    s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  const filtered = search
    ? careers.filter((c) => normalized(c.name).includes(normalized(search)))
    : careers;

  const data = filtered.map((c) => {
    const { reviews, ...rest } = c;
    const rating =
      reviews.length > 0
        ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
        : null;
    return { ...rest, rating };
  });

  return NextResponse.json(data);
}
