import { headers } from "next/headers"
import { NextRequest } from "next/server"
import { getMembersService } from "@/services/members-service"

import { auth } from "@/lib/auth/auth"
import {
  SearchableColumn,
  searchableColumns,
  Status,
  statuses,
} from "@/app/(protected)/members/_components/data"

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams

  const rawPage = Number(searchParams.get("page"))
  const rawPerPage = Number(searchParams.get("perPage"))
  const pageIndex = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1
  const pageSize =
    Number.isInteger(rawPerPage) && rawPerPage >= 1 && rawPerPage <= 100
      ? rawPerPage
      : 10

  const searchTerm = searchParams.get("q")

  const rawSearchBy = searchParams.get("searchBy") || "id"
  const isValidSearchBy = searchableColumns.some(
    (col) => col.value === rawSearchBy
  )
  const searchBy = (isValidSearchBy ? rawSearchBy : "id") as SearchableColumn

  const rawStatus = searchParams.get("status")
  let status: Status[] | undefined = undefined

  if (rawStatus) {
    const statusArray = rawStatus.split(",")
    const isValidStatus = statusArray.every((s) =>
      statuses.some((validStatus) => validStatus.value === s)
    )

    if (!isValidStatus) {
      return Response.json(
        { error: "Invalid status parameter" },
        { status: 400 }
      )
    }
    status = statusArray as Status[]
  }

  try {
    const result = await getMembersService({
      pageIndex,
      pageSize,
      search: searchTerm,
      searchBy: searchBy,
      status: status,
    })
    return Response.json(result)
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Failed to fetch members" }, { status: 500 })
  }
}
