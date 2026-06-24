"use client"

import { use } from "react"
import { useApiQuery } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Clock,
  GraduationCap,
  Star,
  BookOpen,
  Scale,
} from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { UniversityInfoCard } from "@/components/university-info-card"
import { StarRating } from "@/components/star-rating"
import { ReviewForm } from "@/components/review-form"
import { useCompareCareers } from "@/hooks/use-compare-careers"
import { useDynamicBreadcrumb } from "@/components/breadcrumb-context"

// Cada Subject representa una materia individual dentro de un plan de estudios.
// Estos campos vienen del endpoint de detalle de carrera y se usan para agrupar
// y mostrar las materias por año/cuatrimestre en la UI.
type Subject = {
  id: string
  name: string
  year: number
  semester: number | null
}

// StudyPlan agrupa materias por anio de cursada para una carrera determinada.
// El endpoint devuelve un arreglo de planes, y cada uno contiene sus materias.
type StudyPlan = {
  id: string
  name: string
  year: number
  subjects: Subject[]
}

// Review modela cada reseña asociada a la carrera. Se usa en la pestania final
// para mostrar autor, fecha, puntaje y contenido.
type Review = {
  id: string
  rating: number
  content: string
  authorName: string | null
  createdAt: string
}

// CareerDetail describe exactamente la forma del JSON que devuelve
// GET /api/careers/:id. Por eso incluye datos propios de la carrera y tambien
// relaciones ya expandidas como universidad, area, plan y resenias.
type CareerDetail = {
  id: string
  name: string
  durationYears: number
  degreeTitle: string
  modality: "PRESENCIAL" | "HIBRIDO" | "ONLINE"
  description: string | null
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
  studyPlans: StudyPlan[]
  reviews: Review[]
}

// Traduce el enum tecnico de la BD/API a una etiqueta legible para la UI.
const MODALITY_LABEL: Record<CareerDetail["modality"], string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
  ONLINE: "Online",
}

// Vista placeholder mientras el detalle todavia se esta cargando desde la API.
// Mantiene la estructura general de la pagina para evitar saltos visuales.
function SkeletonDetail() {
  return (
    <div className="space-y-8 p-6 lg:p-8">
      <Skeleton className="h-6 w-24" />
      <div className="space-y-3">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-12 mb-1" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-10 w-full max-w-md" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  )
}

export default function CarreraDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Next entrega params como promesa en este contexto; aca se resuelve para
  // obtener el id dinamico de la ruta /carreras/[id].
  const { id } = use(params)
  const { isComparing, canAdd, add: addToCompare, remove: removeFromCompare } = useCompareCareers()

  // Esta llamada pega a /api/careers/:id a traves de useApiQuery.
  // La respuesta se guarda en `career` y queda tipada como CareerDetail.
  // Tambien expone flags para manejar carga y error sin hacer fetch manual.
  const { data: career, isLoading, isError, refetch } = useApiQuery<CareerDetail>(
    ["career", id],
    `careers/${id}`
  )

  useDynamicBreadcrumb(`/carreras/${id}`, career?.name)

  // Mientras llega la respuesta, renderiza una version skeleton de la pagina.
  if (isLoading) return <SkeletonDetail />

  if (isError || !career) {
    return (
      <div className="p-6 lg:p-8">
        <ErrorState
          title="No se encontró la carrera"
          description="Es posible que haya sido eliminada o que el enlace sea incorrecto."
          onRetry={refetch}
        />
      </div>
    )
  }

  // La API devuelve studyPlans con materias. Aca se reorganizan en un objeto
  // indexado por anio para poder renderizar bloques como 1er anio, 2do anio, etc.
  // Esto simplifica el mapeo visual dentro de la pestania de plan de estudios.
  const subjectsByYear = career.studyPlans.flatMap((p) => p.subjects).reduce<
    Record<number, Subject[]>
  >((acc, subject) => {
    if (!acc[subject.year]) acc[subject.year] = []
    acc[subject.year].push(subject)
    return acc
  }, {})

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header principal del detalle: nombre, universidad, modalidad y badges contextuales */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">{career.name}</h1>
            <p className="text-lg text-muted-foreground">{career.university.name}</p>
          </div>
          <Button
              variant={isComparing(career.id) ? "default" : "outline"}
              size="sm"
              onClick={() => isComparing(career.id) ? removeFromCompare(career.id) : addToCompare(career.id)}
              disabled={!isComparing(career.id) && !canAdd}
              title={!isComparing(career.id) && !canAdd ? "Comparador lleno (máx. 4)" : undefined}
            >
              <Scale className="h-4 w-4 mr-2" />
              {isComparing(career.id) ? "En comparador" : "Comparar"}
            </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{MODALITY_LABEL[career.modality]}</Badge>
          <Badge variant={career.university.type === "PUBLIC" ? "default" : "secondary"}>
            {career.university.type === "PUBLIC" ? "Pública" : "Privada"}
          </Badge>
          <Badge variant="secondary">{career.area.name}</Badge>
        </div>

        {career.description && (
          <p className="text-muted-foreground leading-relaxed pt-1">{career.description}</p>
        )}
      </section>

      {/* Resumen rapido de los datos mas importantes de la carrera */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-2xl font-bold">{career.durationYears}</p>
                <p className="text-xs text-muted-foreground">años de duración</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-semibold leading-tight">{career.degreeTitle}</p>
                <p className="text-xs text-muted-foreground mt-0.5">título obtenido</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-2xl font-bold">
                  {career.rating !== null ? career.rating : "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {career.reviewCount} {career.reviewCount === 1 ? "reseña" : "reseñas"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Tabs para separar informacion institucional, academica y social */}
      <Tabs defaultValue="universidad">
        <TabsList className="w-full">
          <TabsTrigger value="universidad" className="flex-1">Universidad</TabsTrigger>
          {career.studyPlans.length > 0 && (
            <TabsTrigger value="plan" className="flex-1">Plan de estudios</TabsTrigger>
          )}
          <TabsTrigger value="resenas" className="flex-1">
            Reseñas ({career.reviewCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="universidad" className="mt-6">
          <UniversityInfoCard
            university={career.university}
            careerCount={career.university.careerCount}
            rating={career.university.rating}
            reviewCount={career.university.reviewCount}
          />
        </TabsContent>

        {career.studyPlans.length > 0 && (
          <TabsContent value="plan" className="mt-6 space-y-4">
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
                          <div
                            key={subject.id}
                            className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                          >
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

        {/* Reseñas de usuarios. Si no hay, se muestra un estado vacio descriptivo */}
        <TabsContent value="resenas" className="mt-6 space-y-4">
          <ReviewForm postUrl={`careers/${career.id}/reviews`} onSuccess={refetch} />

          {career.reviews.length === 0 ? (
            <EmptyState
              icon={Star}
              title="Todavía no hay reseñas para esta carrera"
              description="Sé el primero en compartir tu experiencia."
            />
          ) : (
            career.reviews.map((review) => (
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
