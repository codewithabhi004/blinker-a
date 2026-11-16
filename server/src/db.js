import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client/index.js";

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be configured.");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });
