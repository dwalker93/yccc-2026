import { type ReactNode } from "react"

type MemberCardRowProps = {
  title: string
  value: string | ReactNode
}

export function MemberCardRow({ title, value }: MemberCardRowProps) {
  return (
    <div className="flex flex-col">
      <p className="text-[10px] font-medium text-muted-foreground uppercase">
        {title}
      </p>

      {typeof value === "string" ? <p className="text-xs">{value}</p> : value}
    </div>
  )
}
