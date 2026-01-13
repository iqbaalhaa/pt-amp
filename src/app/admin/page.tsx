"use client";

import KPIStatCard from "@/components/ui/KPIStatCard";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import GlassButton from "@/components/ui/GlassButton";
import GlassTable, { Column } from "@/components/ui/GlassTable";

type Row = {
	id: string;
	type: string;
	date: string;
	input: string;
	output: string;
	status: "success" | "warning" | "danger" | "info" | "neutral";
};

export default function AdminDashboard() {
	const rows: Row[] = [
		{
			id: "A12",
			type: "Batch",
			date: "2026-01-11",
			input: "120 kg raw",
			output: "86 kg finished",
			status: "success",
		},
		{
			id: "B03",
			type: "Batch",
			date: "2026-01-12",
			input: "90 kg raw",
			output: "64 kg finished",
			status: "info",
		},
		{
			id: "C21",
			type: "Batch",
			date: "2026-01-12",
			input: "70 kg raw",
			output: "52 kg finished",
			status: "warning",
		},
	];

	const columns: Column<Row>[] = [
		{ header: "ID", accessorKey: "id", className: "text-primary" },
		{ header: "Type", accessorKey: "type", className: "text-primary" },
		{ header: "Date", accessorKey: "date", className: "text-secondary" },
		{ header: "Input", accessorKey: "input", className: "text-primary" },
		{ header: "Output", accessorKey: "output", className: "text-primary" },
		{
			header: "Status",
			cell: (row) => (
				<StatusBadge status={row.status}>{row.status}</StatusBadge>
			),
		},
	];

	return (
		<>
			<GlassCard className="p-4 md:p-6 bg-red-glass">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-full bg-[var(--brand)] text-white flex items-center justify-center">
						◆
					</div>
					<div className="flex-1">
						<div className="text-xl md:text-2xl font-semibold">Dashboard</div>
						<div className="text-secondary text-sm">
							Ringkasan cepat operasional ERP + CMS
						</div>
					</div>
					<StatusBadge status="info">Live</StatusBadge>
				</div>
			</GlassCard>
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<KPIStatCard title="Total Users" value={24} delta="+3%" status="info" />
				<KPIStatCard
					title="Published Posts"
					value={68}
					delta="+8%"
					status="success"
				/>
				<KPIStatCard
					title="Completed Tasks"
					value={112}
					delta="+2%"
					status="success"
				/>
				<KPIStatCard
					title="Open Inquiries"
					value={7}
					delta="-1%"
					status="warning"
				/>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<GlassCard className="p-4 md:p-6 md:col-span-2">
					<div className="flex items-center justify-between mb-4">
						<div className="text-lg font-semibold">Production Overview</div>
						<div className="flex gap-2">
							<StatusBadge status="neutral">Last 30 days</StatusBadge>
							<StatusBadge status="success">+12%</StatusBadge>
							<StatusBadge status="neutral">Stable</StatusBadge>
						</div>
					</div>
					<div className="h-40 glass rounded-xl"></div>
				</GlassCard>
				<GlassCard className="p-4 md:p-6">
					<div className="text-lg font-semibold mb-3">Recent Activity</div>
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<div className="text-primary">
								Production batch #A12 completed
							</div>
							<div className="text-secondary text-sm">2h</div>
						</div>
						<div className="flex items-center justify-between">
							<div className="text-primary">New inquiry from client</div>
							<div className="text-secondary text-sm">6h</div>
						</div>
					</div>
					<GlassButton variant="ghost" className="mt-4">
						View details
					</GlassButton>
				</GlassCard>
			</div>
			<GlassCard className="p-4 md:p-6">
				<div className="flex items-center justify-between mb-4">
					<div className="text-lg font-semibold">Production Table</div>
					<GlassButton variant="primary">New production</GlassButton>
				</div>
				<GlassTable columns={columns} data={rows} showNumber />
			</GlassCard>
		</>
	);
}
