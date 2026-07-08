import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deriveQsSubject } from "@/lib/qs-subjects";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Obtener la universidad y todas sus carreras con su área
    const university = await prisma.university.findUnique({
      where: { id },
      include: {
        careers: {
          include: {
            area: true,
          },
          orderBy: { name: "asc" },
        },
        ranking: { select: { rank: true, rankLabel: true } },
        subjectRankings: { select: { subject: true, rankLabel: true } },
      },
    });

    if (!university) {
      return NextResponse.json(
        { error: "Universidad no encontrada" },
        { status: 404 }
      );
    }

    // Set de grandes áreas QS en las que esta universidad está rankeada, para
    // marcar carreras "Recomendada" según la gran área de cada carrera.
    const rankedSubjects = new Map(
      university.subjectRankings.map((s) => [s.subject, s.rankLabel])
    );

    // Agrupar carreras por área
    const careersByArea = university.careers.reduce(
      (acc, career) => {
        const areaName = career.area?.name || "Sin clasificar";
        if (!acc[areaName]) {
          acc[areaName] = [];
        }

        const subject = deriveQsSubject(career.area?.name ?? "", career.name);
        const recommendedRankLabel = subject ? rankedSubjects.get(subject) ?? null : null;

        acc[areaName].push({
          id: career.id,
          name: career.name,
          modality: career.modality,
          durationYears: career.durationYears,
          recommended: recommendedRankLabel != null,
          recommendedRankLabel,
          areaId: career.areaId,
          areaName: career.area?.name || "Sin clasificar",
        });
        return acc;
      },
      {} as Record<
        string,
        Array<{
          id: string;
          name: string;
          modality: string;
          durationYears: number;
          recommended: boolean;
          recommendedRankLabel: string | null;
          areaId: string | null;
          areaName: string;
        }>
      >
    );

    return NextResponse.json({
      university: {
        id: university.id,
        name: university.name,
        city: university.city,
        province: university.province,
        type: university.type,
        website: university.website,
        foundedYear: university.foundedYear,
        description: university.description,
        logoUrl: university.logoUrl,
        qsRank: university.ranking?.rank ?? null,
        qsRankLabel: university.ranking?.rankLabel ?? null,
      },
      careersByArea,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener carreras de la universidad" },
      { status: 500 }
    );
  }
}
