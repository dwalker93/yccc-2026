export const planKeys = {
  all: ["plans"] as const,
  active: () => [...planKeys.all, "active"] as const,
}
