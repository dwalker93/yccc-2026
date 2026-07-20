import { MemberCurrentRole } from "@/services/member-service"
import { Check, X } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"

export function MemberCurrentRoleCard({ role }: { role: MemberCurrentRole }) {
  return (
    <Card className="gap-2.5">
      <CardHeader>
        <CardTitle
          className="text-[0.625rem] tracking-widest text-muted-foreground
            uppercase"
        >
          Current Role
        </CardTitle>
      </CardHeader>
      <Separator className="mb-1.5" />

      <CardContent className="flex items-center justify-between">
        {role ? (
          <>
            <div>
              <p className="text-base font-medium">{role.jobTitle}</p>
              <div className="text-muted-foreground">
                {role.employer} &middot; {role.location} &middot;{" "}
                {`${role.startYear} - Present`}
              </div>
            </div>

            {role.isVerified ? (
              <Badge
                className="bg-emerald-200 text-emerald-700 dark:bg-green-700/20
                  dark:text-green-400"
              >
                <Check /> Verified
              </Badge>
            ) : (
              <Badge variant="destructive">
                <X /> Unverified
              </Badge>
            )}
          </>
        ) : (
          <p className="text-xs text-muted-foreground italic!">
            No current role found
          </p>
        )}
      </CardContent>
    </Card>
  )
}
