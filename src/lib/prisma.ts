import "dotenv/config";
import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Check if existing instance is stale (missing new models like pemotongan)
const existingPrisma = globalForPrisma.prisma;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isStale = existingPrisma && !("pemotongan" in (existingPrisma as any));

export const prisma =
	(!isStale && existingPrisma) ? existingPrisma :
	new PrismaClient({
		adapter,
	});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
