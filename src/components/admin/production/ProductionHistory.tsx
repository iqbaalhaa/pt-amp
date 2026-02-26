"use client";

import { useState, useRef } from "react";
import { Tooltip, Box, Typography } from "@mui/material";
import { Visibility, Print, Cancel as CancelIcon } from "@mui/icons-material";
import { useReactToPrint } from "react-to-print";
import { ProductionReport, ProductionReportData } from "./ProductionReport";
import { revokeProduction } from "@/actions/production-actions";
import GlassTable, { Column } from "@/components/ui/GlassTable";
import GlassButton from "@/components/ui/GlassButton";
import StatusBadge from "@/components/ui/StatusBadge";
import GlassDialog from "@/components/ui/GlassDialog";

type Production = {
	id: string;
	productionType: string;
	date: string;
	status: string;
	notes: string | null;
	inputs: {
		id: string;
		productName: string;
		qty: string;
		unitCost: string;
		unit: string;
	}[];
	outputs: {
		id: string;
		productName: string;
		qty: string;
		unitCost: string;
		unit: string;
	}[];
	workers: {
		id: string;
		workerName: string;
		role: string | null;
		hours: string | null;
	}[];
};

export default function ProductionHistory({
	productions,
}: {
	productions: Production[];
}) {
	const [selectedProduction, setSelectedProduction] =
		useState<Production | null>(null);
	const [open, setOpen] = useState(false);
	const reportRef = useRef<HTMLDivElement>(null);

	const handlePrint = useReactToPrint({
		contentRef: reportRef,
	});

	const handleView = (production: Production) => {
		setSelectedProduction(production);
		setOpen(true);
	};

	const handleRevoke = async (id: string) => {
		if (
			confirm(
				"Are you sure you want to revoke this production? This will set status to CANCELLED."
			)
		) {
			await revokeProduction(id);
		}
	};

	const getReportData = (production: Production): ProductionReportData => {
		return {
			id: production.id,
			date: production.date,
			productionType: production.productionType,
			status: production.status,
			notes: production.notes,
			inputs: production.inputs,
			outputs: production.outputs,
			workers: production.workers,
		};
	};

	const getStatusVariant = (
		status: string
	): "success" | "warning" | "danger" | "info" | "neutral" => {
		switch (status) {
			case "completed":
				return "success";
			case "cancelled":
				return "danger";
			default:
				return "neutral";
		}
	};

	const columns: Column<Production>[] = [
		{
			header: "Date",
			cell: (row) => (
				<span suppressHydrationWarning>
					{new Date(row.date).toLocaleDateString("id-ID")}
				</span>
			),
		},
		{
			header: "Type",
			accessorKey: "productionType",
		},
		{
			header: "Status",
			cell: (row) => (
				<StatusBadge status={getStatusVariant(row.status)}>
					{row.status}
				</StatusBadge>
			),
		},
		{
			header: "Inputs",
			cell: (row) => `${row.inputs.length} items`,
		},
		{
			header: "Outputs",
			cell: (row) => `${row.outputs.length} items`,
		},
	];

	return (
		<Box sx={{ mt: 4 }}>
			<Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
				Riwayat Produksi
			</Typography>

			<GlassTable
				columns={columns}
				data={productions}
				showNumber
				actions={(row) => (
					<>
						<Tooltip title="View Report">
							<GlassButton
								variant="primary"
								size="icon"
								onClick={() => handleView(row)}
							>
								<Visibility fontSize="small" />
							</GlassButton>
						</Tooltip>
						<Tooltip title="Revoke">
							<GlassButton
								variant="danger"
								size="icon"
								onClick={() => handleRevoke(row.id)}
								disabled={row.status === "cancelled"}
							>
								<CancelIcon fontSize="small" />
							</GlassButton>
						</Tooltip>
					</>
				)}
			/>

			{/* Report Dialog */}
			<GlassDialog
				open={open}
				onClose={() => setOpen(false)}
				maxWidth="md"
				fullWidth
				title="Production Report"
				actions={
					<>
						<GlassButton variant="ghost" onClick={() => setOpen(false)}>
							Close
						</GlassButton>
						<GlassButton variant="primary" onClick={() => handlePrint()}>
							<Print className="mr-2" fontSize="small" />
							Print
						</GlassButton>
					</>
				}
			>
				{selectedProduction && (
					<ProductionReport
						ref={reportRef}
						data={getReportData(selectedProduction)}
					/>
				)}
			</GlassDialog>
		</Box>
	);
}
