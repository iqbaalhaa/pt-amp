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

export async function getProductions() {
	const productions = await prisma.production.findMany({
		orderBy: { date: "desc" },
		include: {
			productionType: true,
			productionInputs: {
				include: {
					product: true,
				},
			},
			productionOutputs: {
				include: {
					product: true,
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
			productName: i.product.name,
			qty: i.qty.toString(),
			unitCost: i.unitCost.toString(),
			unit: i.product.unit,
		})),
		outputs: p.productionOutputs.map((o) => ({
			id: o.id.toString(),
			productName: o.product.name,
			qty: o.qty.toString(),
			unitCost: o.unitCost.toString(),
			unit: o.product.unit,
		})),
		workers: p.productionWorkers.map((w) => ({
			id: w.id.toString(),
			workerName: w.worker.name,
			role: w.role,
			hours: w.hours ? w.hours.toString() : null,
		})),
	}));
}

export async function revokeProduction(id: string) {
	await prisma.production.update({
		where: { id: BigInt(id) },
		data: { status: "cancelled" },
	});
	revalidatePath("/admin/production");
}
