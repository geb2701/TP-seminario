import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UniversityType } from "@/lib/generated/prisma/enums";
import { normalize } from "@/lib/normalize";

type SortBy = "name" | "careers";
type SortDir = "asc" | "desc";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = (searchParams.get("search") ?? "").trim();
  const type = searchParams.get("type") ?? "";
  const sortByParam = searchParams.get("sortBy") ?? "name";
  const sortBy: SortBy = sortByParam === "careers" ? "careers" : "name";
  const sortDir: SortDir = searchParams.get("sortDir") === "desc" ? "desc" : "asc";

  const universities = await prisma.university.findMany({
    where: type ? { type: type as UniversityType } : {},
    include: {
      _count: { select: { careers: true } },
      ranking: { select: { rank: true, rankLabel: true } },
    },
    orderBy: { name: "asc" },
  });

  const normalizedSearch = normalize(search);
  const filtered = search
    ? universities.filter((u) => normalize(u.name).includes(normalizedSearch))
    : universities;

  const data = filtered.map((u) => {
    const { _count, ranking, ...rest } = u;
    return {
      ...rest,
      careerCount: _count.careers,
      qsRank: ranking?.rank ?? null,
      qsRankLabel: ranking?.rankLabel ?? null,
    };
  });

  const dirMultiplier = sortDir === "asc" ? 1 : -1;
  data.sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name, "es", { sensitivity: "base" }) * dirMultiplier;
    }
    // Las universidades sin carreras van siempre al final, sin importar la
    // dirección, para no confundirlas con el valor más bajo.
    const valueA = a.careerCount;
    const valueB = b.careerCount;
    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return 1;
    if (valueB == null) return -1;
    return (valueA - valueB) * dirMultiplier;
  });

  return NextResponse.json(data);
}
