import { useState, useTransition } from "react"
import { toast } from "sonner"

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

export function ActionDialog({
  trigger,
  title,
  description,
  actionFn,
  cancelText,
  actionText,
  successMessage,
}: {
  trigger: React.ReactNode | string
  title: string
  description: string
  actionFn: () => Promise<
    | {
        error: string
        success?: undefined
      }
    | {
        success: boolean
        error?: undefined
      }
  >
  cancelText?: string
  actionText?: string
  successMessage?: string
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    startTransition(async () => {
      try {
        const result = await actionFn()
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success(successMessage || "Action performed successfully")
          setOpen(false)
        }
      } catch (error: any) {
        toast.error(
          error?.message || String(error) || "Failed to perform action"
        )
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={(val) => !isPending && setOpen(val)}>
      <AlertDialogTrigger asChild>
        {typeof trigger === "string" ? (
          <Button variant="outline">{trigger}</Button>
        ) : (
          trigger
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {cancelText ?? "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleClick} disabled={isPending}>
            {isPending ? "Please wait..." : (actionText ?? "Continue")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
