import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Blog | UniFlow",
  description: "Notas y guías para elegir carrera y universidad en Argentina.",
}

const posts = [
  {
    title: "Cómo elegir carrera sin frustrarte en el intento",
    description:
      "Una guía práctica para bajar la ansiedad, ordenar prioridades y tomar decisiones con más claridad.",
    tag: "Orientación",
    href: "/orientacion",
  },
  {
    title: "Qué mirar al comparar universidades",
    description:
      "No todo es prestigio: ubicación, plan de estudios, modalidad y salida laboral también importan.",
    tag: "Comparativas",
    href: "/comparar",
  },
  {
    title: "Plan de acción de 30 días para decidir tu carrera",
    description:
      "Un paso a paso simple para investigar opciones, hablar con estudiantes y validar tu elección.",
    tag: "Guías",
    href: "/carreras",
  },
]

export default function BlogPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 p-6 lg:p-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Blog UniFlow</h1>
        <p className="max-w-3xl text-muted-foreground">
          Recursos cortos y accionables para ayudarte a elegir carrera y universidad con más información y menos ruido.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.title} className="h-full">
            <CardHeader className="space-y-2">
              <Badge variant="secondary" className="w-fit">
                {post.tag}
              </Badge>
              <CardTitle className="text-lg leading-snug">{post.title}</CardTitle>
              <CardDescription>{post.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href={post.href}>Leer más</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

    </div>
  )
}
