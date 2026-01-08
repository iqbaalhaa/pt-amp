import { Paper, Stack, Typography } from "@mui/material";

export default function AdminDashboard() {
	return (
		<Stack spacing={2}>
			<Typography variant="h4">Dashboard</Typography>

			<Paper sx={{ p: 2 }}>
				<Typography variant="h6">Ringkasan</Typography>
				<Typography variant="body2" sx={{ opacity: 0.8 }}>
					Placeholder: statistik ERP/CMS akan muncul di sini.
				</Typography>
			</Paper>

			<Paper sx={{ p: 2 }}>
				<Typography variant="h6">Quick Links</Typography>
				<Typography variant="body2" sx={{ opacity: 0.8 }}>
					Users / CMS Pages / Settings
				</Typography>
			</Paper>
		</Stack>
	);
}
