"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ProductionStatus } from "@/generated/prisma";

export type ProductionItemInput = {
  productId: string;
  qty: string;
  unitCost: string;
};

export type ProductionWorkerInput = {
  workerId: string;
  role?: string;
  hours?: string;
};

export type ProductionData = {
  productionTypeId: string;
  date: string;
  status: ProductionStatus;
  notes?: string | null;
  inputs: ProductionItemInput[];
  outputs: ProductionItemInput[];
  workers: ProductionWorkerInput[];
};

export async function createProduction(input: ProductionData) {
  // Validate basic requirements
  if (!input.productionTypeId || !input.date) {
    return { success: false, message: "Missing required fields" };
  }

  const inputsData = input.inputs
    .filter((i) => i.productId && i.qty && i.unitCost)
    .map((i) => ({
      productId: BigInt(i.productId),
      qty: i.qty,
      unitCost: i.unitCost,
    }));

  const outputsData = input.outputs
    .filter((i) => i.productId && i.qty && i.unitCost)
    .map((i) => ({
      productId: BigInt(i.productId),
      qty: i.qty,
      unitCost: i.unitCost,
    }));

  const workersData = input.workers
    .filter((w) => w.workerId)
    .map((w) => ({
      workerId: BigInt(w.workerId),
      role: w.role || null,
      hours: w.hours || null,
    }));

  try {
    const production = await prisma.production.create({
      data: {
        productionTypeId: BigInt(input.productionTypeId),
        date: new Date(input.date),
        status: input.status,
        notes: input.notes ?? null,
        ...(inputsData.length > 0
          ? {
              productionInputs: {
                create: inputsData,
              },
            }
          : {}),
        ...(outputsData.length > 0
          ? {
              productionOutputs: {
                create: outputsData,
              },
            }
          : {}),
        ...(workersData.length > 0
          ? {
              productionWorkers: {
                create: workersData,
              },
            }
          : {}),
      },
    });

    revalidatePath("/admin/production");
    return { success: true, id: production.id.toString() };
  } catch (error) {
    console.error("Error creating production:", error);
    return { success: false, message: "Failed to create production" };
  }
}
