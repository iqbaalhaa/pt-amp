"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type PemotonganItemInput = {
  nama: string;
  qty: string;
};

export type PemotonganInput = {
  date: string;
  shift: "siang" | "malam";
  petugas?: string | null;
  notes?: string | null;
  upahPerKg: string;
  items: PemotonganItemInput[];
};

export async function createPemotongan(input: PemotonganInput) {
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

  const pemotongan = await prisma.pemotongan.create({
    data: {
      date: new Date(input.date),
      shift: input.shift,
      petugas: currentUserName || input.petugas,
      notes: input.notes ?? null,
      totalUpah: totalUpah.toString(),
      upahPerKg: upahPerKg || null,
      ...(cleanedItems.length > 0
        ? {
            pemotonganItems: {
              create: cleanedItems,
            },
          }
        : {}),
    },
  });

  return { success: true, id: String(pemotongan.id) };
}

export async function getPemotonganHistory() {
  const data = await prisma.pemotongan.findMany({
    orderBy: { date: "desc" },
    include: {
      pemotonganItems: true,
    },
  });

  return data.map((item) => ({
    id: String(item.id),
    date: item.date,
    shift: (item as any).shift as "siang" | "malam",
    petugas: item.petugas,
    notes: item.notes,
    totalUpah: Number(item.totalUpah ?? 0),
    items: item.pemotonganItems.map((sub) => ({
      nama: sub.nama,
      qty: Number(sub.qty ?? 0),
      total: Number(sub.total ?? 0),
    })),
  }));
}

export async function deletePemotongan(id: string) {
  try {
    await prisma.pemotongan.delete({
      where: { id: BigInt(id) },
    });
    revalidatePath("/admin/pemotongan");
    revalidatePath("/admin/ledger");
    return { success: true };
  } catch (error) {
    console.error("Error deleting pemotongan:", error);
    return { success: false, error: "Gagal menghapus data" };
  }
}
