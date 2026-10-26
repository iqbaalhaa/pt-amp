"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type ExpenseItemInput = {
  purpose: string;
  amount: string;
};

export type ExpenseInput = {
  date: string;
  notes?: string | null;
  items: ExpenseItemInput[];
};

export async function createExpense(input: ExpenseInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user.id ?? null;
  const currentUserName = session?.user.name ?? null;

  const itemsData = input.items
    .filter((i) => i.purpose && i.purpose.trim() !== "" && i.amount)
    .map((i) => ({
      purpose: i.purpose.trim(),
      amount: i.amount,
    }));

  const expense = await prisma.expense.create({
    data: {
      date: new Date(`${input.date}T00:00:00Z`),
      status: "draft",
      notes: input.notes ?? null,
      createdById: currentUserId,
      createdByName: currentUserName,
      ...(itemsData.length > 0
        ? {
            items: {
              create: itemsData,
            },
          }
        : {}),
    },
    include: {
      items: true,
    },
  });
  const expenseId = expense.id.toString();

  revalidatePath("/admin/expenses");
  return { success: true, id: expenseId };
}

export async function approveExpense(id: string) {
  await prisma.expense.update({
    where: { id: BigInt(id) },
    data: { status: "posted" },
  });
  revalidatePath("/admin/ledger");
  revalidatePath("/admin/cash");
  return { success: true };
}

export async function revokeExpense(id: string, reason?: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user.id ?? null;
  await prisma.expense.update({
    where: { id: BigInt(id) },
    data: {
      status: "cancelled",
      revokeReason: reason ?? null,
      revokedAt: new Date(),
      revokedById: userId,
    },
  });
  revalidatePath("/admin/ledger");
  revalidatePath("/admin/cash");
  return { success: true };
}
