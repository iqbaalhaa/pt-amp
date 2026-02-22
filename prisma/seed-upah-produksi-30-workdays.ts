import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function getLastNWorkdays(n: number, base: Date): Date[] {
  const days: Date[] = [];
  let current = new Date(base);
  while (days.length < n) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      days.unshift(new Date(current));
    }
    current.setDate(current.getDate() - 1);
  }
  return days;
}

async function main() {
  const baseDate = new Date(2026, 1, 29);
  const workDays = getLastNWorkdays(30, baseDate);

  const allWorkers = await prisma.worker.findMany({
    where: { isActive: true },
    orderBy: { id: "asc" },
  });

  if (allWorkers.length === 0) {
    console.log("No workers found. Aborting upah produksi seed.");
    return;
  }

  console.log(
    `Seeding Pengikisan, Pemotongan, Penjemuran, Pengemasan, Produksi Lainnya for ${workDays.length} work days and ${allWorkers.length} workers...`,
  );

  const firstTwoWorkers = allWorkers.slice(0, 2);
  const upahPerKg = 1800;
  const upahPerHari = 75000;
  const upahLemburPerJam = 15000;
  const upahPerBungkus = 250;
  const upahKa = 1000;
  const upahStik = 1200;

  for (const workDate of workDays) {
    const dateOnly = new Date(
      workDate.getFullYear(),
      workDate.getMonth(),
      workDate.getDate(),
    );

    const pengikisanItems = allWorkers.map((w, idx) => {
      const baseKa = 8 + (idx % 5);
      const baseStik = 4 + (idx % 4);
      const kaKg = baseKa;
      const stikKg = baseStik;
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

    const totalUpahPengikisan = pengikisanItems.reduce(
      (sum, it) => sum + parseFloat(it.total),
      0,
    );

    await prisma.pengikisan.create({
      data: {
        date: dateOnly,
        petugas: "Seed Pengikisan",
        notes: "Seed data pengikisan 30 hari kerja",
        totalUpah: totalUpahPengikisan.toFixed(2),
        pengikisanItems: { create: pengikisanItems },
      },
    });

    if (firstTwoWorkers.length > 0) {
      const pemotonganItems = firstTwoWorkers.map((w, idx) => {
        const qty = 10 + idx * 5;
        const total = qty * upahPerKg;
        return {
          nama: w.name,
          qty: qty.toFixed(4),
          upahPerKg: upahPerKg.toFixed(2),
          total: total.toFixed(2),
        };
      });

      const totalUpahPemotongan = pemotonganItems.reduce(
        (sum, it) => sum + parseFloat(it.total),
        0,
      );

      await prisma.pemotongan.create({
        data: {
          date: dateOnly,
          petugas: "Seed Pemotongan",
          notes: "Seed data pemotongan 30 hari kerja",
          upahPerKg: upahPerKg.toFixed(2),
          totalUpah: totalUpahPemotongan.toFixed(2),
          pemotonganItems: { create: pemotonganItems },
        },
      });
    }

    const penjemuranItems = allWorkers.map((w, idx) => {
      const hari = 1;
      const lemburJam = idx % 3;
      const total =
        hari * upahPerHari + lemburJam * upahLemburPerJam;
      return {
        nama: w.name,
        hari: hari.toFixed(2),
        lemburJam: lemburJam.toFixed(2),
        upahPerHari: upahPerHari.toFixed(2),
        upahLemburPerJam: upahLemburPerJam.toFixed(2),
        total: total.toFixed(2),
      };
    });

    const totalUpahPenjemuran = penjemuranItems.reduce(
      (sum, it) => sum + parseFloat(it.total),
      0,
    );

    await prisma.penjemuran.create({
      data: {
        date: dateOnly,
        notes: "Seed data penjemuran 30 hari kerja",
        upahPerHari: upahPerHari.toFixed(2),
        upahLemburPerJam: upahLemburPerJam.toFixed(2),
        totalUpah: totalUpahPenjemuran.toFixed(2),
        penjemuranItems: { create: penjemuranItems },
      },
    });

    const pengemasanItems = allWorkers.map((w, idx) => {
      const bungkus = 80 + idx * 10;
      const total = bungkus * upahPerBungkus;
      return {
        nama: w.name,
        bungkus: bungkus.toFixed(2),
        upahPerBungkus: upahPerBungkus.toFixed(2),
        total: total.toFixed(2),
      };
    });

    const totalUpahPengemasan = pengemasanItems.reduce(
      (sum, it) => sum + parseFloat(it.total),
      0,
    );

    await prisma.pengemasan.create({
      data: {
        date: dateOnly,
        petugas: "Seed Pengemasan",
        notes: "Seed data pengemasan 30 hari kerja",
        upahPerBungkus: upahPerBungkus.toFixed(2),
        totalUpah: totalUpahPengemasan.toFixed(2),
        pengemasanItems: { create: pengemasanItems },
      },
    });

    const produksiLainnyaItems = firstTwoWorkers.map((w, idx) => {
      const baseQty = 3 + idx;
      const qty = baseQty;
      const upah = 12000 + idx * 3000;
      const total = qty * upah;
      const pekerjaanList = ["Angkut Barang", "Bersih-bersih Gudang"];
      const namaPekerjaan =
        pekerjaanList[idx % pekerjaanList.length] || "Pekerjaan Lainnya";
      return {
        namaPekerja: w.name,
        namaPekerjaan,
        qty: qty.toFixed(4),
        satuan: "rit",
        upah: upah.toFixed(2),
        total: total.toFixed(2),
      };
    });

    const totalBiayaProduksiLainnya = produksiLainnyaItems.reduce(
      (sum, it) => sum + parseFloat(it.total),
      0,
    );

    await prisma.produksiLainnya.create({
      data: {
        date: dateOnly,
        petugas: "Seed Produksi Lainnya",
        notes: "Seed data Produksi Lainnya 30 hari kerja",
        totalBiaya: totalBiayaProduksiLainnya.toFixed(2),
        produksiLainnyaItems: { create: produksiLainnyaItems },
      },
    });
  }

  console.log(
    "✅ Seed Pengikisan, Pemotongan, Penjemuran, Pengemasan, Produksi Lainnya 30 hari kerja completed.",
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed upah produksi 30 hari kerja failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
