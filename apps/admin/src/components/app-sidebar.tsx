import { PlusIcon, SearchIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"

import { footerNavLinks, navGroups } from "@/components/app-shared"
import { LogoIcon } from "@/components/logo"
import { NavGroup } from "@/components/nav-group"

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="h-14 justify-center">
        <SidebarMenuButton asChild>
          <a href="#link">
            <LogoIcon />
            <span className="font-medium">YCCC Admin</span>
          </a>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              className="min-w-8 bg-primary text-primary-foreground duration-200
                ease-linear hover:bg-primary/90 hover:text-primary-foreground
                active:bg-primary/90 active:text-primary-foreground"
              tooltip="Quick Create"
            >
              <PlusIcon />
              <span>New Conversation</span>
            </SidebarMenuButton>
            <Button
              aria-label="Search conversations"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              size="icon"
              variant="outline"
            >
              <SearchIcon />
              <span className="sr-only">Search conversations</span>
            </Button>
          </SidebarMenuItem>
        </SidebarGroup>
        {navGroups.map((group, index) => (
          <NavGroup key={`sidebar-group-${index}`} {...group} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="mt-2">
          {footerNavLinks.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className="text-muted-foreground"
                size="sm"
              >
                <a href={item.path}>
                  {item.icon}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
