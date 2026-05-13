import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.length < 2) return NextResponse.json({ careers: [], universities: [] });

  const [careers, universities] = await Promise.all([
    prisma.career.findMany({
      include: { university: { select: { name: true } } },
      orderBy: { studentCount: "desc" },
    }),
    prisma.university.findMany({ orderBy: { name: "asc" } }),
  ]);

  const norm = normalize(q);

  return NextResponse.json({
    careers: careers
      .filter((c) => normalize(c.name).includes(norm))
      .slice(0, 5)
      .map(({ id, name, university }) => ({ id, name, universityName: university.name })),
    universities: universities
      .filter((u) => normalize(u.name).includes(norm))
      .slice(0, 5)
      .map(({ id, name, city, province }) => ({ id, name, city, province })),
  });
}
