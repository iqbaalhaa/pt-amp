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
} from "@mui/material";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [err, setErr] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	return (
		<Container maxWidth="sm" sx={{ py: 10 }}>
			<Paper sx={{ p: 4 }}>
				<Stack spacing={2}>
					<Typography variant="h4">Admin Login</Typography>

					<TextField
						label="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<TextField
						label="Password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>

					{err && <Typography color="error">{err}</Typography>}

					<Button
						variant="contained"
						disabled={loading}
						onClick={async () => {
							setLoading(true);
							setErr(null);

							const { error } = await authClient.signIn.email({
								email,
								password,
							});
							setLoading(false);

							if (error) return setErr(error.message);
							router.push("/admin");
						}}
					>
						{loading ? "Signing in..." : "Sign in"}
					</Button>
				</Stack>
			</Paper>
		</Container>
	);
}
