"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

export default function MemberError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // log to your monitoring service here if you have one
    console.error(error)
  }, [error])

  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 text-center">
      <AlertTriangle className="size-10 text-destructive" />
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold">
          Couldn't load this member
        </h2>
        <p className="text-muted-foreground max-w-sm text-sm">
          Something went wrong while fetching member details. This is usually
          temporary.
        </p>
      </div>
      <Button variant="outline" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  )
}