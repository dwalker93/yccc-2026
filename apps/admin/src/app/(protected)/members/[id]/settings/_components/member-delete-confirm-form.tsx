"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

import { memberDeleteConfirmSchema } from "@workspace/shared/zod-schemas/member-input-schema"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { Button } from "@workspace/ui/components/button"
import { useAppForm } from "@workspace/ui/hooks/form"

import { useDeleteMemberMutation } from "@/hooks/members/delete-member-mutation"

type MemberDeleteConfirmFormProps = {
  memberId: string
}

export function MemberDeleteConfirmForm({
  memberId,
}: MemberDeleteConfirmFormProps) {
  const [open, setOpen] = useState(false)
  const { isPending, mutateAsync: deleteMember } = useDeleteMemberMutation()

  const router = useRouter()
  const form = useAppForm({
    defaultValues: {
      confirmText: "",
    },
    validators: {
      onChange: memberDeleteConfirmSchema,
    },
    onSubmit: async () => {
      try {
        await deleteMember({ memberId })
        form.reset()
        setOpen(false)
        router.push("/members")
      } catch {}
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">
            <Trash2 />
            Delete Member
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm member deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent and cannot be undone. Please confirm by
              typing DELETE below.
            </AlertDialogDescription>
            <div className="w-full py-4">
              <form.AppField name="confirmText">
                {(field) => (
                  <field.input
                    label="Type DELETE"
                    placeholder="DELETE..."
                    requiredIcon={false}
                    disabled={isPending}
                  />
                )}
              </form.AppField>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isPending}
              onClick={() => form.reset()}
            >
              Cancel
            </AlertDialogCancel>
            <form.Subscribe
              selector={(state) => state.values.confirmText}
              children={(confirmText) => (
                <AlertDialogAction
                  variant="destructive"
                  disabled={confirmText !== "DELETE" || isPending}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    form.handleSubmit()
                  }}
                >
                  <Trash2 /> Permanently Delete Member
                </AlertDialogAction>
              )}
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}
