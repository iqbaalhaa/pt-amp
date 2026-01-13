"use client";

import React, { useState } from "react";
import GlassSidebar from "./glass/GlassSidebar";
import GlassNavbar from "./glass/GlassNavbar";

export default function GlassAdminShell({
	children,
}: {
	children: React.ReactNode;
}) {
	const [collapsed, setCollapsed] = useState(false);

	return (
		<div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
			<GlassNavbar sidebarCollapsed={collapsed} />
			<GlassSidebar
				collapsed={collapsed}
				onToggle={() => setCollapsed((v) => !v)}
			/>
			<main
				className="pt-20 md:pt-24 pr-2 md:pr-4"
				style={{ paddingLeft: collapsed ? 92 : 284 }}
			>
				<div className="mx-auto max-w-[1400px]">
					<div className="grid gap-4 md:gap-6">{children}</div>
				</div>
			</main>
		</div>
	);
}
