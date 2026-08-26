import { ReactNode } from "react"

import { cn } from "@workspace/ui/lib/utils"

type MemberProfileCardProps = {
  title?: ReactNode
  titleIcon?: ReactNode
  action?: ReactNode
  variant?: "default" | "destructive"
  children: ReactNode
}

export function MemberProfileCard({
  title,
  titleIcon,
  action,
  variant = "default",
  children,
}: MemberProfileCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border",
        variant === "destructive" ? "border-destructive" : "border-border",
        "bg-card"
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div
            className={cn(
              "flex items-center gap-2",
              variant === "destructive"
                ? "text-destructive"
                : "text-muted-foreground"
            )}
          >
            {titleIcon && (
              <span className="inline-flex size-5 items-center">
                {titleIcon}
              </span>
            )}
            {title && (
              <span className="text-[0.625rem] tracking-widest uppercase">
                {title}
              </span>
            )}
          </div>
          {action && <div className="ml-auto">{action}</div>}
        </div>
      )}
      <div className="px-4 py-6">{children}</div>
    </div>
  )
}
