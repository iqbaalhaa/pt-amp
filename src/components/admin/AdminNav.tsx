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
	IconButton,
	Chip,
} from "@mui/material";
import { authClient } from "@/lib/auth-client";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ArticleIcon from "@mui/icons-material/Article";
import SettingsIcon from "@mui/icons-material/Settings";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import StorefrontIcon from "@mui/icons-material/Storefront";
import EmailIcon from "@mui/icons-material/Email";
import InfoIcon from "@mui/icons-material/Info";
import CollectionsIcon from "@mui/icons-material/Collections";
import RssFeedIcon from "@mui/icons-material/RssFeed";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import EngineeringIcon from "@mui/icons-material/Engineering";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import FactoryIcon from "@mui/icons-material/Factory";
import { useState } from "react";

const menuGroups = [
	{
		title: "ERP",
		items: [
			{
				label: "Dashboard",
				href: "/admin",
				icon: <DashboardIcon fontSize="small" />,
			},
			{
				label: "Pembelian",
				href: "/admin/purchases",
				icon: <ShoppingCartIcon fontSize="small" />,
			},
			{
				label: "Products",
				href: "/admin/products",
				icon: <Inventory2Icon fontSize="small" />,
			},
			{
				label: "Customers",
				href: "/admin/customers",
				icon: <StorefrontIcon fontSize="small" />,
			},
			{
				label: "Inquiries",
				href: "/admin/inquiries",
				icon: <EmailIcon fontSize="small" />,
			},
			{
				label: "Sales",
				href: "/admin/sales",
				icon: <PointOfSaleIcon fontSize="small" />,
			},
			{
				label: "Production",
				href: "/admin/production",
				icon: <FactoryIcon fontSize="small" />,
			},
			{
				label: "Workers",
				href: "/admin/workers",
				icon: <EngineeringIcon fontSize="small" />,
			},
		],
	},
	{
		title: "Compro",
		items: [
			{
				label: "Home",
				href: "/admin/cms/pages/home",
				icon: <ArticleIcon fontSize="small" />,
			},
			{
				label: "About Us",
				href: "/admin/compro/about",
				icon: <InfoIcon fontSize="small" />,
			},
			{
				label: "Gallery",
				href: "/admin/compro/gallery",
				icon: <CollectionsIcon fontSize="small" />,
			},
			{
				label: "Blog",
				href: "/admin/compro/blog",
				icon: <RssFeedIcon fontSize="small" />,
			},
			{
				label: "Contact & Social",
				href: "/admin/compro/contact",
				icon: <ContactMailIcon fontSize="small" />,
			},
		],
	},
	{
		title: "Lainnya / Setting",
		items: [
			{
				label: "Users",
				href: "/admin/users",
				icon: <PeopleIcon fontSize="small" />,
			},
			{
				label: "Settings",
				href: "/admin/settings",
				icon: <SettingsIcon fontSize="small" />,
			},
		],
	},
];

function isActive(pathname: string, href: string) {
	if (href === "/admin") return pathname === "/admin";
	return pathname === href || pathname.startsWith(href + "/");
}

export default function AdminNav({
	userEmail,
	role,
}: {
	userEmail: string;
	role: string;
}) {
	const pathname = usePathname();
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<>
			<CssBaseline />

			<AppBar
				position="fixed"
				sx={{
					zIndex: (t) => t.zIndex.drawer + 1,
					bgcolor: "background.paper",
					color: "text.primary",
					boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
				}}
			>
				<Toolbar sx={{ gap: 2 }}>
					<IconButton
						color="default"
						edge="start"
						onClick={() => setMobileOpen((v) => !v)}
						sx={{ mr: 1, display: { sm: "none" } }}
						aria-label="open navigation"
					>
						<MenuIcon />
					</IconButton>
					<Box sx={{ flexGrow: 1 }}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
							<Box
								sx={{
									width: 32,
									height: 32,
									bgcolor: "var(--brand)",
									borderRadius: 1,
								}}
							/>
							<Typography
								variant="h6"
								sx={{
									fontWeight: 800,
									letterSpacing: 0.4,
									color: "var(--brand)",
								}}
							>
								Admin Panel
							</Typography>
						</Box>
						<Typography variant="caption" sx={{ color: "text.secondary" }}>
							<i>Enterprise Resource Planning</i>
						</Typography>
					</Box>

					<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
						<Chip
							label={role}
							size="small"
							sx={{
								border: "1px solid var(--secondary)",
								color: "var(--secondary)",
								bgcolor: "transparent",
							}}
						/>
						<Button
							variant="outlined"
							onClick={async () => {
								await authClient.signOut();
								window.location.href = "/login";
							}}
							sx={{ borderColor: "var(--brand)", color: "var(--brand)" }}
						>
							Logout
						</Button>
					</Box>
				</Toolbar>
			</AppBar>

			<Drawer
				variant="temporary"
				open={mobileOpen}
				onClose={() => setMobileOpen(false)}
				sx={{
					display: { xs: "block", sm: "none" },
					[`& .MuiDrawer-paper`]: {
						width: 260,
						boxSizing: "border-box",
						backgroundColor: "background.paper",
						borderRight: "1px solid rgba(0,0,0,0.06)",
					},
				}}
			>
				<Toolbar />
				<Box sx={{ px: 1, pb: 4 }}>
					{menuGroups.map((group, index) => (
						<Box key={group.title} sx={{ mb: 2 }}>
							<Typography
								variant="caption"
								sx={{
									px: 2,
									py: 1,
									display: "block",
									fontWeight: "bold",
									color: "text.secondary",
									textTransform: "uppercase",
									fontSize: "0.7rem",
								}}
							>
								{group.title}
							</Typography>
							<List dense>
								{group.items.map((item) => (
									<ListItemButton
										key={item.href}
										component={Link}
										href={item.href}
										selected={isActive(pathname, item.href)}
										onClick={() => setMobileOpen(false)}
										sx={{
											mx: 1,
											mb: 0.5,
											borderRadius: 1.5,
											borderLeft: isActive(pathname, item.href)
												? `3px solid var(--secondary)`
												: "3px solid transparent",
											"&.Mui-selected": {
												backgroundColor: "rgba(213,14,12,0.08)",
											},
											"&.Mui-selected:hover": {
												backgroundColor: "rgba(213,14,12,0.12)",
											},
										}}
									>
										<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
											{item.icon}
											<ListItemText primary={item.label} />
										</Box>
									</ListItemButton>
								))}
							</List>
							{index < menuGroups.length - 1 && (
								<Divider sx={{ my: 1, mx: 2 }} />
							)}
						</Box>
					))}
					<Box sx={{ px: 2, pb: 2, mt: 4 }}>
						<Typography
							variant="caption"
							sx={{ opacity: 0.7, color: "text.secondary" }}
						>
							ERP Pt. AMP
						</Typography>
					</Box>
				</Box>
			</Drawer>

			<Drawer
				variant="permanent"
				sx={{
					display: { xs: "none", sm: "block" },
					width: 260,
					flexShrink: 0,
					[`& .MuiDrawer-paper`]: {
						width: 260,
						boxSizing: "border-box",
						backgroundColor: "background.paper",
						borderRight: "1px solid rgba(0,0,0,0.06)",
					},
				}}
			>
				<Toolbar />
				<Box sx={{ px: 1, pb: 4 }}>
					{menuGroups.map((group, index) => (
						<Box key={group.title} sx={{ mb: 2 }}>
							<Typography
								variant="caption"
								sx={{
									px: 2,
									py: 1,
									display: "block",
									fontWeight: "bold",
									color: "text.secondary",
									textTransform: "uppercase",
									fontSize: "0.7rem",
								}}
							>
								{group.title}
							</Typography>
							<List dense>
								{group.items.map((item) => (
									<ListItemButton
										key={item.href}
										component={Link}
										href={item.href}
										selected={isActive(pathname, item.href)}
										sx={{
											mx: 1,
											mb: 0.5,
											borderRadius: 1.5,
											borderLeft: isActive(pathname, item.href)
												? `3px solid var(--secondary)`
												: "3px solid transparent",
											"&.Mui-selected": {
												backgroundColor: "rgba(213,14,12,0.08)",
											},
											"&.Mui-selected:hover": {
												backgroundColor: "rgba(213,14,12,0.12)",
											},
										}}
									>
										<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
											{item.icon}
											<ListItemText primary={item.label} />
										</Box>
									</ListItemButton>
								))}
							</List>
							{index < menuGroups.length - 1 && (
								<Divider sx={{ my: 1, mx: 2 }} />
							)}
						</Box>
					))}

					<Box sx={{ px: 2, pb: 2, mt: 4 }}>
						<Typography
							variant="caption"
							sx={{ opacity: 0.6, color: "text.secondary" }}
						>
							ERP Pt. AMP
						</Typography>
					</Box>
				</Box>
			</Drawer>
		</>
	);
}
