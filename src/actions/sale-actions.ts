"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TransactionStatus } from "@/generated/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type SaleItemInput = {
  productId: string;
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
  const customerNormalized: string | null =
    input.customer && input.customer !== "" ? input.customer : null;

  const itemsData = input.items
    .filter((i) => i.productId && i.qty && i.unitPrice)
    .map((i) => ({
      productId: BigInt(i.productId),
      qty: i.qty,
      unitPrice: i.unitPrice,
    }));

  const sale = await prisma.sale.create({
    data: {
      customer: customerNormalized,
      date: new Date(input.date),
      status: input.status,
      notes: input.notes ?? null,
      ...(itemsData.length > 0
        ? {
            saleItems: {
              create: itemsData,
            },
          }
        : {}),
    },
  });

  revalidatePath("/admin/sales");
  return { success: true, id: sale.id.toString() };
}

export async function getSales() {
  const sales = await prisma.sale.findMany({
    orderBy: { date: "desc" },
    include: {
      saleItems: {
        include: {
          product: true,
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
      productName: i.product.name,
      qty: i.qty.toString(),
      unitPrice: i.unitPrice.toString(),
      unit: i.product.unit,
    })),
  }));
}

export async function revokeSale(id: string, reason?: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user.id ?? null;
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
