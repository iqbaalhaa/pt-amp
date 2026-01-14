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
					p: 1.5,
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
				<Box sx={{ mb: 1, textAlign: "center" }}>
					<Typography
						variant="h6"
						sx={{
							fontWeight: "bold",
							color: "#1a237e",
							fontSize: "10pt",
							letterSpacing: "0.5px",
							lineHeight: 1.2,
						}}
					>
						PT AURORA MITRA PRAKARSA (AMP)
					</Typography>
					<Typography
						variant="body2"
						sx={{
							color: "#555",
							fontStyle: "italic",
							fontSize: "6pt",
							mt: 0.2,
						}}
					>
						(General Contractor, Supplier, Infrastructure)
					</Typography>
					<Divider
						sx={{ my: 0.5, borderBottomWidth: 1.5, borderColor: "#1a237e" }}
					/>
				</Box>

				{/* Invoice Details */}
				<Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
					<Box>
						<Typography
							variant="subtitle2"
							sx={{ fontWeight: "bold", fontSize: "8pt" }}
						>
							{data.type === "Purchase Invoice"
								? "FAKTUR PEMBELIAN"
								: "FAKTUR PENJUALAN"}
						</Typography>
						<Typography variant="body2" sx={{ fontSize: "7pt", mt: 0.2 }}>
							No: {data.id}
						</Typography>
						<Typography variant="body2" sx={{ fontSize: "7pt", mt: 0.2 }}>
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
							sx={{ fontWeight: "bold", fontSize: "8pt" }}
						>
							{data.partyType === "Supplier" ? "Pemasok" : "Pelanggan"}:
						</Typography>
						<Typography variant="body2" sx={{ fontSize: "7pt", mt: 0.2 }}>
							{(data.partyName || "-").toUpperCase()}
						</Typography>
					</Box>
				</Box>

				{/* Items Table */}
				<TableContainer sx={{ mb: 1, border: "0.5px solid #000" }}>
					<Table size="small" sx={{ tableLayout: "fixed" }}>
						<TableHead sx={{ bgcolor: "#eeeeee" }}>
							<TableRow>
								<TableCell
									sx={{
										fontWeight: "bold",
										fontSize: "7pt",
										py: 0.5,
										px: 0.5,
										width: "40%",
										borderBottom: "0.5px solid #000",
										color: "black",
									}}
								>
									Barang
								</TableCell>
								<TableCell
									align="right"
									sx={{
										fontWeight: "bold",
										fontSize: "7pt",
										py: 0.5,
										px: 0.5,
										width: "20%",
										borderBottom: "0.5px solid #000",
										color: "black",
									}}
								>
									Qty
								</TableCell>
								<TableCell
									align="right"
									sx={{
										fontWeight: "bold",
										fontSize: "7pt",
										py: 0.5,
										px: 0.5,
										width: "20%",
										borderBottom: "0.5px solid #000",
										color: "black",
									}}
								>
									Hrg
								</TableCell>
								<TableCell
									align="right"
									sx={{
										fontWeight: "bold",
										fontSize: "7pt",
										py: 0.5,
										px: 0.5,
										width: "20%",
										borderBottom: "0.5px solid #000",
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
											fontSize: "7pt",
											py: 0.4,
											px: 0.5,
											wordBreak: "break-word",
											borderBottom: "0.5px solid #e0e0e0",
											lineHeight: 1.1,
										}}
									>
										{item.productName}
									</TableCell>
									<TableCell
										align="right"
										sx={{
											fontSize: "7pt",
											py: 0.4,
											px: 0.5,
											borderBottom: "0.5px solid #e0e0e0",
											lineHeight: 1.1,
										}}
									>
										{parseFloat(item.qty).toLocaleString("id-ID")} {item.unit}
									</TableCell>
									<TableCell
										align="right"
										sx={{
											fontSize: "7pt",
											py: 0.4,
											px: 0.5,
											borderBottom: "0.5px solid #e0e0e0",
											lineHeight: 1.1,
										}}
									>
										{parseFloat(item.price).toLocaleString("id-ID")}
									</TableCell>
									<TableCell
										align="right"
										sx={{
											fontSize: "7pt",
											py: 0.4,
											px: 0.5,
											borderBottom: "0.5px solid #e0e0e0",
											lineHeight: 1.1,
										}}
									>
										{parseFloat(item.total).toLocaleString("id-ID")}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>

				<Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1.5 }}>
					<Box sx={{ minWidth: "50%" }}>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								borderTop: "1px solid black",
								pt: 0.5,
							}}
						>
							<Typography
								variant="subtitle2"
								sx={{ fontWeight: "bold", fontSize: "8pt" }}
							>
								Total:
							</Typography>
							<Typography
								variant="subtitle2"
								sx={{ fontWeight: "bold", fontSize: "8pt" }}
							>
								Rp {parseFloat(data.totalAmount).toLocaleString("id-ID")}
							</Typography>
						</Box>
					</Box>
				</Box>

				{data.notes && data.notes.trim().length > 0 && (
					<Box sx={{ mb: 1 }}>
						<Typography
							variant="subtitle2"
							sx={{ fontWeight: "bold", fontSize: "7pt", mb: 0.2 }}
						>
							Catatan:
						</Typography>
						<Typography
							variant="body2"
							sx={{
								fontSize: "6pt",
								whiteSpace: "pre-wrap",
								lineHeight: 1.1,
							}}
						>
							{(data.notes || "").toUpperCase()}
						</Typography>
					</Box>
				)}

				<Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
					<Box sx={{ textAlign: "center", width: "40%" }}>
						<Typography variant="body2" sx={{ mb: 4, fontSize: "7pt" }}>
							Dibuat Oleh
						</Typography>
						<Divider sx={{ borderColor: "black" }} />
						<Typography
							variant="caption"
							sx={{ fontSize: "6pt", mt: 0.2, display: "block" }}
						>
							(Staf)
						</Typography>
					</Box>
					<Box sx={{ textAlign: "center", width: "40%" }}>
						<Typography variant="body2" sx={{ mb: 4, fontSize: "7pt" }}>
							Disetujui Oleh
						</Typography>
						<Divider sx={{ borderColor: "black" }} />
						<Typography
							variant="caption"
							sx={{ fontSize: "6pt", mt: 0.2, display: "block" }}
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
