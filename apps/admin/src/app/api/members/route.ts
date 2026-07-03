import { headers } from "next/headers"
import { NextRequest } from "next/server"
import { getMembersService, type ProjectionPreset } from "@/services/members-service"
import { getActivePlansService } from "@/services/plans-service"

import { Districts } from "@workspace/shared/constants/districts"

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

  const rawPlan = searchParams.get("plan")
  let plan: string[] | undefined = undefined

  if (rawPlan) {
    const planData = await getActivePlansService()
    const planArray = rawPlan.split(",")
    const isValidPlan = planArray.every((p) =>
      planData.some(
        (validPlan) => validPlan.name.toLowerCase() === p.toLowerCase()
      )
    )

    if (!isValidPlan) {
      return Response.json({ error: "Invalid plan parameter" }, { status: 400 })
    }
    plan = planArray as string[]
  }

  const rawDistrict = searchParams.get("district")
  let district: string[] | undefined = undefined
  if (rawDistrict) {
    const districtArray = rawDistrict.split(",")
    const isValidDistrict = districtArray.every((d) =>
      Districts.some((validDistrict) => validDistrict === d)
    )

    if (!isValidDistrict) {
      return Response.json(
        { error: "Invalid district parameter" },
        { status: 400 }
      )
    }
    district = districtArray as string[]
  }

  const rawProjection = searchParams.get("projection")
  const projection = (["detailed", "pending", "rejected", "suspended", "banned"].includes(rawProjection || "")
    ? rawProjection
    : "detailed") as ProjectionPreset

  try {
    const result = await getMembersService({
      pageIndex,
      pageSize,
      projection,
      search: searchTerm,
      searchBy: searchBy,
      status: status,
      plan,
      district,
    })
    return Response.json(result)
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Failed to fetch members" }, { status: 500 })
  }
}
