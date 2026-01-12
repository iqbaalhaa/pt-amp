import { Paper, Stack, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import SaleForm from "@/components/admin/sales/SaleForm";
import SaleHistory from "@/components/admin/sales/SaleHistory";
import { prisma } from "@/lib/prisma";
import { getSales } from "@/actions/sale-actions";

export default async function AdminSalesPage() {
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

  const sales = await getSales();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Sales
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Form penjualan barang
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <SaleForm products={productOptions} />
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12 }}>
          <SaleHistory sales={sales} />
        </Grid>
      </Grid>
    </Stack>
  );
}
