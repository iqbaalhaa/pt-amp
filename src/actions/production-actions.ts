"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ProductionStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type ProductionItemInput = {
  itemTypeId: string;
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
    .filter((i) => i.itemTypeId && i.qty && i.unitCost)
    .map((i) => ({
      itemTypeId: BigInt(i.itemTypeId),
      qty: i.qty,
      unitCost: i.unitCost,
    }));

  const outputsData = input.outputs
    .filter((i) => i.itemTypeId && i.qty && i.unitCost)
    .map((i) => ({
      itemTypeId: BigInt(i.itemTypeId),
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
        date: new Date(`${input.date}T00:00:00Z`),
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

export async function getProductions() {
  const productions = await prisma.production.findMany({
    orderBy: { date: "desc" },
    include: {
      productionType: true,
      productionInputs: {
        include: {
          itemType: true,
        },
      },
      productionOutputs: {
        include: {
          itemType: true,
        },
      },
      productionWorkers: {
        include: {
          worker: true,
        },
      },
    },
  });

  return productions.map((p) => ({
    id: p.id.toString(),
    productionType: p.productionType.name,
    date: p.date.toISOString(),
    status: p.status,
    notes: p.notes,
    inputs: p.productionInputs.map((i) => ({
      id: i.id.toString(),
      productName: i.itemType.name,
      qty: i.qty.toString(),
      unitCost: i.unitCost.toString(),
      unit: "-",
    })),
    outputs: p.productionOutputs.map((o) => ({
      id: o.id.toString(),
      productName: o.itemType.name,
      qty: o.qty.toString(),
      unitCost: o.unitCost.toString(),
      unit: "-",
    })),
    workers: p.productionWorkers.map((w) => ({
      id: w.id.toString(),
      workerName: w.worker.name,
      role: w.role,
      hours: w.hours ? w.hours.toString() : null,
    })),
  }));
}

export async function revokeProduction(id: string, reason?: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user.id ?? null;

  // Ensure ID is a valid number for BigInt conversion
  if (!/^\d+$/.test(id)) {
    console.error(`Invalid production ID for BigInt: ${id}`);
    return { success: false, error: "ID produksi tidak valid" };
  }

  // 1. Get production to find items
  const production = await prisma.production.findUnique({
    where: { id: BigInt(id) },
    include: {
      productionInputs: true,
      productionOutputs: true,
    },
  });

  if (!production) return { success: false, error: "Produksi tidak ditemukan" };

  // 2. Delete associated stock movements
  if (production.status === "completed") {
    const inputIds = production.productionInputs.map((i) => i.id);
    const outputIds = production.productionOutputs.map((i) => i.id);

    if (inputIds.length > 0) {
      await prisma.stockMovement.deleteMany({
        where: {
          sourceType: "production_input",
          sourceId: { in: inputIds },
        },
      });
    }

    if (outputIds.length > 0) {
      await prisma.stockMovement.deleteMany({
        where: {
          sourceType: "production_output",
          sourceId: { in: outputIds },
        },
      });
    }
  }

  // 3. Update production status
  await prisma.production.update({
    where: { id: BigInt(id) },
    data: {
      status: "cancelled",
      revokeReason: reason ?? null,
      revokedAt: new Date(),
      revokedById: userId,
    },
  });
  revalidatePath("/admin/production");
  revalidatePath("/admin/ledger");
  revalidatePath("/admin/inventory/stock");

  return { success: true };
}
