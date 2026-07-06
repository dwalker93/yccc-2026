export const memberKeys = {
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
