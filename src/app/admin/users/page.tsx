import { Paper, Stack, Typography, Grid, Button, Box } from "@mui/material";

export default function UsersPage() {
	return (
		<Stack spacing={3}>
			<Box>
				<Typography variant="h4" sx={{ fontWeight: 800 }}>
					Users
				</Typography>
				<Typography variant="body2" sx={{ color: "text.secondary" }}>
					Manajemen akun dan peran staff
				</Typography>
			</Box>

			<Grid container spacing={2}>
				<Grid item xs={12} md={8}>
					<Paper sx={{ p: 2, borderRadius: 2 }}>
						<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
							Daftar Staff
						</Typography>
						<Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
							Placeholder: tabel staff akan ditampilkan di sini.
						</Typography>
						<Button variant="outlined" sx={{ borderColor: "var(--brand)", color: "var(--brand)" }}>
							Export
						</Button>
					</Paper>
				</Grid>
				<Grid item xs={12} md={4}>
					<Paper
						sx={{
							p: 2,
							borderRadius: 2,
							border: "1px solid rgba(213,14,12,0.2)",
							background:
								"linear-gradient(180deg, rgba(213,14,12,0.06), rgba(255,138,0,0.04))",
						}}
					>
						<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
							Tambah Staff
						</Typography>
						<Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
							Placeholder: form pembuatan staff singkat.
						</Typography>
						<Button variant="contained" sx={{ backgroundColor: "var(--brand)" }}>
							Buat Akun
						</Button>
					</Paper>
				</Grid>
			</Grid>
		</Stack>
	);
}
