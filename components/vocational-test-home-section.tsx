"use client"

import { useState } from "react"
import { ArrowRight, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VocationalTest } from "@/app/orientacion/VocationalTest"
import { useVocationalProfile } from "@/hooks/use-vocational-profile"
import { AREA_COLORS, AREA_EMOJIS } from "@/app/orientacion/constants"

type QuizMode = "view" | "retake"

const medals = ["🥇", "🥈", "🥉"]

export function VocationalTestHomeSection() {
  const [quizMode, setQuizMode] = useState<QuizMode | null>(null)
  const { profile, hydrated } = useVocationalProfile()

  if (quizMode !== null) {
    return (
      <div className="space-y-2">
        <button
          onClick={() => setQuizMode(null)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Volver al inicio
        </button>
        {quizMode === "view"
          ? <VocationalTest onClose={() => setQuizMode(null)} />
          : <VocationalTest skipIntro onClose={() => setQuizMode(null)} />
        }
      </div>
    )
  }

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="space-y-2">
          {[70, 55, 40].map((w) => (
            <div key={w} className="space-y-1.5">
              <div className="h-4 animate-pulse rounded bg-muted" style={{ width: `${w}%` }} />
              <div className="h-2 animate-pulse rounded-full bg-muted" />
            </div>
          ))}
        </div>
        <div className="h-11 w-52 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (profile) {
    const top3 = Object.entries(profile.scores).sort((a, b) => b[1] - a[1]).slice(0, 3)
    const savedDate = new Date(profile.savedAt).toLocaleDateString("es-AR", {
      day: "numeric", month: "long", year: "numeric",
    })

    return (
      <div className="space-y-5">
        <p className="text-lg text-muted-foreground">
          Guardado el {savedDate}
          {profile.personName && (
            <> · <span className="font-medium text-foreground">{profile.personName}</span></>
          )}
        </p>

        <div className="space-y-3 max-w-lg">
          {top3.map(([name, score], i) => {
            const color = AREA_COLORS[name] ?? "hsl(var(--primary))"
            return (
              <div key={name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span>{medals[i]}</span>
                    <span>{AREA_EMOJIS[name]}</span>
                    <span className="font-medium">{name}</span>
                  </span>
                  <span className="font-bold tabular-nums" style={{ color }}>{score}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${score}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button size="lg" onClick={() => setQuizMode("view")} className="gap-2">
            Ver resultados completos
            <ArrowRight className="size-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => setQuizMode("retake")} className="gap-2">
            <RotateCcw className="size-4" />
            Rehacer el test
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-lg text-muted-foreground max-w-2xl">
        Respondé 40 preguntas sobre tus intereses, habilidades y preferencias prácticas. En minutos tendrás un perfil vocacional con las áreas y carreras que mejor se adaptan a vos.
      </p>

      <div className="flex flex-wrap gap-2 text-sm">
        {Object.entries(AREA_EMOJIS).map(([name, emoji]) => (
          <div key={name} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
            <span>{emoji}</span>
            <span className="text-muted-foreground">{name}</span>
          </div>
        ))}
      </div>

      <Button size="lg" onClick={() => setQuizMode("retake")} className="gap-2">
        Comenzar test vocacional
        <ArrowRight className="size-4" />
      </Button>
    </div>
  )
}
