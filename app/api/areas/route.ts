import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const areas = await prisma.area.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(areas);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener las áreas" },
      { status: 500 }
    );
  }
}
