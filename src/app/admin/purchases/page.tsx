import { Paper, Stack, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
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

  const purchases = await getPurchases();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Purchases
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Form pembelian bahan sesuai schema
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <PurchaseForm products={productOptions} />
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12 }}>
          <PurchaseHistory purchases={purchases} />
        </Grid>
      </Grid>
    </Stack>
  );
}
