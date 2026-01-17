import { Paper, Stack, Typography, Box } from "@mui/material";
import PurchaseForm from "@/components/admin/purchases/PurchaseForm";
import PurchaseHistory from "@/components/admin/purchases/PurchaseHistory";
import { prisma } from "@/lib/prisma";
import { getPurchases } from "@/actions/purchase-actions";

export default async function AdminPurchasesPage() {
	const products = await prisma.product.findMany({
		where: { isActive: true },
		orderBy: { name: "asc" },
		select: { id: true, name: true, unit: true, type: true },
	});
	const productOptions = products.map((p) => ({
		id: p.id.toString(),
		name: p.name,
		unit: p.unit,
		type: p.type,
	}));

	// const purchases = await getPurchases();

	return (
		<Stack spacing={3}>
			<Box>
				<Typography variant="h4" sx={{ fontWeight: 800 }}>
					Pembelian
				</Typography>
			</Box>

			<Box>
				<Paper sx={{ p: 2, borderRadius: 2 }}>
					<PurchaseForm products={productOptions} />
				</Paper>
			</Box>

			{/* <Box>
				<PurchaseHistory purchases={purchases} />
			</Box> */}
		</Stack>
	);
}
