import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Devuelve las provincias distintas donde hay universidades, ordenadas por
// cantidad de universidades (desc) y luego alfabéticamente. Se usa para armar
// las opciones de la pregunta de ubicación en el test vocacional.
export async function GET() {
  try {
    const universities = await prisma.university.findMany({
      select: { province: true },
    });

    const counts = new Map<string, number>();
    for (const { province } of universities) {
      counts.set(province, (counts.get(province) ?? 0) + 1);
    }

    const provinces = [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"))
      .map(([province]) => province);

    return NextResponse.json(provinces);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener las provincias" },
      { status: 500 }
    );
  }
}
