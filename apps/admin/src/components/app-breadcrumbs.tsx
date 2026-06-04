"use client"

import { Fragment } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"

import { navLinks } from "@/components/app-shared"

export function AppBreadcrumbs() {
  const pathName = usePathname()

  const segments = pathName
    .split("/")
    .filter(Boolean)
    .map((_, i, arr) => "/" + arr.slice(0, i + 1).join("/"))

  if (pathName === "/") {
    segments.push("/")
  }

  const pages = segments
    .map((segment) => navLinks.find((item) => item.path === segment))
    .filter((item) => item !== undefined)

  if (pages.length === 0 || !pages.every((page) => page.title)) {
    return null
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pages.map((page, index) => (
          <Fragment key={page.path}>
            <BreadcrumbItem>
              {index < pages.length - 1 ? (
                <BreadcrumbLink asChild>
                  <Link
                    href={page.path}
                    className="flex items-center gap-2 [&>svg]:size-3.5"
                  >
                    {page.icon}
                    {page.title}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage
                  className="flex items-center gap-2 [&>svg]:size-3.5"
                >
                  {page.icon}
                  {page.title}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < pages.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
