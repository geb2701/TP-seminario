"use client"

import { use } from "react"
import Link from "next/link"
import { useApiQuery } from "@/lib/api"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { ArrowLeft, BookOpen, Clock, Star } from "lucide-react"

type UniversityCareersResponse = {
  university: {
    id: string
    name: string
    city: string
    province: string
    type: "PUBLIC" | "PRIVATE"
  }
  careersByArea: Record<
    string,
    Array<{
      id: string
      name: string
      modality: string
      durationYears: number
      rating: number | null
      areaId: string | null
      areaName: string
    }>
  >
}

export default function UniversityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  // Obtener las carreras agrupadas por área
  const { data, isLoading, isError } = useApiQuery<UniversityCareersResponse>(
    ["university-careers", id],
    `universities/${id}/careers`
  )

  if (isError) {
    return (
      <div className="space-y-6 p-6 lg:p-8">
        <Link href="/universidades" className={cn(buttonVariants({ variant: "ghost" }))}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Link>
        <p className="text-sm text-destructive">Error al cargar los datos de la universidad.</p>
      </div>
    )
  }

  const university = data?.university
  const careersByArea = data?.careersByArea || {}
  const areas = Object.keys(careersByArea).sort()

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Link href="/universidades" className={cn(buttonVariants({ variant: "ghost" }), "mb-2")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-40" />
            </>
          ) : (
            <>
              <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold">{university?.name}</h1>
            </>
          )}
        </div>
        {!isLoading && (
          <Badge variant={university?.type === "PUBLIC" ? "default" : "secondary"}>
            {university?.type === "PUBLIC" ? "Pública" : "Privada"}
          </Badge>
        )}
      </div>

      {/* Carreras por área */}
      {isLoading ? (
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 2 }).map((_, j) => (
                  <Card key={j}>
                    <CardHeader>
                      <Skeleton className="h-5 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : areas.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No hay carreras disponibles en esta universidad.
        </p>
      ) : (
        <div className="space-y-8">
          {areas.map((area) => (
            <div key={area} className="space-y-4">
              <h2 className="text-lg font-semibold">{area}</h2>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {careersByArea[area].map((career) => (
                  <Link
                    key={career.id}
                    href={`/carreras/${career.id}`}
                    className="transition-transform hover:scale-105"
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg line-clamp-2">
                          {career.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-1">
                          {career.modality}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {career.durationYears} {career.durationYears === 1 ? "año" : "años"}
                          </Badge>
                          {career.rating !== null && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400" />
                              {career.rating}/5
                            </Badge>
                          )}
                        </div>
                        <Button className="w-full">Ver detalles</Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
