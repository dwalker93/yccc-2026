import { type Metadata } from "next"

import { SuspendedMembersTable } from "./_components/suspended-members-table"

export const metadata: Metadata = {
  title: "Suspended Members",
  description: "List of suspended members.",
}

export default async function SuspendedMembersPage() {
  return (
    <div className="flex h-full flex-1 flex-col gap-8 p-2 md:p-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-semibold">
          Suspended Members
        </h2>
        <p className="text-muted-foreground">List of suspended members.</p>
      </div>
      <SuspendedMembersTable />
    </div>
  )
}
