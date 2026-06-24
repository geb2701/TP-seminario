import { Sparkles } from "lucide-react"

// Umbral de prestigio: una universidad con promedio de reseñas >= 4.8 se
// considera "Prestigiosa". Se evalúa a nivel universidad (no carrera).
export const PRESTIGE_THRESHOLD = 4.8

export function isPrestigious(rating: number | null | undefined): boolean {
  return rating != null && rating >= PRESTIGE_THRESHOLD
}

// Chip dorado de contorno suave que marca a una universidad prestigiosa.
export function PrestigeBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-400/60 bg-amber-50/50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 ${className}`}
    >
      <Sparkles className="size-2.5" />
      Prestigiosa
    </span>
  )
}
