"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type UnitDTO = {
	id: string;
	name: string;
	description: string | null;
	isActive: boolean;
};

export async function getUnits(): Promise<UnitDTO[]> {
	const units = await prisma.unit.findMany({
		orderBy: { name: "asc" },
	});

	return units.map((u) => ({
		id: u.id.toString(),
		name: u.name,
		description: u.description,
		isActive: u.isActive,
	}));
}

export async function createUnit(formData: FormData) {
	const name = formData.get("name") as string;
	const description = (formData.get("description") as string) || null;
	const isActiveRaw = formData.get("isActive");
	const isActive = isActiveRaw === null ? true : isActiveRaw === "true";

	await prisma.unit.create({
		data: {
			name,
			description,
			isActive,
		},
	});

	revalidatePath("/admin/units");
}

export async function quickCreateUnit(name: string): Promise<UnitDTO> {
	const normalizedName = name.trim().toUpperCase();

	// Try to find case-insensitively
	const existing = await prisma.unit.findFirst({
		where: {
			name: {
				equals: normalizedName,
				mode: 'insensitive'
			}
		},
	});

	let u;
	if (existing) {
		u = await prisma.unit.update({
			where: { id: existing.id },
			data: {
				name: normalizedName, // Standardize to uppercase
				isActive: true
			},
		});
	} else {
		u = await prisma.unit.create({
			data: {
				name: normalizedName,
				isActive: true,
			},
		});
	}

	revalidatePath("/admin/units");
	revalidatePath("/admin/purchases");

	return {
		id: u.id.toString(),
		name: u.name,
		description: u.description,
		isActive: u.isActive,
	};
}

export async function updateUnit(id: string, formData: FormData) {
	const name = formData.get("name") as string;
	const description = (formData.get("description") as string) || null;
	const isActiveRaw = formData.get("isActive");
	const isActive = isActiveRaw === null ? true : isActiveRaw === "true";

	await prisma.unit.update({
		where: { id: BigInt(id) },
		data: {
			name,
			description,
			isActive,
		},
	});

	revalidatePath("/admin/units");
}

export async function deleteUnit(id: string) {
	await prisma.unit.delete({
		where: { id: BigInt(id) },
	});

	revalidatePath("/admin/units");
}

export async function deleteUnits(ids: string[]) {
	await prisma.unit.deleteMany({
		where: {
			id: {
				in: ids.map((id) => BigInt(id)),
			},
		},
	});

	revalidatePath("/admin/units");
}
