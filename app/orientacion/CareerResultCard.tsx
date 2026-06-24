"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, ChevronDown } from "lucide-react"
import { AREA_COLORS, AREA_EMOJIS } from "./constants"

// Un (carrera, universidad) del dataset. Cada fila conserva su propio Career.id,
// así que los links a /carreras/{id} siguen siendo profundos y precisos.
export interface CareerResult {
  id: string
  name: string
  durationYears: number
  modality: "PRESENCIAL" | "HIBRIDO" | "ONLINE"
  rating: number | null
  university: { id: string; name: string; city: string; province: string; type: "PUBLIC" | "PRIVATE"; rating: number | null }
  area: { id: string; name: string }
}

// Carrera agrupada por nombre: la afinidad es idéntica entre sus universidades
// (depende del nombre, no de la universidad), y `universities` son las distintas
// ofertas de esa carrera.
export interface GroupedCareer {
  key: string
  name: string
  area: { id: string; name: string }
  affinity: number
  finalScore: number
  universities: CareerResult[]
}

const MODALITY_LABEL: Record<string, string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
  ONLINE: "Online",
}

// Ordena las universidades de una carrera con prioridades suaves: provincia
// elegida → tipo (pública/privada) → modalidad → rating (mayor primero, sin
// reseñas al final). Nunca filtra: todas las universidades siguen visibles.
export function orderUniversities(
  universities: CareerResult[],
  phase3Answers: Record<string, string>
): CareerResult[] {
  const locationPref = phase3Answers["location"]
  const typePref = phase3Answers["type"]
  const modalityPref = phase3Answers["modality"]

  const score = (c: CareerResult): number[] => [
    locationPref && locationPref !== "ANY" && c.university.province === locationPref ? 0 : 1,
    typePref && typePref !== "ANY" && c.university.type === typePref ? 0 : 1,
    modalityPref && modalityPref !== "ANY" && c.modality === modalityPref ? 0 : 1,
    c.university.rating != null ? -c.university.rating : 1, // rating desc, nulls al final
  ]

  return [...universities].sort((a, b) => {
    const sa = score(a)
    const sb = score(b)
    for (let i = 0; i < sa.length; i++) {
      if (sa[i] !== sb[i]) return sa[i] - sb[i]
    }
    return a.university.name.localeCompare(b.university.name, "es")
  })
}

function CircularScore({ value, color, size }: { value: number; color: string; size: number }) {
  const stroke = size >= 80 ? 7 : 5
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.max(0, Math.min(100, value)) / 100)
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-muted-foreground/15" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.7s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold tabular-nums ${size >= 80 ? "text-xl" : "text-sm"}`} style={{ color }}>
          {value > 0 ? `${value}%` : "—"}
        </span>
      </div>
    </div>
  )
}

function UniversityRow({ option }: { option: CareerResult }) {
  const u = option.university
  return (
    <Link
      href={`/carreras/${option.id}`}
      className="group flex items-center gap-3 rounded-lg border bg-card px-3 py-2 hover:border-primary/40 hover:bg-muted/40 transition-colors"
    >
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">{u.name}</span>
          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${u.type === "PUBLIC" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"}`}>
            {u.type === "PUBLIC" ? "Pública" : "Privada"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {u.city}, {u.province} · {MODALITY_LABEL[option.modality]}
          {u.rating != null && ` · ⭐ ${u.rating}`}
        </p>
      </div>
      <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </Link>
  )
}

const INLINE_UNIVERSITIES = 3

export function CareerResultCard({
  career,
  variant,
  reasons,
  phase3Answers,
}: {
  career: GroupedCareer
  variant: "hero" | "secondary"
  reasons: string[]
  phase3Answers: Record<string, string>
}) {
  const [expanded, setExpanded] = useState(false)
  const color = AREA_COLORS[career.area.name] ?? "hsl(var(--primary))"
  const ordered = orderUniversities(career.universities, phase3Answers)
  const visible = expanded ? ordered : ordered.slice(0, INLINE_UNIVERSITIES)
  const hidden = ordered.length - visible.length
  const isHero = variant === "hero"

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-card ${isHero ? "p-5 shadow-sm" : "p-4"}`}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: color }} />

      <div className="pl-2 space-y-3">
        <div className="flex items-start gap-3">
          <CircularScore value={career.affinity} color={color} size={isHero ? 84 : 56} />
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className={`font-semibold leading-snug ${isHero ? "text-lg" : "text-sm"}`}>{career.name}</h3>
            <p className="text-xs text-muted-foreground">
              {AREA_EMOJIS[career.area.name]} {career.area.name} · {career.universities.length}{" "}
              {career.universities.length === 1 ? "universidad" : "universidades"}
            </p>
            {/* Las razones solo se muestran en el card destacado para no recargar los secundarios. */}
            {isHero && reasons.length > 0 && (
              <ul className="pt-1 space-y-1">
                {reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <span className="mt-0.5" style={{ color }}>✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          {visible.map((option) => (
            <UniversityRow key={option.id} option={option} />
          ))}
          {hidden > 0 && (
            <button
              onClick={() => setExpanded(true)}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <ChevronDown className="size-3.5" />
              Ver {hidden} {hidden === 1 ? "universidad más" : "universidades más"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
