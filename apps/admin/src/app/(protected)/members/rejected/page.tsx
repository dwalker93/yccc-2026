import { type Metadata } from "next"

import { PageHeader } from "@/components/page-header"

import { RejectedMembersTable } from "./_components/rejected-members-table"

export const metadata: Metadata = {
  title: "Rejected Members",
  description: "List of rejected members.",
}

export default async function RejectedMembersPage() {
  return (
    <div className="flex h-full flex-1 flex-col">
      <PageHeader
        title="Rejected Members"
        description="List of rejected members."
      />
      <RejectedMembersTable />
    </div>
  )
}
