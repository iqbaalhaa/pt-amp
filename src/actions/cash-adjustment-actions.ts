"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AdjustmentType } from "@/generated/client";

export type CashAdjustmentInput = {
  date: string;
  amount: number;
  type: AdjustmentType;
  notes?: string | null;
};

export async function createCashAdjustment(input: CashAdjustmentInput) {
  const anyPrisma = prisma as any;
  if (!anyPrisma.cashAdjustment) {
    throw new Error("Sistem kas belum siap (Prisma model missing). Silakan refresh halaman atau restart server.");
  }

  await prisma.cashAdjustment.create({
    data: {
      date: new Date(input.date),
      amount: input.amount,
      type: input.type,
      notes: input.notes ?? null,
    },
  });

  revalidatePath("/admin/cash");
  return { success: true };
}

export async function deleteCashAdjustment(id: string) {
  const anyPrisma = prisma as any;
  if (!anyPrisma.cashAdjustment) {
    throw new Error("Sistem kas belum siap (Prisma model missing).");
  }

  await prisma.cashAdjustment.delete({
    where: { id: BigInt(id) },
  });

  revalidatePath("/admin/cash");
  return { success: true };
}
