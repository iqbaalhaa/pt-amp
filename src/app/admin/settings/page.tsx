import { Stack, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import GlassButton from "@/components/ui/GlassButton";
import GlassCard from "@/components/ui/GlassCard";

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
				<Grid size={{ xs: 12, md: 6 }}>
					<GlassCard className="p-4">
						<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
							Umum
						</Typography>
						<Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
							Placeholder: pengaturan nama perusahaan, logo, dll.
						</Typography>
						<GlassButton variant="primary">
							Simpan
						</GlassButton>
					</GlassCard>
				</Grid>
				<Grid size={{ xs: 12, md: 6 }}>
					<GlassCard className="p-4 bg-red-glass">
						<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
							Keamanan
						</Typography>
						<Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
							Placeholder: kebijakan password, 2FA, peran akses.
						</Typography>
						<GlassButton variant="ghost">
							Atur
						</GlassButton>
					</GlassCard>
				</Grid>
			</Grid>
		</Stack>
	);
}
