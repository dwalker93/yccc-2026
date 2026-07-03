import type { ReactNode } from "react"
import {
  ActivityIcon,
  Banknote,
  BarChart3Icon,
  CreditCardIcon,
  FileTextIcon,
  HexagonIcon,
  LayoutGridIcon,
  SettingsIcon,
  StarIcon,
  TagIcon,
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
          { title: "Create member", path: "/members/create" },
          { title: "All members", path: "/members" },
          { title: "Pending", path: "/members/pending" },
          { title: "Rejected", path: "/members/rejected" },
          { title: "Suspended", path: "/members/suspended" },
          { title: "Banned", path: "/members/banned" },
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
    label: "Billing",
    items: [
      {
        title: "Invoices",
        path: "/invoices",
        icon: <FileTextIcon />,
      },
      {
        title: "Payments",
        path: "/payments",
        icon: <Banknote />,
      },
      {
        title: "Subscriptions",
        path: "/subscriptions",
        icon: <HexagonIcon />,
      },
    ],
  },
  {
    label: "Configurations",
    items: [
      {
        title: "Plans",
        path: "/plans",
        icon: <StarIcon />,
      },
      {
        title: "Payment Methods",
        path: "/payment-methods",
        icon: <CreditCardIcon />,
      },
      {
        title: "Coupons",
        path: "/coupons",
        icon: <TagIcon />,
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
  {
    label: "System",
    items: [
      {
        title: "Settings",
        path: "/settings",
        icon: <SettingsIcon />,
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
