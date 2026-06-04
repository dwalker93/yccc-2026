"use client"

import { BellIcon, SendIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { cn } from "@workspace/ui/lib/utils"

import { AppBreadcrumbs } from "@/components/app-breadcrumbs"
import { CustomSidebarTrigger } from "@/components/custom-sidebar-trigger"
import { NavUser } from "@/components/nav-user"

export function AppHeader() {
  return (
    <header
      className={cn(
        `sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-2
        border-b px-4 md:px-6`
      )}
    >
      <div className="flex items-center gap-3">
        <CustomSidebarTrigger />
        <Separator
          className="mr-2 h-4 data-[orientation=vertical]:self-center"
          orientation="vertical"
        />
        <AppBreadcrumbs />
      </div>
      <div className="flex items-center gap-3">
        <Button size="icon-sm" variant="outline">
          <SendIcon />
        </Button>
        <Button aria-label="Notifications" size="icon-sm" variant="outline">
          <BellIcon />
        </Button>
        <Separator
          className="h-4 data-[orientation=vertical]:self-center"
          orientation="vertical"
        />
        <NavUser />
      </div>
    </header>
  )
}
