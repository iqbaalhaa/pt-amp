import PembelianPage from "@/components/admin/sales/PembelianPage";
import { prisma } from "@/lib/prisma";
import type { ItemTypeDTO } from "@/actions/item-type-actions";

export default async function AdminSalesPembelianPage() {
	const itemTypes = await prisma.itemType.findMany({
		where: { isActive: true },
		orderBy: { name: "asc" },
	});

	const itemTypeDTOs: ItemTypeDTO[] = itemTypes.map((t) => ({
		id: t.id.toString(),
		name: t.name,
		description: t.description,
		type: t.type,
		image: t.image,
		unit: t.unit,
		isPublic: t.isPublic,
		isActive: t.isActive,
	}));

	return (
		<main className="mx-auto w-full max-w-6xl px-4 py-6">
			<PembelianPage itemTypes={itemTypeDTOs} />
		</main>
	);
}
