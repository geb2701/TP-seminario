import { Sparkles } from "lucide-react"

// Señal de prestigio: una universidad es "prestigiosa" si figura en el QS World
// University Rankings (topuniversities.com). La presencia de un puesto QS
// (qsRank != null) es lo que la marca — reemplaza el viejo umbral por promedio
// de reseñas. Se evalúa a nivel universidad (no carrera).
export function isPrestigious(qsRank: number | null | undefined): boolean {
  return qsRank != null
}

// Chip dorado de contorno suave que marca a una universidad prestigiosa. Si se
// pasa `rankLabel` (p. ej. "84" o "801-850"), lo muestra como tooltip.
export function PrestigeBadge({ rankLabel, className = "" }: { rankLabel?: string | null; className?: string }) {
  return (
    <span
      title={rankLabel ? `QS World University Rankings #${rankLabel}` : "En el QS World University Rankings"}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-400/60 bg-amber-50/50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 ${className}`}
    >
      <Sparkles className="size-2.5" />
      Prestigiosa
    </span>
  )
}
