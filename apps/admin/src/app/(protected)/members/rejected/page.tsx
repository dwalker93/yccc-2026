import { type Metadata } from "next"

import { RejectedMembersTable } from "./_components/rejected-members-table"

export const metadata: Metadata = {
  title: "Rejected Members",
  description: "List of rejected members.",
}

export default async function RejectedMembersPage() {
  return (
    <div className="flex h-full flex-1 flex-col gap-8 p-2 md:p-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-semibold">
          Rejected Members
        </h2>
        <p className="text-muted-foreground">List of rejected members.</p>
      </div>
      <RejectedMembersTable />
    </div>
  )
}
