import { defineConfig } from "@prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "./prisma/schema/schema.prisma",
  datasource: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
