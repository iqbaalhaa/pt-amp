import { Stack, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import GlassButton from "@/components/ui/GlassButton";
import GlassCard from "@/components/ui/GlassCard";
import ChangePasswordForm from "@/components/admin/settings/ChangePasswordForm";

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
					<GlassCard className="p-6">
						<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
							Profil Perusahaan
						</Typography>
						<Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
							Pengaturan informasi dasar perusahaan yang akan ditampilkan di website.
						</Typography>
						<div className="p-4 bg-zinc-50 rounded-lg border border-dashed border-zinc-300 text-center text-zinc-500 text-sm">
							Fitur ini sedang dalam pengembangan
						</div>
					</GlassCard>
				</Grid>
				<Grid size={{ xs: 12, md: 6 }}>
					<GlassCard className="p-6 bg-red-glass/10">
						<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
							Keamanan Akun
						</Typography>
						<Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
							Ganti password akun Anda secara berkala untuk menjaga keamanan.
						</Typography>
						<ChangePasswordForm />
					</GlassCard>
				</Grid>
			</Grid>
		</Stack>
	);
}
