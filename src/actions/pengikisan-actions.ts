"use server";

import { prisma } from "@/lib/prisma";

export type PengikisanItemInput = {
	nama: string;
	kaKg: string;
	stikKg: string;
};

export type PengikisanInput = {
	date: string;
	notes?: string | null;
	items: PengikisanItemInput[];
};

const UPAH_KA = 1000;
const UPAH_STIK = 1200;

export async function createPengikisan(input: PengikisanInput) {
	const cleanedItems = input.items
		.map((item) => {
			const ka = parseFloat(item.kaKg || "0");
			const stik = parseFloat(item.stikKg || "0");
			const total = ka * UPAH_KA + stik * UPAH_STIK;

			return {
				nama: item.nama,
				kaKg: item.kaKg || "0",
				stikKg: item.stikKg || "0",
				upahKa: UPAH_KA.toString(),
				upahStik: UPAH_STIK.toString(),
				total: total.toString(),
			};
		})
		.filter(
			(it) => it.nama || parseFloat(it.kaKg) > 0 || parseFloat(it.stikKg) > 0
		);

	const totalUpah = cleanedItems.reduce(
		(sum, it) => sum + parseFloat(it.total),
		0
	);

	const pengikisan = await prisma.pengikisan.create({
		data: {
			date: new Date(input.date),
			notes: input.notes ?? null,
			totalUpah: totalUpah.toString(),
			...(cleanedItems.length > 0
				? {
						pengikisanItems: {
							create: cleanedItems,
						},
				  }
				: {}),
		},
	});

	return { success: true, id: String(pengikisan.id) };
}
