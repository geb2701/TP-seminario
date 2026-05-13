"use client"

import { useState } from "react"
import Link from "next/link"
import { useApiQuery } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Search, MapPin, Users, Clock, Bookmark, BookmarkCheck, SearchX } from "lucide-react"
import { useSavedCareers } from "@/app/mis-carreras/page"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"

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
  studentCount: number
  university: { name: string; city: string; province: string }
  area: { id: string; name: string }
  rating: number | null
}

const MODALITY_LABEL: Record<Career["modality"], string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
  ONLINE: "Online",
}

export default function CarrerasPage() {
  // Hook local para guardar/quitar carreras en favoritos del usuario.
  const { isSaved, save, remove } = useSavedCareers()

  // Estado de filtros en UI.
  const [search, setSearch] = useState("")
  const [modality, setModality] = useState("todos")
  const [areaId, setAreaId] = useState("todos")

  // Construye los query params segun los filtros activos.
  // Si un filtro esta en "todos", no se envia para mantener la consulta limpia.
  const careerParams = new URLSearchParams()
  if (search) careerParams.set("search", search)
  if (modality !== "todos") careerParams.set("modality", modality)
  if (areaId !== "todos") careerParams.set("areaId", areaId)

  // Consulta principal de carreras. Se vuelve a ejecutar cuando cambia
  // alguno de los filtros (search, modality, areaId).
  const { data: careers, isLoading, isError, refetch } = useApiQuery<Career[]>(
    ["careers", search, modality, areaId],
    `careers?${careerParams.toString()}`
  )

  // Catálogo de áreas para poblar el select de filtro.
  const { data: areas } = useApiQuery<Area[]>(["areas"], "areas")

  // Nombre legible del area seleccionada para mostrar en el trigger.
  // Evita que el Select muestre el id tecnico.
  const selectedAreaName =
    areaId === "todos"
      ? "Todas las áreas"
      : areas?.find((area) => area.id === areaId)?.name ?? "Área"

  const hasFilters = search !== "" || modality !== "todos" || areaId !== "todos"

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold">Explorar Carreras</h1>
        <p className="text-muted-foreground">
          Encontrá y compará carreras universitarias en Argentina
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {/* Input de texto para filtrar por nombre de carrera */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar carrera..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filtro por modalidad */}
        <Select value={modality} onValueChange={(v) => setModality(v ?? "todos")}>
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="PRESENCIAL">Presencial</SelectItem>
            <SelectItem value="HIBRIDO">Híbrido</SelectItem>
            <SelectItem value="ONLINE">Online</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro por area academica */}
        <Select value={areaId} onValueChange={(v) => setAreaId(v ?? "todos")}>
          <SelectTrigger>
            <SelectValue placeholder="Área">{selectedAreaName}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas las áreas</SelectItem>
            {areas?.map((area) => (
              <SelectItem key={area.id} value={area.id}>
                {area.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              <Card key={career.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{career.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {career.university.name}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {MODALITY_LABEL[career.modality]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {career.university.city}, {career.university.province}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 shrink-0" />
                      {career.durationYears} {career.durationYears === 1 ? "año" : "años"}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 shrink-0" />
                      {career.studentCount.toLocaleString("es-AR")} estudiantes
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {career.rating !== null ? `⭐ ${career.rating} / 5.0` : "Sin reseñas"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/carreras/${career.id}`} className={cn(buttonVariants(), "flex-1")}>Ver detalles</Link>
                    <Button
                      variant="outline"
                      size="icon"
                      // Toggle de guardado en la lista personal del usuario
                      onClick={() => isSaved(career.id) ? remove(career.id) : save(career.id)}
                      title={isSaved(career.id) ? "Quitar de mis carreras" : "Guardar carrera"}
                    >
                      {isSaved(career.id)
                        ? <BookmarkCheck className="h-4 w-4 text-primary" />
                        : <Bookmark className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
      </section>

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
