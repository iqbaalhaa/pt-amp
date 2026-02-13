"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ProductType } from "@prisma/client";

export type ItemTypeDTO = {
	id: string;
	name: string;
	description: string | null;
	type: ProductType | null;
	image: string | null;
	unit: string | null;
	isPublic: boolean;
	isActive: boolean;
	stock?: string;
};

export async function getItemTypes(): Promise<ItemTypeDTO[]> {
	const itemTypes = await prisma.itemType.findMany({
		orderBy: { name: "asc" },
	});

	return itemTypes.map((it) => ({
		id: it.id.toString(),
		name: it.name,
		description: it.description,
		type: it.type,
		image: it.image,
		unit: it.unit,
		isPublic: it.isPublic,
		isActive: it.isActive,
	}));
}

export async function createItemType(formData: FormData) {
	const name = formData.get("name") as string;
	const description = (formData.get("description") as string) || null;
	const type = (formData.get("type") as ProductType) || null;
	const unit = (formData.get("unit") as string) || "kg";
	const image = (formData.get("image") as string) || null;
	const isPublic = formData.get("isPublic") === "true";
	const isActiveRaw = formData.get("isActive");
	const isActive = isActiveRaw === null ? true : isActiveRaw === "true";

	await prisma.itemType.create({
		data: {
			name,
			description,
			type,
			unit,
			image,
			isPublic,
			isActive,
		},
	});

	revalidatePath("/admin/item-types");
}

export async function quickCreateItemType(name: string): Promise<ItemTypeDTO> {
	const normalizedName = name.trim().toUpperCase();
	
	// Try to find case-insensitively
	const existing = await prisma.itemType.findFirst({
		where: { 
			name: {
				equals: normalizedName,
				mode: 'insensitive'
			}
		},
	});

	let it;
	if (existing) {
		it = await prisma.itemType.update({
			where: { id: existing.id },
			data: { 
				name: normalizedName, // Standardize to uppercase
				isActive: true 
			},
		});
	} else {
		it = await prisma.itemType.create({
			data: {
				name: normalizedName,
				isActive: true,
			},
		});
	}

	revalidatePath("/admin/item-types");
	revalidatePath("/admin/purchases");

	return {
		id: it.id.toString(),
		name: it.name,
		description: it.description,
		type: it.type,
		image: it.image,
		unit: it.unit,
		isPublic: it.isPublic,
		isActive: it.isActive,
	};
}

export async function updateItemType(id: string, formData: FormData) {
	const name = formData.get("name") as string;
	const description = (formData.get("description") as string) || null;
	const type = (formData.get("type") as ProductType) || null;
	const unit = (formData.get("unit") as string) || "kg";
	const image = (formData.get("image") as string) || null;
	const isPublic = formData.get("isPublic") === "true";
	const isActiveRaw = formData.get("isActive");
	const isActive = isActiveRaw === null ? true : isActiveRaw === "true";

	await prisma.itemType.update({
		where: { id: BigInt(id) },
		data: {
			name,
			description,
			type,
			unit,
			image,
			isPublic,
			isActive,
		},
	});

	revalidatePath("/admin/item-types");
}

export async function getPublicItemTypes(): Promise<ItemTypeDTO[]> {
	const itemTypes = await prisma.itemType.findMany({
		where: {
			isPublic: true,
			isActive: true,
		},
		orderBy: { name: "asc" },
	});

	const stockSums = await prisma.stockMovement.groupBy({
		by: ["itemTypeId"],
		_sum: { qty: true },
	});

	const stockMap = new Map(
		stockSums.map((s) => [s.itemTypeId.toString(), s._sum.qty?.toString() || "0"])
	);

	return itemTypes.map((it) => ({
		id: it.id.toString(),
		name: it.name,
		description: it.description,
		type: it.type,
		image: it.image,
		unit: it.unit,
		isPublic: it.isPublic,
		isActive: it.isActive,
		stock: stockMap.get(it.id.toString()) || "0",
	}));
}

export async function deleteItemType(id: string) {
	await prisma.itemType.delete({
		where: { id: BigInt(id) },
	});

	revalidatePath("/admin/item-types");
}

export async function deleteItemTypes(ids: string[]) {
	await prisma.itemType.deleteMany({
		where: {
			id: {
				in: ids.map((id) => BigInt(id)),
			},
		},
	});

	revalidatePath("/admin/item-types");
}

