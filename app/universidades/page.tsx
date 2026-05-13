"use client"

import { useState } from "react"
import { useApiQuery } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { MapPin, BookOpen, Globe, Search, SearchX } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"

type University = {
  id: string
  name: string
  city: string
  province: string
  type: "PUBLIC" | "PRIVATE"
  website: string | null
  foundedYear: number | null
  description: string | null
  logoUrl: string | null
  careerCount: number
  rating: number | null
}

export default function UniversidadesPage() {
  const [search, setSearch] = useState("")
  const [type, setType] = useState("todos")

  const params = new URLSearchParams()
  if (search) params.set("search", search)
  if (type !== "todos") params.set("type", type)

  const { data: universities, isLoading, isError, refetch } = useApiQuery<University[]>(
    ["universities", search, type],
    `universities?${params.toString()}`
  )

  const hasFilters = search !== "" || type !== "todos"

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold">Universidades</h1>
        <p className="text-muted-foreground">
          Descubrí instituciones educativas en toda Argentina
        </p>
      </section>

      <section className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar universidad..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={type} onValueChange={(v) => setType(v ?? "todos")}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="PUBLIC">Pública</SelectItem>
            <SelectItem value="PRIVATE">Privada</SelectItem>
          </SelectContent>
        </Select>
      </section>

      {isError && (
        <ErrorState
          title="No pudimos cargar las universidades"
          description="Ocurrió un error al conectar con el servidor."
          onRetry={refetch}
        />
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
          : universities?.map((uni) => (
              <Card key={uni.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{uni.name}</CardTitle>
                      {uni.foundedYear && (
                        <CardDescription className="mt-1">
                          Fundada en {uni.foundedYear}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant={uni.type === "PUBLIC" ? "default" : "secondary"}>
                      {uni.type === "PUBLIC" ? "Pública" : "Privada"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {uni.city}, {uni.province}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {uni.rating !== null ? `⭐ ${uni.rating} / 5.0` : "Sin reseñas"}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4 shrink-0" />
                      {uni.careerCount} {uni.careerCount === 1 ? "carrera" : "carreras"}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {uni.website && (
                      <a
                        href={uni.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(buttonVariants({ variant: "outline" }), "flex-1")}
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Sitio web
                      </a>
                    )}
                    <Button className="flex-1">Ver carreras</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
      </section>

      {!isLoading && !isError && universities?.length === 0 && (
        <EmptyState
          icon={SearchX}
          title={hasFilters ? "No encontramos universidades que coincidan con tu búsqueda" : "En este momento no hay universidades cargadas"}
          description={hasFilters ? "Probá cambiando los filtros o buscando con otras palabras." : undefined}
        />
      )}
    </div>
  )
}
