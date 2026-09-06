import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { ServiceError } from "@/services/errors"


export type Session = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>

export interface WithAuthOptions {
  roles?: string[]
}

export type AuthenticatedRouteHandler<TContext = any> = (
  request: NextRequest,
  context: TContext,
  session: Session
) => Promise<Response | NextResponse> | Response | NextResponse

/**
 * Higher-order function to wrap Next.js API route handlers with authentication checking.
 * Retrieves session via Better Auth and returns 401 Unauthorized if no active session exists.
 * Optionally validates user role if specified in options.
 */
export function withAuth<TContext = any>(
  handler: AuthenticatedRouteHandler<TContext>,
  options?: WithAuthOptions
) {
  return async (request: NextRequest, context: TContext) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return new Response("Unauthorized", { status: 401 })
    }

    if (options?.roles && options.roles.length > 0) {
      if (!options.roles.includes(session.user.role)) {
        return new Response("Forbidden", { status: 403 })
      }
    }

    try {
      return await handler(request, context, session)
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.statusCode }
        )
      }
      console.error("[withAuth] Unhandled API error:", error)
      return NextResponse.json(
        { error: "Internal server error", code: "INTERNAL_SERVER_ERROR" },
        { status: 500 }
      )
    }
  }
}


