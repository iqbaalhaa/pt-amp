"use client";

import { useEffect, useState } from "react";
import GlassCard from "@/components/ui/GlassCard";

type DashboardData = {
	kpi: {
		totalPurchasing: number;
		totalScraping: number;
		totalCutting: number;
		totalDrying: number;
		totalRevenue: number;
	};
	charts: {
		labels: string[];
		purchasing: number[];
		scraping: number[];
		cutting: number[];
		drying: number[];
		sales: number[];
	};
	recentProductions: {
		id: string;
		type: string;
		date: string;
		input: string;
		output: string;
		status: "success" | "warning" | "danger" | "info" | "neutral";
	}[];
};

type CurrentUser = {
	name?: string | null;
	email?: string | null;
};

type Props = {
	data: DashboardData;
	currentUser?: CurrentUser;
};

export default function DashboardView({ data, currentUser }: Props) {
	void data;

	const [now, setNow] = useState<Date | null>(() => null);

	useEffect(() => {
		const interval = setInterval(() => {
			setNow(new Date());
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	const displayName =
		currentUser && currentUser.name && currentUser.name.trim().length > 0
			? currentUser.name
			: currentUser && currentUser.email
				? currentUser.email
				: "Pengguna";

	const formattedDate =
		now &&
		now.toLocaleDateString("id-ID", {
			weekday: "long",
			day: "numeric",
			month: "long",
			year: "numeric",
		});

	const formattedTime =
		now &&
		now.toLocaleTimeString("id-ID", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});

	return (
		<div className="min-h-[calc(100vh-5rem)] px-4">
			<GlassCard className="relative w-full overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 px-6 py-8 md:px-10 md:py-12 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[var(--brand)]/18 blur-3xl" />
					<div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-emerald-400/12 blur-3xl" />
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_55%)]" />
				</div>
				<div className="relative flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
					<div className="space-y-6 max-w-2xl">
						<span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium tracking-[0.25em] uppercase text-zinc-200">
							<span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.35)]" />
							Panel Admin PT AMP
						</span>
						<h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
							Selamat datang di ruang kendali
							<span className="block text-[var(--brand)]">ERP PT AMP</span>
						</h1>
						<div className="inline-flex flex-wrap items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs md:text-sm text-zinc-100">
							<span className="font-medium text-zinc-300">Masuk sebagai</span>
							<span className="rounded-full bg-black/30 px-3 py-1 text-xs font-semibold tracking-wide text-white">
								{displayName}
							</span>
						</div>
					</div>
					<div className="flex flex-col items-end gap-2 text-right text-zinc-100 md:min-w-[220px]">
						<div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
							Hari ini
						</div>
						<div className="text-sm md:text-base font-medium text-zinc-200">
							{formattedDate}
						</div>
						<div className="text-3xl md:text-4xl font-semibold tabular-nums text-white">
							{formattedTime}
						</div>
					</div>
				</div>
			</GlassCard>
		</div>
	);
}
