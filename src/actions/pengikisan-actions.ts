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
  petugas?: string | null;
  notes?: string | null;
  items: PengikisanItemInput[];
};

const UPAH_KA = 1000;
const UPAH_STIK = 1200;

export async function createPengikisan(input: PengikisanInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserName = session?.user.name ?? null;

  const cleanedItems = input.items
    .map((item) => {
      const ka = parseFloat(item.kaKg || "0");
      const stik = parseFloat(item.stikKg || "0");
      const total = ka * UPAH_KA + stik * UPAH_STIK;

      return {
        nama: item.nama,
        kaKg: item.kaKg || "0",
        stikKg: item.stikKg || "0",
        upahKa: UPAH_KA.toString(),
        upahStik: UPAH_STIK.toString(),
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
      namaPetugas: currentUserName || input.petugas,
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

export async function bulkCreatePengikisan(inputs: PengikisanInput[]) {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserName = session?.user.name ?? null;

  let successCount = 0;
  let errors: string[] = [];

  for (const input of inputs) {
    try {
      const cleanedItems = input.items
        .map((item) => {
          const ka = parseFloat(item.kaKg || "0");
          const stik = parseFloat(item.stikKg || "0");
          const total = ka * UPAH_KA + stik * UPAH_STIK;

          return {
            nama: item.nama,
            kaKg: item.kaKg || "0",
            stikKg: item.stikKg || "0",
            upahKa: UPAH_KA.toString(),
            upahStik: UPAH_STIK.toString(),
            total: total.toString(),
          };
        })
        .filter(
          (it) => it.nama || parseFloat(it.kaKg) > 0 || parseFloat(it.stikKg) > 0
        );

      if (cleanedItems.length === 0) continue;

      const totalUpah = cleanedItems.reduce(
        (sum, it) => sum + parseFloat(it.total),
        0
      );

      await prisma.pengikisan.create({
        data: {
          date: new Date(input.date),
          namaPetugas: currentUserName || input.petugas,
          notes: input.notes ?? null,
          totalUpah: totalUpah.toString(),
          pengikisanItems: {
            create: cleanedItems,
          },
        },
      });
      successCount++;
    } catch (e: any) {
      errors.push(`Error for date ${input.date}: ${e.message}`);
    }
  }

  revalidatePath("/admin/pengikisan");
  revalidatePath("/admin/ledger");
  return { success: true, count: successCount, errors };
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
    petugas: item.namaPetugas,
    notes: item.notes,
    totalUpah: parseFloat(item.totalUpah || "0"),
    items: item.pengikisanItems.map((sub) => ({
      nama: sub.nama,
      kaKg: parseFloat(sub.kaKg || "0"),
      stikKg: parseFloat(sub.stikKg || "0"),
      total: parseFloat(sub.total || "0"),
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
