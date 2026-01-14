"use client";

import { useState, useRef } from "react";
import { Tooltip, Box } from "@mui/material";
import { Visibility, Print, Cancel as CancelIcon } from "@mui/icons-material";
import { useReactToPrint } from "react-to-print";
import { Invoice, InvoiceData } from "@/components/Invoice";
import { revokeSale } from "@/actions/sale-actions";
import GlassTable, { Column } from "@/components/ui/GlassTable";
import GlassButton from "@/components/ui/GlassButton";
import StatusBadge from "@/components/ui/StatusBadge";
import GlassDialog from "@/components/ui/GlassDialog";

type Sale = {
	id: string;
	customer: string | null;
	date: string;
	status: string;
	notes: string | null;
	items: {
		id: string;
		productName: string;
		qty: string;
		unitPrice: string;
		unit: string;
	}[];
};

export default function SaleHistory({ sales }: { sales: Sale[] }) {
	const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
	const [open, setOpen] = useState(false);
	const invoiceRef = useRef<HTMLDivElement>(null);

	const handlePrint = useReactToPrint({
		contentRef: invoiceRef,
	});

	const handleView = (sale: Sale) => {
		setSelectedSale(sale);
		setOpen(true);
	};

	const handleRevoke = async (id: string) => {
		if (
			confirm(
				"Are you sure you want to revoke this invoice? This will set status to CANCELLED."
			)
		) {
			await revokeSale(id);
		}
	};

	const getInvoiceData = (sale: Sale): InvoiceData => {
		const items = sale.items.map((item) => ({
			productName: item.productName,
			qty: item.qty,
			unit: item.unit,
			price: item.unitPrice,
			total: (parseFloat(item.qty) * parseFloat(item.unitPrice)).toString(),
		}));

		const totalAmount = items
			.reduce((sum, item) => sum + parseFloat(item.total), 0)
			.toString();

		return {
			id: sale.id,
			date: sale.date,
			partyName: sale.customer,
			partyType: "Customer",
			type: "Sales Invoice",
			notes: sale.notes,
			items,
			totalAmount,
		};
	};

	const columns: Column<Sale>[] = [
		{ header: "Date", cell: (row) => new Date(row.date).toLocaleDateString() },
		{ header: "Customer", cell: (row) => row.customer || "-" },
		{
			header: "Status",
			cell: (row) => {
				let statusColor: "danger" | "success" | "neutral" = "neutral";
				if (row.status === "cancelled") statusColor = "danger";
				else if (row.status === "posted") statusColor = "success";

				return <StatusBadge status={statusColor}>{row.status}</StatusBadge>;
			},
		},
		{ header: "Items", cell: (row) => `${row.items.length} items` },
	];

	return (
		<Box sx={{ mt: 4 }}>
			<h2 className="text-xl font-bold mb-4 text-[var(--foreground)]">
				Sales History
			</h2>
			<GlassTable
				columns={columns}
				data={sales}
				showNumber
				actions={(row) => (
					<>
						<Tooltip title="View Invoice">
							<span>
								<GlassButton
									variant="ghost"
									size="icon"
									onClick={() => handleView(row)}
								>
									<Visibility fontSize="small" />
								</GlassButton>
							</span>
						</Tooltip>
						<Tooltip title="Revoke">
							<span>
								<GlassButton
									variant="danger"
									size="icon"
									onClick={() => handleRevoke(row.id)}
									disabled={row.status === "cancelled"}
									className={
										row.status === "cancelled"
											? "opacity-50 cursor-not-allowed"
											: ""
									}
								>
									<CancelIcon fontSize="small" />
								</GlassButton>
							</span>
						</Tooltip>
					</>
				)}
			/>

			{/* Invoice Dialog */}
			<GlassDialog
				open={open}
				onClose={() => setOpen(false)}
				maxWidth="md"
				fullWidth
				title="Invoice Details"
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
				{selectedSale && (
					<Invoice ref={invoiceRef} data={getInvoiceData(selectedSale)} />
				)}
			</GlassDialog>
		</Box>
	);
}
