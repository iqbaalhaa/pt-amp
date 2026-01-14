"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function GlassNavbar({
	sidebarCollapsed,
	isMobile,
	onMenuClick,
}: {
	sidebarCollapsed: boolean;
	isMobile: boolean;
	onMenuClick?: () => void;
}) {
	const [query, setQuery] = useState("");
	// On mobile, left is 0. On desktop, it respects sidebar width.
	const leftPx = isMobile ? 0 : (sidebarCollapsed ? 92 : 284);
	const rightPx = isMobile ? 0 : 16;
	
	return (
		<motion.div
			initial={{ opacity: 0, y: -8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.18, ease: "easeOut" }}
			className="absolute top-0 z-30"
			style={{ left: leftPx, right: rightPx }}
		>
			<div className={`glass rounded-2xl mt-2 md:mt-3 px-3 md:px-4 py-2 shadow-soft ${isMobile ? "mx-2" : ""}`}>
				<div className="flex items-center gap-3">
					{isMobile && (
						<button 
							onClick={onMenuClick}
							className="p-2 -ml-2 text-secondary hover:text-primary"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
						</button>
					)}
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
					<div className="flex-1 md:hidden" /> {/* Spacer for mobile */}
					
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
