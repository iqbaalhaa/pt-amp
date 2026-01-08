"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	AppBar,
	Toolbar,
	Typography,
	Box,
	Drawer,
	List,
	ListItemButton,
	ListItemText,
	Button,
	Divider,
	CssBaseline,
} from "@mui/material";
import { authClient } from "@/lib/auth-client";

const drawerWidth = 260;

const nav = [
	{ label: "Dashboard", href: "/admin" },
	{ label: "Users", href: "/admin/users" },
	{ label: "CMS Pages", href: "/admin/cms/pages" },
	{ label: "Settings", href: "/admin/settings" },
];

function isActive(pathname: string, href: string) {
	if (href === "/admin") return pathname === "/admin";
	return pathname === href || pathname.startsWith(href + "/");
}

export default function AdminShell({
	children,
	userEmail,
	role,
}: {
	children: React.ReactNode;
	userEmail: string;
	role: string;
}) {
	const pathname = usePathname();

	return (
		<Box sx={{ display: "flex" }}>
			<CssBaseline />

			<AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
				<Toolbar sx={{ gap: 2 }}>
					<Typography variant="h6" sx={{ flexGrow: 1 }}>
						PT AMP — Admin Panel
					</Typography>

					<Typography variant="body2" sx={{ opacity: 0.9 }}>
						{role} • {userEmail}
					</Typography>

					<Button
						color="inherit"
						onClick={async () => {
							await authClient.signOut();
							window.location.href = "/login";
						}}
					>
						Logout
					</Button>
				</Toolbar>
			</AppBar>

			<Drawer
				variant="permanent"
				sx={{
					width: drawerWidth,
					flexShrink: 0,
					[`& .MuiDrawer-paper`]: {
						width: drawerWidth,
						boxSizing: "border-box",
					},
				}}
			>
				<Toolbar />
				<Box sx={{ px: 1 }}>
					<Typography variant="subtitle2" sx={{ px: 2, py: 1, opacity: 0.7 }}>
						Navigation
					</Typography>

					<List>
						{nav.map((item) => (
							<ListItemButton
								key={item.href}
								component={Link}
								href={item.href}
								selected={isActive(pathname, item.href)}
							>
								<ListItemText primary={item.label} />
							</ListItemButton>
						))}
					</List>

					<Divider sx={{ my: 1 }} />

					<Box sx={{ px: 2, pb: 2 }}>
						<Typography variant="caption" sx={{ opacity: 0.6 }}>
							v0.1 • ERP + CMS (1 panel)
						</Typography>
					</Box>
				</Box>
			</Drawer>

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					p: 3,
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
