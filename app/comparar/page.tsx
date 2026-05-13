"use client"

import { useMemo, useState } from "react"
import { useApiQuery, api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { X, Plus, Trash2, Search } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts"
import { useCompareCareers } from "@/hooks/use-compare-careers"

type CareerOption = {
  id: string
  name: string
  university: { name: string; city: string; province: string }
  area: { id: string; name: string }
}

type CareerDetail = CareerOption & {
  durationYears: number
  degreeTitle: string
  modality: "PRESENCIAL" | "HIBRIDO" | "ONLINE"
  studentCount: number
  description: string | null
  university: { name: string; city: string; province: string; type: string }
  area: { name: string }
  rating: number | null
  reviewCount: number
}

const MODALITY_LABEL: Record<string, string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
  ONLINE: "Online",
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
]

type MetricChartProps = {
  title: string
  data: { name: string; shortName: string; value: number | null }[]
  formatter?: (v: number) => string
  domain?: [number, number]
}

function MetricBarChart({ title, data, formatter, domain }: MetricChartProps) {
  const chartConfig = Object.fromEntries(
    data.map((d, i) => [d.shortName, { label: d.name, color: CHART_COLORS[i] }])
  )

  const chartData = data.map((d) => ({
    name: d.shortName,
    value: d.value ?? 0,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[180px] w-full [aspect-ratio:auto]">
          <BarChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              domain={domain}
              tickFormatter={formatter}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    formatter ? formatter(Number(value)) : String(value)
                  }
                />
              }
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="mt-3 space-y-1">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span
                className="h-2 w-2 rounded-sm shrink-0"
                style={{ backgroundColor: CHART_COLORS[i] }}
              />
              <span className="truncate">{d.name}</span>
              <span className="ml-auto font-medium text-foreground shrink-0">
                {d.value !== null
                  ? formatter
                    ? formatter(d.value)
                    : d.value
                  : "—"}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const MAX_CAREERS = 4

export default function ComparePage() {
  const { compareIds, isComparing, canAdd, add, remove: removeFromHook, clear } = useCompareCareers()

  const [searchQuery, setSearchQuery] = useState("")
  const [filterUniversity, setFilterUniversity] = useState("")
  const [filterArea, setFilterArea] = useState("")

  const selectedIds = compareIds

  const { data: allCareers } = useApiQuery<CareerOption[]>(["careers-list"], "careers")

  const { data: compared, isLoading } = useQuery<CareerDetail[]>({
    queryKey: ["compare", selectedIds],
    queryFn: () =>
      api.get(`careers/compare?ids=${selectedIds.join(",")}`).json<CareerDetail[]>(),
    enabled: selectedIds.length > 0,
  })

  const universities = useMemo(() => {
    if (!allCareers) return []
    const seen = new Set<string>()
    return allCareers
      .map((c) => c.university.name)
      .filter((name) => { if (seen.has(name)) return false; seen.add(name); return true })
      .sort((a, b) => a.localeCompare(b, "es"))
  }, [allCareers])

  const areas = useMemo(() => {
    if (!allCareers) return []
    const seen = new Set<string>()
    return allCareers
      .filter((c) => { if (seen.has(c.area.id)) return false; seen.add(c.area.id); return true })
      .map((c) => c.area)
      .sort((a, b) => a.name.localeCompare(b.name, "es"))
  }, [allCareers])

  const filteredCareers = useMemo(() => {
    if (!allCareers) return []
    const q = searchQuery.toLowerCase()
    return allCareers.filter((c) => {
      if (isComparing(c.id)) return false
      if (q && !c.name.toLowerCase().includes(q) && !c.university.name.toLowerCase().includes(q)) return false
      if (filterUniversity && c.university.name !== filterUniversity) return false
      if (filterArea && c.area.id !== filterArea) return false
      return true
    })
  }, [allCareers, searchQuery, filterUniversity, filterArea, compareIds])

  const rows: { label: string; render: (c: CareerDetail) => React.ReactNode }[] = [
    { label: "Universidad", render: (c) => c.university.name },
    { label: "Localidad", render: (c) => `${c.university.city}, ${c.university.province}` },
    { label: "Tipo de institución", render: (c) => c.university.type === "PUBLIC" ? "Pública" : "Privada" },
    { label: "Área", render: (c) => c.area.name },
    { label: "Título otorgado", render: (c) => c.degreeTitle },
    { label: "Duración", render: (c) => `${c.durationYears} años` },
    {
      label: "Modalidad", render: (c) => (
        <Badge variant="outline">{MODALITY_LABEL[c.modality]}</Badge>
      ),
    },
    {
      label: "Estudiantes inscritos",
      render: (c) => c.studentCount.toLocaleString("es-AR"),
    },
    {
      label: "Calificación",
      render: (c) =>
        c.rating !== null
          ? `⭐ ${c.rating} / 5.0 (${c.reviewCount} reseñas)`
          : "Sin reseñas",
    },
  ]

  const shortName = (name: string) =>
    name.length > 18 ? name.substring(0, 16) + "…" : name

  const studentsData = compared?.map((c) => ({
    name: c.name,
    shortName: shortName(c.name),
    value: c.studentCount,
  })) ?? []

  const durationData = compared?.map((c) => ({
    name: c.name,
    shortName: shortName(c.name),
    value: c.durationYears,
  })) ?? []

  const ratingData = compared?.map((c) => ({
    name: c.name,
    shortName: shortName(c.name),
    value: c.rating,
  })) ?? []

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Comparador de Carreras</h1>
          <p className="text-muted-foreground">
            Comparás hasta {MAX_CAREERS} carreras
          </p>
        </div>
        {selectedIds.length > 0 && (
          <Button variant="destructive" onClick={clear} className="shrink-0">
            <Trash2 className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        )}
      </section>

      {/* Search panel */}
      {canAdd && (
        <Accordion defaultValue={["add"]}>
          <AccordionItem value="add" className="rounded-lg border bg-card px-4">
            <AccordionTrigger className="text-base font-semibold hover:no-underline py-4">
              Agregar carrera
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {selectedIds.length}/{MAX_CAREERS} seleccionadas
              </span>
            </AccordionTrigger>
            <AccordionContent>
          <div className="space-y-3 pb-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="relative sm:col-span-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nombre de carrera o universidad..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterUniversity || "todas"} onValueChange={(v) => setFilterUniversity(v === "todas" ? "" : (v ?? ""))}>
                <SelectTrigger className="w-full px-3">
                  <span className={cn("flex-1 text-left text-sm truncate", !filterUniversity && "text-muted-foreground")}>
                    {filterUniversity || "Universidad"}
                  </span>
                </SelectTrigger>
                <SelectContent className="min-w-[260px]">
                  <SelectItem value="todas">Todas las universidades</SelectItem>
                  {universities.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterArea || "todas"} onValueChange={(v) => setFilterArea(v === "todas" ? "" : (v ?? ""))}>
                <SelectTrigger className="w-full px-3">
                  <span className={cn("flex-1 text-left text-sm truncate", !filterArea && "text-muted-foreground")}>
                    {filterArea ? (areas.find(a => a.id === filterArea)?.name ?? filterArea) : "Facultad / Área"}
                  </span>
                </SelectTrigger>
                <SelectContent className="min-w-[260px]">
                  <SelectItem value="todas">Todas las áreas</SelectItem>
                  {areas.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border overflow-hidden">
              {!allCareers ? (
                <div className="divide-y">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3">
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : filteredCareers.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No se encontraron carreras con esos criterios.
                </p>
              ) : (
                <div className="max-h-72 overflow-y-auto divide-y">
                  {filteredCareers.slice(0, 30).map((career) => (
                    <div
                      key={career.id}
                      className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{career.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {career.university.name} · {career.university.city}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        onClick={() => add(career.id)}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Agregar
                      </Button>
                    </div>
                  ))}
                  {filteredCareers.length > 30 && (
                    <p className="text-center text-xs text-muted-foreground py-2">
                      Mostrando 30 de {filteredCareers.length} — refiná la búsqueda para ver más
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {selectedIds.length === 0 && !canAdd === false && (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
          <Plus className="h-10 w-10 opacity-20" />
          <p className="text-sm">Usá el buscador para agregar carreras a la comparación.</p>
          <p className="text-xs">También podés agregarlas desde el listado o el detalle de cada carrera.</p>
        </div>
      )}

      {selectedIds.length > 0 && (
        <>
          <section className="overflow-x-auto rounded-lg border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left py-3 px-4 font-semibold sticky left-0 bg-muted/40 w-48">
                    Característica
                  </th>
                  {isLoading
                    ? selectedIds.map((id) => (
                      <th key={id} className="py-3 px-4 min-w-[220px]">
                        <Skeleton className="h-5 w-3/4" />
                      </th>
                    ))
                    : compared?.map((career) => (
                      <th key={career.id} className="text-left py-3 px-4 min-w-[220px]">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold">{career.name}</p>
                            <p className="text-xs font-normal text-muted-foreground mt-0.5">
                              {career.university.name}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromHook(career.id)}
                            className="text-muted-foreground hover:text-destructive shrink-0 mt-0.5"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
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
                        <td key={id} className="py-3 px-4">
                          <Skeleton className="h-4 w-3/4" />
                        </td>
                      ))
                      : compared?.map((career) => (
                        <td key={career.id} className="py-3 px-4">
                          {row.render(career)}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {!isLoading && compared && compared.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Métricas comparativas</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <MetricBarChart
                  title="Estudiantes inscritos"
                  data={studentsData}
                  formatter={(v) => v.toLocaleString("es-AR")}
                />
                <MetricBarChart
                  title="Duración (años)"
                  data={durationData}
                  formatter={(v) => `${v} año${v !== 1 ? "s" : ""}`}
                  domain={[0, 7]}
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
        </>
      )}
    </div>
  )
}
