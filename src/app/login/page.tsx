"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Container,
	TextField,
	Button,
	Stack,
	Typography,
	Paper,
	IconButton,
	InputAdornment,
} from "@mui/material";
import { authClient } from "@/lib/auth-client";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [err, setErr] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#d50e0c]/10 via-orange-200/20 to-white">
			<Container maxWidth="md" sx={{ py: 10 }}>
				<Paper
					sx={{
						p: 0,
						overflow: "hidden",
						borderRadius: 3,
						boxShadow:
							"0 10px 30px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.4)",
						border: "1px solid rgba(0,0,0,0.06)",
						backdropFilter: "blur(6px)",
					}}
				>
					<Stack direction={{ xs: "column", md: "row" }}>
						<Stack
							sx={{
								flex: 1,
								p: 5,
							}}
							spacing={2}
						>
							<Typography variant="h4" sx={{ fontWeight: 700 }}>
								Welcome Back
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Masuk untuk mengelola panel admin PT AMP.
							</Typography>

							<TextField
								label="Email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								type="email"
								error={!!err && !email}
								helperText={!email && err ? "Email wajib diisi" : undefined}
							/>
							<TextField
								label="Password"
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								error={!!err && !password}
								helperText={!password && err ? "Password wajib diisi" : undefined}
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<IconButton
												aria-label="toggle password visibility"
												onClick={() => setShowPassword((s) => !s)}
												edge="end"
											>
												{showPassword ? <VisibilityOff /> : <Visibility />}
											</IconButton>
										</InputAdornment>
									),
								}}
							/>

							{err && (
								<Typography color="error" variant="body2">
									{err}
								</Typography>
							)}

							<Button
								variant="contained"
								disabled={loading || !email || !password}
								onClick={async () => {
									setLoading(true);
									setErr(null);

									const { error } = await authClient.signIn.email({
										email,
										password,
									});
									setLoading(false);

									if (error)
										return setErr(error.message || "Terjadi kesalahan");
									router.push("/admin");
								}}
								sx={{
									bgcolor: "var(--brand)",
									"&:hover": { opacity: 0.9, bgcolor: "var(--brand)" },
								}}
							>
								{loading ? "Memproses..." : "Masuk"}
							</Button>

							<Stack direction="row" spacing={1} alignItems="center">
								<Typography variant="body2">Belum punya akun?</Typography>
								<Button href="/register" variant="text" size="small">
									Daftar
								</Button>
							</Stack>
						</Stack>
						<Stack
							sx={{
								flex: 1,
								p: 6,
								bgcolor: "rgba(213,14,12,0.08)",
								display: { xs: "none", md: "flex" },
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Stack spacing={2} alignItems="center">
								<Typography
									variant="h3"
									sx={{
										fontWeight: 800,
										background:
											"linear-gradient(90deg, #d50e0c, #ff8a00)",
										WebkitBackgroundClip: "text",
										WebkitTextFillColor: "transparent",
									}}
								>
									PT AMP
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									textAlign="center"
									maxWidth={360}
								>
									Panel aman untuk pengelolaan data operasional dan pembukuan.
								</Typography>
							</Stack>
						</Stack>
					</Stack>
				</Paper>
			</Container>
		</div>
	);
}
