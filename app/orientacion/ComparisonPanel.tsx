"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts"
import { AREA_EMOJIS, getCareerAffinity } from "./constants"

export type CompareCareer = {
  id: string
  name: string
  durationYears: number
  degreeTitle: string
  modality: "PRESENCIAL" | "HIBRIDO" | "ONLINE"
  description: string | null
  university: { name: string; city: string; province: string; type: string; rating: number | null; qsRank: number | null; qsRankLabel: string | null }
  area: { name: string }
  rating: number | null
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

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"]

function shortName(name: string) {
  return name.length > 18 ? name.substring(0, 16) + "…" : name
}

function MetricBarChart({
  title,
  data,
  formatter,
  tickFormatter,
  domain,
}: {
  title: string
  data: { name: string; shortName: string; value: number | null }[]
  formatter?: (v: number) => string
  tickFormatter?: (v: number) => string
  domain?: [number, number]
}) {
  const chartConfig = Object.fromEntries(
    data.map((d, i) => [d.shortName, { label: d.name, color: CHART_COLORS[i] }])
  )
  const chartData = data.map((d) => ({ name: d.shortName, value: d.value ?? 0 }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[180px] w-full [aspect-ratio:auto]">
          <BarChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              domain={domain}
              tickFormatter={tickFormatter ?? formatter}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatter ? formatter(Number(value)) : String(value)}
                />
              }
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="mt-3 space-y-1">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-sm shrink-0" style={{ backgroundColor: CHART_COLORS[i] }} />
              <span className="truncate">{d.name}</span>
              <span className="ml-auto font-medium text-foreground shrink-0">
                {d.value !== null ? (formatter ? formatter(d.value) : d.value) : "—"}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
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
  const ratingData   = data?.map((c) => ({ name: c.name, shortName: shortName(c.name), value: c.rating })) ?? []
  const subjectsData = data?.map((c) => ({
    name: c.name,
    shortName: shortName(c.name),
    value: c.studyPlans.reduce((sum, p) => sum + p.subjects.length, 0),
  })) ?? []

  const rows: { label: string; render: (c: CompareCareer) => React.ReactNode }[] = [
    { label: "Afinidad", render: (c) => {
      const score = getCareerAffinity(careerScores, c.name)
      return score > 0
        ? <span className="font-semibold text-primary">{score}%</span>
        : <span className="text-muted-foreground">—</span>
    }},
    { label: "Universidad",        render: (c) => c.university.name },
    { label: "Localidad",          render: (c) => `${c.university.city}, ${c.university.province}` },
    { label: "Tipo de institución", render: (c) => c.university.type === "PUBLIC" ? "Pública" : "Privada" },
    { label: "Área",               render: (c) => `${AREA_EMOJIS[c.area.name] ?? ""} ${c.area.name}` },
    { label: "Título otorgado",    render: (c) => c.degreeTitle },
    { label: "Duración",           render: (c) => `${c.durationYears} años` },
    { label: "Modalidad",          render: (c) => <Badge variant="outline">{MODALITY_LABEL[c.modality]}</Badge> },
    {
      label: "Calificación",
      render: (c) => c.rating !== null ? `⭐ ${c.rating} / 5.0 (${c.reviewCount} reseñas)` : "Sin reseñas",
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
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricBarChart
              title="Duración (años)"
              data={durationData}
              formatter={(v) => `${v} año${v !== 1 ? "s" : ""}`}
              tickFormatter={(v) => String(v)}
              domain={[0, 7]}
            />
            <MetricBarChart
              title="Cantidad de materias"
              data={subjectsData}
              formatter={(v) => `${v} materia${v !== 1 ? "s" : ""}`}
              tickFormatter={(v) => String(v)}
            />
            <MetricBarChart
              title="Calificación promedio"
              data={ratingData}
              formatter={(v) => `${v} / 5`}
              domain={[0, 5]}
            />
          </div>
        </section>
      )}
    </div>
  )
}
