import { Paper, Stack, Typography, Grid, Button, Box } from "@mui/material";

export default function SettingsPage() {
	return (
		<Stack spacing={3}>
			<Box>
				<Typography variant="h4" sx={{ fontWeight: 800 }}>
					Settings
				</Typography>
				<Typography variant="body2" sx={{ color: "text.secondary" }}>
					Konfigurasi sistem dan preferensi
				</Typography>
			</Box>
			<Grid container spacing={2}>
				<Grid item xs={12} md={6}>
					<Paper sx={{ p: 2, borderRadius: 2 }}>
						<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
							Umum
						</Typography>
						<Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
							Placeholder: pengaturan nama perusahaan, logo, dll.
						</Typography>
						<Button variant="contained" sx={{ backgroundColor: "var(--brand)" }}>
							Simpan
						</Button>
					</Paper>
				</Grid>
				<Grid item xs={12} md={6}>
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
							Keamanan
						</Typography>
						<Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
							Placeholder: kebijakan password, 2FA, peran akses.
						</Typography>
						<Button variant="outlined" sx={{ borderColor: "var(--brand)", color: "var(--brand)" }}>
							Atur
						</Button>
					</Paper>
				</Grid>
			</Grid>
		</Stack>
	);
}
