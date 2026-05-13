"use client"

import { use } from "react"
import { useApiQuery } from "@/lib/api"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CareerCard } from "@/components/career-card"
import { UniversityInfoCard } from "@/components/university-info-card"
import { useSavedCareers } from "@/app/mis-carreras/page"
import { useCompareCareers } from "@/hooks/use-compare-careers"
import { EmptyState } from "@/components/empty-state"
import { Star } from "lucide-react"

type Review = {
  id: string
  rating: number
  content: string
  authorName: string | null
  createdAt: string
}

type UniversityCareersResponse = {
  university: {
    id: string
    name: string
    city: string
    province: string
    type: "PUBLIC" | "PRIVATE"
    website: string | null
    foundedYear: number | null
    description: string | null
    logoUrl: string | null
    reviews: Review[]
  }
  careersByArea: Record<
    string,
    Array<{
      id: string
      name: string
      modality: string
      durationYears: number
      studentCount: number
      rating: number | null
      areaId: string | null
      areaName: string
    }>
  >
}


function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating} / 5.0</span>
    </div>
  )
}

export default function UniversityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { isSaved, save, remove } = useSavedCareers()
  const { isComparing, canAdd, add: addToCompare, remove: removeFromCompare } = useCompareCareers()

  const { data, isLoading, isError } = useApiQuery<UniversityCareersResponse>(
    ["university-careers", id],
    `universities/${id}/careers`
  )

  if (isError) {
    return (
      <div className="space-y-6 p-6 lg:p-8">
        <p className="text-sm text-destructive">Error al cargar los datos de la universidad.</p>
      </div>
    )
  }

  const university = data?.university
  const careersByArea = data?.careersByArea || {}
  const areas = Object.keys(careersByArea).sort()
  const totalCareers = Object.values(careersByArea).reduce((sum, list) => sum + list.length, 0)

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div className="space-y-2">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
          </>
        ) : (
          <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold">{university?.name}</h1>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-1" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <Skeleton className="h-9 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {university && (
            <UniversityInfoCard
              university={university}
              careerCount={totalCareers}
              reviews={university.reviews}
            />
          )}

          {/* Carreras por área */}
          {areas.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              No hay carreras disponibles en esta universidad.
            </p>
          ) : (
            <div className="space-y-8">
              <h2 className="text-xl font-semibold">Carreras</h2>
              {areas.map((area) => (
                <div key={area} className="space-y-4">
                  <h3 className="text-base font-semibold text-muted-foreground">{area}</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {careersByArea[area].map((career) => (
                      <CareerCard
                        key={career.id}
                        career={career}
                        university={{
                          id: university?.id,
                          name: university?.name ?? "",
                          city: university?.city ?? "",
                          province: university?.province ?? "",
                        }}
                        isSaved={isSaved(career.id)}
                        onSave={() => isSaved(career.id) ? remove(career.id) : save(career.id)}
                        isComparing={isComparing(career.id)}
                        canAddToCompare={canAdd}
                        onCompare={() => isComparing(career.id) ? removeFromCompare(career.id) : addToCompare(career.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reseñas de la universidad */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Reseñas ({university?.reviews.length ?? 0})
            </h2>
            {university?.reviews.length === 0 ? (
              <EmptyState
                icon={Star}
                title="Todavía no hay reseñas para esta universidad"
                description="Sé el primero en compartir tu experiencia."
              />
            ) : (
              university?.reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {review.authorName ?? "Anónimo"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString("es-AR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.content}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
