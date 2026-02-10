// prisma.config.ts
import { defineConfig } from "prisma/config";

function mustGetEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: mustGetEnv("DATABASE_URL"),
  },
});
