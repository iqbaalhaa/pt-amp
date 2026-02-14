import { PrismaClient } from "../src/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Sales Transaction...");

  // 0. Clean existing sales (optional, based on "clean data" request)
  await prisma.stockMovement.deleteMany({ where: { sourceType: "sale_item" } });
  await prisma.sale.deleteMany();

  // 1. Get User (Admin)
  const admin = await prisma.user.findFirst({
    where: { email: "admin@amp.local" }
  });

  if (!admin) {
    console.error("❌ Admin user not found. Run 'npx prisma db seed' first.");
    return;
  }

  // 2. Get Item Types (Products)
  const itemTypes = await prisma.itemType.findMany();
  if (itemTypes.length === 0) {
    console.error("❌ No Item Types found. Run 'npx prisma db seed' first.");
    return;
  }

  const item1 = itemTypes[0];
  const item2 = itemTypes.length > 1 ? itemTypes[1] : itemTypes[0];

  // 3. Create Sale Transaction
  
  const sale = await prisma.sale.create({
    data: {
      date: new Date(),
      customer: "Toko Sejahtera",
      status: "posted", // Posted affects stock/ledger
      // total: 5000000, // Removed: not in schema? let's check prisma.schema
      notes: "Penjualan perdana pasca reset",
      saleItems: {
        create: [
          {
            itemTypeId: item1.id,
            qty: 10,
            unitPrice: 150000,
          },
          {
            itemTypeId: item2.id,
            qty: 20,
            unitPrice: 175000,
          }
        ]
      }
    },
    include: { saleItems: true }
  });

  // 4. Create Stock Movements
  const movements = sale.saleItems.map(item => ({
    itemTypeId: item.itemTypeId,
    qty: -Number(item.qty), // Negative for sales
    sourceType: "sale_item",
    sourceId: item.id,
    displayUnit: null,
    conversionRateUsed: null,
  }));

  await prisma.stockMovement.createMany({ data: movements });

  console.log(`✅ Created Sale Transaction: ${sale.id} with ${movements.length} stock movements`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
