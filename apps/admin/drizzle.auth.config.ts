import { defineConfig } from "drizzle-kit"

if (!process.env.AUTH_DATABASE_URL) {
  throw new Error("AUTH_DATABASE_URL is not defined")
}

//need to add other schemas

export default defineConfig({
  out: "./src/migrations/auth",
  schema: "./src/lib/db/schemas/auth-schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.AUTH_DATABASE_URL!,
  },
})
