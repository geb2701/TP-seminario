import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// TODO: esta ruta todavía no se llama desde ningún lado. El test vocacional
// guarda el perfil en localStorage (useVocationalProfile), no contra esta API.
// Conectar el flujo de guardado a estos endpoints o eliminarlos si no se usan.

export async function POST(req: NextRequest) {
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
}

export async function GET() {
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
}
