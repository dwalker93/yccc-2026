import type { ReactNode } from "react"
import {
  ActivityIcon,
  BarChart3Icon,
  FileTextIcon,
  LayoutGridIcon,
  UsersIcon,
} from "lucide-react"

export type SidebarNavItem = {
  title: string
  path: string
  icon?: ReactNode
  subItems?: SidebarNavItem[]
}

export type SidebarNavGroup = {
  label: string
  items: SidebarNavItem[]
}

export const navGroups: SidebarNavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        path: "/",
        icon: <LayoutGridIcon />,
      },
      {
        title: "Analytics",
        path: "/analytics",
        icon: <BarChart3Icon />,
      },
    ],
  },
  {
    label: "Members",
    items: [
      {
        title: "Members",
        path: "/members",
        icon: <UsersIcon />,
        subItems: [
          { title: "All members", path: "/members" },
          { title: "Pending", path: "/members?status=pending" },
          { title: "Banned", path: "/members?status=banned" },
          { title: "Create member", path: "/members/create" },
        ],
      },
      {
        title: "Certificates",
        path: "/certificates",
        icon: <FileTextIcon />,
      },
    ],
  },
  {
    label: "Team",
    items: [
      {
        title: "Team members",
        path: "/team-members",
        icon: <UsersIcon />,
      },
    ],
  },
]

export const footerNavLinks: SidebarNavItem[] = [
  {
    title: "Platform status",
    path: "/status",
    icon: <ActivityIcon />,
  },
]

export const navLinks: SidebarNavItem[] = [
  ...navGroups.flatMap((group) =>
    group.items.flatMap((item) =>
      item.subItems?.length ? [item, ...item.subItems] : [item]
    )
  ),
  ...footerNavLinks,
]
