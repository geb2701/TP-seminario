import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
            reviews: { select: { rating: true } },
          },
          orderBy: { name: "asc" },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          select: { id: true, rating: true, content: true, authorName: true, createdAt: true },
        },
      },
    });

    if (!university) {
      return NextResponse.json(
        { error: "Universidad no encontrada" },
        { status: 404 }
      );
    }

    // Agrupar carreras por área
    const careersByArea = university.careers.reduce(
      (acc, career) => {
        const areaName = career.area?.name || "Sin clasificar";
        if (!acc[areaName]) {
          acc[areaName] = [];
        }
        
        // Calcular rating promedio de la carrera
        const rating =
          career.reviews.length > 0
            ? Math.round(
                (career.reviews.reduce((s, r) => s + r.rating, 0) /
                  career.reviews.length) *
                  10
              ) / 10
            : null;

        acc[areaName].push({
          id: career.id,
          name: career.name,
          modality: career.modality,
          durationYears: career.durationYears,
          studentCount: career.studentCount,
          rating,
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
          studentCount: number;
          rating: number | null;
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
        reviews: university.reviews,
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
