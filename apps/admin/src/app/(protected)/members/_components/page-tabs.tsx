"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@workspace/ui/lib/utils"
import { Badge } from "@workspace/ui/components/badge"

type TabKey = "overview" | "career" | "billing" | "history"

type TabItem = {
  key: TabKey
  label: string
  href: string
}

const TAB_ITEMS: TabItem[] = [
  { key: "overview", label: "Overview", href: "" },
  { key: "career", label: "Career", href: "/career" },
  { key: "billing", label: "Billing", href: "/billing" },
  { key: "history", label: "History", href: "/history" },
]

type PageTabsProps = {
  id: string
  badges?: Partial<Record<TabKey, number>>
}

export default function PageTabs({ id, badges }: PageTabsProps) {
  const pathname = usePathname()

  return (
    <div className="-mx-4 border-t border-b border-muted md:-mx-6">
      <div className="flex items-center gap-4 px-4 md:gap-6 md:px-6">
        {TAB_ITEMS.map(({ key, label, href }) => {
          const fullHref = `/members/${id}${href}`
          const isActive = pathname === fullHref
          const badgeCount = badges?.[key]

          return (
            <Link
              key={key}
              href={fullHref}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm",
                isActive
                  ? "border-b-2 border-primary font-medium"
                  : `text-muted-foreground transition-colors
                    hover:text-foreground`
              )}
            >
              {label}
              {!!badgeCount && <Badge variant={isActive ? "default" : "secondary"}>{badgeCount}</Badge>}
            </Link>
          )
        })}
      </div>
    </div>
  )
}