"use client"

import { useState } from "react"
import { useApiQuery } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Users, Clock, Bookmark, BookmarkCheck } from "lucide-react"
import { useSavedCareers } from "@/app/mis-carreras/page"

type Area = { id: string; name: string }

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
  const { isSaved, save, remove } = useSavedCareers()
  const [search, setSearch] = useState("")
  const [modality, setModality] = useState("todos")
  const [areaId, setAreaId] = useState("todos")

  const careerParams = new URLSearchParams()
  if (search) careerParams.set("search", search)
  if (modality !== "todos") careerParams.set("modality", modality)
  if (areaId !== "todos") careerParams.set("areaId", areaId)

  const { data: careers, isLoading, isError } = useApiQuery<Career[]>(
    ["careers", search, modality, areaId],
    `careers?${careerParams.toString()}`
  )

  const { data: areas } = useApiQuery<Area[]>(["areas"], "areas")

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold">Explorar Carreras</h1>
        <p className="text-muted-foreground">
          Encontrá y comparé carreras universitarias en Argentina
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar carrera..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={modality} onValueChange={(v) => setModality(v ?? "todos")}>
          <SelectTrigger>
            <SelectValue placeholder="Modalidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas las modalidades</SelectItem>
            <SelectItem value="PRESENCIAL">Presencial</SelectItem>
            <SelectItem value="HIBRIDO">Híbrido</SelectItem>
            <SelectItem value="ONLINE">Online</SelectItem>
          </SelectContent>
        </Select>
        <Select value={areaId} onValueChange={(v) => setAreaId(v ?? "todos")}>
          <SelectTrigger>
            <SelectValue placeholder="Área" />
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
        <p className="text-sm text-destructive">Error al cargar carreras.</p>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        {isLoading
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
                    <Button className="flex-1">Ver detalles</Button>
                    <Button
                      variant="outline"
                      size="icon"
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

      {!isLoading && careers?.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No se encontraron carreras con esos filtros.
        </p>
      )}
    </div>
  )
}
