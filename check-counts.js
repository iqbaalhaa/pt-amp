
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const itemTypes = await prisma.itemType.count();
  const units = await prisma.unit.count();
  console.log({ itemTypes, units });
}

main().catch(console.error).finally(() => prisma.$disconnect());
