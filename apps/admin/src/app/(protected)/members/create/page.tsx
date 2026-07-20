import { Metadata } from "next"

import { CreateMemberForm } from "@/components/create-member-form"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "Create Member",
  description: "Create a new member.",
}

export default async function CreateMemberPage() {
  return (
    <div className="flex h-full flex-1 flex-col">
      <PageHeader
        title="Create Member"
        description="Create a new member."
        backHref="/members"
      />
      <div
        className="-mx-4 mb-4 w-[calc(100%+2rem)] border-b md:-mx-6
          md:w-[calc(100%+3rem)]"
      />
      <CreateMemberForm />
    </div>
  )
}
