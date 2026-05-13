import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const post = await prisma.post.update({
    where: { id },
    data: { likes: { increment: 1 } },
  });

  return NextResponse.json({ likes: post.likes });
}
