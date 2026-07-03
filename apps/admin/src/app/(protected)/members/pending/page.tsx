import { type Metadata } from "next"

import { PendingMembersTable } from "./_components/pending-members-table"

export const metadata: Metadata = {
  title: "Pending Members",
  description: "List of members awaiting review.",
}

export default async function PendingMembersPage() {
  return (
    <div className="flex h-full flex-1 flex-col gap-8 p-2 md:p-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-semibold">Pending Members</h2>
        <p className="text-muted-foreground">Members awaiting review.</p>
      </div>
      <PendingMembersTable />
    </div>
  )
}
