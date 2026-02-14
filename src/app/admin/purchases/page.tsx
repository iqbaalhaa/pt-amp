import { Paper, Stack, Typography, Box } from "@mui/material";
import PurchaseForm from "@/components/admin/purchases/PurchaseForm";
import PurchaseHistory from "@/components/admin/purchases/PurchaseHistory";
import { prisma } from "@/lib/prisma";
import { getPurchases } from "@/actions/purchase-actions";
import { getItemTypes } from "@/actions/item-type-actions";
import { getUnits } from "@/actions/unit-actions";
import { getSuppliers } from "@/actions/supplier-actions";

export default async function AdminPurchasesPage() {
	const [itemTypes, units, suppliers] = await Promise.all([
		getItemTypes(),
		getUnits(),
		getSuppliers(),
	]);

	return (
		<Stack spacing={3}>
			<Box>
				<Typography variant="h4" sx={{ fontWeight: 800 }}>
					Pembelian
				</Typography>
			</Box>

			<Box>
				<Paper sx={{ p: 2, borderRadius: 2 }}>
					<PurchaseForm itemTypes={itemTypes} units={units} suppliers={suppliers} />
				</Paper>
			</Box>
		</Stack>
	);
}
