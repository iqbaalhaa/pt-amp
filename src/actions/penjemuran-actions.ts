"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type PenjemuranItemInput = {
  nama: string;
  hari: string;
  lemburJam: string;
};

export type PenjemuranInput = {
  date: string;
  petugas?: string | null;
  notes?: string | null;
  upahPerHari: string;
  upahLemburPerJam: string;
  items: PenjemuranItemInput[];
};

export async function createPenjemuran(input: PenjemuranInput) {
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

  const penjemuran = await prisma.penjemuran.create({
    data: {
      date: new Date(input.date),
      notes: input.notes ?? null,
      totalUpah: totalUpah.toString(),
      upahPerHari: upahPerHari.toString(),
      upahLemburPerJam: upahLemburPerJam.toString(),
      ...(cleanedItems.length > 0
        ? {
            penjemuranItems: {
              create: cleanedItems,
            },
          }
        : {}),
    },
  });

  return { success: true, id: String(penjemuran.id) };
}

export async function bulkCreatePenjemuran(inputs: PenjemuranInput[]) {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserName = session?.user.name ?? null;

<<<<<<< HEAD
  return data.map((item) => ({
    id: String(item.id),
    date: item.date,
    notes: item.notes,
    totalUpah: Number(item.totalUpah ?? 0),
    items: item.penjemuranItems.map((sub) => ({
      nama: sub.nama,
      hari: Number(sub.hari ?? 0),
      lemburJam: Number(sub.lemburJam ?? 0),
      total: Number(sub.total ?? 0),
    })),
  }));
}
=======
  let successCount = 0;
  let errors: string[] = [];
>>>>>>> e0c72936a410aeab850975a346a34fb9bf258026

  for (const input of inputs) {
    try {
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

      if (cleanedItems.length === 0) continue;

      const totalUpah = cleanedItems.reduce(
        (sum, it) => sum + parseFloat(it.total),
        0
      );

      await prisma.penjemuran.create({
        data: {
          date: new Date(input.date),
          petugas: currentUserName || input.petugas,
          notes: input.notes ?? null,
          totalUpah: totalUpah.toString(),
          upahPerHari: upahPerHari.toString(),
          upahLemburPerJam: upahLemburPerJam.toString(),
          penjemuranItems: {
            create: cleanedItems,
          },
        },
      });
      successCount++;
    } catch (e: any) {
      errors.push(`Error for date ${input.date}: ${e.message}`);
    }
  }

  revalidatePath("/admin/penjemuran");
  revalidatePath("/admin/ledger");
  return { success: true, count: successCount, errors };
}
