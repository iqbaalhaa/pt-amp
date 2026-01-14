"use client";

import React, { useEffect, useState } from "react";
import GlassSidebar from "./glass/GlassSidebar";
import GlassNavbar from "./glass/GlassNavbar";

export default function GlassAdminShell({
	children,
}: {
	children: React.ReactNode;
}) {
	const [collapsed, setCollapsed] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

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

	const sidebarWidth = collapsed ? (isMobile ? 0 : 92) : 284;

	return (
		<div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
			<GlassNavbar sidebarCollapsed={collapsed} isMobile={isMobile} onMenuClick={() => setCollapsed(!collapsed)} />
			<GlassSidebar
				collapsed={collapsed}
				isMobile={isMobile}
				onToggle={() => setCollapsed((v) => !v)}
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
