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

  // Si el id no existe en la BD, responde 404 para que el frontend muestre "no encontrada".
  if (!career) {
    return NextResponse.json({ error: "Carrera no encontrada" }, { status: 404 });
  }

  // Métrica derivada para la UI:
  // - Si hay reseñas, calcula promedio de rating
  // - Redondea a 1 decimal (ej: 4.46 -> 4.5)
  // - Si no hay reseñas, queda null para mostrar "Sin reseñas"
  const rating =
    career.reviews.length > 0
      ? Math.round(
          (career.reviews.reduce((sum, review) => sum + review.rating, 0) /
            career.reviews.length) *
            10
        ) / 10
      : null;

  // Respuesta JSON final:
  // - `...career`: datos crudos traídos de Prisma (incluye relaciones)
  // - `rating`: promedio calculado
  // - `reviewCount`: total de reseñas, útil para tabs y labels
  return NextResponse.json({
    ...career,
    rating,
    reviewCount: career.reviews.length,
  });
}