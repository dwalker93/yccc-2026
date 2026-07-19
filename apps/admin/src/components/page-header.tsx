import { type ReactNode } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

interface PageHeaderProps {
  title: string
  description?: string
  backHref?: string
  actions?: ReactNode
}

export function PageHeader({
  title,
  description,
  backHref,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-4">
        {backHref && (
          <Button
            variant="outline"
            size="icon"
            asChild
            className="h-8 w-8 rounded-full"
          >
            <Link href={backHref}>
              <ChevronLeft className="size-6" />
            </Link>
          </Button>
        )}
        <div className="flex flex-col gap-0.5">
          <h2 className="font-heading text-[20px] font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
