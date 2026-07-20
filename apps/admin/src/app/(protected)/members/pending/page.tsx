import { type Metadata } from "next"

import { PageHeader } from "@/components/page-header"

import { PendingMembersTable } from "./_components/pending-members-table"

export const metadata: Metadata = {
  title: "Pending Members",
  description: "List of members awaiting review.",
}

export default async function PendingMembersPage() {
  return (
    <div className="flex h-full flex-1 flex-col">
      <PageHeader
        title="Pending Members"
        description="List of members awaiting review."
      />
      <PendingMembersTable />
    </div>
  )
}
