import { Paper, Stack, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import ProductionForm from "@/components/admin/production/ProductionForm";
import ProductionHistory from "@/components/admin/production/ProductionHistory";
import { getProductions } from "@/actions/production-actions";
import { prisma } from "@/lib/prisma";
import type { ItemTypeDTO } from "@/actions/item-type-actions";

export default async function AdminProductionPage() {
	const productions = await getProductions();

	const itemTypes = await prisma.itemType.findMany({
		where: { isActive: true },
		orderBy: { name: "asc" },
	});

	const workers = await prisma.worker.findMany({
		where: { isActive: true },
		orderBy: { name: "asc" },
		select: { id: true, name: true },
	});

	const productionTypes = await prisma.productionType.findMany({
		where: { isActive: true },
		orderBy: { name: "asc" },
		select: { id: true, name: true },
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

	const workerOptions = workers.map((w) => ({
		id: w.id.toString(),
		name: w.name,
	}));

	const typeOptions = productionTypes.map((t) => ({
		id: t.id.toString(),
		name: t.name,
	}));

	return (
		<Stack spacing={3}>
			<Box>
				<Typography variant="h4" sx={{ fontWeight: 800 }}>
					Production
				</Typography>
				<Typography variant="body2" sx={{ color: "text.secondary" }}>
					Input data produksi (Input Bahan, Output Hasil, Tenaga Kerja)
				</Typography>
			</Box>

			<Grid container spacing={2}>
				<Grid size={{ xs: 12 }}>
					<Paper sx={{ p: 2, borderRadius: 2 }}>
						<ProductionForm
							itemTypes={itemTypeDTOs}
							workers={workerOptions}
							productionTypes={typeOptions}
						/>
					</Paper>
				</Grid>
			</Grid>

			<ProductionHistory productions={productions} />
		</Stack>
	);
}
