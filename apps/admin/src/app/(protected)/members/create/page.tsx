import { Metadata } from "next"

import { CreateMemberForm } from "@/components/create-member-form"

export const metadata: Metadata = {
  title: "Create Member",
  description: "Create a new member.",
}

export default async function CreateMemberPage() {
  return (
    <div className="flex h-full flex-1 flex-col gap-8 p-2 md:p-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-semibold">Create member</h2>
        <p className="text-muted-foreground">Create a new member.</p>
      </div>
      <CreateMemberForm />
    </div>
  )
}
