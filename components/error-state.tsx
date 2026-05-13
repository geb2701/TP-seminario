import { type LucideIcon, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ErrorStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export function ErrorState({
  icon: Icon = AlertCircle,
  title,
  description,
  onRetry,
  retryLabel = "Reintentar",
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 gap-4", className)}>
      <Icon className="h-10 w-10 text-destructive opacity-70" />
      <div className="space-y-1 text-center">
        <p className="font-medium text-foreground">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
