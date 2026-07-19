"use client"

import { useState } from "react"
import Link from "next/link"
import {
  approveMemberAction,
  banMemberAction,
  reinstateMemberAction,
  rejectMemberAction,
  suspendMemberAction,
} from "@/actions/members-actions"
import { type Member } from "@/services/members-service"
import { formatMemberId } from "@/utils/member"
import { useQueryClient } from "@tanstack/react-query"
import { CheckCircle, Ellipsis, XCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import { memberKeys } from "@/hooks/members/keys"
import {
  Action,
  ChangeMemberStatusDialog,
} from "@/components/change-member-status-dialog"

interface RowActionsProps {
  row: Member["detailed"]
}

type ActionItem = {
  action: Action
  label: string
  icon: React.ReactNode
}

type ActionsMapping = Record<Member["detailed"]["status"], ActionItem[]>

const actionsMapping: ActionsMapping = {
  pending: [
    {
      action: "approve",
      label: "Approve",
      icon: <CheckCircle />,
    },
    {
      action: "reject",
      label: "Reject",
      icon: <XCircle />,
    },
  ],
  rejected: [
    {
      action: "approve",
      label: "Approve",
      icon: <CheckCircle />,
    },
  ],
  approved: [
    {
      action: "suspend",
      label: "Suspend",
      icon: <XCircle />,
    },
    {
      action: "ban",
      label: "Ban",
      icon: <XCircle />,
    },
  ],
  suspended: [
    {
      action: "reinstate",
      label: "Reinstate",
      icon: <CheckCircle />,
    },
    {
      action: "ban",
      label: "Ban",
      icon: <XCircle />,
    },
  ],
  banned: [],
}

export const RowActions = ({ row }: RowActionsProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dialogAction, setDialogAction] = useState<Action | null>(null)
  const queryClient = useQueryClient()

  const closeDialog = () => setDialogAction(null)

  if (row.status === "banned") return null

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          // prevents Radix from yanking focus back to the trigger
          // before the dialog has a chance to mount/open
          onCloseAutoFocus={(e) => {
            if (dialogAction) e.preventDefault()
          }}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {actionsMapping[row.status].map((actionItem) => (
              <DropdownMenuItem
                key={actionItem.action}
                onSelect={(e) => {
                  e.preventDefault()
                  setDropdownOpen(false)
                  setDialogAction(actionItem.action)
                }}
                variant={
                  actionItem.action === "approve" ||
                  actionItem.action === "reinstate"
                    ? "default"
                    : "destructive"
                }
              >
                {actionItem.icon}
                {actionItem.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Details</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/members/${formatMemberId(row.id)}`}>
                View Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Edit Profile</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rendered OUTSIDE the DropdownMenu tree entirely */}
      {dialogAction === "approve" && (
        <ChangeMemberStatusDialog
          open
          onOpenChange={(open) => !open && closeDialog()}
          member={row}
          action="approve"
          onSubmit={async (data) => {
            const result = await approveMemberAction(
              data.memberId,
              data.reason,
              data.note
            )
            if (result.success) {
              toast.success("Member approved")
              queryClient.invalidateQueries({ queryKey: memberKeys.all })
            } else {
              toast.error(result.error)
            }
            return result
          }}
        />
      )}

      {dialogAction === "reject" && (
        <ChangeMemberStatusDialog
          open
          onOpenChange={(open) => !open && closeDialog()}
          member={row}
          action="reject"
          onSubmit={async (data) => {
            const result = await rejectMemberAction(
              data.memberId,
              data.reason,
              data.note
            )
            if (result.success) {
              toast.success("Member rejected")
              queryClient.invalidateQueries({ queryKey: memberKeys.all })
            } else {
              toast.error(result.error)
            }
            return result
          }}
        />
      )}

      {dialogAction === "suspend" && (
        <ChangeMemberStatusDialog
          open
          onOpenChange={(open) => !open && closeDialog()}
          member={row}
          action="suspend"
          onSubmit={async (data) => {
            const result = await suspendMemberAction(
              data.memberId,
              data.reason,
              data.note,
              data.suspendedUntil
            )
            if (result.success) {
              toast.success("Member suspended")
              queryClient.invalidateQueries({ queryKey: memberKeys.all })
            } else {
              toast.error(result.error)
            }
            return result
          }}
        />
      )}

      {dialogAction === "ban" && (
        <ChangeMemberStatusDialog
          open
          onOpenChange={(open) => !open && closeDialog()}
          member={row}
          action="ban"
          onSubmit={async (data) => {
            const result = await banMemberAction(
              data.memberId,
              data.reason,
              data.note
            )
            if (result.success) {
              toast.success("Member banned")
              queryClient.invalidateQueries({ queryKey: memberKeys.all })
            } else {
              toast.error(result.error)
            }
            return result
          }}
        />
      )}

      {dialogAction === "reinstate" && (
        <ChangeMemberStatusDialog
          open
          onOpenChange={(open) => !open && closeDialog()}
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
      )}
    </>
  )
}
