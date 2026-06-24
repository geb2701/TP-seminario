import { Star } from "lucide-react"

export function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) {
    return <span className="text-sm text-muted-foreground">Sin calificación</span>
  }

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating} / 5.0</span>
    </div>
  )
}
