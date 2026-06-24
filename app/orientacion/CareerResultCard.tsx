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
  universities: CareerResult[]
}

const MODALITY_LABEL: Record<string, string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
  ONLINE: "Online",
}

// ─── Ordenamiento por residencia / movilidad / prioridad ──────────────────────
// Fuente única de verdad para ordenar tanto las carreras (a nivel resultados)
// como las universidades dentro de cada card. La afinidad sigue siendo el
// FILTRO de pertenencia (se calcula y filtra en VocationalTest); acá solo
// reordena dentro de ese conjunto.

export interface SortContext {
  residence: string
  provinceFirst: boolean
  priority: string
  typePref?: string
  modalityPref?: string
}

export function deriveSortContext(phase3Answers: Record<string, string>): SortContext {
  const mobility = phase3Answers["mobility"]
  const priority = phase3Answers["priority"] ?? ""
  // LOCAL y COMMUTE = "solo mi provincia". RELOCATE = abierto a otras provincias.
  // priority=LOCATION fija la provincia incluso bajo RELOCATE (elección explícita).
  const strict = mobility === "LOCAL" || mobility === "COMMUTE"
  return {
    residence: phase3Answers["location"] ?? "",
    provinceFirst: strict || priority === "LOCATION",
    priority,
    typePref: phase3Answers["type"],
    modalityPref: phase3Answers["modality"],
  }
}

// Forma mínima que necesita el comparador (un row carrera+universidad).
export interface SortRow {
  province: string
  type: "PUBLIC" | "PRIVATE"
  modality: "PRESENCIAL" | "HIBRIDO" | "ONLINE"
  rating: number | null
  affinity?: number // presente al ordenar carreras; constante dentro de un card
}

// Claves lexicográficas ascendentes (0 = mejor). Orden:
// provincia (si provinceFirst) → señal de prioridad → afinidad → tipo → modalidad → rating.
export function rowSortKeys(row: SortRow, ctx: SortContext): number[] {
  const keys: number[] = []
  if (ctx.provinceFirst) keys.push(row.province === ctx.residence ? 0 : 1)
  // Señal de prioridad: PRESTIGE → rating; COST → pública primero; LOCATION/EMPLOYMENT → ninguna.
  if (ctx.priority === "PRESTIGE") keys.push(row.rating != null ? 5 - row.rating : 5)
  else if (ctx.priority === "COST") keys.push(row.type === "PUBLIC" ? 0 : 1)
  keys.push(100 - (row.affinity ?? 0)) // afinidad desc (constante dentro de un card)
  if (ctx.typePref && ctx.typePref !== "ANY") keys.push(row.type === ctx.typePref ? 0 : 1)
  if (ctx.modalityPref && ctx.modalityPref !== "ANY") keys.push(row.modality === ctx.modalityPref ? 0 : 1)
  keys.push(row.rating != null ? 5 - row.rating : 5) // tiebreak general por rating
  return keys
}

export function compareSortKeys(a: number[], b: number[]): number {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] - b[i]
  }
  return 0
}

// Ordena las universidades de una carrera con el mismo contexto. La afinidad es
// constante dentro de una carrera, así que esa clave no influye acá. Nunca
// filtra: todas las universidades siguen visibles.
export function orderUniversities(
  universities: CareerResult[],
  phase3Answers: Record<string, string>
): CareerResult[] {
  const ctx = deriveSortContext(phase3Answers)
  const keyOf = (c: CareerResult) =>
    rowSortKeys({ province: c.university.province, type: c.university.type, modality: c.modality, rating: c.university.rating }, ctx)
  return [...universities].sort((a, b) => {
    const cmp = compareSortKeys(keyOf(a), keyOf(b))
    return cmp !== 0 ? cmp : a.university.name.localeCompare(b.university.name, "es")
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
        <div className="flex items-start gap-2 min-w-0">
          <span className="text-sm font-medium break-words min-w-0 group-hover:text-primary transition-colors">{u.name}</span>
          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${u.type === "PUBLIC" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"}`}>
            {u.type === "PUBLIC" ? "Pública" : "Privada"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground break-words">
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
      className={`relative min-w-0 overflow-hidden rounded-xl border bg-card ${isHero ? "p-5 shadow-sm" : "p-4"}`}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: color }} />

      <div className="pl-2 space-y-3">
        <div className="flex items-start gap-3">
          <CircularScore value={career.affinity} color={color} size={isHero ? 84 : 56} />
          <div className="flex-1 min-w-0 space-y-1">
            {/* El título lleva al detalle de la mejor opción de esa carrera,
                conservando la conexión carrera → detalle. */}
            <h3 className={`font-semibold leading-snug break-words ${isHero ? "text-lg" : "text-sm"}`}>
              {ordered[0] ? (
                <Link href={`/carreras/${ordered[0].id}`} className="hover:text-primary hover:underline transition-colors">
                  {career.name}
                </Link>
              ) : (
                career.name
              )}
            </h3>
            <p className="text-xs text-muted-foreground">
              {AREA_EMOJIS[career.area.name]} {career.area.name} · {career.universities.length}{" "}
              {career.universities.length === 1 ? "universidad" : "universidades"}
            </p>
            {/* Las razones solo se muestran en el card destacado para no recargar los secundarios. */}
            {isHero && reasons.length > 0 && (
              <ul className="pt-1 space-y-1">
                {reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <span className="mt-0.5 shrink-0" style={{ color }}>✓</span>
                    <span className="min-w-0 break-words">{r}</span>
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
