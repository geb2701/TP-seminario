"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useApiQuery } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { PaginationControls } from "@/components/pagination-controls"
import { cn } from "@/lib/utils"
import { MapPin, BookOpen, Globe, Search, SearchX } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { PrestigeBadge, isPrestigious } from "@/components/prestige-badge"

const PAGE_SIZE = 12

const DIMENSION_LABELS = {
  type: "Tipo",
  name: "Nombre",
  rating: "Rating",
  careers: "Cantidad de carreras",
} as const

type University = {
  id: string
  name: string
  shortCode: string | null
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

function UniversityLogo({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  const [imageError, setImageError] = useState(false)
  const useFullCoverLogo =
    name === "Universidad Tecnológica Nacional" ||
    name === "Universidad Nacional de Mar del Plata"

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  if (!logoUrl || imageError) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground">
        {initials}
      </div>
    )
  }

  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
      <Image
        src={logoUrl}
        alt={`Logo de ${name}`}
        fill
        className={cn("object-contain p-1", useFullCoverLogo && "object-cover p-0")}
        sizes="48px"
        onError={() => setImageError(true)}
      />
    </div>
  )
}

type SortDimension = "type" | "name" | "rating" | "careers"
type TypeFilter = "todos" | "PUBLIC" | "PRIVATE"
type SortDir = "asc" | "desc"

function UniversidadesPageContent() {
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") ?? "")
  const [dimension, setDimension] = useState<SortDimension>("type")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("todos")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [page, setPage] = useState(1)

  // Si cambian los filtros, volvemos a la primera página.
  useEffect(() => {
    setPage(1)
  }, [search, dimension, typeFilter, sortDir])

  // El segundo selector cambia de significado según el primero, así que al
  // cambiar de dimensión reseteamos su valor para no dejar estado confuso
  // (p.ej. "Descendente" arrastrado de "Rating" mientras se mira "Tipo").
  function changeDimension(next: SortDimension) {
    setDimension(next)
    setTypeFilter("todos")
    setSortDir("asc")
  }

  const params = new URLSearchParams()
  if (search) params.set("search", search)
  if (dimension === "type") {
    if (typeFilter !== "todos") params.set("type", typeFilter)
  } else {
    params.set("sortBy", dimension)
    params.set("sortDir", sortDir)
  }

  // El listado completo se trae en una sola consulta (130 universidades es
  // liviano), pero se pagina del lado del cliente porque la grilla completa
  // es demasiado larga para scrollear de una sola vez.
  const { data: universities, isLoading, isError, refetch } = useApiQuery<University[]>(
    ["universities", search, dimension, typeFilter, sortDir],
    `universities?${params.toString()}`
  )

  const totalPages = Math.max(1, Math.ceil((universities?.length ?? 0) / PAGE_SIZE))
  const pageItems = universities?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const hasFilters = search !== "" || typeFilter !== "todos"

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
        <Select value={dimension} onValueChange={(v) => changeDimension((v as SortDimension) ?? "type")}>
          <SelectTrigger className="w-full sm:w-44 px-3">
            <span className="flex-1 text-left text-sm truncate">
              {DIMENSION_LABELS[dimension]}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="type">Tipo</SelectItem>
            <SelectItem value="name">Nombre</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="careers">Cantidad de carreras</SelectItem>
          </SelectContent>
        </Select>

        {dimension === "type" ? (
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter((v as TypeFilter) ?? "todos")}>
            <SelectTrigger className="w-full sm:w-40 px-3">
              <span className={cn("flex-1 text-left text-sm truncate", typeFilter === "todos" && "text-muted-foreground")}>
                {typeFilter === "todos" ? "Todas" : typeFilter === "PUBLIC" ? "Pública" : "Privada"}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              <SelectItem value="PUBLIC">Pública</SelectItem>
              <SelectItem value="PRIVATE">Privada</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Select value={sortDir} onValueChange={(v) => setSortDir((v as SortDir) ?? "asc")}>
            <SelectTrigger className="w-full sm:w-40 px-3">
              <span className="flex-1 text-left text-sm truncate">
                {sortDir === "asc" ? "Ascendente" : "Descendente"}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascendente</SelectItem>
              <SelectItem value="desc">Descendente</SelectItem>
            </SelectContent>
          </Select>
        )}
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
          : pageItems?.map((uni) => (
              <Card key={uni.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <UniversityLogo name={uni.name} logoUrl={uni.logoUrl} />
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                          {uni.name}
                          {isPrestigious(uni.rating) && <PrestigeBadge />}
                        </CardTitle>
                        {uni.foundedYear && (
                          <CardDescription className="mt-1">
                            Fundada en {uni.foundedYear}
                          </CardDescription>
                        )}
                      </div>
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
                    <Link
                      href={`/universidades/${uni.id}`}
                      className={cn(buttonVariants(), "flex-1")}
                    >
                      Ver carreras
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
      </section>

      {!isLoading && universities && universities.length > 0 && (
        <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
      )}

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

export default function UniversidadesPage() {
  return (
    <Suspense>
      <UniversidadesPageContent />
    </Suspense>
  )
}
