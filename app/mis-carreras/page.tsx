"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Clock, Users, Trash2, BookOpen } from "lucide-react"
import Link from "next/link"

const STORAGE_KEY = "mis-carreras"

type Career = {
  id: string
  name: string
  durationYears: number
  degreeTitle: string
  modality: "PRESENCIAL" | "HIBRIDO" | "ONLINE"
  studentCount: number
  university: { name: string; city: string; province: string }
  area: { name: string }
  rating: number | null
}

const MODALITY_LABEL: Record<Career["modality"], string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
  ONLINE: "Online",
}

export function useSavedCareers() {
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      setIds(stored ? JSON.parse(stored) : [])
    } catch {
      setIds([])
    }
  }, [])

  function save(id: string) {
    setIds((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  function remove(id: string) {
    setIds((prev) => {
      const next = prev.filter((i) => i !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  function isSaved(id: string) {
    return ids.includes(id)
  }

  return { ids, save, remove, isSaved }
}

export default function MisCarrerasPage() {
  const { ids, remove } = useSavedCareers()

  const { data: careers, isLoading } = useQuery<Career[]>({
    queryKey: ["compare", ids],
    queryFn: () =>
      api.get(`careers/compare?ids=${ids.join(",")}`).json<Career[]>(),
    enabled: ids.length > 0,
  })

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">Mis carreras</h1>
        <p className="text-muted-foreground">
          Carreras que guardaste para revisar más tarde.
        </p>
      </section>

      {ids.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
          <BookOpen className="h-12 w-12 opacity-20" />
          <p>No tenés carreras guardadas todavía.</p>
          <Link href="/carreras" className={buttonVariants()}>
            Explorar carreras
          </Link>
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {isLoading
            ? Array.from({ length: ids.length }).map((_, i) => (
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
                      <Badge variant="outline">{MODALITY_LABEL[career.modality]}</Badge>
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
                        {career.durationYears} años
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4 shrink-0" />
                        {career.studentCount.toLocaleString("es-AR")} estudiantes
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {career.rating !== null ? `⭐ ${career.rating} / 5.0` : "Sin reseñas"}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full text-destructive hover:text-destructive"
                      onClick={() => remove(career.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Quitar de mis carreras
                    </Button>
                  </CardContent>
                </Card>
              ))}
        </section>
      )}
    </div>
  )
}
