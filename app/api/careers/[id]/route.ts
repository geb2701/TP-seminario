import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deriveQsSubject } from "@/lib/qs-subjects";

// Endpoint: GET /api/careers/:id
// Devuelve el detalle completo de una carrera para la vista individual.
// Incluye relaciones (universidad, area, plan) y agrega métricas derivadas.
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
          ranking: { select: { rank: true, rankLabel: true } },
          subjectRankings: { select: { subject: true, rankLabel: true } },
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
    },
  });

  if (!career) {
    return NextResponse.json({ error: "Carrera no encontrada" }, { status: 404 });
  }

  const { university, ...careerRest } = career;
  const { ranking, subjectRankings, _count, ...universityRest } = university;

  const subject = deriveQsSubject(career.area.name, career.name);
  const subjectMatch = subject ? subjectRankings.find((s) => s.subject === subject) : undefined;

  return NextResponse.json({
    ...careerRest,
    recommended: !!subjectMatch,
    recommendedRankLabel: subjectMatch?.rankLabel ?? null,
    university: {
      ...universityRest,
      careerCount: _count.careers,
      qsRank: ranking?.rank ?? null,
      qsRankLabel: ranking?.rankLabel ?? null,
    },
  });
}