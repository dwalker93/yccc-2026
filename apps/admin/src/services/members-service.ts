import { and, count, desc, ilike, inArray, SQL } from "drizzle-orm"

import { members } from "@workspace/shared/schemas/member-schema"

import { appdb } from "@/lib/db"
import {
  SearchableColumn,
  Status,
} from "@/app/(protected)/members/_components/data"

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`)
export async function getMembersService({
  pageIndex,
  pageSize,
  search,
  searchBy,
  status,
}: {
  pageIndex: number
  pageSize: number
  search?: string | null
  searchBy: SearchableColumn
  status?: Status[]
}) {
  // Build shared where conditions
  const conditions: SQL[] = []
  if (search) {
    conditions.push(ilike(members[searchBy], `%${escapeLike(search)}%`))
  }
  if (status?.length) {
    conditions.push(inArray(members.membershipStatus, status))
  }
  const whereClause = conditions.length ? and(...conditions) : undefined

  const [memberData, countResult] = await Promise.all([
    appdb
      .select({
        id: members.id,
        name: members.name,
        email: members.email,
        phone: members.phone,
        dateOfBirth: members.dateOfBirth,
        nic: members.nic,
        city: members.city,
        status: members.membershipStatus,
        registeredAt: members.memberSince,
      })
      .from(members)
      .where(whereClause)
      .orderBy(desc(members.createdAt))
      .limit(Math.max(1, pageSize))
      .offset(
        Math.max(0, (Math.max(1, pageIndex) - 1) * Math.max(1, pageSize))
      ),

    appdb.select({ count: count() }).from(members).where(whereClause),
  ])

  return {
    members: memberData,
    totalCount: countResult[0]?.count ?? 0,
  }
}

export type Member = Awaited<
  ReturnType<typeof getMembersService>
>["members"][number]
