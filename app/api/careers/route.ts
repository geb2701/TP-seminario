import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Modality } from "@/lib/generated/prisma/enums";
import { deriveQsSubject } from "@/lib/qs-subjects";

export async function GET(req: NextRequest) {
  try {
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
        university: {
          select: {
            id: true, name: true, city: true, province: true, type: true,
            ranking: { select: { rank: true, rankLabel: true } },
            subjectRankings: { select: { subject: true, rankLabel: true } },
          },
        },
        area: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });

    const normalized = (s: string) =>
      s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

    const filtered = search
      ? careers.filter((c) => normalized(c.name).includes(normalized(search)))
      : careers;

    const data = filtered.map((c) => {
      const { university, ...rest } = c;
      const { ranking, subjectRankings, ...uRest } = university;
      // "Recomendada": la universidad figura en el ranking QS de la gran área a la
      // que pertenece esta carrera (ver lib/qs-subjects.ts).
      const subject = deriveQsSubject(c.area.name, c.name);
      const subjectMatch = subject ? subjectRankings.find((s) => s.subject === subject) : undefined;
      return {
        ...rest,
        recommended: !!subjectMatch,
        recommendedRankLabel: subjectMatch?.rankLabel ?? null,
        university: {
          ...uRest,
          qsRank: ranking?.rank ?? null,
          qsRankLabel: ranking?.rankLabel ?? null,
        },
      };
    });

    const total = data.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const paged = data.slice((page - 1) * pageSize, page * pageSize);

    return NextResponse.json({
      data: paged,
      pagination: { page, pageSize, total, totalPages },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener las carreras" },
      { status: 500 }
    );
  }
}
