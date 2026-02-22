import "dotenv/config";
import { PrismaClient } from "../src/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { randomUUID } from "crypto";
import { seedContent } from "./seeds/content-seed";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SEED_PASSWORD = process.env.SEED_PASSWORD ?? "Admin123!";

// Better Auth stores password hash in Account.password (providerId="credential") and uses scrypt by default.
// We'll use better-auth/crypto hashPassword if available.
async function hashWithBetterAuth(password: string): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = await import("better-auth/crypto");
    if (typeof mod.hashPassword !== "function") {
      throw new Error("better-auth/crypto.hashPassword not found");
    }
    return await mod.hashPassword(password);
  } catch (e) {
    console.warn(
      "[seed] WARNING: Cannot import better-auth/crypto hashPassword. " +
        "Credential login may fail. Install/config Better Auth properly.",
      e
    );
    // Fallback: store plain (NOT recommended). Better-auth will likely reject this.
    return password;
  }
}

async function ensureCredentialAccount(userId: string, passwordHash: string) {
  const existing = await prisma.account.findFirst({
    where: { userId, providerId: "credential" },
    select: { id: true },
  });

  if (existing) {
    await prisma.account.update({
      where: { id: existing.id },
      data: { password: passwordHash },
    });
    return;
  }

  await prisma.account.create({
    data: {
      id: randomUUID(),
      accountId: userId, // Better Auth commonly uses accountId == userId for credentials
      providerId: "credential",
      userId,
      password: passwordHash,
    },
  });
}

async function seedAuth() {
  console.log("🌱 Seeding Auth (Roles, Permissions, Users)...");
  // Roles
  const roles = [
    { name: "SUPERADMIN", description: "Super Admin with full access" },
    { name: "ADMIN", description: "Administrator access" },
    { name: "STAFF", description: "Staff access" },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      create: { name: r.name, description: r.description },
      update: { description: r.description },
    });
  }

  // Permissions (minimal + safe default)
  const permissions = [
    { name: "view-dashboard", description: "Access dashboard page" },
    {
      name: "manage-master",
      description: "Manage master data (product/worker/type)",
    },
    {
      name: "manage-transactions",
      description: "Manage transactions (purchase/sale/production)",
    },
    { name: "view-reports", description: "View reports" },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { name: p.name },
      create: { name: p.name, description: p.description },
      update: { description: p.description },
    });
  }

  const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
  const staffRole = await prisma.role.findUnique({ where: { name: "STAFF" } });
  if (!adminRole || !staffRole) throw new Error("Roles not found after upsert");

  // Assign permissions: ADMIN gets all; STAFF gets none by default (adjust if needed)
  const permRows = await prisma.permission.findMany({
    where: { name: { in: permissions.map((p) => p.name) } },
    select: { id: true, name: true },
  });

  await prisma.rolePermission.createMany({
    data: permRows.map((p) => ({ roleId: adminRole.id, permissionId: p.id })),
    skipDuplicates: true,
  });

  // Ensure STAFF does NOT have view-dashboard (and generally none)
  const viewDash = permRows.find((p) => p.name === "view-dashboard");
  if (viewDash) {
    await prisma.rolePermission.deleteMany({
      where: { permissionId: viewDash.id, roleId: staffRole.id },
    });
  }

  // Users
  const usersToSeed = [
    {
      email: "admin@amp.local",
      name: "Admin",
      roleStr: "SUPERADMIN", // deprecated column for transition
      pivotRoleName: "ADMIN",
      emailVerified: true,
    },
    ...Array.from({ length: 5 }).map((_, i) => ({
      email: `staff${i + 1}@amp.local`,
      name: `Staff ${i + 1}`,
      roleStr: "STAFF",
      pivotRoleName: "STAFF",
      emailVerified: true,
    })),
  ];

  const roleRecords = await prisma.role.findMany({
    where: {
      name: {
        in: Array.from(new Set(usersToSeed.map((u) => u.pivotRoleName))),
      },
    },
    select: { id: true, name: true },
  });
  const roleIdByName = new Map(roleRecords.map((r) => [r.name, r.id]));

  const passwordHash = await hashWithBetterAuth(SEED_PASSWORD);

  for (const u of usersToSeed) {
    await prisma.user.upsert({
      where: { email: u.email },
      create: {
        id: randomUUID(),
        email: u.email,
        name: u.name,
        role: u.roleStr,
        emailVerified: u.emailVerified,
      },
      update: {
        name: u.name,
        role: u.roleStr,
        emailVerified: u.emailVerified,
      },
    });

    const user = await prisma.user.findUnique({ where: { email: u.email } });
    const roleId = roleIdByName.get(u.pivotRoleName);
    if (!user || !roleId) continue;

    await prisma.userRole.createMany({
      data: [{ userId: user.id, roleId }],
      skipDuplicates: true,
    });

    // Create/Update credential account password
    await ensureCredentialAccount(user.id, passwordHash);
  }

  return { adminEmail: "admin@amp.local" };
}

async function main() {
  try {
    const { adminEmail } = await seedAuth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await seedContent(prisma as any);

    console.log("✅ Seed completed (User & CMS only).");
    console.log("Login:");
    console.log(`- admin: ${adminEmail}`);
    console.log(`- password (all seeded users): ${SEED_PASSWORD}`);
  } catch (e) {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
