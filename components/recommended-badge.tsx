import { BadgeCheck } from "lucide-react"

// Señal de recomendación: una carrera es "Recomendada" si su universidad figura
// en el QS World University Rankings by Subject para la gran área de la carrera
// (ver lib/qs-subjects.ts). Independiente del prestigio (ranking mundial).
export function isRecommended(recommended: boolean | null | undefined): boolean {
  return !!recommended
}

// Chip azul de contorno suave, gemelo del PrestigeBadge (ámbar). Si se pasa
// `rankLabel`, lo muestra como tooltip.
export function RecommendedBadge({ rankLabel, className = "" }: { rankLabel?: string | null; className?: string }) {
  return (
    <span
      title={rankLabel ? `QS por disciplina #${rankLabel}` : "En el QS World University Rankings by Subject"}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-blue-400/60 bg-blue-50/50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 ${className}`}
    >
      <BadgeCheck className="size-2.5" />
      Recomendada
    </span>
  )
}
