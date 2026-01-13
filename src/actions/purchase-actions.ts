"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TransactionStatus } from "@/generated/prisma";

export type PurchaseItemInput = {
  productId: string;
  qty: string;
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
  const supplierNormalized: string | null =
    input.supplier && input.supplier !== "" ? input.supplier : null;

  const itemsData = input.items
    .filter((i) => i.productId && i.qty && i.unitCost)
    .map((i) => ({
      productId: BigInt(i.productId),
      qty: i.qty,
      unitCost: i.unitCost,
    }));

  const purchase = await prisma.purchase.create({
    data: {
      supplier: supplierNormalized,
      date: new Date(input.date),
      status: input.status,
      notes: input.notes ?? null,
      ...(itemsData.length > 0
        ? {
            purchaseItems: {
              create: itemsData,
            },
          }
        : {}),
    },
  });

  revalidatePath("/admin/purchases");
  return { success: true, id: purchase.id.toString() };
}

export async function getPurchases() {
  const purchases = await prisma.purchase.findMany({
    orderBy: { date: "desc" },
    include: {
      purchaseItems: {
        include: {
          product: true,
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
      productName: i.product.name,
      qty: i.qty.toString(),
      unitCost: i.unitCost.toString(),
      unit: i.product.unit,
    })),
  }));
}

export async function revokePurchase(id: string) {
  await prisma.purchase.update({
    where: { id: BigInt(id) },
    data: { status: "cancelled" },
  });
  revalidatePath("/admin/purchases");
}
