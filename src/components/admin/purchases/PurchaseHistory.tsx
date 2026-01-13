"use client";

import { useState, useRef } from "react";
import { Tooltip, Box } from "@mui/material";
import { Visibility, Print, Cancel as CancelIcon } from "@mui/icons-material";
import { useReactToPrint } from "react-to-print";
import { Invoice, InvoiceData } from "@/components/Invoice";
import { revokePurchase } from "@/actions/purchase-actions";
import GlassTable, { Column } from "@/components/ui/GlassTable";
import GlassButton from "@/components/ui/GlassButton";
import StatusBadge from "@/components/ui/StatusBadge";
import GlassDialog from "@/components/ui/GlassDialog";

type Purchase = {
	id: string;
	supplier: string | null;
	date: string;
	status: string;
	notes: string | null;
	items: {
		id: string;
		productName: string;
		qty: string;
		unitCost: string;
		unit: string;
	}[];
};

export default function PurchaseHistory({
	purchases,
}: {
	purchases: Purchase[];
}) {
	const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
		null
	);
	const [open, setOpen] = useState(false);
	const invoiceRef = useRef<HTMLDivElement>(null);

	const handlePrint = useReactToPrint({
		contentRef: invoiceRef,
	});

	const handleView = (purchase: Purchase) => {
		setSelectedPurchase(purchase);
		setOpen(true);
	};

	const handleRevoke = async (id: string) => {
		if (
			confirm(
				"Are you sure you want to revoke this invoice? This will set status to CANCELLED."
			)
		) {
			await revokePurchase(id);
		}
	};

	const getInvoiceData = (purchase: Purchase): InvoiceData => {
		const items = purchase.items.map((item) => ({
			productName: item.productName,
			qty: item.qty,
			unit: item.unit,
			price: item.unitCost,
			total: (parseFloat(item.qty) * parseFloat(item.unitCost)).toString(),
		}));

		const totalAmount = items
			.reduce((sum, item) => sum + parseFloat(item.total), 0)
			.toString();

		return {
			id: purchase.id,
			date: purchase.date,
			partyName: purchase.supplier,
			partyType: "Supplier",
			type: "Purchase Invoice",
			items,
			totalAmount,
		};
	};

	const columns: Column<Purchase>[] = [
		{
			header: "Date",
			cell: (row) =>
				new Date(row.date).toLocaleDateString("id-ID", {
					day: "2-digit",
					month: "short",
					year: "numeric",
				}),
		},
		{ header: "Supplier", cell: (row) => row.supplier || "-" },
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
				Purchase History
			</h2>
			<GlassTable
				columns={columns}
				data={purchases}
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
				{selectedPurchase && (
					<Invoice ref={invoiceRef} data={getInvoiceData(selectedPurchase)} />
				)}
			</GlassDialog>
		</Box>
	);
}
