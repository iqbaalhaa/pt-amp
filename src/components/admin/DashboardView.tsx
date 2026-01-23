"use client";

import KPIStatCard from "@/components/ui/KPIStatCard";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import GlassButton from "@/components/ui/GlassButton";
import GlassTable, { Column } from "@/components/ui/GlassTable";
import DashboardChart from "@/components/ui/DashboardChart";
import { formatRupiah } from "@/lib/currency";

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

type Props = {
	data: DashboardData;
};

export default function DashboardView({ data }: Props) {
	const { kpi, charts, recentProductions } = data;

	const columns: Column<(typeof recentProductions)[0]>[] = [
		{
			header: "ID",
			accessorKey: "id",
			className: "font-semibold",
		},
		{ header: "Tipe", accessorKey: "type" },
		{ header: "Tanggal", accessorKey: "date", className: "text-gray-500" },
		{ header: "Input", accessorKey: "input" },
		{ header: "Output", accessorKey: "output" },
		{
			header: "Status",
			cell: (row) => (
				<StatusBadge status={row.status}>
					{row.status.toUpperCase()}
				</StatusBadge>
			),
		},
	];

	return (
		<>
			<GlassCard className="p-6 md:p-8 shadow-lg rounded-xl">
				<div className="flex items-center gap-4">
					<div className="w-12 h-12 rounded-full bg-[#D33E3E] text-white flex items-center justify-center">
						◆
					</div>
					<div className="flex-1">
						<div className="text-3xl font-bold text-gray-900">Dashboard</div>
						<div className="text-gray-600 text-sm">
							Ringkasan cepat operasional ERP + CMS
						</div>
					</div>
					<StatusBadge status="info">Live</StatusBadge>
				</div>
			</GlassCard>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mt-8">
				<KPIStatCard
					title="Total Pembelian"
					value={`${kpi.totalPurchasing.toLocaleString("id-ID")} Unit`}
					delta="Bulan Ini"
					status="info"
				/>
				<KPIStatCard
					title="Total Pengikisan"
					value={`${kpi.totalScraping.toLocaleString("id-ID")} kg`}
					delta="Bulan Ini"
					status="warning"
				/>
				<KPIStatCard
					title="Total Pemotongan"
					value={`${kpi.totalCutting.toLocaleString("id-ID")} kg`}
					delta="Bulan Ini"
					status="danger"
				/>
				<KPIStatCard
					title="Biaya Penjemuran"
					value={formatRupiah(kpi.totalDrying)}
					delta="Bulan Ini"
					status="neutral"
				/>
				<KPIStatCard
					title="Total Penjualan"
					value={formatRupiah(kpi.totalRevenue)}
					delta="Bulan Ini"
					status="success"
				/>
			</div>

			<div className="mt-8 mb-4">
				<h2 className="text-xl font-bold text-gray-900 mb-2">
					Grafik Operasional
				</h2>
				<p className="text-gray-600 text-sm">
					Monitoring aktivitas per divisi dalam 7 hari terakhir
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Pembelian */}
				<GlassCard className="p-6 shadow-lg rounded-xl">
					<DashboardChart
						title="Pembelian Bahan Baku (Kg)"
						labels={charts.labels}
						data={charts.purchasing}
						color="#3b82f6" // Blue
						type="bar"
					/>
				</GlassCard>

				{/* Pengikisan */}
				<GlassCard className="p-6 shadow-lg rounded-xl">
					<DashboardChart
						title="Pengikisan (Kg Output)"
						labels={charts.labels}
						data={charts.scraping}
						color="#f59e0b" // Amber
						type="area"
					/>
				</GlassCard>

				{/* Pemotongan */}
				<GlassCard className="p-6 shadow-lg rounded-xl">
					<DashboardChart
						title="Pemotongan (Kg Output)"
						labels={charts.labels}
						data={charts.cutting}
						color="#ef4444" // Red
						type="line"
					/>
				</GlassCard>

				{/* Penjemuran */}
				<GlassCard className="p-6 shadow-lg rounded-xl">
					<DashboardChart
						title="Biaya Penjemuran (Rp)"
						labels={charts.labels}
						data={charts.drying}
						color="#eab308" // Yellow
						type="bar"
					/>
				</GlassCard>

				{/* Penjualan */}
				<GlassCard className="p-6 shadow-lg rounded-xl">
					<DashboardChart
						title="Penjualan (Rp Revenue)"
						labels={charts.labels}
						data={charts.sales}
						color="#22c55e" // Green
						type="line"
					/>
				</GlassCard>

				{/* Aktivitas Terbaru */}
				<GlassCard className="p-6 shadow-lg rounded-xl flex flex-col">
					<div className="text-lg font-semibold text-gray-900 mb-4">
						Aktivitas Terbaru
					</div>
					<div className="space-y-4 text-gray-900 flex-1">
						{recentProductions.length > 0 ? (
							recentProductions.slice(0, 3).map((prod) => (
								<div
									key={prod.id}
									className="flex items-center justify-between"
								>
									<div className="font-semibold text-sm">
										Batch #{prod.id}{" "}
										{prod.status === "success" ? "selesai" : "diproses"}
									</div>
									<div className="text-xs text-gray-500">{prod.date}</div>
								</div>
							))
						) : (
							<div className="text-sm text-gray-500 text-center py-4">
								Belum ada aktivitas produksi
							</div>
						)}
					</div>
					<GlassButton variant="primary" className="mt-4 w-full justify-center">
						Lihat Semua
					</GlassButton>
				</GlassCard>
			</div>

			<GlassCard className="p-6 md:p-8 mt-8 shadow-lg rounded-xl">
				<div className="flex items-center justify-between mb-4">
					<div className="text-2xl font-semibold text-gray-900">
						Produksi Terkini
					</div>
					<GlassButton variant="primary">Produksi Baru</GlassButton>
				</div>
				<GlassTable
					columns={columns}
					data={recentProductions}
					showNumber
					className="bg-white/95"
				/>
			</GlassCard>
		</>
	);
}
