import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function main() {
  const migrationName = "20260214092211_align_sale_unit";
  console.log(`Attempting to delete migration record: ${migrationName}`);

  try {
    const result =
      await prisma.$executeRaw`DELETE FROM "_prisma_migrations" WHERE migration_name = ${migrationName}`;
    console.log(`Deleted ${result} record(s).`);
  } catch (e) {
    console.error("Error deleting migration record:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
