 "use server";
 
 import { prisma } from "@/lib/prisma";
 
 export type PengemasanItemInput = {
 	nama: string;
 	bungkus: string;
 };
 
 export type PengemasanInput = {
 	date: string;
 	notes?: string | null;
 	upahPerBungkus: string;
 	items: PengemasanItemInput[];
 };
 
 export async function createPengemasan(input: PengemasanInput) {
 	const upahPerBungkus = parseFloat(input.upahPerBungkus || "0");
 
 	const cleanedItems = input.items
 		.map((item) => {
 			const bungkus = parseFloat(item.bungkus || "0");
 			const total = bungkus * upahPerBungkus;
 
 			return {
 				nama: item.nama,
 				bungkus: item.bungkus || "0",
 				upahPerBungkus: upahPerBungkus.toString(),
 				total: total.toString(),
 			};
 		})
 		.filter((it) => it.nama || parseFloat(it.bungkus) > 0);
 
 	const totalUpah = cleanedItems.reduce(
 		(sum, it) => sum + parseFloat(it.total),
 		0
 	);
 
 	const pengemasan = await prisma.pengemasan.create({
 		data: {
 			date: new Date(input.date),
 			notes: input.notes ?? null,
 			totalUpah: totalUpah.toString(),
 			upahPerBungkus: upahPerBungkus || null,
 			...(cleanedItems.length > 0
 				? {
 						pengemasanItems: {
 							create: cleanedItems,
 						},
 				  }
 				: {}),
 		},
 	});
 
 	return { success: true, id: String(pengemasan.id) };
 }
 
