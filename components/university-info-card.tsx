import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MapPin, Globe, Landmark, Users, Star } from "lucide-react"

type UniversityInfoCardProps = {
  university: {
    id?: string
    name: string
    city: string
    province: string
    type: "PUBLIC" | "PRIVATE"
    website?: string | null
    foundedYear?: number | null
    description?: string | null
  }
  careerCount?: number
  rating?: number | null
  reviewCount?: number
}

export function UniversityInfoCard({ university, careerCount, rating, reviewCount }: UniversityInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        {university.foundedYear && (
          <CardDescription>Fundada en {university.foundedYear}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {university.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {university.description}
          </p>
        )}
        <Separator />
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            {university.city}, {university.province}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Landmark className="h-4 w-4 shrink-0" />
            {university.type === "PUBLIC" ? "Universidad Pública" : "Universidad Privada"}
          </div>
          {careerCount !== undefined && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 shrink-0" />
              {careerCount} {careerCount === 1 ? "carrera" : "carreras"}
            </div>
          )}
          {rating !== undefined && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="h-4 w-4 shrink-0" />
              {rating ? `${rating} / 5.0 (${reviewCount} reseñas)` : "Sin reseñas"}
            </div>
          )}
        </div>
        {university.website && (
          <a
            href={university.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Globe className="h-4 w-4" />
            {university.website}
          </a>
        )}
      </CardContent>
    </Card>
  )
}
