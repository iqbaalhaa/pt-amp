import { PrismaClient } from "../src/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const suppliers = [
  {
    name: "PT SEMEN INDONESIA",
    address: "Jl. Veteran, Gresik, Jawa Timur",
    phone: "031-3981732",
    bankAccount: "MANDIRI 1420001234567 a/n PT Semen Indonesia",
  },
  {
    name: "CV JAYA BERSAMA",
    address: "Kawasan Industri Pulogadung, Jakarta Timur",
    phone: "0812-3456-7890",
    bankAccount: "BCA 0351234567 a/n Budi Santoso",
  },
  {
    name: "UD SUMBER MAJU",
    address: "Jl. Raya Solo-Semarang KM 15, Boyolali",
    phone: "0857-1122-3344",
    bankAccount: "BRI 001201000456789 a/n UD Sumber Maju",
  },
  {
    name: "PT GLOBAL LOGISTIK",
    address: "Tanjung Priok Port, Jakarta Utara",
    phone: "021-43901234",
    bankAccount: "BNI 0098765432 a/n PT Global Logistik",
  },
  {
    name: "TOKO BESI HARAPAN",
    address: "Jl. Gajah Mada No. 120, Semarang",
    phone: "024-3541234",
    bankAccount: "DANAMON 3567890123 a/n Toko Besi Harapan",
  },
  {
    name: "CV MITRA TEKNIK",
    address: "Ruko Inkopal Blok B No. 15, Kelapa Gading",
    phone: "0811-9988-7766",
    bankAccount: "BCA 2170098765 a/n Mitra Teknik CV",
  },
  {
    name: "PT ANUGERAH SEJAHTERA",
    address: "Kawasan Industri Jababeka II, Cikarang",
    phone: "021-8934567",
    bankAccount: "CIMB 800123456789 a/n PT Anugerah Sejahtera",
  },
  {
    name: "UD MEKAR SARI",
    address: "Jl. Kaliurang KM 7, Yogyakarta",
    phone: "0274-889900",
    bankAccount: "MANDIRI 1370007654321 a/n Siti Aminah",
  },
  {
    name: "PT LOGAM MULIA",
    address: "Jl. Pulo Ayang No. 6, Pulogadung",
    phone: "021-4609123",
    bankAccount: "PERMATA 4101234567 a/n PT Logam Mulia",
  },
  {
    name: "CV BERKAH ABADI",
    address: "Jl. Bypass Ngurah Rai No. 500, Bali",
    phone: "0361-778899",
    bankAccount: "BCA 0409876543 a/n I Wayan Berkah",
  },
];

async function main() {
  console.log("Starting seed suppliers...");
  for (const supplier of suppliers) {
    await prisma.supplier.upsert({
      where: { name: supplier.name },
      update: {},
      create: {
        ...supplier,
        isActive: true,
      },
    });
  }
  console.log("Seed suppliers completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
