"use client"

import Link from "next/link"
import { BrainCircuit, X, ArrowRight } from "lucide-react"
import { useVocationalProfile } from "@/hooks/use-vocational-profile"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const AREA_EMOJIS: Record<string, string> = {
  "Ingeniería y Tecnología": "⚙️",
  "Ciencias de la Salud": "🏥",
  "Ciencias Económicas": "📊",
  "Derecho y Ciencias Sociales": "⚖️",
  "Humanidades y Artes": "🎨",
  "Ciencias Exactas y Naturales": "🔬",
  "Arquitectura y Diseño": "🏛️",
  "Comunicación y Periodismo": "📡",
}

export function VocationalProfileBanner() {
  const { profile, hydrated, clearProfile } = useVocationalProfile()

  if (!hydrated || !profile) return null

  const emoji = AREA_EMOJIS[profile.topArea] ?? "🎓"
  const name = profile.personName ? `, ${profile.personName}` : ""

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border bg-primary/5 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <BrainCircuit className="size-5 text-primary shrink-0" />
        <p className="text-sm leading-snug">
          <span className="font-semibold">Tu perfil vocacional{name}:</span>{" "}
          <span className="text-muted-foreground">
            mayor afinidad con{" "}
            <span className="font-medium text-foreground">
              {emoji} {profile.topArea}
            </span>
          </span>
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Link
          href="/orientacion"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5 text-xs")}
        >
          Ver resultados
          <ArrowRight className="size-3" />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground"
          onClick={clearProfile}
        >
          <X className="size-3.5" />
          <span className="sr-only">Cerrar</span>
        </Button>
      </div>
    </div>
  )
}
