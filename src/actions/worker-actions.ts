"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type WorkerDTO = {
  id: string;
  name: string;
  role: string | null;
  isActive: boolean;
};

export async function getWorkers(): Promise<WorkerDTO[]> {
  const workers = await prisma.worker.findMany({
    orderBy: { name: "asc" },
  });

  return workers.map((w) => ({
    id: w.id.toString(),
    name: w.name,
    role: w.role,
    isActive: w.isActive,
  }));
}

export async function createWorker(formData: FormData) {
  const name = formData.get("name") as string;
  const role = (formData.get("role") as string) || null;
  const isActive = formData.get("isActive") === "true";

  await prisma.worker.create({
    data: {
      name,
      role,
      isActive,
    },
  });

  revalidatePath("/admin/workers");
}

export async function updateWorker(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const role = (formData.get("role") as string) || null;
  const isActive = formData.get("isActive") === "true";

  await prisma.worker.update({
    where: { id: BigInt(id) },
    data: {
      name,
      role,
      isActive,
    },
  });

  revalidatePath("/admin/workers");
}

export async function deleteWorker(id: string) {
  try {
    await prisma.worker.delete({
      where: { id: BigInt(id) },
    });
    revalidatePath("/admin/workers");
  } catch (error) {
    console.error("Failed to delete worker:", error);
    throw new Error("Gagal menghapus pekerja. Mungkin sedang digunakan dalam data produksi.");
  }
}
