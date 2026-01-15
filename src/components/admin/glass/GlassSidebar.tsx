"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PeopleIcon from "@mui/icons-material/People";
import MailIcon from "@mui/icons-material/Mail";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import FactoryIcon from "@mui/icons-material/Factory";
import HandymanIcon from "@mui/icons-material/Handyman";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import CollectionsIcon from "@mui/icons-material/Collections";
import RssFeedIcon from "@mui/icons-material/RssFeed";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import SettingsIcon from "@mui/icons-material/Settings";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import InventoryIcon from "@mui/icons-material/Inventory";
import ContentCutIcon from "@mui/icons-material/ContentCut";

type Item = { label: string; href: string; icon: React.ReactNode };
type Group = { title: string; items: Item[] };

const groups: Group[] = [
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
				label: "Pengikisan",
				href: "/admin/pengikisan",
				icon: <PrecisionManufacturingIcon fontSize="small" />,
			},
			{
				label: "Penjemuran",
				href: "/admin/penjemuran",
				icon: <WbSunnyIcon fontSize="small" />,
			},
			{
				label: "Pengemasan",
				href: "/admin/pengemasan",
				icon: <InventoryIcon fontSize="small" />,
			},
			{
				label: "Pemotongan",
				href: "/admin/ledger",
				icon: <ContentCutIcon fontSize="small" />,
			},
			{
				label: "Pembukuan",
				href: "/admin/ledger",
				icon: <MenuBookIcon fontSize="small" />,
			},
			{
				label: "Products",
				href: "/admin/products",
				icon: <Inventory2Icon fontSize="small" />,
			},
			{
				label: "Customers",
				href: "/admin/customers",
				icon: <PeopleIcon fontSize="small" />,
			},
			{
				label: "Inquiries",
				href: "/admin/inquiries",
				icon: <MailIcon fontSize="small" />,
			},
			{
				label: "Sales",
				href: "/admin/sales",
				icon: <ReceiptLongIcon fontSize="small" />,
			},
			{
				label: "Production",
				href: "/admin/production",
				icon: <FactoryIcon fontSize="small" />,
			},
			{
				label: "Workers",
				href: "/admin/workers",
				icon: <HandymanIcon fontSize="small" />,
			},
		],
	},
	{
		title: "Compro",
		items: [
			{
				label: "Home",
				href: "/admin/cms/pages/home",
				icon: <HomeIcon fontSize="small" />,
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
		title: "Settings",
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

export default function GlassSidebar({
	collapsed,
	isMobile,
	onToggle,
}: {
	collapsed: boolean;
	isMobile: boolean;
	onToggle: () => void;
}) {
	const pathname = usePathname();
	const isActive = (href: string) => {
		if (href === "/admin") {
			return pathname === "/admin";
		}
		return pathname === href || pathname.startsWith(href + "/");
	};

	// Determine width/transform classes based on state
	const containerClasses = isMobile
		? `fixed left-0 top-0 h-screen z-40 transition-transform duration-300 ease-in-out ${
				collapsed ? "-translate-x-full" : "translate-x-0"
		  }`
		: "fixed left-0 top-0 h-screen z-40";

	const widthClass = isMobile
		? "w-[260px]"
		: collapsed
		? "w-[76px]"
		: "w-[260px]";

	return (
		<div className={containerClasses}>
			<div className="p-2 md:p-3 h-full">
				<div
					className={`glass rounded-2xl h-full shadow-soft flex flex-col transition-[width] duration-200 ease-out ${widthClass}`}
				>
					<div className="flex items-center gap-2 px-3 pt-3">
						<div className="w-7 h-7 rounded-lg overflow-hidden bg-white flex items-center justify-center">
							<img
								src="/logoAMP.png"
								alt="Logo PT AMP"
								className="w-full h-full object-contain"
							/>
						</div>
						<AnimatePresence initial={false}>
							{(!collapsed || isMobile) && (
								<motion.div
									initial={{ opacity: 0, x: -6 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -6 }}
									transition={{ duration: 0.2, ease: "easeOut" }}
									className="text-sm font-semibold tracking-wide text-[var(--brand)]"
								>
									Aurora Mitra Perkasa
								</motion.div>
							)}
						</AnimatePresence>

						{!isMobile && (
							<button
								aria-label="Toggle sidebar"
								className="ml-auto w-8 h-8 rounded-full glass flex items-center justify-center text-secondary hover:text-[var(--brand)] transition-transform hover:scale-105"
								onClick={onToggle}
							>
								{collapsed ? (
									<ChevronRightIcon fontSize="small" />
								) : (
									<ChevronLeftIcon fontSize="small" />
								)}
							</button>
						)}
					</div>
					<div className="px-2 mt-2 overflow-y-auto no-scrollbar flex-1">
						{groups.map((g) => (
							<div key={g.title} className="mb-4">
								<AnimatePresence initial={false}>
									{(!collapsed || isMobile) && (
										<motion.div
											initial={{ opacity: 0, x: -6 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: -6 }}
											transition={{ duration: 0.2, ease: "easeOut" }}
											className="px-3 py-2 text-[10px] uppercase tracking-wide text-secondary"
										>
											{g.title}
										</motion.div>
									)}
								</AnimatePresence>
								<div className="flex flex-col gap-1">
									{g.items.map((it) => {
										const isItemActive = isActive(it.href);
										return (
											<Link
												key={`${g.title}-${it.label}`}
												href={it.href}
												className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
													isItemActive
														? "bg-[rgba(213,14,12,0.12)] text-[var(--brand)]"
														: "hover:bg-[rgba(255,255,255,0.06)] text-primary"
												}`}
											>
												<div
													className={`w-6 h-6 flex items-center justify-center ${
														isItemActive ? "text-[var(--brand)]" : "text-black"
													}`}
												>
													{it.icon}
												</div>
												<AnimatePresence initial={false}>
													{(!collapsed || isMobile) && (
														<motion.span
															initial={{ opacity: 0, x: -6 }}
															animate={{ opacity: 1, x: 0 }}
															exit={{ opacity: 0, x: -6 }}
															transition={{ duration: 0.2, ease: "easeOut" }}
															className="text-sm font-semibold"
														>
															{it.label}
														</motion.span>
													)}
												</AnimatePresence>
												{isItemActive && (
													<span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--brand)] shadow-[0_0_12px_rgba(213,14,12,0.8)]" />
												)}
											</Link>
										);
									})}
								</div>
							</div>
						))}
					</div>
					<div className="mt-auto px-3 pb-3 text-[11px] text-secondary">
						ERP Pt. AMP
					</div>
				</div>
			</div>
		</div>
	);
}
