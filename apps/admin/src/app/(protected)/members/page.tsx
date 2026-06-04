import { type Metadata } from "next"

import { MembersTable } from "./_components/members-table"

export const metadata: Metadata = {
  title: "Members",
  description: "List of all members.",
}

export default async function MembersPage() {
  return (
    <div className="flex h-full flex-1 flex-col gap-8 p-2 md:p-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-semibold">Members</h2>
        <p className="text-muted-foreground">List of all members.</p>
      </div>
      <MembersTable />
    </div>
  )
}
