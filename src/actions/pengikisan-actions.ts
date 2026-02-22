"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type PengikisanItemInput = {
  nama: string;
  kaKg: string;
  stikKg: string;
};

export type PengikisanInput = {
  date: string;
  shift: "siang" | "malam";
  petugas?: string | null;
  notes?: string | null;
  upahKa?: string;
  upahStik?: string;
  items: PengikisanItemInput[];
};

export async function createPengikisan(input: PengikisanInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserName = session?.user.name ?? null;

  const upahKaValue = parseFloat(input.upahKa || "1000");
  const upahStikValue = parseFloat(input.upahStik || "1200");

  const cleanedItems = input.items
    .map((item) => {
      const ka = parseFloat(item.kaKg || "0");
      const stik = parseFloat(item.stikKg || "0");
      const total = ka * upahKaValue + stik * upahStikValue;

      return {
        nama: item.nama,
        kaKg: item.kaKg || "0",
        stikKg: item.stikKg || "0",
        upahKa: upahKaValue.toString(),
        upahStik: upahStikValue.toString(),
        total: total.toString(),
      };
    })
    .filter(
      (it) => it.nama || parseFloat(it.kaKg) > 0 || parseFloat(it.stikKg) > 0
    );

  const totalUpah = cleanedItems.reduce(
    (sum, it) => sum + parseFloat(it.total),
    0
  );

  const pengikisan = await prisma.pengikisan.create({
    data: {
      date: new Date(input.date),
      shift: input.shift,
      petugas: currentUserName || input.petugas,
      notes: input.notes ?? null,
      totalUpah: totalUpah.toString(),
      ...(cleanedItems.length > 0
        ? {
            pengikisanItems: {
              create: cleanedItems,
            },
          }
        : {}),
    },
  });

  return { success: true, id: String(pengikisan.id) };
}

export async function getPengikisanHistory() {
  const data = await prisma.pengikisan.findMany({
    orderBy: { date: "desc" },
    include: {
      pengikisanItems: true,
    },
  });

  return data.map((item) => ({
    id: String(item.id),
    date: item.date,
    shift: (item as any).shift as "siang" | "malam",
    petugas: item.petugas,
    notes: item.notes,
    totalUpah: Number(item.totalUpah ?? 0),
    items: item.pengikisanItems.map((sub) => ({
      nama: sub.nama,
      kaKg: Number(sub.kaKg ?? 0),
      stikKg: Number(sub.stikKg ?? 0),
      total: Number(sub.total ?? 0),
    })),
  }));
}

export async function deletePengikisan(id: string) {
  try {
    await prisma.pengikisan.delete({
      where: { id: BigInt(id) },
    });
    revalidatePath("/admin/pengikisan");
    revalidatePath("/admin/ledger");
    return { success: true };
  } catch (error) {
    console.error("Error deleting pengikisan:", error);
    return { success: false, error: "Gagal menghapus data" };
  }
}
