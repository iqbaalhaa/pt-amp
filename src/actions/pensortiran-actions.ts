"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type PensortiranItemInput = {
  nama: string;
  qty: string;
};

export type PensortiranInput = {
  date: string;
  petugas?: string | null;
  notes?: string | null;
  upahPerKg: string;
  items: PensortiranItemInput[];
};

export async function createPensortiran(input: PensortiranInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserName = session?.user.name ?? null;

  const upahPerKg = parseFloat(input.upahPerKg || "0");

  const cleanedItems = input.items
    .map((item) => {
      const qty = parseFloat(item.qty || "0");
      const total = qty * upahPerKg;

      return {
        nama: item.nama,
        qty: item.qty || "0",
        upahPerKg: upahPerKg.toString(),
        total: total.toString(),
      };
    })
    .filter((it) => it.nama || parseFloat(it.qty) > 0);

  const totalUpah = cleanedItems.reduce(
    (sum, it) => sum + parseFloat(it.total),
    0
  );

  const pensortiran = await prisma.pensortiran.create({
    data: {
      date: new Date(input.date),
      petugas: currentUserName || input.petugas,
      notes: input.notes ?? null,
      totalUpah: totalUpah.toString(),
      upahPerKg: upahPerKg || null,
      ...(cleanedItems.length > 0
        ? {
            pensortiranItems: {
              create: cleanedItems,
            },
          }
        : {}),
    },
  });

  revalidatePath("/admin/pensortiran");
  revalidatePath("/admin/ledger");

  return { success: true, id: String(pensortiran.id) };
}

export async function getPensortiranHistory() {
  const data = await prisma.pensortiran.findMany({
    orderBy: { date: "desc" },
    include: {
      pensortiranItems: true,
    },
  });

  return data.map((item) => ({
    id: String(item.id),
    date: item.date,
    petugas: item.petugas,
    notes: item.notes,
    totalUpah: Number(item.totalUpah ?? 0),
    items: item.pensortiranItems.map((sub) => ({
      nama: sub.nama,
      qty: Number(sub.qty ?? 0),
      total: Number(sub.total ?? 0),
    })),
  }));
}

export async function deletePensortiran(id: string) {
  try {
    await prisma.pensortiran.delete({
      where: { id: BigInt(id) },
    });
    revalidatePath("/admin/pensortiran");
    revalidatePath("/admin/ledger");
    return { success: true };
  } catch (error) {
    console.error("Error deleting pensortiran:", error);
    return { success: false, error: "Gagal menghapus data" };
  }
}

