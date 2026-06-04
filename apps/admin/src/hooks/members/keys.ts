export const memberKeys = {
  all: ["members"] as const,
  filtered: ({
    pageIndex,
    pageSize,
    searchTerm,
    searchBy,
    status,
  }: {
    pageIndex: string
    pageSize: string
    searchTerm?: string
    searchBy?: string
    status?: string
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
    ] as const,
}
