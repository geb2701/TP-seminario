import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(
    posts.map((p) => ({ ...p, tags: JSON.parse(p.tags) as string[] }))
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { content, authorName, authorRole, tags } = body as {
    content: string;
    authorName: string;
    authorRole?: string;
    tags?: string[];
  };

  if (!content?.trim() || !authorName?.trim()) {
    return NextResponse.json(
      { error: "content y authorName son requeridos" },
      { status: 400 }
    );
  }

  const post = await prisma.post.create({
    data: {
      content: content.trim(),
      authorName: authorName.trim(),
      authorRole: authorRole?.trim() ?? null,
      tags: JSON.stringify(tags ?? []),
    },
  });

  return NextResponse.json(
    { ...post, tags: JSON.parse(post.tags) as string[] },
    { status: 201 }
  );
}
