import { drizzle } from "drizzle-orm/neon-serverless"

import * as app_schema from "@workspace/shared/schemas"

import * as auth_schema from "./schemas/auth-schema"

if (!process.env.APP_DATABASE_URL) {
  throw new Error("APP_DATABASE_URL is not defined")
}
if (!process.env.AUTH_DATABASE_URL) {
  throw new Error("AUTH_DATABASE_URL is not defined")
}

export const appdb = drizzle(process.env.APP_DATABASE_URL, {
  schema: app_schema,
})
export const authdb = drizzle(process.env.AUTH_DATABASE_URL, {
  schema: auth_schema,
})

export type DBTransaction = Parameters<
  Parameters<typeof appdb.transaction>[0]
>[0]
