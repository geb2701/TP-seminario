"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Users, BookOpen, Award, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex-1 space-y-8 p-6 lg:p-8">
      {/* Hero Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bienvenido de vuelta</h1>
            <p className="text-muted-foreground mt-2">
              Descubre y compara las mejores carreras universitarias de Argentina
            </p>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Carreras</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,547</div>
            <p className="text-xs text-muted-foreground">
              +180 este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Universidades</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">
              Instituciones públicas y privadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,231</div>
            <p className="text-xs text-muted-foreground">
              +2,102 últimos 30 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comparaciones</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18,923</div>
            <p className="text-xs text-muted-foreground">
              Realizadas este mes
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Main Content Tabs */}
      <section>
        <Tabs defaultValue="recomendadas" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recomendadas">Recomendadas</TabsTrigger>
            <TabsTrigger value="populares">Populares</TabsTrigger>
            <TabsTrigger value="nuevas">Nuevas</TabsTrigger>
          </TabsList>

          <TabsContent value="recomendadas" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Ingeniería en Sistemas",
                  university: "Universidad Nacional de La Plata",
                  students: 2541,
                  rating: 4.8,
                },
                {
                  title: "Medicina",
                  university: "Universidad de Buenos Aires",
                  students: 3821,
                  rating: 4.9,
                },
                {
                  title: "Administración de Empresas",
                  university: "UADE - Buenos Aires",
                  students: 1920,
                  rating: 4.7,
                },
              ].map((career, i) => (
                <Card key={i} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Badge className="w-fit mb-2" variant="outline">Destacada</Badge>
                    <CardTitle className="text-lg">{career.title}</CardTitle>
                    <CardDescription>{career.university}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Estudiantes inscriptos</span>
                        <span className="font-semibold">{career.students.toLocaleString('es-AR')}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Calificación</span>
                        <span className="font-semibold flex items-center gap-1">
                          ⭐ {career.rating}
                        </span>
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        Ver detalles <ArrowRight className="h-4 w-4 ml-2" />
                      </Button> 
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="populares" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Carreras más buscadas</CardTitle>
                <CardDescription>Las 10 carreras con más búsquedas este mes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Ingeniería en Sistemas", searches: "8,543", growth: "+12%" },
                    { name: "Medicina", searches: "7,231", growth: "+8%" },
                    { name: "Enfermería", searches: "6,142", growth: "+15%" },
                    { name: "Psicología", searches: "5,923", growth: "+5%" },
                    { name: "Derecho", searches: "5,812", growth: "+3%" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{item.searches}</span>
                        <span className="text-sm text-green-600 font-semibold">{item.growth}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nuevas" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Carreras recientemente agregadas</CardTitle>
                <CardDescription>Nuevas opciones disponibles en el catálogo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Ingeniería en IA y Machine Learning", date: "Hace 2 días" },
                    { name: "Técnico en Ciberseguridad", date: "Hace 5 días" },
                    { name: "Carrera en Sostenibilidad", date: "Hace 1 semana" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 px-4 bg-secondary/50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                      </div>
                      <Button variant="ghost" size="sm">Ver</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">¿Listo para encontrar tu carrera?</h2>
            <p className="text-blue-100">Explora más de 2,500 carreras y compara universidades</p>
          </div>
          <Link href="/carreras">
            <Button className="bg-white text-blue-600 hover:bg-blue-50">
              Explorar ahora <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
