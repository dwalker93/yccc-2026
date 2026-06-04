export async function withRetry<T>(
  fn: () => Promise<T>,
  { maxRetries = 2, delayMs = 300 } = {}
): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      console.warn(
        `[auth] Attempt ${attempt + 1}/${maxRetries + 1} failed:`,
        error
      )
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }
  }
  throw lastError
}
