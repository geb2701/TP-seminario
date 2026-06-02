import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  GraduationCap,
  Compass,
  BarChart3,
  BookOpen,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { VocationalTestHomeSection } from "@/components/vocational-test-home-section"

const features = [
  {
    icon: Compass,
    title: "Explorar carreras",
    description:
      "Buscá entre cientos de carreras universitarias de todo el país. Filtrá por área, duración, modalidad y más.",
    href: "/carreras",
    badge: "Principal",
  },
  {
    icon: BarChart3,
    title: "Comparar carreras",
    description:
      "Poné dos o más carreras una al lado de la otra y analizá sus diferencias: duración, universidades disponibles, perfil del egresado y campo laboral.",
    href: "/comparar",
    badge: null,
  },
  {
    icon: GraduationCap,
    title: "Universidades",
    description:
      "Explorá las instituciones disponibles, tanto públicas como privadas, y conocé qué carreras ofrece cada una.",
    href: "/universidades",
    badge: null,
  },
  {
    icon: BookOpen,
    title: "Mis carreras",
    description:
      "Guardá las carreras que más te interesan para volver a verlas cuando quieras y organizarlas a tu manera.",
    href: "/mis-carreras",
    badge: null,
  },
  {
    icon: Users,
    title: "Comunidad",
    description:
      "Leé experiencias de estudiantes y egresados, hacé preguntas y compartí tu opinión sobre las carreras.",
    href: "/comunidad",
    badge: null,
  },
]

const steps = [
  { label: "Explorá las carreras disponibles por área o nombre" },
  { label: "Comparalas para encontrar la que mejor se adapta a vos" },
  { label: "Guardá las que más te gusten en tu lista personal" },
]

export default function Home() {
  return (
    <div className="flex-1 space-y-16 p-6 lg:p-10 max-w-5xl mx-auto w-full">

      {/* Hero */}
      <section className="space-y-6 pt-4">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Encontrá la carrera universitaria<br className="hidden md:block" /> que estás buscando
        </h1>
        <VocationalTestHomeSection />
      </section>

      <Separator />

      {/* Features */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">¿Qué podés hacer acá?</h2>
          <p className="text-muted-foreground">
            Estas son las herramientas disponibles en el sitio.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href} className="group block">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    {feature.badge && (
                      <Badge variant="secondary">{feature.badge}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {feature.title}
                    <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Separator />

      {/* How it works */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">¿Cómo empezar?</h2>
          <p className="text-muted-foreground">En tres pasos simples.</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3 flex-1">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Paso {i + 1}
                </span>
                <p className="mt-0.5 text-sm">{step.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
