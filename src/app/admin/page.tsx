import { Paper, Stack, Typography, Button, Box } from "@mui/material";
import Grid from "@mui/material/Grid";

export default function AdminDashboard() {
	return (
		<Stack spacing={3}>
			<Box>
				<Typography variant="h4" sx={{ fontWeight: 800 }}>
					Dashboard
				</Typography>
				<Typography variant="body2" sx={{ color: "text.secondary" }}>
					Ringkasan cepat operasional ERP + CMS
				</Typography>
			</Box>

			<Grid container spacing={2}>
				<Grid size={{ xs: 12, md: 3 }}>
					<Paper
						sx={{
							p: 2,
							borderRadius: 2,
							border: "1px solid rgba(213,14,12,0.2)",
							background:
								"linear-gradient(180deg, rgba(213,14,12,0.06), rgba(255,138,0,0.04))",
						}}
					>
						<Typography variant="body2" sx={{ color: "text.secondary" }}>
							Total Users
						</Typography>
						<Typography variant="h4" sx={{ fontWeight: 800, color: "var(--brand)" }}>
							24
						</Typography>
					</Paper>
				</Grid>
				<Grid size={{ xs: 12, md: 3 }}>
					<Paper
						sx={{
							p: 2,
							borderRadius: 2,
							border: "1px solid rgba(213,14,12,0.2)",
							background:
								"linear-gradient(180deg, rgba(213,14,12,0.06), rgba(255,138,0,0.04))",
						}}
					>
						<Typography variant="body2" sx={{ color: "text.secondary" }}>
							Halaman CMS
						</Typography>
						<Typography variant="h4" sx={{ fontWeight: 800, color: "var(--brand)" }}>
							12
						</Typography>
					</Paper>
				</Grid>
				<Grid size={{ xs: 12, md: 3 }}>
					<Paper
						sx={{
							p: 2,
							borderRadius: 2,
							border: "1px solid rgba(213,14,12,0.2)",
							background:
								"linear-gradient(180deg, rgba(213,14,12,0.06), rgba(255,138,0,0.04))",
						}}
					>
						<Typography variant="body2" sx={{ color: "text.secondary" }}>
							Tugas Aktif
						</Typography>
						<Typography variant="h4" sx={{ fontWeight: 800, color: "var(--brand)" }}>
							5
						</Typography>
					</Paper>
				</Grid>
				<Grid size={{ xs: 12, md: 3 }}>
					<Paper
						sx={{
							p: 2,
							borderRadius: 2,
							border: "1px solid rgba(213,14,12,0.2)",
							background:
								"linear-gradient(180deg, rgba(213,14,12,0.06), rgba(255,138,0,0.04))",
						}}
					>
						<Typography variant="body2" sx={{ color: "text.secondary" }}>
							Notifikasi
						</Typography>
						<Typography variant="h4" sx={{ fontWeight: 800, color: "var(--brand)" }}>
							3
						</Typography>
					</Paper>
				</Grid>
			</Grid>

			<Paper sx={{ p: 2, borderRadius: 2 }}>
				<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
					Quick Actions
				</Typography>
				<Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
					<Button
						variant="contained"
						href="/admin/users"
						sx={{ backgroundColor: "var(--brand)" }}
					>
						Users
					</Button>
					<Button
						variant="contained"
						href="/admin/cms/pages"
						sx={{ backgroundColor: "var(--brand)" }}
					>
						CMS Pages
					</Button>
					<Button
						variant="outlined"
						href="/admin/settings"
						sx={{ borderColor: "var(--brand)", color: "var(--brand)" }}
					>
						Settings
					</Button>
				</Stack>
			</Paper>
		</Stack>
	);
}
