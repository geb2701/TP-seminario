import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Genera los números de página a mostrar, con "…" cuando hay muchas páginas.
function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  const pages: (number | "ellipsis")[] = []
  const window = 1
  const add = (n: number | "ellipsis") => pages.push(n)

  add(1)
  if (current - window > 2) add("ellipsis")
  for (let p = Math.max(2, current - window); p <= Math.min(total - 1, current + window); p++) {
    add(p)
  }
  if (current + window < total - 1) add("ellipsis")
  if (total > 1) add(total)

  return pages
}

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <section className="flex items-center justify-center gap-1.5">
      <Button
        variant="outline"
        size="icon"
        disabled={page === 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getPageNumbers(page, totalPages).map((p, i) =>
        p === "ellipsis" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        disabled={page === totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </section>
  )
}
