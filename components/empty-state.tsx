import { type LucideIcon } from "lucide-react"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateAction {
  label: string
  href?: string
  onClick?: () => void
}

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: EmptyStateAction
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground", className)}>
      <Icon className="h-12 w-12 opacity-20" />
      <div className="space-y-1 text-center">
        <p className="font-medium text-foreground">{title}</p>
        {description && <p className="text-sm">{description}</p>}
      </div>
      {action && (
        action.href ? (
          <Link href={action.href} className={buttonVariants()}>
            {action.label}
          </Link>
        ) : (
          <Button onClick={action.onClick}>{action.label}</Button>
        )
      )}
    </div>
  )
}
