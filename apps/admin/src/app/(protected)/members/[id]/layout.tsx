import { type ReactNode } from "react"
import { notFound } from "next/navigation"
import {
  getMemberMetadata,
  MemberNotFoundError,
} from "@/services/member-service"
import { formatMemberId } from "@/utils/member"

import { Button } from "@workspace/ui/components/button"

import { PageHeader } from "@/components/page-header"

import PageTabs from "../_components/page-tabs"

interface MemberLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function MemberLayout({
  children,
  params,
}: MemberLayoutProps) {
  const { id: memberId } = await params

  const id = formatMemberId(memberId)

  let metadata
  try {
    metadata = await getMemberMetadata({ id: "MEM" + memberId })
  } catch (err) {
    if (err instanceof MemberNotFoundError) notFound()
    throw err // rethrow anything else so error.tsx handles it
  }
  return (
    <div className="flex h-full flex-1 flex-col">
      <PageHeader
        title={metadata.name}
        description={`Member details - ${id}`}
        backHref="/members"
        actions={
          <>
            {metadata.openInvoicesCount === 0 && (
              <Button variant="outline">Issue invoice</Button>
            )}
            <Button variant="destructive">Suspend</Button>
            <Button variant="default">Approve</Button>
          </>
        }
      />
      <PageTabs
        id={id}
        badges={{
          career:
            metadata.unverifiedEducationCount +
            metadata.unverifiedProfessionsCount,
          billing: metadata.openInvoicesCount,
        }}
      />
      <div className="py-6">{children}</div>
    </div>
  )
}
