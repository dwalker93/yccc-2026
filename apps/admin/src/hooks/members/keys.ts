export const memberKeys = {
  member: (id: string) => ["member", id] as const,
  metadata: (id: string) => [...memberKeys.member(id), "metadata"] as const,
  latestInvoice: (id: string) =>
    [...memberKeys.member(id), "latest-invoice"] as const,
  education: ({
    id,
    pageIndex = 0,
    pageSize = 10,
  }: {
    id: string
    pageIndex?: number
    pageSize?: number
  }) =>
    [
      ...memberKeys.member(id),
      "education",
      "page",
      pageIndex,
      "perPage",
      pageSize,
    ] as const,
  professional: ({
    id,
    pageIndex = 0,
    pageSize = 10,
  }: {
    id: string
    pageIndex?: number
    pageSize?: number
  }) =>
    [
      ...memberKeys.member(id),
      "professional",
      "page",
      pageIndex,
      "perPage",
      pageSize,
    ] as const,
  invoices: ({
    id,
    pageIndex = 0,
    pageSize = 10,
  }: {
    id: string
    pageIndex?: number
    pageSize?: number
  }) =>
    [
      ...memberKeys.member(id),
      "invoices",
      "page",
      pageIndex,
      "perPage",
      pageSize,
    ] as const,
  payments: ({
    id,
    pageIndex = 0,
    pageSize = 10,
  }: {
    id: string
    pageIndex: number
    pageSize: number
  }) =>
    [
      ...memberKeys.member(id),
      "payments",
      "page",
      pageIndex,
      "perPage",
      pageSize,
    ] as const,
  all: ["members"] as const,
  filtered: ({
    pageIndex,
    pageSize,
    searchTerm,
    searchBy,
    status,
    plan,
    district,
    projection,
  }: {
    pageIndex: string
    pageSize: string
    searchTerm?: string
    searchBy?: string
    status?: string
    plan?: string
    district?: string
    projection?: string
  }) =>
    [
      ...memberKeys.all,
      "page",
      pageIndex,
      "perPage",
      pageSize,
      "q",
      searchTerm,
      "searchBy",
      searchBy,
      "status",
      status,
      "plan",
      plan,
      "district",
      district,
      "projection",
      projection,
    ] as const,
}
