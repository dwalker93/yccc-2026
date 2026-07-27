import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

type SimpleTablePaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function SimpleTablePagination({
  page,
  totalPages,
  onPageChange,
}: SimpleTablePaginationProps) {
  if (totalPages <= 1) return null // ← don't render if only one page

  return (
    <div
      className="flex items-center justify-end gap-2 border-t px-4 py-2 text-xs
        text-muted-foreground"
    >
      <span>
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        className="size-7"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="size-3" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="size-7"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="size-3" />
      </Button>
    </div>
  )
}
