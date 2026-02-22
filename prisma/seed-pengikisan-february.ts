import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const year = 2026;
  const month = 1; // 0-based: 1 = Februari

  const allWorkers = await prisma.worker.findMany({
    where: { isActive: true },
    orderBy: { id: "asc" },
  });

  if (allWorkers.length === 0) {
    console.log("No workers found. Aborting pengikisan seed.");
    return;
  }

  const workDays: Date[] = [];
  for (let d = 1; d <= 29; d++) {
    const date = new Date(year, month, d);
    const day = date.getDay(); // 0=Sun,6=Sat
    if (day === 0 || day === 6) continue;
    workDays.push(date);
  }

  console.log(
    `Seeding pengikisan for ${workDays.length} work days in February ${year} for ${allWorkers.length} workers...`,
  );

  for (const workDate of workDays) {
    const pengikisanItems = allWorkers.map((w, idx) => {
      const baseKa = 8 + (idx % 5);
      const baseStik = 4 + (idx % 4);
      const kaKg = baseKa;
      const stikKg = baseStik;
      const upahKa = 1000;
      const upahStik = 1200;
      const total = kaKg * upahKa + stikKg * upahStik;
      return {
        nama: w.name,
        kaKg: kaKg.toFixed(4),
        stikKg: stikKg.toFixed(4),
        upahKa: upahKa.toFixed(2),
        upahStik: upahStik.toFixed(2),
        total: total.toFixed(2),
      };
    });

    const totalUpah = pengikisanItems.reduce(
      (sum, it) => sum + parseFloat(it.total),
      0,
    );

    await prisma.pengikisan.create({
      data: {
        date: workDate,
        petugas: "Seed Pengikisan",
        notes: "Seed data pengikisan Februari 2026",
        totalUpah: totalUpah.toFixed(2),
        pengikisanItems: {
          create: pengikisanItems,
        },
      },
    });
  }

  console.log("✅ Seed pengikisan Februari completed.");
}

main()
  .catch((e) => {
    console.error("❌ Seed pengikisan Februari failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
