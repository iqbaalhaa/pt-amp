"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type QcPotongSortirItemInput = {
  nama: string;
  hari: string;
  lemburJam: string;
};

export type QcPotongSortirInput = {
  date: string;
  petugas?: string | null;
  notes?: string | null;
  upahPerHari: string;
  upahLemburPerJam: string;
  items: QcPotongSortirItemInput[];
};

export async function createQcPotongSortir(input: QcPotongSortirInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserName = session?.user.name ?? null;

  const upahPerHari = parseFloat(input.upahPerHari || "0");
  const upahLemburPerJam = parseFloat(input.upahLemburPerJam || "0");

  const cleanedItems = input.items
    .map((item) => {
      const hari = parseFloat(item.hari || "0");
      const lemburJam = parseFloat(item.lemburJam || "0");
      const total = hari * upahPerHari + lemburJam * upahLemburPerJam;

      return {
        nama: item.nama,
        hari: item.hari || "0",
        lemburJam: item.lemburJam || "0",
        upahPerHari: upahPerHari.toString(),
        upahLemburPerJam: upahLemburPerJam.toString(),
        total: total.toString(),
      };
    })
    .filter(
      (it) =>
        it.nama ||
        parseFloat(it.hari) > 0 ||
        parseFloat(it.lemburJam || "0") > 0
    );

  const totalUpah = cleanedItems.reduce(
    (sum, it) => sum + parseFloat(it.total),
    0
  );

  const qcPotongSortir = await prisma.qcPotongSortir.create({
    data: {
      date: new Date(input.date),
      notes: input.notes ?? null,
      totalUpah: totalUpah.toString(),
      upahPerHari: upahPerHari || null,
      upahLemburPerJam: upahLemburPerJam || null,
      petugas: currentUserName || input.petugas,
      ...(cleanedItems.length > 0
        ? {
            qcPotongSortirItems: {
              create: cleanedItems,
            },
          }
        : {}),
    },
  });

  revalidatePath("/admin/qc-potong-sortir");
  revalidatePath("/admin/ledger");

  return { success: true, id: String(qcPotongSortir.id) };
}

export async function getQcPotongSortirHistory() {
  const data = await prisma.qcPotongSortir.findMany({
    orderBy: { date: "desc" },
    include: {
      qcPotongSortirItems: true,
    },
  });

  return data.map((item) => ({
    id: String(item.id),
    date: item.date,
    petugas: item.petugas,
    notes: item.notes,
    totalUpah: Number(item.totalUpah ?? 0),
    items: item.qcPotongSortirItems.map((sub) => ({
      nama: sub.nama,
      hari: Number(sub.hari ?? 0),
      lemburJam: Number(sub.lemburJam ?? 0),
      total: Number(sub.total ?? 0),
    })),
  }));
}

export async function deleteQcPotongSortir(id: string) {
  try {
    await prisma.qcPotongSortir.delete({
      where: { id: BigInt(id) },
    });
    revalidatePath("/admin/qc-potong-sortir");
    revalidatePath("/admin/ledger");
    return { success: true };
  } catch (error) {
    console.error("Error deleting qc potong sortir:", error);
    return { success: false, error: "Gagal menghapus data" };
  }
}

