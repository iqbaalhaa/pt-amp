"use server";

import { prisma } from "@/lib/prisma";

export type PenjemuranItemInput = {
	nama: string;
	hari: string;
	lemburJam: string;
};

export type PenjemuranInput = {
	date: string;
	notes?: string | null;
	upahPerHari: string;
	upahLemburPerJam: string;
	items: PenjemuranItemInput[];
};

export async function createPenjemuran(input: PenjemuranInput) {
	const upahPerHari = parseFloat(input.upahPerHari || "0");
	const upahLemburPerJam = parseFloat(input.upahLemburPerJam || "0");

	const cleanedItems = input.items
		.map((item) => {
			const hari = parseFloat(item.hari || "0");
			const lemburJam = parseFloat(item.lemburJam || "0");
			const total = hari * upahPerHari + lemburJam * upahLemburPerJam;

			return {
				nama: item.nama,
				hari: item.hari || "0",
				lemburJam: item.lemburJam || "0",
				upahPerHari: upahPerHari.toString(),
				upahLemburPerJam: upahLemburPerJam.toString(),
				total: total.toString(),
			};
		})
		.filter(
			(it) =>
				it.nama ||
				parseFloat(it.hari) > 0 ||
				parseFloat(it.lemburJam || "0") > 0
		);

	const totalUpah = cleanedItems.reduce(
		(sum, it) => sum + parseFloat(it.total),
		0
	);

	const penjemuran = await prisma.penjemuran.create({
		data: {
			date: new Date(input.date),
			notes: input.notes ?? null,
			totalUpah: totalUpah.toString(),
			upahPerHari: upahPerHari || null,
			upahLemburPerJam: upahLemburPerJam || null,
			...(cleanedItems.length > 0
				? {
						penjemuranItems: {
							create: cleanedItems,
						},
				  }
				: {}),
		},
	});

	return { success: true, id: String(penjemuran.id) };
}
