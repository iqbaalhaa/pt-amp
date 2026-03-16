"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TransactionStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type PurchaseItemInput = {
  itemTypeId: string;
  qty: string;
  unitId?: string | null;
  unitCost: string;
};

export type PurchaseInput = {
  supplier?: string | null;
  date: string;
  status: TransactionStatus;
  notes?: string | null;
  items: PurchaseItemInput[];
};

export async function createPurchase(input: PurchaseInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user.id ?? null;
  const currentUserName = session?.user.name ?? null;
  const supplierNormalized: string | null =
    input.supplier && input.supplier !== "" ? input.supplier : null;

  const itemsData = input.items
    .filter((i) => i.itemTypeId && i.qty && i.unitCost)
    .map((i) => ({
      itemTypeId: BigInt(i.itemTypeId),
      unitId: i.unitId ? BigInt(i.unitId) : null,
      qty: i.qty,
      unitCost: i.unitCost,
    }));

  const purchase = await prisma.purchase.create({
    data: {
      supplier: supplierNormalized,
      date: new Date(`${input.date}T00:00:00Z`),
      status: input.status,
      notes: input.notes ?? null,
      createdById: currentUserId,
      createdByName: currentUserName,
      ...(itemsData.length > 0
        ? {
            purchaseItems: {
              create: itemsData,
            },
          }
        : {}),
    },
    include: {
      purchaseItems: true,
    },
  });

  if (input.status === "posted" && purchase.purchaseItems.length > 0) {
    const movements = purchase.purchaseItems.map((item) => ({
      itemTypeId: item.itemTypeId,
      qty: item.qty, // Positive for purchase
      sourceType: "purchase_item",
      sourceId: item.id,
      displayUnit: null,
      conversionRateUsed: null,
    }));

    await prisma.stockMovement.createMany({
      data: movements,
    });
  }

  revalidatePath("/admin/purchases");
  revalidatePath("/admin/inventory/stock");
  return { success: true, id: purchase.id.toString() };
}

export async function getPurchases() {
  const purchases = await prisma.purchase.findMany({
    orderBy: { date: "desc" },
    include: {
      purchaseItems: {
        include: {
          itemType: true,
          unit: true,
        },
      },
    },
  });

  return purchases.map((p) => ({
    id: p.id.toString(),
    supplier: p.supplier,
    date: p.date.toISOString(),
    status: p.status,
    notes: p.notes,
    items: p.purchaseItems.map((i) => ({
      id: i.id.toString(),
      productName: i.itemType.name,
      qty: i.qty.toString(),
      unitCost: i.unitCost.toString(),
      unit: i.unit ? i.unit.name : "-",
    })),
  }));
}

export async function revokePurchase(id: string, reason?: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user.id ?? null;
  
  // 1. Get purchase to find items
  const purchase = await prisma.purchase.findUnique({
    where: { id: BigInt(id) },
    include: { purchaseItems: true },
  });

  if (!purchase) return;

  // 2. Delete associated stock movements
  if (purchase.status === "posted") {
    const itemIds = purchase.purchaseItems.map((i) => i.id);
    if (itemIds.length > 0) {
      await prisma.stockMovement.deleteMany({
        where: {
          sourceType: "purchase_item",
          sourceId: { in: itemIds },
        },
      });
    }
  }

  // 3. Update purchase status
  await prisma.purchase.update({
    where: { id: BigInt(id) },
    data: {
      status: "cancelled",
      revokeReason: reason ?? null,
      revokedAt: new Date(),
      revokedById: userId,
    },
  });
  revalidatePath("/admin/purchases");
  revalidatePath("/admin/ledger");
  revalidatePath("/admin/inventory/stock");
}

export async function approvePurchase(id: string) {
  // Fetch purchase and items
  const purchase = await prisma.purchase.findUnique({
    where: { id: BigInt(id) },
    include: { purchaseItems: true },
  });
  if (!purchase) return { success: false };

  // Update status to posted
  const updated = await prisma.purchase.update({
    where: { id: BigInt(id) },
    data: { status: "posted" },
    include: { purchaseItems: true },
  });

  // Create stock movements
  if (updated.purchaseItems.length > 0) {
    const movements = updated.purchaseItems.map((item) => ({
      itemTypeId: item.itemTypeId,
      qty: item.qty,
      sourceType: "purchase_item",
      sourceId: item.id,
      displayUnit: null,
      conversionRateUsed: null,
    }));
    await prisma.stockMovement.createMany({ data: movements });
  }

  revalidatePath("/admin/purchases");
  revalidatePath("/admin/ledger");
  revalidatePath("/admin/inventory/stock");
  return { success: true };
}
