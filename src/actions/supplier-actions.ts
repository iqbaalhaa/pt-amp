"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type SupplierDTO = {
	id: string;
	name: string;
	address: string | null;
	phone: string | null;
	bankAccount: string | null;
	isActive: boolean;
};

export async function getSuppliers(): Promise<SupplierDTO[]> {
	const suppliers = await prisma.supplier.findMany({
		orderBy: { name: "asc" },
	});

	return suppliers.map((s) => ({
		id: s.id.toString(),
		name: s.name,
		address: s.address,
		phone: s.phone,
		bankAccount: s.bankAccount,
		isActive: s.isActive,
	}));
}

export async function createSupplier(formData: FormData) {
	const name = formData.get("name") as string;
	const address = (formData.get("address") as string) || null;
	const phone = (formData.get("phone") as string) || null;
	const bankAccount = (formData.get("bankAccount") as string) || null;
	const isActiveRaw = formData.get("isActive");
	const isActive = isActiveRaw === null ? true : isActiveRaw === "true";

	await prisma.supplier.create({
		data: {
			name,
			address,
			phone,
			bankAccount,
			isActive,
		},
	});

	revalidatePath("/admin/suppliers");
}

export async function quickCreateSupplier(name: string) {
	const supplier = await prisma.supplier.create({
		data: {
			name,
			isActive: true,
		},
	});

	revalidatePath("/admin/suppliers");
	revalidatePath("/admin/purchases");
	return {
		id: supplier.id.toString(),
		name: supplier.name,
		address: supplier.address,
		phone: supplier.phone,
		bankAccount: supplier.bankAccount,
		isActive: supplier.isActive,
	};
}

export async function updateSupplier(id: string, formData: FormData) {
	const name = formData.get("name") as string;
	const address = (formData.get("address") as string) || null;
	const phone = (formData.get("phone") as string) || null;
	const bankAccount = (formData.get("bankAccount") as string) || null;
	const isActiveRaw = formData.get("isActive");
	const isActive = isActiveRaw === null ? true : isActiveRaw === "true";

	await prisma.supplier.update({
		where: { id: BigInt(id) },
		data: {
			name,
			address,
			phone,
			bankAccount,
			isActive,
		},
	});

	revalidatePath("/admin/suppliers");
}

export async function deleteSupplier(id: string) {
	await prisma.supplier.delete({
		where: { id: BigInt(id) },
	});
	revalidatePath("/admin/suppliers");
}

export async function deleteSuppliers(ids: string[]) {
	await prisma.supplier.deleteMany({
		where: {
			id: {
				in: ids.map((id) => BigInt(id)),
			},
		},
	});
	revalidatePath("/admin/suppliers");
}
