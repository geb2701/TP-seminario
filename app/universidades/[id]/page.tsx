"use client"

import { use } from "react"
import { useApiQuery } from "@/lib/api"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CareerCard } from "@/components/career-card"
import { UniversityInfoCard } from "@/components/university-info-card"
import { StarRating } from "@/components/star-rating"
import { useSavedCareers } from "@/app/mis-carreras/page"
import { useCompareCareers } from "@/hooks/use-compare-careers"
import { EmptyState } from "@/components/empty-state"
import { ReviewForm } from "@/components/review-form"
import { Star } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PrestigeBadge, isPrestigious } from "@/components/prestige-badge"

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
  const { isSaved, save, remove } = useSavedCareers()
  const { isComparing, canAdd, add: addToCompare, remove: removeFromCompare } = useCompareCareers()

  const { data, isLoading, isError, refetch } = useApiQuery<UniversityCareersResponse>(
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
  const uniReviews = university?.reviews ?? []
  const uniRating =
    uniReviews.length > 0
      ? Math.round((uniReviews.reduce((s, r) => s + r.rating, 0) / uniReviews.length) * 10) / 10
      : null

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
          <h1 className="text-3xl lg:text-4xl font-bold flex items-center gap-3 flex-wrap">
            {university?.name}
            {isPrestigious(uniRating) && <PrestigeBadge />}
          </h1>
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
              rating={uniRating}
              reviewCount={uniReviews.length}
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
              <Accordion defaultValue={areas.slice(0, 1)} className="rounded-lg border bg-card px-4">
                {areas.map((area) => (
                  <AccordionItem key={area} value={area}>
                    <AccordionTrigger className="py-4 text-base font-semibold hover:no-underline">
                      {area}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {careersByArea[area].length} {careersByArea[area].length === 1 ? "carrera" : "carreras"}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
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
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {/* Reseñas de la universidad */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Reseñas</h2>
            <ReviewForm
              postUrl={`universities/${id}/reviews`}
              onSuccess={refetch}
              placeholder="Contá tu experiencia en esta universidad..."
            />
            {university?.reviews.length === 0 ? (
              <EmptyState
                icon={Star}
                title="Todavía no hay reseñas para esta universidad"
                description="Sé el primero en compartir tu experiencia."
              />
            ) : (
              <Accordion className="rounded-lg border bg-card px-4">
                {university?.reviews.map((review, index) => (
                  <AccordionItem key={review.id} value={review.id}>
                    <AccordionTrigger className="py-4 hover:no-underline">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
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
                        <div className="mt-1 flex items-center gap-3">
                          <StarRating rating={review.rating} />
                          <span className="text-xs text-muted-foreground">
                            {index === 0 ? "Reseña destacada" : "Ver comentario completo"}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {review.content}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </>
      )}
    </div>
  )
}
