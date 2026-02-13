"use client";

import React, { useEffect, useState } from "react";
import GlassSidebar from "./glass/GlassSidebar";
import GlassNavbar from "./glass/GlassNavbar";
import { usePathname, useRouter } from "next/navigation";

export default function GlassAdminShell({
	children,
	allowedPaths,
}: {
	children: React.ReactNode;
	allowedPaths?: string[];
}) {
	const [collapsed, setCollapsed] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const pathname = usePathname();
	const router = useRouter();

	useEffect(() => {
		const checkMobile = () => {
			const mobile = window.innerWidth < 768;
			setIsMobile(mobile);
			if (mobile) {
				setCollapsed(true);
			} else {
				setCollapsed(false);
			}
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// Client-side guard: if allowedPaths is provided (non-admin),
	// redirect to /forbidden when current path is not allowed
	useEffect(() => {
		if (!allowedPaths) return;
		const isAllowed = allowedPaths.some(
			(p) => pathname === p || pathname.startsWith(p + "/")
		);
		if (!isAllowed) {
			router.replace("/forbidden");
		}
	}, [allowedPaths, pathname, router]);

	const sidebarWidth = collapsed ? (isMobile ? 0 : 92) : 284;

	return (
		<div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
			<GlassNavbar sidebarCollapsed={collapsed} isMobile={isMobile} onMenuClick={() => setCollapsed(!collapsed)} />
			<GlassSidebar
				collapsed={collapsed}
				isMobile={isMobile}
				onToggle={() => setCollapsed((v) => !v)}
				allowedPaths={allowedPaths}
			/>
			<main
				className="pt-20 md:pt-24 pr-2 md:pr-4 transition-all duration-200"
				style={{ paddingLeft: isMobile ? 16 : sidebarWidth }}
			>
				<div className="mx-auto max-w-[1400px]">
					<div className="grid gap-4 md:gap-6">{children}</div>
				</div>
			</main>
		</div>
	);
}
