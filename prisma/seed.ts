// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

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

async function seedMaster() {
  // Production Types (unique by name => upsert)
  const prodTypes = [
    { name: "Produksi Stik", description: "Proses produksi stik" },
    { name: "Produksi Reguler", description: "Produksi umum" },
  ];
  for (const t of prodTypes) {
    await prisma.productionType.upsert({
      where: { name: t.name },
      create: { name: t.name, description: t.description },
      update: { description: t.description },
    });
  }

  // Item Types (dynamic labels for purchase)
  const itemTypesList = [
    { name: "ASALAN", type: "raw" as const },
    { name: "PATAHAN", type: "raw" as const },
    { name: "AAA", type: "finished" as const },
    { name: "AA", type: "finished" as const },
    { name: "RIJECT", type: "raw" as const },
    { name: "MISS CUT", type: "raw" as const },
    { name: "KF", type: "raw" as const },
    { name: "KS", type: "raw" as const },
    { name: "KA", type: "raw" as const },
    { name: "KTP", type: "raw" as const },
    { name: "KB", type: "raw" as const },
    { name: "KC", type: "raw" as const },
    { name: "Tembakau Mentah", type: "raw" as const, unit: "kg" },
    { name: "Cengkeh", type: "raw" as const, unit: "kg" },
    { name: "Kertas Rokok", type: "raw" as const, unit: "lembar" },
    { name: "Stik 12cm", type: "finished" as const, unit: "bungkus" },
  ];
  for (const item of itemTypesList) {
    await prisma.itemType.upsert({
      where: { name: item.name },
      create: { 
        name: item.name, 
        type: item.type,
        unit: item.unit || "kg",
        isActive: true,
        isPublic: true 
      },
      update: { 
        type: item.type,
        unit: item.unit || "kg",
        isActive: true 
      },
    });
  }

  const itemTypes = await prisma.itemType.findMany({ orderBy: { id: "asc" } });

  // Units
  const units = ["GRAM", "KG", "TON", "BUAH", "LEMBAR", "BUNGKUS"];
  for (const name of units) {
    await prisma.unit.upsert({
      where: { name },
      create: { name, isActive: true },
      update: { isActive: true },
    });
  }

  // Workers (no unique => seed only if empty)
  const workerCount = await prisma.worker.count();
  if (workerCount === 0) {
    await prisma.worker.createMany({
      data: [
        { name: "Budi Santoso", isActive: true },
        { name: "Siti Aulia", isActive: true },
        { name: "Rian Pratama", isActive: true },
        { name: "Dewi Lestari", isActive: true },
      ],
    });
  }

  const workers = await prisma.worker.findMany({ orderBy: { id: "asc" } });
  const productionTypes = await prisma.productionType.findMany({
    orderBy: { id: "asc" },
  });

  if (itemTypes.length < 4)
    throw new Error("Not enough item types to seed transactions");
  if (workers.length < 2)
    throw new Error("Not enough workers to seed production workers");
  if (productionTypes.length < 1)
    throw new Error("Not enough production types");

  return { itemTypes, workers, productionTypes };
}

async function seedTransactions(ctx: {
  itemTypes: Awaited<ReturnType<typeof prisma.itemType.findMany>>;
  workers: Awaited<ReturnType<typeof prisma.worker.findMany>>;
  productionTypes: Awaited<ReturnType<typeof prisma.productionType.findMany>>;
}) {
  const [itAsalan, itPatahan, itAAA] = ctx.itemTypes;
  const prodType = ctx.productionTypes[0];
  const worker1 = ctx.workers[0];
  const worker2 = ctx.workers[1];

  // Purchase + items (seed only if empty)
  let purchaseId: bigint | null = null;
  const purchaseCount = await prisma.purchase.count();
  if (purchaseCount === 0) {
    const purchase = await prisma.purchase.create({
      data: {
        supplier: "CV Sumber Makmur",
        date: new Date("2026-02-01"),
        status: "posted",
        notes: "Pembelian awal untuk contoh data",
        purchaseItems: {
          create: [
            { itemTypeId: itAsalan.id, qty: "50.0000", unitCost: "15000.0000" },
            { itemTypeId: itPatahan.id, qty: "10.0000", unitCost: "90000.0000" },
            { itemTypeId: itAAA.id, qty: "1000.0000", unitCost: "200.0000" },
          ],
        },
      },
      select: { id: true },
    });
    purchaseId = purchase.id;
  } else {
    const any = await prisma.purchase.findFirst({ select: { id: true } });
    purchaseId = any?.id ?? null;
  }

  // Sale + items (seed only if empty)
  let saleId: bigint | null = null;
  const saleCount = await prisma.sale.count();
  if (saleCount === 0) {
    const sale = await prisma.sale.create({
      data: {
        customer: "Toko Andalas",
        date: new Date("2026-02-05"),
        status: "posted",
        notes: "Penjualan contoh",
        saleItems: {
          create: [
            { itemTypeId: itAsalan.id, qty: "100.0000", unitPrice: "5000.0000" },
          ],
        },
      },
      select: { id: true },
    });
    saleId = sale.id;
  } else {
    const any = await prisma.sale.findFirst({ select: { id: true } });
    saleId = any?.id ?? null;
  }

  // Production + inputs/outputs/workers (seed only if empty)
  let productionId: bigint | null = null;
  const productionCount = await prisma.production.count();
  if (productionCount === 0) {
    const production = await prisma.production.create({
      data: {
        productionTypeId: prodType.id,
        date: new Date("2026-02-06"),
        status: "completed",
        notes: "Produksi contoh",
        productionInputs: {
          create: [
            { itemTypeId: itAsalan.id, qty: "20.0000", unitCost: "15000.0000" },
            { itemTypeId: itAAA.id, qty: "400.0000", unitCost: "200.0000" },
          ],
        },
        productionOutputs: {
          create: [
            { itemTypeId: itPatahan.id, qty: "120.0000", unitCost: "4000.0000" },
          ],
        },
        productionWorkers: {
          create: [
            { workerId: worker1.id, role: "Operator", hours: "8.00" },
            { workerId: worker2.id, role: "Helper", hours: "6.50" },
          ],
        },
      },
      select: { id: true },
    });
    productionId = production.id;
  } else {
    const any = await prisma.production.findFirst({ select: { id: true } });
    productionId = any?.id ?? null;
  }

  // Stock Movements (seed only if empty AND we have source rows)
  const stockCount = await prisma.stockMovement.count();
  if (stockCount === 0) {
    // Find source rows for linking
    const purchaseItems = await prisma.purchaseItem.findMany({
      take: 10,
      orderBy: { id: "asc" },
      select: { id: true, itemTypeId: true, qty: true },
    });
    const saleItems = await prisma.saleItem.findMany({
      take: 10,
      orderBy: { id: "asc" },
      select: { id: true, itemTypeId: true, qty: true },
    });
    const prodInputs = await prisma.productionInput.findMany({
      take: 10,
      orderBy: { id: "asc" },
      select: { id: true, itemTypeId: true, qty: true },
    });
    const prodOutputs = await prisma.productionOutput.findMany({
      take: 10,
      orderBy: { id: "asc" },
      select: { id: true, itemTypeId: true, qty: true },
    });

    const data: Array<{
      itemTypeId: bigint;
      qty: string;
      sourceType: string;
      sourceId: bigint;
      displayUnit?: string | null;
      conversionRateUsed?: string | null;
    }> = [];

    for (const it of purchaseItems) {
      data.push({
        itemTypeId: it.itemTypeId,
        qty: String(it.qty), // + incoming
        sourceType: "purchase_item",
        sourceId: it.id,
        displayUnit: null,
        conversionRateUsed: null,
      });
    }
    for (const it of saleItems) {
      data.push({
        itemTypeId: it.itemTypeId,
        qty: `-${String(it.qty)}`, // - outgoing
        sourceType: "sale_item",
        sourceId: it.id,
        displayUnit: null,
        conversionRateUsed: null,
      });
    }
    for (const it of prodInputs) {
      data.push({
        itemTypeId: it.itemTypeId,
        qty: `-${String(it.qty)}`, // consumed
        sourceType: "production_input",
        sourceId: it.id,
        displayUnit: null,
        conversionRateUsed: null,
      });
    }
    for (const it of prodOutputs) {
      data.push({
        itemTypeId: it.itemTypeId,
        qty: String(it.qty), // produced
        sourceType: "production_output",
        sourceId: it.id,
        displayUnit: null,
        conversionRateUsed: null,
      });
    }

    if (data.length > 0) {
      await prisma.stockMovement.createMany({ data });
    }
  }

  // Upah modules (seed only if empty)
  if ((await prisma.pengikisan.count()) === 0) {
    await prisma.pengikisan.create({
      data: {
        date: new Date("2026-02-07"),
        notes: "Pengikisan contoh",
        totalUpah: "58250.00",
        pengikisanItems: {
          create: [
            {
              nama: "Rian Pratama",
              kaKg: "12.5000",
              stikKg: "7.0000",
              upahKa: "2000.00",
              upahStik: "1500.00",
              total: "35500.00",
            },
            {
              nama: "Dewi Lestari",
              kaKg: "8.0000",
              stikKg: "4.5000",
              upahKa: "2000.00",
              upahStik: "1500.00",
              total: "22750.00",
            },
          ],
        },
      },
    });
  }

  if ((await prisma.penjemuran.count()) === 0) {
    await prisma.penjemuran.create({
      data: {
        date: new Date("2026-02-08"),
        notes: "Penjemuran contoh",
        upahPerHari: "75000.00",
        upahLemburPerJam: "15000.00",
        totalUpah: "225000.00",
        penjemuranItems: {
          create: [
            {
              nama: "Budi Santoso",
              hari: "2.00",
              lemburJam: "3.00",
              upahPerHari: "75000.00",
              upahLemburPerJam: "15000.00",
              total: "195000.00", // 2*75000 + 3*15000
            },
            {
              nama: "Siti Aulia",
              hari: "1.00",
              lemburJam: "2.00",
              upahPerHari: "75000.00",
              upahLemburPerJam: "15000.00",
              total: "105000.00", // 1*75000 + 2*15000
            },
          ],
        },
      },
    });
  }

  if ((await prisma.pengemasan.count()) === 0) {
    await prisma.pengemasan.create({
      data: {
        date: new Date("2026-02-09"),
        notes: "Pengemasan contoh",
        upahPerBungkus: "250.00",
        totalUpah: "50000.00",
        pengemasanItems: {
          create: [
            {
              nama: "Budi Santoso",
              bungkus: "120.00",
              upahPerBungkus: "250.00",
              total: "30000.00",
            },
            {
              nama: "Siti Aulia",
              bungkus: "80.00",
              upahPerBungkus: "250.00",
              total: "20000.00",
            },
          ],
        },
      },
    });
  }

  if ((await prisma.pemotongan.count()) === 0) {
    await prisma.pemotongan.create({
      data: {
        date: new Date("2026-02-10"),
        notes: "Pemotongan contoh",
        upahPerKg: "1800.00",
        totalUpah: "54000.00",
        pemotonganItems: {
          create: [
            {
              nama: "Rian Pratama",
              qty: "20.0000",
              upahPerKg: "1800.00",
              total: "36000.00",
            },
            {
              nama: "Dewi Lestari",
              qty: "10.0000",
              upahPerKg: "1800.00",
              total: "18000.00",
            },
          ],
        },
      },
    });
  }

  return { purchaseId, saleId, productionId };
}

async function main() {
  const { adminEmail } = await seedAuth();
  const master = await seedMaster();
  await seedTransactions(master);

  console.log("✅ Seed completed (NON-CMS only).");
  console.log("Login:");
  console.log(`- admin: ${adminEmail}`);
  console.log(`- password (all seeded users): ${SEED_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
