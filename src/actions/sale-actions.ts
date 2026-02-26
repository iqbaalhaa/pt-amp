"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TransactionStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type SaleItemInput = {
  itemTypeId: string;
  qty: string;
  unitPrice: string;
};

export type SaleInput = {
  customer?: string | null;
  date: string;
  status: TransactionStatus;
  notes?: string | null;
  items: SaleItemInput[];
};

export async function createSale(input: SaleInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user.id ?? null;
  const currentUserName = session?.user.name ?? null;
  const customerNormalized: string | null =
    input.customer && input.customer !== "" ? input.customer : null;

  const itemsData = input.items
    .filter((i) => i.itemTypeId && i.qty && i.unitPrice)
    .map((i) => ({
      itemTypeId: BigInt(i.itemTypeId),
      qty: i.qty,
      unitPrice: i.unitPrice,
    }));

  const sale = await prisma.sale.create({
    data: {
      customer: customerNormalized,
      date: new Date(input.date),
      status: input.status,
      notes: input.notes ?? null,
      createdById: currentUserId,
      createdByName: currentUserName,
      ...(itemsData.length > 0
        ? {
            saleItems: {
              create: itemsData,
            },
          }
        : {}),
    },
    include: {
      saleItems: true,
    },
  });

  if (input.status === "posted" && sale.saleItems.length > 0) {
    const movements = sale.saleItems.map((item) => ({
      itemTypeId: item.itemTypeId,
      qty: -Number(item.qty), // Negative for sales
      sourceType: "sale_item",
      sourceId: item.id,
      displayUnit: null,
      conversionRateUsed: null,
    }));

    await prisma.stockMovement.createMany({
      data: movements,
    });
  }

  revalidatePath("/admin/sales");
  revalidatePath("/admin/inventory/stock");
  return { success: true, id: sale.id.toString() };
}

export async function getSales() {
  const sales = await prisma.sale.findMany({
    orderBy: { date: "desc" },
    include: {
      saleItems: {
        include: {
          itemType: true,
        },
      },
    },
  });

  return sales.map((s) => ({
    id: s.id.toString(),
    customer: s.customer,
    date: s.date.toISOString(),
    status: s.status,
    notes: s.notes,
    items: s.saleItems.map((i) => ({
      id: i.id.toString(),
      productName: i.itemType.name,
      qty: i.qty.toString(),
      unitPrice: i.unitPrice.toString(),
      unit: "-", // ItemType doesn't have direct unit relation in current schema
    })),
  }));
}

export async function revokeSale(id: string, reason?: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user.id ?? null;
  
  // 1. Get sale to find items
  const sale = await prisma.sale.findUnique({
    where: { id: BigInt(id) },
    include: { saleItems: true },
  });

  if (!sale) return;

  // 2. Delete associated stock movements
  if (sale.status === "posted") {
    const itemIds = sale.saleItems.map((i) => i.id);
    if (itemIds.length > 0) {
      await prisma.stockMovement.deleteMany({
        where: {
          sourceType: "sale_item",
          sourceId: { in: itemIds },
        },
      });
    }
  }

  // 3. Update sale status
  await prisma.sale.update({
    where: { id: BigInt(id) },
    data: {
      status: "cancelled",
      revokeReason: reason ?? null,
      revokedAt: new Date(),
      revokedById: userId,
    },
  });
  revalidatePath("/admin/sales");
  revalidatePath("/admin/ledger");
}

export async function approveSale(id: string) {
  // Fetch sale and items
  const sale = await prisma.sale.findUnique({
    where: { id: BigInt(id) },
    include: { saleItems: true },
  });
  if (!sale) return { success: false };

  // Update status to posted
  const updated = await prisma.sale.update({
    where: { id: BigInt(id) },
    data: { status: "posted" },
    include: { saleItems: true },
  });

  // Create stock movements (negative for sales)
  if (updated.saleItems.length > 0) {
    const movements = updated.saleItems.map((item) => ({
      itemTypeId: item.itemTypeId,
      qty: -Number(item.qty),
      sourceType: "sale_item",
      sourceId: item.id,
      displayUnit: null,
      conversionRateUsed: null,
    }));
    await prisma.stockMovement.createMany({ data: movements });
  }

  revalidatePath("/admin/sales");
  revalidatePath("/admin/ledger");
  revalidatePath("/admin/inventory/stock");
  return { success: true };
}
