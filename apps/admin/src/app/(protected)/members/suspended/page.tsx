import { type Metadata } from "next"

import { PageHeader } from "@/components/page-header"

import { SuspendedMembersTable } from "./_components/suspended-members-table"

export const metadata: Metadata = {
  title: "Suspended Members",
  description: "List of suspended members.",
}

export default async function SuspendedMembersPage() {
  return (
    <div className="flex h-full flex-1 flex-col">
      <PageHeader
        title="Suspended Members"
        description="List of suspended members."
      />
      <SuspendedMembersTable />
    </div>
  )
}
