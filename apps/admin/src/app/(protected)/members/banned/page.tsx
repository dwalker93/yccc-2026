import { type Metadata } from "next"

import { PageHeader } from "@/components/page-header"

import { BannedMembersTable } from "./_components/banned-members-table"

export const metadata: Metadata = {
  title: "Banned Members",
  description: "List of banned members.",
}

export default async function BannedMembersPage() {
  return (
    <div className="flex h-full flex-1 flex-col">
      <PageHeader
        title="Banned Members"
        description="List of banned members."
      />
      <BannedMembersTable />
    </div>
  )
}
