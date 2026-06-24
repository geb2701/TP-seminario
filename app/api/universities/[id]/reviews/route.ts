import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { rating, content, authorName } = body as {
    rating: number;
    content: string;
    authorName?: string;
  };

  if (!content?.trim()) {
    return NextResponse.json(
      { error: "El contenido de la reseña es requerido" },
      { status: 400 }
    );
  }

  if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return NextResponse.json(
      { error: "El puntaje debe ser un número entero entre 1 y 5" },
      { status: 400 }
    );
  }

  const university = await prisma.university.findUnique({ where: { id } });
  if (!university) {
    return NextResponse.json({ error: "Universidad no encontrada" }, { status: 404 });
  }

  const review = await prisma.universityReview.create({
    data: {
      rating,
      content: content.trim(),
      authorName: authorName?.trim() || null,
      universityId: id,
    },
  });

  return NextResponse.json(review, { status: 201 });
}
