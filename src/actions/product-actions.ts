"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ProductType } from "@prisma/client";

export type ProductDTO = {
	id: string;
	name: string;
	type: ProductType;
	unit: string;
	description: string | null;
	image: string | null;
	isActive: boolean;
	stock: string;
};

export async function getProducts(): Promise<ProductDTO[]> {
	const [products, stockSums] = await prisma.$transaction([
		prisma.product.findMany({
			orderBy: { createdAt: "desc" },
		}),
		prisma.stockMovement.groupBy({
			by: ["productId"],
			orderBy: { productId: "asc" },
			_sum: { qty: true },
		}),
	]);

	const stockByProductId = new Map<string, string>();
	for (const row of stockSums) {
		const qty = row._sum?.qty;
		stockByProductId.set(
			row.productId.toString(),
			qty ? qty.toString() : "0"
		);
	}

	return products.map((p) => {
		const id = p.id.toString();
		return {
			id,
			name: p.name,
			type: p.type,
			unit: p.unit,
			description: p.description,
			image: p.image,
			isActive: p.isActive,
			stock: stockByProductId.get(id) ?? "0",
		};
	});
}

export async function createProduct(formData: FormData) {
	const name = formData.get("name") as string;
	const description = (formData.get("description") as string) || null;
	const type = formData.get("type") as ProductType;
	const unit = (formData.get("unit") as string) || "kg";
	const image = (formData.get("image") as string) || null;
	const isActiveRaw = formData.get("isActive");
	const isActive = isActiveRaw === null ? true : String(isActiveRaw) === "true";

	await prisma.product.create({
		data: {
			name,
			description,
			type,
			unit,
			image,
			isActive,
		},
	});

	revalidatePath("/admin/products");
	revalidatePath("/");
}

export async function updateProduct(id: string, formData: FormData) {
	const name = formData.get("name") as string;
	const description = (formData.get("description") as string) || null;
	const type = formData.get("type") as ProductType;
	const unit = (formData.get("unit") as string) || "kg";
	const image = (formData.get("image") as string) || null;
	const isActive = String(formData.get("isActive")) === "true";

	await prisma.product.update({
		where: { id: BigInt(id) },
		data: {
			name,
			description,
			type,
			unit,
			image,
			isActive,
		},
	});

	revalidatePath("/admin/products");
	revalidatePath("/");
}

export async function deleteProduct(id: string) {
	await prisma.product.delete({
		where: { id: BigInt(id) },
	});

	revalidatePath("/admin/products");
	revalidatePath("/");
}
