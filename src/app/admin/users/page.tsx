import { Stack, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import GlassButton from "@/components/ui/GlassButton";
import GlassCard from "@/components/ui/GlassCard";

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
				<Grid size={{ xs: 12, md: 8 }}>
					<GlassCard className="p-4">
						<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
							Daftar Staff
						</Typography>
						<Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
							Placeholder: tabel staff akan ditampilkan di sini.
						</Typography>
						<GlassButton variant="ghost">
							Export
						</GlassButton>
					</GlassCard>
				</Grid>
				<Grid size={{ xs: 12, md: 4 }}>
					<GlassCard className="p-4 bg-red-glass">
						<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
							Tambah Staff
						</Typography>
						<Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
							Placeholder: form pembuatan staff singkat.
						</Typography>
						<GlassButton variant="primary">
							Buat Akun
						</GlassButton>
					</GlassCard>
				</Grid>
			</Grid>
		</Stack>
	);
}
