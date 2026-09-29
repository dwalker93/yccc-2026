import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

export function MemberStatCard({
  title,
  value,
}: {
  title: string
  value: string | number | React.ReactNode
}) {
  return (
    <Card className="col-span-4 gap-2">
      <CardHeader>
        <CardTitle
          className="text-[0.625rem] tracking-widest text-muted-foreground
            uppercase"
        >
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 text-xl font-bold">
        {value}
      </CardContent>
    </Card>
  )
}
