import { type Metadata } from "next"
import { getMemberEducationService } from "@/services/member-education-service"
import { getMemberProfessionService } from "@/services/member-profession-service"
import { toMemberId } from "@/utils/member"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"

import { memberKeys } from "@/hooks/members/keys"

import { MemberCareerTables } from "./_components/member-career-tables"

export const metadata: Metadata = {
  title: "Member Career",
  description: "Member career details.",
}

export default async function MemberCareerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: rawId } = await params
  const memberId = toMemberId(rawId)

  const queryClient = new QueryClient()

  // prefetch both on server in parallel
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: memberKeys.education({
        id: memberId,
        pageIndex: 1,
        pageSize: 5,
      }),
      queryFn: () =>
        getMemberEducationService({
          memberId: memberId,
          pageIndex: 1,
          pageSize: 5,
        }),
    }),
    queryClient.prefetchQuery({
      queryKey: memberKeys.professional({
        id: memberId,
        pageIndex: 1,
        pageSize: 5,
      }),
      queryFn: () =>
        getMemberProfessionService({
          memberId: memberId,
          pageIndex: 1,
          pageSize: 5,
        }),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MemberCareerTables memberId={memberId} />
    </HydrationBoundary>
  )
}
