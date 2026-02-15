"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type ProduksiLainnyaItemInput = {
  namaPekerja: string;
  namaPekerjaan: string;
  upah: string;
  qty: string;
  satuan: string;
};

export type ProduksiLainnyaInput = {
  date: string;
  petugas?: string | null;
  notes?: string | null;
  items: ProduksiLainnyaItemInput[];
};

export async function createProduksiLainnya(input: ProduksiLainnyaInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserName = session?.user.name ?? null;

  const cleanedItems = input.items
    .map((item) => {
      const qty = parseFloat(item.qty || "0");
      const upah = parseFloat(item.upah || "0");
      const total = qty * upah;

      return {
        namaPekerja: item.namaPekerja,
        namaPekerjaan: item.namaPekerjaan,
        qty: qty,
        satuan: item.satuan,
        upah: upah,
        total: total,
      };
    })
    .filter(
      (it) => it.namaPekerja || it.namaPekerjaan || it.qty > 0 || it.upah > 0
    );

  const totalBiaya = cleanedItems.reduce((sum, it) => sum + it.total, 0);

  const produksiLainnya = await prisma.produksiLainnya.create({
    data: {
      date: new Date(input.date),
      petugas: currentUserName || input.petugas,
      notes: input.notes ?? null,
      totalBiaya: totalBiaya,
      ...(cleanedItems.length > 0
        ? {
            produksiLainnyaItems: {
              create: cleanedItems,
            },
          }
        : {}),
    },
  });

  return { success: true, id: String(produksiLainnya.id) };
}

export async function getProduksiLainnyaHistory() {
  const history = await prisma.produksiLainnya.findMany({
    orderBy: { date: "desc" },
    include: {
      produksiLainnyaItems: true,
    },
  });

  return history.map((item) => ({
    id: String(item.id),
    date: item.date,
    petugas: item.petugas,
    notes: item.notes,
    totalBiaya: Number(item.totalBiaya),
    items: item.produksiLainnyaItems.map((i) => ({
      id: String(i.id),
      produksiLainnyaId: String(i.produksiLainnyaId),
      namaPekerja: i.namaPekerja,
      namaPekerjaan: i.namaPekerjaan,
      qty: Number(i.qty),
      satuan: i.satuan,
      upah: Number(i.upah),
      total: Number(i.total),
    })),
  }));
}

export async function deleteProduksiLainnya(id: string) {
  await prisma.produksiLainnya.delete({
    where: { id: BigInt(id) },
  });
  return { success: true };
}
