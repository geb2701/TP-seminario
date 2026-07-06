import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Endpoint: GET /api/careers/:id
// Devuelve el detalle completo de una carrera para la vista individual.
// Incluye relaciones (universidad, area, plan y reseñas) y agrega métricas derivadas.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // `id` viene del segmento dinámico de la ruta ([id]).
  // Ejemplo: /api/careers/cmox87ioq000iycb5ph611csf
  const { id } = await params;

  // Consulta principal en Prisma:
  // - Busca una carrera por id (findUnique)
  // - Incluye relaciones necesarias para evitar múltiples round-trips desde el frontend
  // - Ordena planes y materias para que la UI ya reciba datos listos para renderizar
  const career = await prisma.career.findUnique({
    where: { id },
    include: {
      // Universidad asociada a la carrera (campos puntuales para el header y bloque institucional)
      university: {
        select: {
          id: true,
          name: true,
          city: true,
          province: true,
          type: true,
          website: true,
          foundedYear: true,
          description: true,
          logoUrl: true,
          reviews: { select: { rating: true } },
          ranking: { select: { rank: true, rankLabel: true } },
          _count: { select: { careers: true } },
        },
      },

      // Área académica de la carrera (para badges/filtros)
      area: { select: { id: true, name: true } },

      // Planes de estudio de la carrera, ordenados por año ascendente
      studyPlans: {
        orderBy: { year: "asc" },
        include: {
          // Materias del plan, ordenadas por año/cuatrimestre/nombre para visualización estable
          subjects: {
            orderBy: [{ year: "asc" }, { semester: "asc" }, { name: "asc" }],
          },
        },
      },

      // Reseñas de la carrera, más nuevas primero
      reviews: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          rating: true,
          content: true,
          authorName: true,
          createdAt: true,
        },
      },
    },
  });

  if (!career) {
    return NextResponse.json({ error: "Carrera no encontrada" }, { status: 404 });
  }

  const { university, reviews: careerReviews, ...careerRest } = career;
  const { reviews: uniReviews, ranking, _count, ...universityRest } = university;

  const rating =
    careerReviews.length > 0
      ? Math.round(
          (careerReviews.reduce((sum, r) => sum + r.rating, 0) / careerReviews.length) * 10
        ) / 10
      : null;

  const universityRating =
    uniReviews.length > 0
      ? Math.round(
          (uniReviews.reduce((s, r) => s + r.rating, 0) / uniReviews.length) * 10
        ) / 10
      : null;

  return NextResponse.json({
    ...careerRest,
    rating,
    reviewCount: careerReviews.length,
    reviews: careerReviews,
    university: {
      ...universityRest,
      careerCount: _count.careers,
      rating: universityRating,
      reviewCount: uniReviews.length,
      qsRank: ranking?.rank ?? null,
      qsRankLabel: ranking?.rankLabel ?? null,
    },
  });
}