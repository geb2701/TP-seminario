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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PrestigeBadge, isPrestigious } from "@/components/prestige-badge"

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
    qsRank: number | null
    qsRankLabel: string | null
  }
  careersByArea: Record<
    string,
    Array<{
      id: string
      name: string
      modality: string
      durationYears: number
      recommended: boolean
      recommendedRankLabel: string | null
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
          <h1 className="text-3xl lg:text-4xl font-bold flex items-center gap-3 flex-wrap">
            {university?.name}
            {isPrestigious(university?.qsRank) && <PrestigeBadge rankLabel={university?.qsRankLabel} />}
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
        </>
      )}
    </div>
  )
}
