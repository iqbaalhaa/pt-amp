"use client";

import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassTable, { Column } from "@/components/ui/GlassTable";
import StatusBadge from "@/components/ui/StatusBadge";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

type Row = {
	id: string;
	type: string;
	date: string;
	input: string;
	output: string;
	status: "success" | "warning" | "danger" | "info" | "neutral";
};

export default function ProductionTablePage() {
	const rows: Row[] = [
		{
			id: "P-101",
			type: "Batch",
			date: "2026-01-10",
			input: "110 kg",
			output: "82 kg",
			status: "success",
		},
		{
			id: "P-102",
			type: "Batch",
			date: "2026-01-11",
			input: "95 kg",
			output: "70 kg",
			status: "info",
		},
		{
			id: "P-103",
			type: "Batch",
			date: "2026-01-12",
			input: "120 kg",
			output: "84 kg",
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
			<GlassCard className="p-5 md:p-6">
				<div className="flex items-center justify-between mb-4">
					<div className="text-xl font-semibold">Production</div>
					<div className="flex gap-2">
						<GlassButton variant="ghost">Export</GlassButton>
						<GlassButton variant="primary">New</GlassButton>
					</div>
				</div>
				<GlassTable
					columns={columns}
					data={rows}
					showNumber
					actions={(row) => (
						<>
							<GlassButton variant="ghost" size="icon">
								<VisibilityIcon fontSize="small" />
							</GlassButton>
							<GlassButton variant="ghost" size="icon">
								<EditIcon fontSize="small" />
							</GlassButton>
							<GlassButton variant="danger" size="icon">
								<DeleteIcon fontSize="small" />
							</GlassButton>
						</>
					)}
				/>
			</GlassCard>
		</>
	);
}
