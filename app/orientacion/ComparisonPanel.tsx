"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MetricBarChart } from "@/components/metric-bar-chart"
import { AREA_EMOJIS, getCareerAffinity } from "./constants"
import { PrestigeBadge, isPrestigious } from "@/components/prestige-badge"
import { RecommendedBadge, isRecommended } from "@/components/recommended-badge"

export type CompareCareer = {
  id: string
  name: string
  durationYears: number
  degreeTitle: string
  modality: "PRESENCIAL" | "HIBRIDO" | "ONLINE"
  description: string | null
  university: { name: string; city: string; province: string; type: string; qsRank: number | null; qsRankLabel: string | null }
  area: { name: string }
  recommended: boolean
  recommendedRankLabel: string | null
  avgRating: number | null
  reviewCount: number
  studyPlans: {
    id: string
    year: number
    subjects: { id: string; name: string; semester: number | null }[]
  }[]
}

const MODALITY_LABEL: Record<string, string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
  ONLINE: "Online",
}

function shortName(name: string) {
  return name.length > 18 ? name.substring(0, 16) + "…" : name
}

export function ComparisonPanel({
  data,
  isLoading,
  careerScores,
  selectedIds,
}: {
  data: CompareCareer[] | undefined
  isLoading: boolean
  careerScores: Record<string, number>
  selectedIds: string[]
}) {
  const allYears = useMemo(() => {
    if (!data) return []
    const years = new Set<number>()
    data.forEach((c) => c.studyPlans.forEach((p) => years.add(p.year)))
    return Array.from(years).sort((a, b) => a - b)
  }, [data])

  const durationData = data?.map((c) => ({ name: c.name, shortName: shortName(c.name), value: c.durationYears })) ?? []

  const ratingData = data?.map((c) => ({
    name: c.name,
    shortName: shortName(c.name),
    value: c.avgRating,
    displayValue: c.reviewCount > 0
      ? `${c.avgRating!.toFixed(1)} ★ (${c.reviewCount} reseña${c.reviewCount !== 1 ? "s" : ""})`
      : "Sin reseñas",
  })) ?? []
  const hasRatings = ratingData.some((d) => d.value !== null)

  // El ranking QS es "menor = mejor": graficamos un puntaje invertido (1500 -
  // rank) para que la barra más alta sea la universidad mejor posicionada.
  // 1500 cubre el rango QS observado ("1401+" es el techo real).
  const REFERENCE_MAX_RANK = 1500
  const prestigeData = data?.map((c) => ({
    name: c.name,
    shortName: shortName(c.name),
    value: c.university.qsRank !== null ? Math.max(REFERENCE_MAX_RANK - c.university.qsRank, 0) : null,
    displayValue: c.university.qsRank !== null
      ? `#${c.university.qsRankLabel ?? c.university.qsRank}`
      : "Sin ranking",
  })) ?? []
  const hasRanking = prestigeData.some((d) => d.value !== null)

  const rows: { label: string; render: (c: CompareCareer) => React.ReactNode }[] = [
    { label: "Afinidad", render: (c) => {
      const score = getCareerAffinity(careerScores, c.name)
      return score > 0
        ? <span className="font-semibold text-primary">{score}%</span>
        : <span className="text-muted-foreground">—</span>
    }},
    {
      label: "Universidad",
      render: (c) => (
        <span className="inline-flex items-center gap-1.5 flex-wrap justify-center">
          {c.university.name}
          {isPrestigious(c.university.qsRank) && <PrestigeBadge rankLabel={c.university.qsRankLabel} />}
        </span>
      ),
    },
    { label: "Localidad",          render: (c) => `${c.university.city}, ${c.university.province}` },
    { label: "Tipo de institución", render: (c) => c.university.type === "PUBLIC" ? "Pública" : "Privada" },
    { label: "Área",               render: (c) => `${AREA_EMOJIS[c.area.name] ?? ""} ${c.area.name}` },
    { label: "Título otorgado",    render: (c) => c.degreeTitle },
    { label: "Duración",           render: (c) => `${c.durationYears} años` },
    { label: "Modalidad",          render: (c) => <Badge variant="outline">{MODALITY_LABEL[c.modality]}</Badge> },
    {
      label: "Recomendada",
      render: (c) => isRecommended(c.recommended) ? <RecommendedBadge rankLabel={c.recommendedRankLabel} /> : "—",
    },
  ]

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <section className="overflow-x-auto rounded-lg border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="text-left py-3 px-4 font-semibold sticky left-0 bg-muted/40 w-40">
                Característica
              </th>
              {isLoading
                ? selectedIds.map((id) => (
                  <th key={id} className="py-3 px-4 min-w-[200px]">
                    <Skeleton className="h-5 w-3/4" />
                  </th>
                ))
                : data?.map((career) => (
                  <th key={career.id} className="text-left py-3 px-4 min-w-[200px]">
                    <p className="font-semibold">{career.name}</p>
                    <p className="text-xs font-normal text-muted-foreground mt-0.5">
                      {career.university.name}
                    </p>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b last:border-0 hover:bg-muted/20">
                <td className="py-3 px-4 font-medium sticky left-0 bg-background text-muted-foreground">
                  {row.label}
                </td>
                {isLoading
                  ? selectedIds.map((id) => (
                    <td key={id} className="py-3 px-4"><Skeleton className="h-4 w-3/4" /></td>
                  ))
                  : data?.map((career) => (
                    <td key={career.id} className="py-3 px-4">{row.render(career)}</td>
                  ))}
              </tr>
            ))}

            {!isLoading && allYears.length > 0 && (
              <>
                <tr className="border-b bg-muted/40">
                  <td colSpan={(data?.length ?? 0) + 1} className="py-2 px-4 text-sm font-semibold">
                    Plan de estudios
                  </td>
                </tr>
                {allYears.map((year) => (
                  <tr key={`year-${year}`} className="border-b last:border-0 hover:bg-muted/20 align-top">
                    <td className="py-3 px-4 font-medium sticky left-0 bg-background text-muted-foreground whitespace-nowrap">
                      {year}° año
                    </td>
                    {data?.map((career) => {
                      const plan = career.studyPlans.find((p) => p.year === year)
                      return (
                        <td key={career.id} className="py-3 px-4 align-top">
                          {plan ? (
                            plan.subjects.length > 0 ? (
                              <ul className="space-y-1">
                                {plan.subjects.map((s) => (
                                  <li key={s.id} className="text-sm">{s.name}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-sm text-muted-foreground">Sin materias cargadas</span>
                            )
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </section>

      {!isLoading && data && data.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-base font-semibold">Métricas comparativas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricBarChart
              title="Duración (años)"
              data={durationData}
              formatter={(v) => `${v} año${v !== 1 ? "s" : ""}`}
              tickFormatter={(v) => String(v)}
              domain={[0, 7]}
            />
            {hasRatings && (
              <MetricBarChart
                title="Calificación promedio"
                data={ratingData}
                formatter={(v) => `${v.toFixed(1)} ★`}
                tickFormatter={(v) => String(v)}
                domain={[0, 5]}
              />
            )}
            {hasRanking && (
              <MetricBarChart
                title="Prestigio (ranking QS)"
                caption="Más alto = mejor posición en el ranking QS mundial"
                data={prestigeData}
                tickFormatter={() => ""}
              />
            )}
          </div>
        </section>
      )}
    </div>
  )
}
