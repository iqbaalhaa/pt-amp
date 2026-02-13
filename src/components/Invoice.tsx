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
import Image from "next/image";

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
	inputBy?: string;
}

interface InvoiceProps {
	data: InvoiceData;
}

// 1/2 A4 is A5 size (148mm x 210mm)
export const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(
	({ data }, ref) => {
		const formatRupiah = (val: string) => {
			const n = parseFloat(val || "0");
			return new Intl.NumberFormat("id-ID", {
				style: "currency",
				currency: "IDR",
				maximumFractionDigits: 0,
			}).format(n);
		};

		return (
			<Box
				ref={ref}
				sx={{
					p: "8mm",
					bgcolor: "white",
					color: "black",
					width: "148mm",
					minHeight: "210mm",
					display: "flex",
					flexDirection: "column",
					margin: "0 auto",
					fontFamily: "'Times New Roman', serif",
					boxSizing: "border-box",
					position: "relative",
					border: "1px solid #eee",
				}}
			>
				{/* Header with Smaller Logo and Kop */}
				<Box sx={{ mb: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
					<Box sx={{ position: "relative", width: "100px", height: "40px", mb: 0.2 }}>
						<Image 
							src="/logoAMP.png" 
							alt="Logo AMP" 
							fill 
							style={{ objectFit: "contain" }}
							priority
						/>
					</Box>
					<Typography
						variant="h6"
						sx={{
							fontWeight: "bold",
							fontSize: "9pt",
							lineHeight: 1,
						}}
					>
						PT AURORA MITRA PRAKARSA
					</Typography>
					<Typography
						variant="body2"
						sx={{
							fontSize: "6pt",
							fontStyle: "italic",
							color: "#333",
							lineHeight: 1
						}}
					>
						General Contractor, Supplier, Infrastructure
					</Typography>
				</Box>

				<Divider sx={{ mb: 1.5, borderBottomWidth: 1.5, borderColor: "black" }} />

				{/* Title Rata Tengah */}
				<Box sx={{ textAlign: "center", mb: 2 }}>
					<Typography
						variant="h6"
						sx={{
							fontWeight: "bold",
							fontSize: "12pt",
							textDecoration: "underline",
							mb: 0.5
						}}
					>
						{data.type === "Purchase Invoice" ? "FAKTUR PEMBELIAN" : "FAKTUR PENJUALAN"}
					</Typography>
				</Box>

				{/* Info Party & Date */}
				<Box sx={{ mb: 2, fontSize: "9pt", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
					<Box>
						<Box sx={{ display: "flex", mb: 0.3 }}>
							<Box sx={{ width: "70px" }}>Tanggal</Box>
							<Box sx={{ mr: 1 }}>:</Box>
							<Box>{new Date(data.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</Box>
						</Box>
						<Box sx={{ display: "flex" }}>
							<Box sx={{ width: "70px" }}>{data.partyType}</Box>
							<Box sx={{ mr: 1 }}>:</Box>
							<Box sx={{ fontWeight: "bold" }}>{data.partyName || "-"}</Box>
						</Box>
					</Box>
					{data.inputBy && (
						<Box sx={{ fontSize: "8pt", fontStyle: "italic", color: "text.secondary" }}>
							Diinput oleh: {data.inputBy}
						</Box>
					)}
				</Box>

				{/* Table Items - Width 100% */}
				<TableContainer sx={{ mb: 2, overflow: "visible", width: "100%" }}>
					<Table size="small" sx={{ border: "1px solid black", width: "100%", tableLayout: "fixed" }}>
						<TableHead>
							<TableRow sx={{ bgcolor: "#f5f5f5" }}>
								<TableCell sx={{ border: "1px solid black", fontWeight: "bold", fontSize: "8.5pt", textAlign: "center", py: 0.5, width: "35px" }}>No</TableCell>
								<TableCell sx={{ border: "1px solid black", fontWeight: "bold", fontSize: "8.5pt", py: 0.5 }}>Nama Barang</TableCell>
								<TableCell sx={{ border: "1px solid black", fontWeight: "bold", fontSize: "8.5pt", textAlign: "center", py: 0.5, width: "70px" }}>Qty</TableCell>
								<TableCell sx={{ border: "1px solid black", fontWeight: "bold", fontSize: "8.5pt", textAlign: "right", py: 0.5, width: "90px" }}>Harga</TableCell>
								<TableCell sx={{ border: "1px solid black", fontWeight: "bold", fontSize: "8.5pt", textAlign: "right", py: 0.5, width: "100px" }}>Total</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{data.items.map((item, idx) => (
								<TableRow key={idx}>
									<TableCell sx={{ border: "1px solid black", fontSize: "8.5pt", textAlign: "center", py: 0.5 }}>{idx + 1}</TableCell>
									<TableCell sx={{ border: "1px solid black", fontSize: "8.5pt", py: 0.5, wordBreak: "break-word" }}>{item.productName}</TableCell>
									<TableCell sx={{ border: "1px solid black", fontSize: "8.5pt", textAlign: "center", py: 0.5 }}>{item.qty} {item.unit}</TableCell>
									<TableCell sx={{ border: "1px solid black", fontSize: "8.5pt", textAlign: "right", py: 0.5 }}>{formatRupiah(item.price)}</TableCell>
									<TableCell sx={{ border: "1px solid black", fontSize: "8.5pt", textAlign: "right", py: 0.5 }}>{formatRupiah(item.total)}</TableCell>
								</TableRow>
							))}
							<TableRow>
								<TableCell colSpan={4} sx={{ border: "1px solid black", fontWeight: "bold", fontSize: "9pt", textAlign: "right", py: 0.8 }}>TOTAL</TableCell>
								<TableCell sx={{ border: "1px solid black", fontWeight: "bold", fontSize: "9pt", textAlign: "right", py: 0.8, bgcolor: "#f5f5f5" }}>
									{formatRupiah(data.totalAmount)}
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</TableContainer>

				{data.notes && (
					<Box sx={{ mt: 1 }}>
						<Typography variant="body2" sx={{ fontSize: "8pt", fontStyle: "italic" }}>
							Catatan: {data.notes}
						</Typography>
					</Box>
				)}
			</Box>
		);
	}
);

Invoice.displayName = "Invoice";
