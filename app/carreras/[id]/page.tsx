"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useApiQuery } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Clock,
  Users,
  GraduationCap,
  Globe,
  ArrowLeft,
  Star,
  BookOpen,
  Building2,
  Calendar,
} from "lucide-react"

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

// Convierte un numero de rating en una fila de estrellas visuales.
// Se reutiliza para no repetir la misma logica en cada card de reseña.
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
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

  // Se usa para volver a la pantalla anterior desde los botones de navegacion.
  const router = useRouter()

  // Esta llamada pega a /api/careers/:id a traves de useApiQuery.
  // La respuesta se guarda en `career` y queda tipada como CareerDetail.
  // Tambien expone flags para manejar carga y error sin hacer fetch manual.
  const { data: career, isLoading, isError } = useApiQuery<CareerDetail>(
    ["career", id],
    `careers/${id}`
  )

  // Mientras llega la respuesta, renderiza una version skeleton de la pagina.
  if (isLoading) return <SkeletonDetail />

  // Si la API falla o no devuelve datos, se muestra un estado vacio simple.
  if (isError || !career) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 lg:p-8 min-h-[40vh]">
        <p className="text-muted-foreground text-lg">No se encontró la carrera.</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
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
    <div className="space-y-8 p-6 lg:p-8 max-w-5xl">
      {/* Volver */}
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a carreras
      </Button>

      {/* Header principal del detalle: nombre, universidad, modalidad y badges contextuales */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">{career.name}</h1>
            <p className="text-lg text-muted-foreground">{career.university.name}</p>
          </div>
          <Badge variant="outline" className="text-sm px-3 py-1">
            {MODALITY_LABEL[career.modality]}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{career.area.name}</Badge>
          <Badge variant={career.university.type === "PUBLIC" ? "default" : "secondary"}>
            {career.university.type === "PUBLIC" ? "Pública" : "Privada"}
          </Badge>
        </div>

        {career.description && (
          <p className="text-muted-foreground leading-relaxed pt-1">{career.description}</p>
        )}
      </section>

      {/* Resumen rapido de los datos mas importantes de la carrera */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <Users className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-2xl font-bold">{career.studentCount.toLocaleString("es-AR")}</p>
                <p className="text-xs text-muted-foreground">estudiantes</p>
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
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="universidad">Universidad</TabsTrigger>
          {/* Solo se muestra si la API devolvio planes/materias para esta carrera */}
          {career.studyPlans.length > 0 && (
            <TabsTrigger value="plan">Plan de estudios</TabsTrigger>
          )}
          <TabsTrigger value="resenas">
            Reseñas ({career.reviewCount})
          </TabsTrigger>
        </TabsList>

        {/* Informacion institucional de la universidad asociada a la carrera */}
        <TabsContent value="universidad" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {career.university.name}
              </CardTitle>
              {career.university.foundedYear && (
                <CardDescription>Fundada en {career.university.foundedYear}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {career.university.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {career.university.description}
                </p>
              )}
              <Separator />
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {career.university.city}, {career.university.province}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" />
                  {career.university.type === "PUBLIC" ? "Universidad Pública" : "Universidad Privada"}
                </div>
              </div>
              {career.university.website && (
                <a
                  href={career.university.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  {career.university.website}
                </a>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plan de estudios agrupado por anio y luego por materia */}
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
          {career.reviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              Todavía no hay reseñas para esta carrera.
            </p>
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
