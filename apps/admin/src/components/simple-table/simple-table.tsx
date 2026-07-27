import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

export type SimpleTableColumn<T> = {
  key: keyof T | string
  label: string
  width?: string
  render?: (row: T) => React.ReactNode
}

type SimpleTableProps<T extends { id: string }> = {
  columns: SimpleTableColumn<T>[]
  data: T[]
  emptyMessage?: string
  action?: React.ReactNode
  title?: string
}

export function createColumns<T>(
  columns: SimpleTableColumn<T>[]
): SimpleTableColumn<T>[] {
  return columns
}

export function SimpleTable<T extends { id: string }>({
  columns,
  data,
  emptyMessage = "No records found.",
  action,
  title,
}: SimpleTableProps<T>) {
  return (
    <div className="rounded-lg border bg-card">
      {(title || action) && (
        <div className="flex items-center justify-between border-b px-4 py-3">
          {title && (
            <span
              className="text-[0.625rem] tracking-widest text-muted-foreground
                uppercase"
            >
              {title}
            </span>
          )}
          {action && <div className="ml-auto">{action}</div>}
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={String(col.key)}
                style={{ width: col.width }}
                className="px-4 text-[0.625rem] tracking-widest
                  text-muted-foreground uppercase"
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-6 text-center text-xs text-muted-foreground
                  italic"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={row.id}>
                {columns.map((col) => (
                  <TableCell key={String(col.key)} className="px-4">
                    {col.render
                      ? col.render(row)
                      : String((row as any)[col.key] ?? "—")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
