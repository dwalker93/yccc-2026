"use client"

import {
  reinstateMemberAction,
  rejectMemberAction,
} from "@/actions/members-actions"
import { type Member } from "@/services/members-service"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"

import { memberKeys } from "@/hooks/members/keys"
import { ChangeMemberStatusDialog } from "@/components/change-member-status-dialog"

interface RowActionsProps {
  row: Member["rejected"]
}

export const RowActions = ({ row }: RowActionsProps) => {
  const queryClient = useQueryClient()

  return (
    <div className="-my-2 flex flex-row gap-2">
      <ChangeMemberStatusDialog
        trigger={<Button variant="default">Reinstate</Button>}
        member={row}
        action="reinstate"
        onSubmit={async (data) => {
          const result = await reinstateMemberAction(
            data.memberId,
            data.reason,
            data.note
          )
          if (result.success) {
            toast.success("Member reinstated")
            queryClient.invalidateQueries({ queryKey: memberKeys.all })
          } else {
            toast.error(result.error)
          }
          return result
        }}
      />

      <Button variant="outline" className="">
        Details
      </Button>
    </div>
  )
}
