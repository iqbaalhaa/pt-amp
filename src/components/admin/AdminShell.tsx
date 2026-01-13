import { Box, CssBaseline, Toolbar } from "@mui/material";
import AdminNav from "./AdminNav";

export default function AdminShell({
	children,
	userEmail,
	role,
}: {
	children: React.ReactNode;
	userEmail: string;
	role: string;
}) {
	return (
		<Box
			sx={{
				display: "flex",
				minHeight: "100vh",
				bgcolor: "background.default",
			}}
		>
			<CssBaseline />

			<AdminNav userEmail={userEmail} role={role} />

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					p: { xs: 2, md: 3 },
					minHeight: "100vh",
					bgcolor: "background.default",
				}}
			>
				<Toolbar />
				{children}
			</Box>
		</Box>
	);
}
