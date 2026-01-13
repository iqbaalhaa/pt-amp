"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function GlassNavbar({
	sidebarCollapsed,
}: {
	sidebarCollapsed: boolean;
}) {
	const [query, setQuery] = useState("");
	const leftPx = sidebarCollapsed ? 92 : 284;
	const rightPx = 16;
	return (
		<motion.div
			initial={{ opacity: 0, y: -8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.18, ease: "easeOut" }}
			className="absolute top-0 z-30"
			style={{ left: leftPx, right: rightPx }}
		>
			<div className="glass rounded-2xl mt-2 md:mt-3 px-3 md:px-4 py-2 shadow-soft">
				<div className="flex items-center gap-3">
					<div className="hidden md:flex items-center gap-2 flex-1">
						<SearchIcon fontSize="small" className="text-secondary" />
						<input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search"
							className="w-full bg-transparent outline-none text-sm text-primary placeholder:text-secondary"
							aria-label="Search"
						/>
					</div>
					<button
						aria-label="Notifications"
						className="w-9 h-9 rounded-xl glass flex items-center justify-center"
					>
						<NotificationsIcon fontSize="small" className="text-secondary" />
					</button>
					<div className="w-9 h-9 rounded-xl bg-red-glass flex items-center justify-center text-[var(--brand)]">
						<AccountCircleIcon fontSize="small" />
					</div>
				</div>
			</div>
		</motion.div>
	);
}
