import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { personName, scores, topArea } = body

    if (!scores || !topArea) {
      return NextResponse.json({ error: "scores y topArea son requeridos" }, { status: 400 })
    }

    const result = await prisma.vocationalResult.create({
      data: {
        personName: personName?.trim() || null,
        scores: JSON.stringify(scores),
        topArea,
      },
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Error al guardar el resultado" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const results = await prisma.vocationalResult.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json(
      results.map((r) => ({
        ...r,
        scores: JSON.parse(r.scores) as Record<string, number>,
      }))
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Error al obtener los resultados" },
      { status: 500 }
    )
  }
}
