"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Users, GraduationCap, Star, BookOpen } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { UniversityInfoCard } from "@/components/university-info-card"
import { StarRating } from "@/components/star-rating"
import { AREA_EMOJIS } from "./constants"

function normalizeCareerName(name: string): string {
  return name.normalize("NFC").trim()
}

type Subject = { id: string; name: string; year: number; semester: number | null }

export type CareerDetailFull = {
  id: string
  name: string
  durationYears: number
  degreeTitle: string
  modality: "PRESENCIAL" | "HIBRIDO" | "ONLINE"
  description: string | null
  studentCount: number
  rating: number | null
  reviewCount: number
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
    careerCount: number
    rating: number | null
    reviewCount: number
  }
  area: { id: string; name: string }
  studyPlans: { id: string; name: string; year: number; subjects: Subject[] }[]
  reviews: { id: string; rating: number; content: string; authorName: string | null; createdAt: string }[]
}

const MODALITY_LABEL: Record<string, string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
  ONLINE: "Online",
}

function SkeletonDetail() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="space-y-3">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardContent className="pt-6">
            <Skeleton className="h-8 w-12 mb-1" />
            <Skeleton className="h-4 w-24" />
          </CardContent></Card>
        ))}
      </div>
      <Skeleton className="h-10 w-full max-w-md" />
    </div>
  )
}

export function CareerDetailPanel({
  data,
  isLoading,
  careerScores,
}: {
  data: CareerDetailFull | undefined
  isLoading: boolean
  careerScores: Record<string, number>
}) {
  if (isLoading || !data) return <SkeletonDetail />

  const affinity = careerScores[normalizeCareerName(data.name)] ?? 0

  const subjectsByYear = data.studyPlans
    .flatMap((p) => p.subjects)
    .reduce<Record<number, Subject[]>>((acc, s) => {
      if (!acc[s.year]) acc[s.year] = []
      acc[s.year].push(s)
      return acc
    }, {})

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <section className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <h2 className="text-2xl font-bold leading-tight">{data.name}</h2>
            <p className="text-muted-foreground">{data.university.name}</p>
          </div>
          {affinity > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-sm font-semibold text-primary shrink-0">
              {affinity}% afinidad
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{MODALITY_LABEL[data.modality]}</Badge>
          <Badge variant={data.university.type === "PUBLIC" ? "default" : "secondary"}>
            {data.university.type === "PUBLIC" ? "Pública" : "Privada"}
          </Badge>
          <Badge variant="secondary">{AREA_EMOJIS[data.area.name]} {data.area.name}</Badge>
        </div>
        {data.description && (
          <p className="text-sm text-muted-foreground leading-relaxed pt-1">{data.description}</p>
        )}
      </section>

      {/* Stats grid */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-2xl font-bold">{data.durationYears}</p>
              <p className="text-xs text-muted-foreground">años de duración</p>
            </div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-2xl font-bold">{data.studentCount.toLocaleString("es-AR")}</p>
              <p className="text-xs text-muted-foreground">estudiantes</p>
            </div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-semibold leading-tight">{data.degreeTitle}</p>
              <p className="text-xs text-muted-foreground mt-0.5">título obtenido</p>
            </div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-2xl font-bold">{data.rating !== null ? data.rating : "—"}</p>
              <p className="text-xs text-muted-foreground">
                {data.reviewCount} {data.reviewCount === 1 ? "reseña" : "reseñas"}
              </p>
            </div>
          </div>
        </CardContent></Card>
      </section>

      {/* Tabs */}
      <Tabs defaultValue="universidad">
        <TabsList className="w-full">
          <TabsTrigger value="universidad" className="flex-1">Universidad</TabsTrigger>
          {data.studyPlans.length > 0 && (
            <TabsTrigger value="plan" className="flex-1">Plan de estudios</TabsTrigger>
          )}
          <TabsTrigger value="resenas" className="flex-1">
            Reseñas ({data.reviewCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="universidad" className="mt-4">
          <UniversityInfoCard
            university={data.university}
            careerCount={data.university.careerCount}
            rating={data.university.rating}
            reviewCount={data.university.reviewCount}
          />
        </TabsContent>

        {data.studyPlans.length > 0 && (
          <TabsContent value="plan" className="mt-4 space-y-4">
            {Object.entries(subjectsByYear)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([year, subjects]) => (
                <Card key={year}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BookOpen className="h-4 w-4" />
                      {Number(year)}° año
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {subjects
                        .sort((a, b) => (a.semester ?? 0) - (b.semester ?? 0))
                        .map((subject) => (
                          <div key={subject.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                            <span>{subject.name}</span>
                            {subject.semester && (
                              <Badge variant="outline" className="text-xs ml-2 shrink-0">
                                {subject.semester}° cuatri
                              </Badge>
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        )}

        <TabsContent value="resenas" className="mt-4 space-y-4">
          {data.reviews.length === 0 ? (
            <EmptyState icon={Star} title="Todavía no hay reseñas para esta carrera" />
          ) : (
            data.reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{review.authorName ?? "Anónimo"}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("es-AR", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </span>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
