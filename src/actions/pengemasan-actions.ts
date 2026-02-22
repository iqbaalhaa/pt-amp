"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type PengemasanItemInput = {
  nama: string;
  bungkus: string;
  itemTypeId: string;
};

export type PengemasanInput = {
  date: string;
  petugas?: string | null;
  notes?: string | null;
  upahPerBungkus: string;
  items: PengemasanItemInput[];
};

export async function createPengemasan(input: PengemasanInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserName = session?.user.name ?? null;

  const upahPerBungkus = parseFloat(input.upahPerBungkus || "0");

  const cleanedItems = input.items
    .map((item) => {
      const bungkus = parseFloat(item.bungkus || "0");
      const total = bungkus * upahPerBungkus;

      return {
        nama: item.nama,
        bungkus: item.bungkus || "0",
        upahPerBungkus: upahPerBungkus.toString(),
        total: total.toString(),
      };
    })
    .filter((it) => it.nama || parseFloat(it.bungkus) > 0);

  const totalUpah = cleanedItems.reduce(
    (sum, it) => sum + parseFloat(it.total),
    0
  );

  const pengemasan = await prisma.pengemasan.create({
    data: {
      date: new Date(input.date),
      petugas: currentUserName || input.petugas,
      notes: input.notes ?? null,
      totalUpah: totalUpah.toString(),
      upahPerBungkus: upahPerBungkus || null,
      ...(cleanedItems.length > 0
        ? {
            pengemasanItems: {
              create: cleanedItems,
            },
          }
        : {}),
    },
  });

  return { success: true, id: String(pengemasan.id) };
}

export async function getPengemasanHistory() {
  const data = await prisma.pengemasan.findMany({
    orderBy: { date: "desc" },
    include: {
      pengemasanItems: true,
    },
  });

  return data.map((item) => ({
    id: String(item.id),
    date: item.date,
    petugas: item.petugas,
    notes: item.notes,
    totalUpah: Number(item.totalUpah ?? 0),
    items: item.pengemasanItems.map((sub) => ({
      nama: sub.nama,
      bungkus: Number(sub.bungkus ?? 0),
      total: Number(sub.total ?? 0),
    })),
  }));
}

export async function deletePengemasan(id: string) {
  try {
    await prisma.pengemasan.delete({
      where: { id: BigInt(id) },
    });
    revalidatePath("/admin/pengemasan");
    revalidatePath("/admin/ledger");
    return { success: true };
  } catch (error) {
    console.error("Error deleting pengemasan:", error);
    return { success: false, error: "Gagal menghapus data" };
  }
}
