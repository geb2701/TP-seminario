import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Bookmark, BookmarkCheck, Scale, Building2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

const MODALITY_LABEL: Record<string, string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
  ONLINE: "Online",
}

type CareerCardProps = {
  career: {
    id: string
    name: string
    modality: string
    durationYears: number
    rating: number | null
  }
  university: {
    id?: string
    name: string
    city: string
    province: string
  }
  isSaved: boolean
  onSave: () => void
  isComparing: boolean
  canAddToCompare: boolean
  onCompare: () => void
  showUniversityLink?: boolean
  removeAction?: { label: string; onClick: () => void }
}

export function CareerCard({
  career,
  university,
  isSaved,
  onSave,
  isComparing,
  canAddToCompare,
  onCompare,
  showUniversityLink = false,
  removeAction,
}: CareerCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg">{career.name}</CardTitle>
            <CardDescription className="mt-1">{university.name}</CardDescription>
          </div>
          <Badge variant="outline">
            {MODALITY_LABEL[career.modality] ?? career.modality}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            {university.city}, {university.province}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" />
            {career.durationYears} {career.durationYears === 1 ? "año" : "años"}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            {career.rating !== null ? `⭐ ${career.rating} / 5.0` : "Sin reseñas"}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/carreras/${career.id}`} className={cn(buttonVariants(), "flex-1")}>
            Ver detalles
          </Link>
          {showUniversityLink && university.id && (
            <Link
              href={`/universidades/${university.id}`}
              className={cn(buttonVariants({ variant: "outline" }), "px-3")}
              title="Ver universidad"
            >
              <Building2 className="h-4 w-4" />
            </Link>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={onCompare}
            title={isComparing ? "Quitar del comparador" : canAddToCompare ? "Agregar al comparador" : "Comparador lleno (máx. 4)"}
            disabled={!isComparing && !canAddToCompare}
          >
            <Scale className={`h-4 w-4 ${isComparing ? "text-primary" : ""}`} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onSave}
            title={isSaved ? "Quitar de mis carreras" : "Guardar en mis carreras"}
          >
            {isSaved
              ? <BookmarkCheck className="h-4 w-4 text-primary" />
              : <Bookmark className="h-4 w-4" />}
          </Button>
        </div>
        {removeAction && (
          <Button
            variant="outline"
            className="w-full text-destructive hover:text-destructive"
            onClick={removeAction.onClick}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {removeAction.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
