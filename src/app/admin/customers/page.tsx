import { Paper, Stack, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";

export default async function CustomersPage() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Customers
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Modul Customer sudah dihapus dari schema
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Halaman ini dinonaktifkan karena model Customer sudah dihapus.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
