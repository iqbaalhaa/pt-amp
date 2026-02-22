import { Stack, Typography, Box, Chip } from "@mui/material";
import Grid from "@mui/material/Grid";
import GlassCard from "@/components/ui/GlassCard";
import ChangePasswordForm from "@/components/admin/settings/ChangePasswordForm";
import AccountProfileForm from "@/components/admin/settings/AccountProfileForm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Shield, UserCircle2 } from "lucide-react";

export default async function SettingsPage() {
	const session = await auth.api.getSession({ headers: await headers() });

	return (
		<div className="relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-gradient-to-br from-white/90 via-white to-red-50/60 shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
			<div className="pointer-events-none absolute -top-24 -right-10 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(213,14,12,0.18),transparent_70%)]" />
			<div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.06),transparent_70%)]" />

			<div className="relative p-6 md:p-8">
				<Stack spacing={3}>
					<Box className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<Box className="flex items-center gap-3">
							<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand)] to-red-700 text-white shadow-lg shadow-[var(--brand)]/40">
								<Shield className="h-5 w-5" />
							</div>
							<Box>
								<Typography variant="overline" sx={{ letterSpacing: 1.2 }}>
									Control Center
								</Typography>
								<Typography
									variant="h4"
									sx={{ fontWeight: 800, lineHeight: 1.1 }}
								>
									Settings Akun
								</Typography>
							</Box>
						</Box>

						<Box className="flex flex-wrap items-center gap-2">
							<Chip
								label={session?.user.email ?? "Tidak ada email"}
								size="small"
								variant="outlined"
								sx={{
									borderRadius: 999,
									borderColor: "rgba(15,23,42,0.12)",
									fontWeight: 500,
									backgroundColor: "rgba(255,255,255,0.8)",
								}}
							/>
							<Chip
								label={session?.user.role ?? "USER"}
								size="small"
								color="primary"
								sx={{
									borderRadius: 999,
									textTransform: "uppercase",
									fontWeight: 700,
									bgcolor: "rgba(213,14,12,0.12)",
									color: "var(--brand)",
								}}
							/>
						</Box>
					</Box>

					<Grid container spacing={3}>
						<Grid size={{ xs: 12, md: 6 }}>
							<GlassCard className="relative h-full overflow-hidden border border-white/70 bg-white/90 p-6 backdrop-blur-xl">
								<div className="pointer-events-none absolute -top-10 -right-6 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,rgba(213,14,12,0.18),transparent_70%)]" />
								<Box className="relative flex items-start gap-3">
									<div className="mt-1 flex h-9 w-9 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-md shadow-black/25">
										<UserCircle2 className="h-4 w-4" />
									</div>
									<Box>
										<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
											Profil Akun
										</Typography>
										<Typography
											variant="body2"
											sx={{ color: "text.secondary", mb: 3, mt: 0.5 }}
										>
											Perbarui nama dan email yang digunakan untuk akses ke
											dashboard.
										</Typography>
									</Box>
								</Box>

								<div className="relative mt-1">
									<AccountProfileForm
										initialName={session?.user.name ?? ""}
										initialEmail={session?.user.email ?? ""}
									/>
								</div>
							</GlassCard>
						</Grid>

						<Grid size={{ xs: 12, md: 6 }}>
							<GlassCard className="h-full border border-red-100 bg-gradient-to-br from-red-50/80 via-white/90 to-red-100/70 p-6 backdrop-blur-xl">
								<Box className="flex items-start gap-3">
									<div className="mt-1 flex h-9 w-9 items-center justify-center rounded-2xl bg-red-600 text-white shadow-md shadow-red-500/40">
										<Shield className="h-4 w-4" />
									</div>
									<Box>
										<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
											Keamanan Akun
										</Typography>
										<Typography
											variant="body2"
											sx={{ color: "text.secondary", mb: 3, mt: 0.5 }}
										>
											Rutin mengganti password membantu menjaga keamanan data
											dan akses sistem.
										</Typography>
									</Box>
								</Box>

								<div className="mt-1">
									<ChangePasswordForm />
								</div>
							</GlassCard>
						</Grid>
					</Grid>
				</Stack>
			</div>
		</div>
	);
}
