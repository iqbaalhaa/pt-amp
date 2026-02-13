import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

type GlobalPrisma = typeof globalThis & {
  __prisma?: PrismaClient;
  __pgPool?: Pool;
};

const g = globalThis as GlobalPrisma;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const requiredModels = [
  "pemotongan",
  "userRole",
  "role",
  "permission",
  "rolePermission",
] as const;

function isStale(client?: PrismaClient) {
  if (!client) return false;
  const c = client as unknown as Record<string, any>;
  return !requiredModels.every((m) => {
    const delegate = c[m];
    return delegate && typeof delegate.findMany === "function";
  });
}

function createPrisma() {
  const pool =
    g.__pgPool ??
    new Pool({
      connectionString,
      // opsional: bikin lebih stabil di prod
      max: Number(process.env.PG_POOL_MAX ?? 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });

  // cache pool di dev biar gak bikin pool baru tiap hot reload
  if (process.env.NODE_ENV !== "production") g.__pgPool = pool;

  return new PrismaClient({
    adapter: new PrismaPg(pool),
  });
}

export const prisma =
  g.__prisma && !isStale(g.__prisma) ? g.__prisma : createPrisma();

if (process.env.NODE_ENV !== "production") g.__prisma = prisma;
