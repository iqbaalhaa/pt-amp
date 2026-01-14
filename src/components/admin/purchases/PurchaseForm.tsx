"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
	Box,
	Stack,
	Typography,
	TextField,
	Snackbar,
	Alert,
	Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import { useRouter } from "next/navigation";
import { createPurchase } from "@/actions/purchase-actions";
import { formatRupiah } from "@/lib/currency";
import { TransactionStatus } from "@/generated/prisma";
import GlassTable, { Column } from "@/components/ui/GlassTable";
import GlassButton from "@/components/ui/GlassButton";
import { Invoice, InvoiceData } from "@/components/Invoice";

import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type ProductOption = {
	id: string;
	name: string;
	unit: string;
	type: "raw" | "finished";
};

type Props = {
	products: ProductOption[];
};

type ItemRow = {
	productId: string;
	qty: string;
	unitCost: string;
};

const PRODUCTS_1 = ["ASALAN", "PATAHAN", "AAA", "AA", "RIJECT", "MISS CUT"];
const PRODUCTS_2 = ["KF", "KS", "KA", "KTP", "KB", "KC"];
const ALL_TARGETS = [...PRODUCTS_1, ...PRODUCTS_2];

// A6 portrait: 105mm × 148mm
const A6_W_MM = 105;
const A6_H_MM = 148;
const PRINT_MARGIN_MM = 6;

export default function PurchaseForm({ products }: Props) {
	const router = useRouter();

	const [supplier, setSupplier] = useState<string>("");
	const [date, setDate] = useState<string>("");
	const [status, setStatus] = useState<TransactionStatus>("draft");
	const [notes, setNotes] = useState<string>("");

	useEffect(() => {
		const today = new Date();
		const yyyy = today.getFullYear();
		const mm = String(today.getMonth() + 1).padStart(2, "0");
		const dd = String(today.getDate()).padStart(2, "0");
		setDate(`${yyyy}-${mm}-${dd}`);
	}, []);

	const [items, setItems] = useState<ItemRow[]>(() => {
		return ALL_TARGETS.map((name) => {
			const p = products.find(
				(prod) => prod.name.toUpperCase() === name.toUpperCase()
			);
			return { productId: p ? p.id : "", qty: "", unitCost: "" };
		});
	});

	const [saving, setSaving] = useState(false);
	const [snack, setSnack] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error";
	}>({ open: false, message: "", severity: "success" });

	const updateItem = (idx: number, field: keyof ItemRow, value: string) => {
		setItems((prev) =>
			prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
		);
	};

	const lineTotal = (row: ItemRow) => {
		const q = parseFloat(row.qty || "0");
		const c = parseFloat(row.unitCost || "0");
		return isFinite(q * c) ? q * c : 0;
	};

	const grandTotal = useMemo(
		() => items.reduce((sum, row) => sum + lineTotal(row), 0),
		[items]
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		try {
			const validItems = items.filter(
				(r) => r.productId && r.qty && r.unitCost
			);

			const payload = {
				supplier: supplier || null,
				date,
				status,
				notes: notes || null,
				items: validItems,
			};

			const res = await createPurchase(payload);
			if (res && res.success) {
				setSnack({
					open: true,
					message: "Purchase berhasil dibuat",
					severity: "success",
				});

				setSupplier("");

				const today = new Date();
				const yyyy = today.getFullYear();
				const mm = String(today.getMonth() + 1).padStart(2, "0");
				const dd = String(today.getDate()).padStart(2, "0");
				setDate(`${yyyy}-${mm}-${dd}`);

				setStatus("draft");
				setNotes("");

				setItems(
					ALL_TARGETS.map((name) => {
						const p = products.find(
							(prod) => prod.name.toUpperCase() === name.toUpperCase()
						);
						return { productId: p ? p.id : "", qty: "", unitCost: "" };
					})
				);

				router.refresh();
			} else {
				setSnack({
					open: true,
					message: "Gagal membuat purchase",
					severity: "error",
				});
			}
		} catch {
			setSnack({ open: true, message: "Terjadi kesalahan", severity: "error" });
		} finally {
			setSaving(false);
		}
	};

	const columns1: Column<ItemRow>[] = [
		{
			header: "Nama Barang",
			cell: (_row, idx) => (
				<Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
					{PRODUCTS_1[idx]}
				</Typography>
			),
			className: "min-w-[120px]",
		},
		{
			header: "Banyaknya",
			cell: (row, idx) => (
				<TextField
					type="number"
					inputProps={{ step: "0.0001", style: { padding: "4px 8px" } }}
					placeholder="Qty"
					size="small"
					value={row.qty}
					onChange={(e) => updateItem(idx, "qty", e.target.value)}
					fullWidth
				/>
			),
			className: "min-w-[80px]",
		},
		{
			header: "Harga Satuan",
			cell: (row, idx) => (
				<TextField
					type="number"
					inputProps={{ step: "0.0001", style: { padding: "4px 8px" } }}
					placeholder="Harga"
					size="small"
					value={row.unitCost}
					onChange={(e) => updateItem(idx, "unitCost", e.target.value)}
					fullWidth
				/>
			),
			className: "min-w-[100px]",
		},
		{
			header: "Jumlah",
			cell: (row) => (
				<Typography sx={{ fontSize: "0.875rem" }}>
					{formatRupiah(lineTotal(row), 0)}
				</Typography>
			),
			className: "min-w-[100px]",
		},
	];

	const columns2: Column<ItemRow>[] = [
		{
			header: "Nama Barang",
			cell: (_row, idx) => (
				<Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
					{PRODUCTS_2[idx]}
				</Typography>
			),
			className: "min-w-[120px]",
		},
		{
			header: "Banyaknya",
			cell: (row, idx) => (
				<TextField
					type="number"
					inputProps={{ step: "0.0001", style: { padding: "4px 8px" } }}
					placeholder="Qty"
					size="small"
					value={row.qty}
					onChange={(e) => updateItem(idx + 6, "qty", e.target.value)}
					fullWidth
				/>
			),
			className: "min-w-[80px]",
		},
		{
			header: "Harga Satuan",
			cell: (row, idx) => (
				<TextField
					type="number"
					inputProps={{ step: "0.0001", style: { padding: "4px 8px" } }}
					placeholder="Harga"
					size="small"
					value={row.unitCost}
					onChange={(e) => updateItem(idx + 6, "unitCost", e.target.value)}
					fullWidth
				/>
			),
			className: "min-w-[100px]",
		},
		{
			header: "Jumlah",
			cell: (row) => (
				<Typography sx={{ fontSize: "0.875rem" }}>
					{formatRupiah(lineTotal(row), 0)}
				</Typography>
			),
			className: "min-w-[100px]",
		},
	];

	// ---------- INVOICE DATA ----------
	const invoiceItems = useMemo(() => {
		return items
			.map((item, idx) => {
				const product = products.find((p) => p.id === item.productId);
				const hardcodedName = ALL_TARGETS[idx];
				const q = parseFloat(item.qty || "0");
				const c = parseFloat(item.unitCost || "0");
				const total = isFinite(q * c) ? q * c : 0;

				return {
					productName: product ? product.name : hardcodedName,
					qty: item.qty || "0",
					unit: product ? product.unit : "-",
					price: item.unitCost || "0",
					total: total.toString(),
				};
			})
			.filter((it) => parseFloat(it.qty) > 0 || parseFloat(it.price) > 0);
	}, [items, products]);

	const invoiceData: InvoiceData = {
		id: "DRAFT",
		date: date || new Date().toISOString().split("T")[0],
		partyName: supplier,
		partyType: "Supplier",
		type: "Purchase Invoice",
		notes: notes || null,
		items: invoiceItems,
		totalAmount: grandTotal.toString(),
	};

	// ---------- PRINT & DOWNLOAD (NODE KHUSUS, TANPA SCALE) ----------
	const invoicePrintRef = useRef<HTMLDivElement>(null);

	const handlePrint = useReactToPrint({
		content: () => invoicePrintRef.current,
		documentTitle: `nota-purchase-${date || "draft"}`,
		removeAfterPrint: true,
		pageStyle: `
      @page { size: ${A6_W_MM}mm ${A6_H_MM}mm; margin: ${PRINT_MARGIN_MM}mm; }
      html, body { margin: 0; padding: 0; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    `,
	});

	const handleDownloadPdf = async () => {
		if (!invoicePrintRef.current) return;

		// IMPORTANT: capture node yang 1:1 (tanpa transform)
		const canvas = await html2canvas(invoicePrintRef.current, {
			scale: 2,
			backgroundColor: "#ffffff",
			useCORS: true,
			// ini sering bantu supaya tidak "geser-geser"
			scrollX: 0,
			scrollY: 0,
			windowWidth: invoicePrintRef.current.scrollWidth,
			windowHeight: invoicePrintRef.current.scrollHeight,
		});

		const imgData = canvas.toDataURL("image/png");

		// PDF A6
		const pdf = new jsPDF({
			orientation: "p",
			unit: "mm",
			format: [A6_W_MM, A6_H_MM],
		});

		const pageW = A6_W_MM;
		const pageH = A6_H_MM;
		const margin = PRINT_MARGIN_MM;

		const contentW = pageW - margin * 2;
		const contentH = pageH - margin * 2;

		// tinggi gambar dalam mm mengikuti rasio
		const imgHeightMm = (canvas.height * contentW) / canvas.width;

		let heightLeft = imgHeightMm;
		let offsetY = 0;

		// page 1
		pdf.addImage(imgData, "PNG", margin, margin, contentW, imgHeightMm);
		heightLeft -= contentH;

		// page berikutnya bila kepanjangan
		while (heightLeft > 0) {
			offsetY += contentH;
			pdf.addPage([pageW, pageH], "p");
			pdf.addImage(
				imgData,
				"PNG",
				margin,
				margin - offsetY,
				contentW,
				imgHeightMm
			);
			heightLeft -= contentH;
		}

		pdf.save(`nota-purchase-${date || "draft"}.pdf`);
	};

	const canExport = invoiceItems.length > 0;

	return (
		<Box component="form" onSubmit={handleSubmit}>
			{/* 2 kolom md+: jangan wrap */}
			<Grid
				container
				spacing={2}
				alignItems="flex-start"
				sx={{ flexWrap: { xs: "wrap", md: "nowrap" } }}
			>
				{/* KIRI */}
				<Grid item xs={12} md sx={{ minWidth: 0 }}>
					<Stack spacing={3}>
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<TextField
									fullWidth
									label="Nama Pemilik Barang"
									value={supplier}
									onChange={(e) => setSupplier(e.target.value)}
								/>
							</Grid>
							<Grid item xs={12} md={6}>
								<TextField
									type="date"
									label="Tanggal"
									fullWidth
									value={date}
									onChange={(e) => setDate(e.target.value)}
									InputLabelProps={{ shrink: true }}
								/>
							</Grid>
							<Grid item xs={12} md={6}>
								<TextField
									fullWidth
									label="Catatan"
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
								/>
							</Grid>
						</Grid>

						<Box>
							<Grid container spacing={2} sx={{ mb: 2 }}>
								<Grid item xs={12}>
									<Box sx={{ overflowX: "auto" }}>
										<GlassTable columns={columns1} data={items.slice(0, 6)} />
									</Box>
								</Grid>
								<Grid item xs={12}>
									<Box sx={{ overflowX: "auto" }}>
										<GlassTable columns={columns2} data={items.slice(6, 12)} />
									</Box>
								</Grid>
							</Grid>

							<Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
								<Typography variant="h6" sx={{ fontWeight: 700 }}>
									Total: {formatRupiah(grandTotal, 0)}
								</Typography>
							</Box>
						</Box>

						<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
							<GlassButton type="submit" variant="primary" disabled={saving}>
								<SaveIcon className="mr-2" fontSize="small" />
								Simpan Purchase
							</GlassButton>
						</Box>
					</Stack>
				</Grid>

				{/* KANAN */}
				<Grid
					item
					xs={12}
					md="auto"
					sx={{
						flexShrink: 0,
						width: { md: 420 },
						minWidth: 0,
					}}
				>
					<Box sx={{ position: { md: "sticky" }, top: { md: 20 } }}>
						<Stack spacing={1.5}>
							<Typography variant="h6" sx={{ fontWeight: 700 }}>
								Preview Nota (A6)
							</Typography>

							<Stack direction="row" spacing={1}>
								<GlassButton
									type="button"
									variant="secondary"
									onClick={handleDownloadPdf}
									disabled={!canExport}
								>
									<DownloadIcon className="mr-2" fontSize="small" />
									Download
								</GlassButton>

								<GlassButton
									type="button"
									variant="secondary"
									onClick={handlePrint}
									disabled={!canExport}
								>
									<PrintIcon className="mr-2" fontSize="small" />
									Cetak
								</GlassButton>
							</Stack>

							<Divider />

							{/* PREVIEW: boleh di-scale */}
							<Box
								sx={{
									boxShadow: 3,
									borderRadius: 2,
									overflow: "hidden",
									bgcolor: "white",
									width: "100%",
									display: "flex",
									justifyContent: "center",
									p: 1,
								}}
							>
								{/* Frame preview mengikuti rasio A6 */}
								<Box
									sx={{
										width: "100%",
										maxWidth: 360,
										aspectRatio: `${A6_W_MM} / ${A6_H_MM}`,
										overflow: "hidden",
										display: "flex",
										justifyContent: "center",
										alignItems: "flex-start",
										bgcolor: "white",
									}}
								>
									{/* Invoice asli 105mm, kita scale supaya muat */}
									<Box
										sx={{
											transform: "scale(0.75)",
											transformOrigin: "top center",
											width: `${A6_W_MM}mm`,
										}}
									>
										<Invoice data={invoiceData} />
									</Box>
								</Box>
							</Box>

							{!canExport && (
								<Typography variant="caption" color="text.secondary">
									Isi qty/harga dulu supaya nota bisa di-download / dicetak.
								</Typography>
							)}
						</Stack>
					</Box>
				</Grid>
			</Grid>

			{/* NODE KHUSUS PRINT/PDF: disembunyikan, TANPA SCALE */}
			<Box
				sx={{
					position: "fixed",
					left: "-10000px",
					top: 0,
					width: `${A6_W_MM}mm`,
					bgcolor: "white",
					zIndex: -1,
				}}
			>
				{/* Ref langsung ke Invoice (lebih stabil) */}
				<Invoice ref={invoicePrintRef} data={invoiceData} />
			</Box>

			<Snackbar
				open={snack.open}
				autoHideDuration={3000}
				onClose={() => setSnack((s) => ({ ...s, open: false }))}
			>
				<Alert
					onClose={() => setSnack((s) => ({ ...s, open: false }))}
					severity={snack.severity}
					variant="filled"
				>
					{snack.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}
