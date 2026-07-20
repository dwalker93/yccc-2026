import { type Metadata } from "next"

import { PageHeader } from "@/components/page-header"

import { MembersTable } from "./_components/members-table"

export const metadata: Metadata = {
  title: "Members",
  description: "List of all members.",
}

export default async function MembersPage() {
  return (
    <div className="flex h-full flex-1 flex-col">
      <PageHeader title="Members" description="List of all members." />
      <MembersTable />
    </div>
  )
}
