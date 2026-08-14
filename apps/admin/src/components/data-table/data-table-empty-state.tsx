import { LucideIcon } from "lucide-react"

type DataTableEmptyStateProps = {
  icon: LucideIcon
  message: string
  description?: string
}

export function DataTableEmptyState({
  icon: Icon,
  message,
  description,
}: DataTableEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 rounded-full bg-muted p-4 text-muted-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium">{message}</p>
      {description && (
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
}
