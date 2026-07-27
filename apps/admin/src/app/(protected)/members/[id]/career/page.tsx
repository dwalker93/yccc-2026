import { type Metadata } from "next"
import {
  getMemberEducationService,
  getMemberProfessionService,
} from "@/services/member-service"
import { formatMemberId } from "@/utils/member"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"

import { MemberCareerTables } from "./_components/member-career-tables"

export const metadata: Metadata = {
  title: "Member Career",
  description: "Member career details.",
}

export default async function MemberOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: rawId } = await params
  const id = formatMemberId(rawId)

  const queryClient = new QueryClient()

  const memberId = "MEM" + id

  // prefetch both on server in parallel
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["member-education", memberId, { page: 1, pageSize: 5 }],
      queryFn: () =>
        getMemberEducationService({
          memberId: memberId,
          pageIndex: 1,
          pageSize: 5,
        }),
    }),
    queryClient.prefetchQuery({
      queryKey: ["member-profession", memberId, { page: 1, pageSize: 5 }],
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
