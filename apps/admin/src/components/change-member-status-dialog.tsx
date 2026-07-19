import { useState, useTransition } from "react"
import {
  approveMemberSchema,
  banMemberSchema,
  bulkApproveMemberSchema,
  reinstateMemberSchema,
  rejectMemberSchema,
  suspendMemberSchema,
} from "@/schemas/member-schema"
import { type Member, type ProjectionPreset } from "@/services/members-service"
import * as z from "zod"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { useAppForm } from "@workspace/ui/hooks/form"

export type Action =
  | "approve"
  | "bulkApprove"
  | "reject"
  | "suspend"
  | "ban"
  | "reinstate"

type ChangeMemberStatusDialogProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  onSubmit: (data: any) => Promise<{ error?: string; success?: boolean }>
} & (
  | {
      action: Exclude<Action, "bulkApprove">
      member: Member[ProjectionPreset]
      members?: never
    }
  | {
      action: "bulkApprove"
      members: Member[ProjectionPreset][]
      member?: never
    }
)

type StatusFormValues =
  | { memberId: string; reason?: string; note?: string }
  | { memberIds: string[]; reason?: string; note?: string }
  | { memberId: string; reason: string; note?: string; suspendedUntil?: Date }

const schemas = {
  approve: approveMemberSchema,
  bulkApprove: bulkApproveMemberSchema,
  reject: rejectMemberSchema,
  suspend: suspendMemberSchema,
  ban: banMemberSchema,
  reinstate: reinstateMemberSchema,
}

const config: Record<
  Action,
  {
    title: string
    description: string
    submitLabel: string
    submitVariant: "default" | "destructive"
    reasonRequired: boolean
    showSuspendedUntil: boolean
    requiresConfirmation: boolean
  }
> = {
  approve: {
    title: "Approve Member",
    description: "Approve this member's application and grant access.",
    submitLabel: "Approve",
    submitVariant: "default",
    reasonRequired: false,
    showSuspendedUntil: false,
    requiresConfirmation: false,
  },
  bulkApprove: {
    title: "Approve Members",
    description: "Approve all selected members' applications and grant access.",
    submitLabel: "Approve all",
    submitVariant: "default",
    reasonRequired: false,
    showSuspendedUntil: false,
    requiresConfirmation: true,
  },
  reject: {
    title: "Reject Member",
    description: "Reject this member's application. A reason is required.",
    submitLabel: "Reject",
    submitVariant: "destructive",
    reasonRequired: true,
    showSuspendedUntil: false,
    requiresConfirmation: true,
  },
  suspend: {
    title: "Suspend Member",
    description: "Temporarily restrict this member's access.",
    submitLabel: "Suspend",
    submitVariant: "destructive",
    reasonRequired: true,
    showSuspendedUntil: true,
    requiresConfirmation: true,
  },
  ban: {
    title: "Ban Member",
    description: "Permanently remove this member from the platform.",
    submitLabel: "Ban",
    submitVariant: "destructive",
    reasonRequired: true,
    showSuspendedUntil: false,
    requiresConfirmation: true,
  },
  reinstate: {
    title: "Reinstate Member",
    description: "Restore this member's access to the platform.",
    submitLabel: "Reinstate",
    submitVariant: "default",
    reasonRequired: true,
    showSuspendedUntil: false,
    requiresConfirmation: false,
  },
}

export function ChangeMemberStatusDialog({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
  member,
  members,
  action,
  onSubmit,
}: ChangeMemberStatusDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const cfg = config[action]

  const defaultValues: StatusFormValues =
    action === "suspend"
      ? {
          memberId: member.id,
          reason: "",
          note: "",
          suspendedUntil: undefined,
        }
      : action === "bulkApprove"
        ? { memberIds: members?.map((m) => m.id) ?? [], reason: "", note: "" }
        : { memberId: member.id, reason: "", note: "" }

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: schemas[action] as unknown as z.ZodType<
        StatusFormValues,
        StatusFormValues
      >,
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        const result = await onSubmit(value)
        if (result?.error) {
          setSubmitError(result.error)
          return
        }
        form.reset()
        setSubmitError(null)
        setOpen(false)
      })
    },
  })

  const handleSubmitClick = async () => {
    if (cfg.requiresConfirmation) {
      // validate first — only open confirm if form is valid
      await form.validate("submit")
      const hasErrors = Object.values(form.state.fieldMeta).some(
        (field) => field?.errors?.length ?? 0 > 0
      )
      if (!hasErrors) {
        setShowConfirm(true)
      }
    } else {
      form.handleSubmit()
    }
  }

  const handleReset = () => {
    form.reset()
    setSubmitError(null)
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value) handleReset()
          setOpen(value)
        }}
      >
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

        <DialogContent className="sm:max-w-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <DialogHeader>
              <DialogTitle>{cfg.title}</DialogTitle>
              <DialogDescription>{cfg.description}</DialogDescription>
            </DialogHeader>

            <div
              className="-mx-4 max-h-[50vh] overflow-y-auto px-4
                md:max-h-[70vh]"
            >
              <div className="grid gap-4 py-4">
                <form.AppField name="reason">
                  {(field) => (
                    <field.input
                      label="Reason"
                      placeholder="Reason for this status change"
                      optionalField={!cfg.reasonRequired}
                    />
                  )}
                </form.AppField>

                {cfg.showSuspendedUntil && (
                  <form.AppField name="suspendedUntil">
                    {(field) => (
                      <field.input
                        type="date"
                        label="Suspend Until"
                        optionalField
                      />
                    )}
                  </form.AppField>
                )}

                <form.AppField name="note">
                  {(field) => (
                    <field.input
                      label="Note"
                      placeholder="Optional internal note"
                      optionalField
                    />
                  )}
                </form.AppField>
              </div>
            </div>

            {submitError && (
              <p className="mb-3 text-sm text-destructive">{submitError}</p>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={handleReset}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                variant={cfg.submitVariant}
                disabled={isPending}
                onClick={handleSubmitClick}
              >
                {isPending ? `${cfg.submitLabel}ing...` : cfg.submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog — rendered outside main Dialog to avoid nesting issues */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to {cfg.submitLabel.toLowerCase()}{" "}
              {member ? member.name : `${members?.length ?? 0} members`}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirm(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant={cfg.submitVariant}
              disabled={isPending}
              onClick={() => {
                setShowConfirm(false)
                form.handleSubmit()
              }}
            >
              {isPending ? `${cfg.submitLabel}ing...` : cfg.submitLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
