"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { CareerCard } from "@/components/career-card"
import { useCompareCareers } from "@/hooks/use-compare-careers"

const STORAGE_KEY = "mis-carreras"

type Career = {
  id: string
  name: string
  durationYears: number
  modality: "PRESENCIAL" | "HIBRIDO" | "ONLINE"
  university: { id: string; name: string; city: string; province: string }
  rating: number | null
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
  const { ids, isSaved, save, remove } = useSavedCareers()
  const { isComparing, canAdd, add: addToCompare, remove: removeFromCompare } = useCompareCareers()

  const { data: careers, isLoading } = useQuery<Career[]>({
    queryKey: ["mis-carreras", ids],
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
        <EmptyState
          icon={BookOpen}
          title="No tenés carreras guardadas todavía"
          action={{ label: "Explorar carreras", href: "/carreras" }}
        />
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
                <CareerCard
                  key={career.id}
                  career={career}
                  university={career.university}
                  isSaved={isSaved(career.id)}
                  onSave={() => isSaved(career.id) ? remove(career.id) : save(career.id)}
                  isComparing={isComparing(career.id)}
                  canAddToCompare={canAdd}
                  onCompare={() => isComparing(career.id) ? removeFromCompare(career.id) : addToCompare(career.id)}
                  showUniversityLink
                  removeAction={{
                    label: "Quitar de mis carreras",
                    onClick: () => remove(career.id),
                  }}
                />
              ))}
        </section>
      )}
    </div>
  )
}
