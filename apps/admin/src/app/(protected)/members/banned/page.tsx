import { type Metadata } from "next"

import { BannedMembersTable } from "./_components/banned-members-table"

export const metadata: Metadata = {
  title: "Banned Members",
  description: "List of banned members.",
}

export default async function BannedMembersPage() {
  return (
    <div className="flex h-full flex-1 flex-col gap-8 p-2 md:p-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-semibold">Banned Members</h2>
        <p className="text-muted-foreground">List of banned members.</p>
      </div>
      <BannedMembersTable />
    </div>
  )
}
