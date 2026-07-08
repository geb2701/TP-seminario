"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useApiQuery } from "@/lib/api"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { CareerCard } from "@/components/career-card"
import { PaginationControls } from "@/components/pagination-controls"

type University = { id: string; name: string }
import { cn } from "@/lib/utils"
import { Search, SearchX } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { useSavedCareers } from "@/app/mis-carreras/page"
import { useCompareCareers } from "@/hooks/use-compare-careers"
import { useVocationalProfile } from "@/hooks/use-vocational-profile"
import { BrainCircuit } from "lucide-react"

// Area disponible para filtrar el listado de carreras.
type Area = { id: string; name: string }

// Estructura de cada carrera tal como llega desde GET /api/careers.
type Career = {
  id: string
  name: string
  durationYears: number
  degreeTitle: string
  modality: "PRESENCIAL" | "HIBRIDO" | "ONLINE"
  description: string | null
  university: { id: string; name: string; city: string; province: string }
  area: { id: string; name: string }
  recommended: boolean
  recommendedRankLabel: string | null
}

type CareersResponse = {
  data: Career[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
}

export default function CarrerasPage() {
  const { isSaved, save, remove } = useSavedCareers()
  const { isComparing, canAdd, add: addToCompare, remove: removeFromCompare } = useCompareCareers()
  const { profile } = useVocationalProfile()

  // Estado de filtros en UI.
  const [search, setSearch] = useState("")
  const [modality, setModality] = useState("todos")
  const [areaId, setAreaId] = useState("")
  const [universityId, setUniversityId] = useState("")
  const [page, setPage] = useState(1)

  // Si cambian los filtros, volvemos a la primera página.
  useEffect(() => {
    setPage(1)
  }, [search, modality, areaId, universityId])

  const careerParams = new URLSearchParams()
  if (search) careerParams.set("search", search)
  if (modality !== "todos") careerParams.set("modality", modality)
  if (areaId) careerParams.set("areaId", areaId)
  if (universityId) careerParams.set("universityId", universityId)
  careerParams.set("page", String(page))

  // Consulta principal de carreras. Se vuelve a ejecutar cuando cambia
  // alguno de los filtros (search, modality, areaId) o la página.
  const { data: careersResponse, isLoading, isError, refetch } = useApiQuery<CareersResponse>(
    ["careers", search, modality, areaId, universityId, String(page)],
    `careers?${careerParams.toString()}`
  )
  const careers = careersResponse?.data
  const pagination = careersResponse?.pagination

  const { data: areas } = useApiQuery<Area[]>(["areas"], "areas")
  const { data: universities } = useApiQuery<University[]>(["universities"], "universities")

  const hasFilters = search !== "" || modality !== "todos" || areaId !== "todos"

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold">Explorar carreras</h1>
        <p className="text-muted-foreground">
          Encontrá y compará carreras universitarias en Argentina
        </p>
      </section>

      {profile && (
        <section>
          {areaId && areas?.find((a) => a.id === areaId)?.name === profile.topArea ? (
            <button
              onClick={() => setAreaId("")}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              <BrainCircuit className="size-3.5" />
              Mostrando carreras de tu perfil: {profile.topArea}
              <span className="ml-1 opacity-60">✕</span>
            </button>
          ) : (
            <button
              onClick={() => {
                const match = areas?.find((a) => a.name === profile.topArea)
                if (match) setAreaId(match.id)
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              <BrainCircuit className="size-3.5" />
              Ver recomendadas para tu perfil: {profile.topArea}
            </button>
          )}
        </section>
      )}

      <section className="space-y-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar carreras..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Select value={universityId || "todas"} onValueChange={(v) => setUniversityId(v === "todas" ? "" : (v ?? ""))}>
            <SelectTrigger className="w-full px-3">
              <span className={cn("flex-1 text-left text-sm truncate", !universityId && "text-muted-foreground")}>
                {universityId ? (universities?.find(u => u.id === universityId)?.name ?? universityId) : "Universidad"}
              </span>
            </SelectTrigger>
            <SelectContent className="min-w-[260px]">
              <SelectItem value="todas">Todas las universidades</SelectItem>
              {universities?.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={areaId || "todas"} onValueChange={(v) => setAreaId(v === "todas" ? "" : (v ?? ""))}>
            <SelectTrigger className="w-full px-3">
              <span className={cn("flex-1 text-left text-sm truncate", !areaId && "text-muted-foreground")}>
                {areaId ? (areas?.find(a => a.id === areaId)?.name ?? areaId) : "Facultad / Área"}
              </span>
            </SelectTrigger>
            <SelectContent className="min-w-[260px]">
              <SelectItem value="todas">Todas las áreas</SelectItem>
              {areas?.map((area) => (
                <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={modality} onValueChange={(v) => setModality(v ?? "todos")}>
            <SelectTrigger className="w-full px-3">
              <span className={cn("flex-1 text-left text-sm truncate", modality === "todos" && "text-muted-foreground")}>
                {modality === "todos" ? "Modalidad" : modality === "PRESENCIAL" ? "Presencial" : modality === "HIBRIDO" ? "Híbrido" : "Online"}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las modalidades</SelectItem>
              <SelectItem value="PRESENCIAL">Presencial</SelectItem>
              <SelectItem value="HIBRIDO">Híbrido</SelectItem>
              <SelectItem value="ONLINE">Online</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {isError && (
        <ErrorState
          title="No pudimos cargar las carreras"
          description="Ocurrió un error al conectar con el servidor."
          onRetry={refetch}
        />
      )}

      <section className="grid gap-4 md:grid-cols-2">
        {isLoading
          // Skeleton mientras se obtiene la lista desde la API
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-1" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))
          // Render real de cards una vez cargados los datos
          : careers?.map((career) => (
              <CareerCard
                key={career.id}
                career={career}
                university={career.university}
                isSaved={isSaved(career.id)}
                onSave={() => isSaved(career.id) ? remove(career.id) : save(career.id)}
                isComparing={isComparing(career.id)}
                canAddToCompare={canAdd}
                onCompare={() => isComparing(career.id) ? removeFromCompare(career.id) : addToCompare(career.id)}
                showUniversityLink
              />
            ))}
      </section>

      {!isLoading && pagination && (
        <PaginationControls page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
      )}

      {!isLoading && !isError && careers?.length === 0 && (
        <EmptyState
          icon={SearchX}
          title={hasFilters ? "No encontramos carreras que coincidan con tu búsqueda" : "En este momento no hay carreras cargadas"}
          description={hasFilters ? "Probá cambiando los filtros o buscando con otras palabras." : undefined}
        />
      )}
    </div>
  )
}
