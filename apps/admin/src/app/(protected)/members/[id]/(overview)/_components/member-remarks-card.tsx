import { type MemberRemarks } from "@/services/member-service"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"

export function MemberRemarksCard({ remarks }: { remarks: MemberRemarks }) {
  return (
    <Card className="gap-2.5">
      <CardHeader>
        <CardTitle
          className="text-[0.625rem] tracking-widest text-muted-foreground
            uppercase"
        >
          Admin Remarks
        </CardTitle>
      </CardHeader>
      <Separator className="mb-1.5" />
      <CardContent>
        {remarks?.remarks ? (
          <p className="text-sm text-muted-foreground">{remarks.remarks}</p>
        ) : (
          <p className="text-xs text-muted-foreground italic!">
            No remarks found
          </p>
        )}
      </CardContent>
    </Card>
  )
}
