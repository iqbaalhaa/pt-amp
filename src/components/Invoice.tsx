import React, { forwardRef } from "react";
import {
	Box,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Divider,
} from "@mui/material";

export interface InvoiceItem {
	productName: string;
	qty: string;
	unit: string;
	price: string;
	total: string;
}

export interface InvoiceData {
	id: string;
	date: string;
	partyName: string | null;
	partyType: "Supplier" | "Customer";
	type: "Purchase Invoice" | "Sales Invoice";
	notes?: string | null;
	items: InvoiceItem[];
	totalAmount: string;
}

interface InvoiceProps {
	data: InvoiceData;
}

export const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(
	({ data }, ref) => {
		return (
			<Box
				ref={ref}
				sx={{
					p: 1,
					bgcolor: "white",
					color: "black",
					width: "105mm",
					height: "148mm", // FIX A6 supaya konsisten
					overflow: "hidden", // biar tidak meleber keluar halaman
					margin: "0",
					fontFamily: "Arial, sans-serif",
					boxSizing: "border-box",
				}}
			>
				{/* Header */}
				<Box sx={{ mb: 0.6, textAlign: "center" }}>
					<Typography
						variant="h6"
						sx={{
							fontWeight: "bold",
							color: "#1a237e",
							fontSize: "9pt",
							letterSpacing: "0.4px",
							lineHeight: 1.15,
						}}
					>
						PT AURORA MITRA PRAKARSA (AMP)
					</Typography>
					<Typography
						variant="body2"
						sx={{
							color: "#555",
							fontStyle: "italic",
							fontSize: "5.5pt",
							mt: 0.1,
						}}
					>
						(General Contractor, Supplier, Infrastructure)
					</Typography>
					<Divider
						sx={{ my: 0.4, borderBottomWidth: 1.2, borderColor: "#1a237e" }}
					/>
				</Box>

				{/* Invoice Details */}
				<Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
					<Box>
						<Typography
							variant="subtitle2"
							sx={{ fontWeight: "bold", fontSize: "7.5pt" }}
						>
							{data.type === "Purchase Invoice"
								? "FAKTUR PEMBELIAN"
								: "FAKTUR PENJUALAN"}
						</Typography>
						<Typography variant="body2" sx={{ fontSize: "6.5pt", mt: 0.1 }}>
							No: {data.id}
						</Typography>
						<Typography variant="body2" sx={{ fontSize: "6.5pt", mt: 0.1 }}>
							Tgl:{" "}
							{new Date(data.date).toLocaleDateString("id-ID", {
								day: "2-digit",
								month: "2-digit",
								year: "2-digit",
							})}
						</Typography>
					</Box>
					<Box sx={{ textAlign: "right" }}>
						<Typography
							variant="subtitle2"
							sx={{ fontWeight: "bold", fontSize: "7.5pt" }}
						>
							{data.partyType === "Supplier" ? "Pemasok" : "Pelanggan"}:
						</Typography>
						<Typography variant="body2" sx={{ fontSize: "6.5pt", mt: 0.1 }}>
							{(data.partyName || "-").toUpperCase()}
						</Typography>
					</Box>
				</Box>

				{/* Items Table */}
				<TableContainer sx={{ mb: 0.8, border: "0.4px solid #000" }}>
					<Table size="small" sx={{ tableLayout: "fixed" }}>
						<TableHead sx={{ bgcolor: "#eeeeee" }}>
							<TableRow>
								<TableCell
									sx={{
										fontWeight: "bold",
										fontSize: "6.5pt",
										py: 0.4,
										px: 0.4,
										width: "40%",
										borderBottom: "0.4px solid #000",
										color: "black",
									}}
								>
									Barang
								</TableCell>
								<TableCell
									align="right"
									sx={{
										fontWeight: "bold",
										fontSize: "6.5pt",
										py: 0.4,
										px: 0.4,
										width: "20%",
										borderBottom: "0.4px solid #000",
										color: "black",
									}}
								>
									Qty
								</TableCell>
								<TableCell
									align="right"
									sx={{
										fontWeight: "bold",
										fontSize: "6.5pt",
										py: 0.4,
										px: 0.4,
										width: "20%",
										borderBottom: "0.4px solid #000",
										color: "black",
									}}
								>
									Hrg
								</TableCell>
								<TableCell
									align="right"
									sx={{
										fontWeight: "bold",
										fontSize: "6.5pt",
										py: 0.4,
										px: 0.4,
										width: "20%",
										borderBottom: "0.4px solid #000",
										color: "black",
									}}
								>
									Jml
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{data.items.map((item, index) => (
								<TableRow key={index}>
									<TableCell
										sx={{
											fontSize: "6.5pt",
											py: 0.35,
											px: 0.4,
											wordBreak: "break-word",
											borderBottom: "0.4px solid #e0e0e0",
											lineHeight: 1.05,
										}}
									>
										{item.productName}
									</TableCell>
									<TableCell
										align="right"
										sx={{
											fontSize: "6.5pt",
											py: 0.35,
											px: 0.4,
											borderBottom: "0.4px solid #e0e0e0",
											lineHeight: 1.05,
										}}
									>
										{parseFloat(item.qty).toLocaleString("id-ID")} {item.unit}
									</TableCell>
									<TableCell
										align="right"
										sx={{
											fontSize: "6.5pt",
											py: 0.35,
											px: 0.4,
											borderBottom: "0.4px solid #e0e0e0",
											lineHeight: 1.05,
										}}
									>
										{parseFloat(item.price).toLocaleString("id-ID")}
									</TableCell>
									<TableCell
										align="right"
										sx={{
											fontSize: "6.5pt",
											py: 0.35,
											px: 0.4,
											borderBottom: "0.4px solid #e0e0e0",
											lineHeight: 1.05,
										}}
									>
										{parseFloat(item.total).toLocaleString("id-ID")}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>

				<Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
					<Box sx={{ minWidth: "50%" }}>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								borderTop: "1px solid black",
								pt: 0.4,
							}}
						>
							<Typography
								variant="subtitle2"
								sx={{ fontWeight: "bold", fontSize: "7.5pt" }}
							>
								Total:
							</Typography>
							<Typography
								variant="subtitle2"
								sx={{ fontWeight: "bold", fontSize: "7.5pt" }}
							>
								Rp {parseFloat(data.totalAmount).toLocaleString("id-ID")}
							</Typography>
						</Box>
					</Box>
				</Box>

				{data.notes && data.notes.trim().length > 0 && (
					<Box sx={{ mb: 0.8 }}>
						<Typography
							variant="subtitle2"
							sx={{ fontWeight: "bold", fontSize: "6.5pt", mb: 0.15 }}
						>
							Catatan:
						</Typography>
						<Typography
							variant="body2"
							sx={{
								fontSize: "5.5pt",
								whiteSpace: "pre-wrap",
								lineHeight: 1.05,
							}}
						>
							{(data.notes || "").toUpperCase()}
						</Typography>
					</Box>
				)}

				<Box sx={{ display: "flex", justifyContent: "space-between", mt: 1.5 }}>
					<Box sx={{ textAlign: "center", width: "40%" }}>
						<Typography variant="body2" sx={{ mb: 3, fontSize: "6.5pt" }}>
							Dibuat Oleh
						</Typography>
						<Divider sx={{ borderColor: "black" }} />
						<Typography
							variant="caption"
							sx={{ fontSize: "5.5pt", mt: 0.15, display: "block" }}
						>
							(Staf)
						</Typography>
					</Box>
					<Box sx={{ textAlign: "center", width: "40%" }}>
						<Typography variant="body2" sx={{ mb: 3, fontSize: "6.5pt" }}>
							Disetujui Oleh
						</Typography>
						<Divider sx={{ borderColor: "black" }} />
						<Typography
							variant="caption"
							sx={{ fontSize: "5.5pt", mt: 0.15, display: "block" }}
						>
							(Manajer)
						</Typography>
					</Box>
				</Box>
			</Box>
		);
	}
);

Invoice.displayName = "Invoice";
