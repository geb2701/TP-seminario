"use client"

import { useState } from "react"
import { useApiQuery, api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, Trash2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

type CareerOption = {
  id: string
  name: string
  university: { name: string; city: string; province: string }
}

type CareerDetail = CareerOption & {
  durationYears: number
  degreeTitle: string
  modality: "PRESENCIAL" | "HIBRIDO" | "ONLINE"
  studentCount: number
  description: string | null
  university: { name: string; city: string; province: string; type: string }
  area: { name: string }
  rating: number | null
  reviewCount: number
  studyPlans: {
    id: string
    year: number
    subjects: {
      id: string
      name: string
      semester: number | null
    }[]
  }[]
}

const MODALITY_LABEL: Record<string, string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
  ONLINE: "Online",
}

const MAX_CAREERS = 3

function renderStudyPlan(career: CareerDetail) {
  if (!career.studyPlans.length) {
    return "Sin plan disponible"
  }

  return (
    <div className="space-y-2">
      {career.studyPlans.map((plan) => (
        <div key={plan.id} className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{plan.year}° año</p>
          {plan.subjects.length > 0 ? (
            <p className="text-sm leading-relaxed">
              {plan.subjects.map((subject) => subject.name).join(", ")}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Sin materias cargadas</p>
          )}
        </div>
      ))}
    </div>
  )
}

export default function ComparePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [pickerValue, setPickerValue] = useState("")

  const { data: allCareers } = useApiQuery<CareerOption[]>(["careers-list"], "careers")

  const { data: compared, isLoading } = useQuery<CareerDetail[]>({
    queryKey: ["compare", selectedIds],
    queryFn: () =>
      api.get(`careers/compare?ids=${selectedIds.join(",")}`).json<CareerDetail[]>(),
    enabled: selectedIds.length > 0,
  })

  function addCareer(id: string) {
    if (!id || selectedIds.includes(id) || selectedIds.length >= MAX_CAREERS) return
    setSelectedIds((prev) => [...prev, id])
    setPickerValue("")
  }

  function removeCareer(id: string) {
    setSelectedIds((prev) => prev.filter((i) => i !== id))
  }

  const availableToAdd = allCareers?.filter((c) => !selectedIds.includes(c.id))

  const rows: { label: string; render: (c: CareerDetail) => React.ReactNode }[] = [
    { label: "Universidad", render: (c) => c.university.name },
    { label: "Localidad", render: (c) => `${c.university.city}, ${c.university.province}` },
    { label: "Tipo de institución", render: (c) => c.university.type === "PUBLIC" ? "Pública" : "Privada" },
    { label: "Área", render: (c) => c.area.name },
    { label: "Título otorgado", render: (c) => c.degreeTitle },
    { label: "Duración", render: (c) => `${c.durationYears} años` },
    {
      label: "Modalidad", render: (c) => (
        <Badge variant="outline">{MODALITY_LABEL[c.modality]}</Badge>
      ),
    },
    {
      label: "Estudiantes inscritos",
      render: (c) => c.studentCount.toLocaleString("es-AR"),
    },
    {
      label: "Calificación",
      render: (c) =>
        c.rating !== null
          ? `⭐ ${c.rating} / 5.0 (${c.reviewCount} reseñas)`
          : "Sin reseñas",
    },
    {
      label: "Plan de estudios",
      render: (c) => renderStudyPlan(c),
    },
  ]

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">Comparador de Carreras</h1>
        <p className="text-muted-foreground">
          Comparás hasta {MAX_CAREERS} carreras lado a lado
        </p>
      </section>

      <section className="flex items-center gap-3">
        <Select
          value={pickerValue}
          onValueChange={(v) => { const val = v ?? ""; setPickerValue(val); addCareer(val) }}
          disabled={selectedIds.length >= MAX_CAREERS}
        >
          <SelectTrigger className="w-96">
            <SelectValue
              placeholder={
                selectedIds.length >= MAX_CAREERS
                  ? "Máximo alcanzado"
                  : "Agregar carrera para comparar..."
              }
            />
          </SelectTrigger>
          <SelectContent>
            {availableToAdd?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} — {c.university.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedIds.length > 0 && (
          <Button variant="outline" onClick={() => setSelectedIds([])}>
            <Trash2 className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        )}
      </section>

      {selectedIds.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Plus className="h-12 w-12 opacity-20" />
          <p>Seleccioná al menos una carrera para comenzar la comparación.</p>
        </div>
      )}

      {selectedIds.length > 0 && (
        <section className="overflow-x-auto rounded-lg border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left py-3 px-4 font-semibold sticky left-0 bg-muted/40 w-48">
                  Característica
                </th>
                {isLoading
                  ? selectedIds.map((id) => (
                    <th key={id} className="py-3 px-4 min-w-[220px]">
                      <Skeleton className="h-5 w-3/4" />
                    </th>
                  ))
                  : compared?.map((career) => (
                    <th key={career.id} className="text-left py-3 px-4 min-w-[220px]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{career.name}</p>
                          <p className="text-xs font-normal text-muted-foreground mt-0.5">
                            {career.university.name}
                          </p>
                        </div>
                        <button
                          onClick={() => removeCareer(career.id)}
                          className="text-muted-foreground hover:text-destructive shrink-0 mt-0.5"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="py-3 px-4 font-medium sticky left-0 bg-background text-muted-foreground">
                    {row.label}
                  </td>
                  {isLoading
                    ? selectedIds.map((id) => (
                      <td key={id} className="py-3 px-4">
                        <Skeleton className="h-4 w-3/4" />
                      </td>
                    ))
                    : compared?.map((career) => (
                      <td key={career.id} className="py-3 px-4">
                        {row.render(career)}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}
