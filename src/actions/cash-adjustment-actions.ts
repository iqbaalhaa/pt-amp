"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AdjustmentType } from "@/generated/client";

export type CashAdjustmentInput = {
  date: string;
  amount: number;
  type: AdjustmentType;
  notes?: string | null;
};

export async function createCashAdjustment(input: CashAdjustmentInput) {
  await prisma.cashAdjustment.create({
    data: {
      date: new Date(`${input.date}T00:00:00Z`),
      amount: input.amount,
      type: input.type,
      notes: input.notes ?? null,
    },
  });

  revalidatePath("/admin/cash");
  return { success: true };
}

export async function deleteCashAdjustment(id: string) {
  await prisma.cashAdjustment.delete({
    where: { id: BigInt(id) },
  });

  revalidatePath("/admin/cash");
  return { success: true };
}
