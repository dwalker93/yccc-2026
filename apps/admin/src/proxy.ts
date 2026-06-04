import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/lib/auth/auth"

const publicRoutes = [
  "/signin",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
]

export async function proxy(request: NextRequest) {
  const url = request.nextUrl
  const pathname = url.pathname

  if (pathname.startsWith("/api/auth")) {
    return
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session && !publicRoutes.includes(pathname)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const target = `${url.pathname}${url.search}`
    return NextResponse.redirect(
      new URL(`/signin?redirect=${encodeURIComponent(target)}`, request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
