import { defineConfig } from "drizzle-kit"

if (!process.env.APP_DATABASE_URL) {
  throw new Error("APP_DATABASE_URL is not defined")
}

//need to add other schemas

export default defineConfig({
  out: "./src/migrations/app",
  schema: "../../packages/shared/src/schemas/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.APP_DATABASE_URL!,
  },
})
