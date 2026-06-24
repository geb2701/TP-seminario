import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Modality } from "@/lib/generated/prisma/enums";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const modality = searchParams.get("modality") ?? "";
  const areaId = searchParams.get("areaId") ?? "";
  const universityId = searchParams.get("universityId") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.max(1, Number(searchParams.get("pageSize")) || 20);

  const careers = await prisma.career.findMany({
    where: {
      AND: [
        modality ? { modality: modality as Modality } : {},
        areaId ? { areaId } : {},
        universityId ? { universityId } : {},
      ],
    },
    include: {
      university: { select: { id: true, name: true, city: true, province: true, type: true } },
      area: { select: { id: true, name: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: { name: "asc" },
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

  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paged = data.slice((page - 1) * pageSize, page * pageSize);

  return NextResponse.json({
    data: paged,
    pagination: { page, pageSize, total, totalPages },
  });
}
