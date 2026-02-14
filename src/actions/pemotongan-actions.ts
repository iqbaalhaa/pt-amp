"use server";

import { prisma } from "@/lib/prisma";

export type PemotonganItemInput = {
	nama: string;
	qty: string;
};

export type PemotonganInput = {
	date: string;
	notes?: string | null;
	upahPerKg: string;
	items: PemotonganItemInput[];
};

export async function createPemotongan(input: PemotonganInput) {
	const upahPerKg = parseFloat(input.upahPerKg || "0");

	const cleanedItems = input.items
		.map((item) => {
			const qty = parseFloat(item.qty || "0");
			const total = qty * upahPerKg;

			return {
				nama: item.nama,
				qty: item.qty || "0",
				upahPerKg: upahPerKg.toString(),
				total: total.toString(),
			};
		})
		.filter((it) => it.nama || parseFloat(it.qty) > 0);

	const totalUpah = cleanedItems.reduce(
		(sum, it) => sum + parseFloat(it.total),
		0
	);

	const pemotongan = await prisma.pemotongan.create({
		data: {
			date: new Date(input.date),
			notes: input.notes ?? null,
			totalUpah: totalUpah.toString(),
			upahPerKg: upahPerKg || null,
			...(cleanedItems.length > 0
				? {
						pemotonganItems: {
							create: cleanedItems,
						},
				  }
				: {}),
		},
	});

	return { success: true, id: String(pemotongan.id) };
}

export async function getPemotonganHistory() {
	const data = await prisma.pemotongan.findMany({
		orderBy: { date: "desc" },
		include: {
			pemotonganItems: true,
		},
	});

	return data.map((item) => ({
		id: String(item.id),
		date: item.date,
		notes: item.notes,
		totalUpah: parseFloat(item.totalUpah || "0"),
		items: item.pemotonganItems.map((sub) => ({
			nama: sub.nama,
			qty: parseFloat(sub.qty || "0"),
			total: parseFloat(sub.total || "0"),
		})),
	}));
}

export async function deletePemotongan(id: string) {
	try {
		await prisma.pemotongan.delete({
			where: { id: parseInt(id) },
		});
		return { success: true };
	} catch (error) {
		console.error("Error deleting pemotongan:", error);
		return { success: false, error: "Gagal menghapus data" };
	}
}
