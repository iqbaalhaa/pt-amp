"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
	Box,
	Stack,
	Typography,
	TextField,
	MenuItem,
	Snackbar,
	Alert,
	Divider,
	Autocomplete,
	CircularProgress,
	createFilterOptions,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import { createPurchase } from "@/actions/purchase-actions";
import { formatRupiah } from "@/lib/currency";
import { TransactionStatus } from "@prisma/client";
import GlassTable, { Column } from "@/components/ui/GlassTable";
import GlassButton from "@/components/ui/GlassButton";
import { Invoice, InvoiceData } from "@/components/Invoice";

import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { type ItemTypeDTO, quickCreateItemType } from "@/actions/item-type-actions";
import { type UnitDTO, quickCreateUnit } from "@/actions/unit-actions";
import { type SupplierDTO, quickCreateSupplier } from "@/actions/supplier-actions";
import SuccessModal from "./SuccessModal";
import { authClient } from "@/lib/auth-client";

const filter = createFilterOptions<ItemTypeDTO>();
const unitFilter = createFilterOptions<UnitDTO>();
const supplierFilter = createFilterOptions<SupplierDTO>();

type Props = {
	itemTypes: ItemTypeDTO[];
	units: UnitDTO[];
	suppliers: SupplierDTO[];
};

type ItemRow = {
	id: string; // internal client-side id for keys
	itemTypeId: string;
	qty: string;
	unitCost: string;
	unitId?: string | null;
};

export default function PurchaseForm({ itemTypes, units: initialUnits, suppliers: initialSuppliers }: Props) {
	const router = useRouter();

	const [localItemTypes, setLocalItemTypes] = useState<ItemTypeDTO[]>(itemTypes);
	const [localUnits, setLocalUnits] = useState<UnitDTO[]>(initialUnits);
	const [localSuppliers, setLocalSuppliers] = useState<SupplierDTO[]>(initialSuppliers);

	useEffect(() => {
		setLocalItemTypes(itemTypes);
	}, [itemTypes]);

	useEffect(() => {
		setLocalUnits(initialUnits);
	}, [initialUnits]);

	useEffect(() => {
		setLocalSuppliers(initialSuppliers);
	}, [initialSuppliers]);

	const activeItemTypes = useMemo(() => {
		return localItemTypes.filter((t) => t.isActive);
	}, [localItemTypes]);

	const activeUnits = useMemo(() => {
		return localUnits.filter((u) => u.isActive);
	}, [localUnits]);

	const activeSuppliers = useMemo(() => {
		return localSuppliers.filter((s) => s.isActive);
	}, [localSuppliers]);

	const [supplierId, setSupplierId] = useState<string>("");
	const [date, setDate] = useState<string>("");
	const [status, setStatus] = useState<TransactionStatus>("draft");
	const [notes, setNotes] = useState<string>("");
	const [creatingItemType, setCreatingItemType] = useState(false);
	const [creatingUnit, setCreatingUnit] = useState(false);
	const [creatingSupplier, setCreatingSupplier] = useState(false);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const { data: session } = authClient.useSession();

	// A5 (1/2 A4) portrait: 148mm × 210mm
	const A5_W_MM = 148;
	const A5_H_MM = 210;
	const PRINT_MARGIN_MM = 10;

	useEffect(() => {
		const today = new Date();
		const yyyy = today.getFullYear();
		const mm = String(today.getMonth() + 1).padStart(2, "0");
		const dd = String(today.getDate()).padStart(2, "0");
		setDate(`${yyyy}-${mm}-${dd}`);
	}, []);

	const [items, setItems] = useState<ItemRow[]>([
		{ id: Math.random().toString(), itemTypeId: "", qty: "", unitCost: "", unitId: "" }
	]);

	const [saving, setSaving] = useState(false);
	const [snack, setSnack] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error";
	}>({ open: false, message: "", severity: "success" });

	const addItem = () => {
		setItems(prev => [
			...prev,
			{ id: Math.random().toString(), itemTypeId: "", qty: "", unitCost: "", unitId: "" }
		]);
	};

	const removeItem = (id: string) => {
		if (items.length <= 1) return;
		setItems(prev => prev.filter(it => it.id !== id));
	};

	const updateItem = (id: string, field: keyof ItemRow, value: string) => {
		setItems((prev) =>
			prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
		);
	};

	const lineTotal = (row: ItemRow) => {
		const q = parseFloat(row.qty || "0");
		const c = parseFloat(row.unitCost || "0");
		return isFinite(q * c) ? q * c : 0;
	};

	const grandTotal = useMemo(
		() => items.reduce((sum, row) => sum + lineTotal(row), 0),
		[items],
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!supplierId) {
			setSnack({
				open: true,
				message: "Nama Pemilik Barang (Supplier) wajib diisi",
				severity: "error",
			});
			return;
		}

		setSaving(true);
		try {
			const validItems = items.filter(
				(r) => r.itemTypeId && r.qty && r.unitCost,
			);

			if (validItems.length === 0) {
				setSnack({
					open: true,
					message: "Mohon isi minimal satu item dengan lengkap",
					severity: "error",
				});
				return;
			}

			const payload = {
				supplier: localSuppliers.find(s => s.id === supplierId)?.name || null,
				date,
				status,
				notes: notes || null,
				items: validItems.map(({ id, ...rest }) => rest),
			};

			const res = await createPurchase(payload);
			if (res && res.success) {
				setShowSuccessModal(true);
				router.refresh();
			} else {
				setSnack({
					open: true,
					message: "Gagal membuat purchase",
					severity: "error",
				});
			}
		} catch (error) {
			console.error("Save error:", error);
			setSnack({ open: true, message: "Terjadi kesalahan", severity: "error" });
		} finally {
			setSaving(false);
		}
	};

	const columns: Column<ItemRow>[] = [
		{
			header: "Nama Barang",
			cell: (row) => (
				<Autocomplete
					value={activeItemTypes.find(it => it.id === row.itemTypeId) || null}
					onChange={async (event, newValue) => {
						if (typeof newValue === 'string') {
							// Should not happen with current config
						} else if (newValue && (newValue as any).inputValue) {
							// Create new item type
							setCreatingItemType(true);
							try {
								const newIt = await quickCreateItemType((newValue as any).inputValue);
								setLocalItemTypes(prev => [...prev, newIt]);
								updateItem(row.id, "itemTypeId", newIt.id);
								setSnack({ open: true, message: `Barang "${newIt.name}" berhasil ditambahkan`, severity: "success" });
							} catch (err) {
								setSnack({ open: true, message: "Gagal menambahkan barang baru", severity: "error" });
							} finally {
								setCreatingItemType(false);
							}
						} else {
							updateItem(row.id, "itemTypeId", newValue?.id || "");
						}
					}}
					filterOptions={(options, params) => {
						const filtered = filter(options, params);
						const { inputValue } = params;
						const isExisting = options.some((option) => inputValue.toLowerCase() === option.name.toLowerCase());
						if (inputValue !== '' && !isExisting) {
							filtered.push({
								inputValue,
								name: `Tambah "${inputValue}"`,
							} as any);
						}
						return filtered;
					}}
					selectOnFocus
					clearOnBlur
					handleHomeEndKeys
					options={activeItemTypes}
					getOptionLabel={(option) => {
						if (typeof option === 'string') return option;
						if ((option as any).inputValue) return (option as any).inputValue;
						return option.name;
					}}
					renderOption={(props, option) => {
						const { key, ...optionProps } = props as any;
						return (
							<li key={key} {...optionProps}>
								{option.name}
							</li>
						);
					}}
					size="small"
					fullWidth
					renderInput={(params) => (
						<TextField 
							{...params} 
							placeholder="Pilih/Cari Barang"
							InputProps={{
								...params.InputProps,
								endAdornment: (
									<>
										{creatingItemType ? <CircularProgress color="inherit" size={20} /> : null}
										{params.InputProps.endAdornment}
									</>
								),
							}}
						/>
					)}
				/>
			),
			className: "min-w-[200px]",
		},
		{
			header: "Satuan",
			cell: (row) => (
				<Autocomplete
					value={activeUnits.find(u => u.id === row.unitId) || null}
					onChange={async (event, newValue) => {
						if (newValue && (newValue as any).inputValue) {
							setCreatingUnit(true);
							try {
								const newUnit = await quickCreateUnit((newValue as any).inputValue);
								setLocalUnits(prev => [...prev, newUnit]);
								updateItem(row.id, "unitId", newUnit.id);
								setSnack({ open: true, message: `Satuan "${newUnit.name}" berhasil ditambahkan`, severity: "success" });
							} catch (err) {
								setSnack({ open: true, message: "Gagal menambahkan satuan baru", severity: "error" });
							} finally {
								setCreatingUnit(false);
							}
						} else {
							updateItem(row.id, "unitId", newValue?.id || "");
						}
					}}
					filterOptions={(options, params) => {
						const filtered = unitFilter(options, params);
						const { inputValue } = params;
						const isExisting = options.some((option) => inputValue.toLowerCase() === option.name.toLowerCase());
						if (inputValue !== '' && !isExisting) {
							filtered.push({
								inputValue,
								name: `Tambah "${inputValue}"`,
							} as any);
						}
						return filtered;
					}}
					selectOnFocus
					clearOnBlur
					handleHomeEndKeys
					options={activeUnits}
					getOptionLabel={(option) => {
						if (typeof option === 'string') return option;
						if ((option as any).inputValue) return (option as any).inputValue;
						return option.name;
					}}
					renderOption={(props, option) => {
						const { key, ...optionProps } = props as any;
						return (
							<li key={key} {...optionProps}>
								{option.name}
							</li>
						);
					}}
					size="small"
					fullWidth
					renderInput={(params) => (
						<TextField 
							{...params} 
							placeholder="Pilih Satuan"
							InputProps={{
								...params.InputProps,
								endAdornment: (
									<>
										{creatingUnit ? <CircularProgress color="inherit" size={20} /> : null}
										{params.InputProps.endAdornment}
									</>
								),
							}}
						/>
					)}
				/>
			),
			className: "min-w-[150px]",
		},
		{
			header: "Banyaknya",
			cell: (row) => (
				<TextField
					type="number"
					inputProps={{ step: "0.01", style: { padding: "4px 8px" } }}
					placeholder="Qty"
					size="small"
					value={row.qty}
					onChange={(e) => updateItem(row.id, "qty", e.target.value)}
					fullWidth
				/>
			),
			className: "min-w-[80px]",
		},
		{
			header: "Harga Satuan",
			cell: (row) => (
				<TextField
					type="number"
					inputProps={{ step: "1", style: { padding: "4px 8px" } }}
					placeholder="Harga"
					size="small"
					value={row.unitCost}
					onChange={(e) => updateItem(row.id, "unitCost", e.target.value)}
					fullWidth
				/>
			),
			className: "min-w-[100px]",
		},
		{
			header: "Jumlah",
			cell: (row) => (
				<Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
					{formatRupiah(lineTotal(row), 0)}
				</Typography>
			),
			className: "min-w-[100px]",
		},
		{
			header: "",
			cell: (row) => (
				<GlassButton 
					variant="danger" 
					size="sm" 
					onClick={() => removeItem(row.id)}
					disabled={items.length <= 1}
				>
					<DeleteIcon fontSize="small" />
				</GlassButton>
			),
			className: "w-[40px]",
		}
	];

	// ---------- INVOICE DATA ----------
	const invoiceItems = useMemo(() => {
		return items
			.map((item) => {
				const it = localItemTypes.find((t) => t.id === item.itemTypeId);
				const unit = localUnits.find((u) => u.id === item.unitId);
				const q = parseFloat(item.qty || "0");
				const c = parseFloat(item.unitCost || "0");
				const total = isFinite(q * c) ? q * c : 0;

				return {
					productName: it ? it.name : "-",
					qty: item.qty || "0",
					unit: unit ? unit.name : "-",
					price: item.unitCost || "0",
					total: total.toString(),
				};
			})
			.filter((it) => parseFloat(it.qty) > 0 || parseFloat(it.price) > 0);
	}, [items, localItemTypes, localUnits]);

	const invoiceData: InvoiceData = {
		id: "DRAFT",
		date: date || new Date().toISOString().split("T")[0],
		partyName: localSuppliers.find(s => s.id === supplierId)?.name || "",
		partyType: "Supplier",
		type: "Purchase Invoice",
		notes: notes || null,
		items: invoiceItems,
		totalAmount: grandTotal.toString(),
		inputBy: session?.user?.name || "Admin",
	};

	// ---------- PRINT & DOWNLOAD (NODE KHUSUS, TANPA SCALE) ----------
	const invoicePrintRef = useRef<HTMLDivElement>(null);

	const handlePrint = useReactToPrint({
		contentRef: invoicePrintRef,
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

		// PDF 1/2 A4 (A5)
		const pdf = new jsPDF({
			orientation: "p",
			unit: "mm",
			format: [A5_W_MM, A5_H_MM],
		});

		const pageW = A5_W_MM;
		const pageH = A5_H_MM;
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
				imgHeightMm,
			);
			heightLeft -= contentH;
		}

		pdf.save(`nota-purchase-${date || "draft"}.pdf`);
	};

	const canExport = invoiceItems.length > 0;

	const handleNewPurchase = () => {
		setSupplierId("");
		setNotes("");
		setItems([{ id: Math.random().toString(), itemTypeId: "", qty: "", unitCost: "", unitId: "" }]);
		setShowSuccessModal(false);
	};

	return (
		<Box component="form" onSubmit={handleSubmit}>
			<SuccessModal 
				open={showSuccessModal} 
				onClose={() => setShowSuccessModal(false)}
				onDownload={handleDownloadPdf}
				onNewPurchase={handleNewPurchase}
			/>
			{/* 2 kolom md+: jangan wrap */}
			<Box
				sx={{
					display: "flex",
					flexDirection: { xs: "column", md: "row" },
					gap: 2,
					alignItems: "flex-start",
				}}
			>
				{/* KIRI */}
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Stack spacing={3}>
						<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
							<Autocomplete
								value={activeSuppliers.find(s => s.id === supplierId) || null}
								onChange={async (event, newValue) => {
									if (newValue && (newValue as any).inputValue) {
										setCreatingSupplier(true);
										try {
											const newSup = await quickCreateSupplier((newValue as any).inputValue);
											setLocalSuppliers(prev => [...prev, newSup]);
											setSupplierId(newSup.id);
											setSnack({ open: true, message: `Supplier "${newSup.name}" berhasil ditambahkan`, severity: "success" });
										} catch (err) {
											setSnack({ open: true, message: "Gagal menambahkan supplier baru", severity: "error" });
										} finally {
											setCreatingSupplier(false);
										}
									} else {
										setSupplierId(newValue?.id || "");
									}
								}}
								filterOptions={(options, params) => {
									const filtered = supplierFilter(options, params);
									const { inputValue } = params;
									const isExisting = options.some((option) => inputValue.toLowerCase() === option.name.toLowerCase());
									if (inputValue !== '' && !isExisting) {
										filtered.push({
											inputValue,
											name: `Tambah "${inputValue}"`,
										} as any);
									}
									return filtered;
								}}
								selectOnFocus
								clearOnBlur
								handleHomeEndKeys
								options={activeSuppliers}
								getOptionLabel={(option) => {
									if (typeof option === 'string') return option;
									if ((option as any).inputValue) return (option as any).inputValue;
									return option.name;
								}}
								renderOption={(props, option) => {
									const { key, ...optionProps } = props as any;
									return (
										<li key={key} {...optionProps}>
											{option.name}
										</li>
									);
								}}
								fullWidth
								renderInput={(params) => (
									<TextField 
										{...params} 
										required
										label="Nama Pemilik Barang"
										placeholder="Pilih/Cari Supplier"
										InputProps={{
											...params.InputProps,
											endAdornment: (
												<>
													{creatingSupplier ? <CircularProgress color="inherit" size={20} /> : null}
													{params.InputProps.endAdornment}
												</>
											),
										}}
									/>
								)}
							/>
							<Box
								sx={{
									display: "flex",
									flexDirection: { xs: "column", md: "row" },
									gap: 2,
								}}
							>
								<TextField
									type="date"
									label="Tanggal"
									fullWidth
									value={date}
									onChange={(e) => setDate(e.target.value)}
									InputLabelProps={{ shrink: true }}
								/>
								<TextField
									fullWidth
									label="Catatan"
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
								/>
							</Box>
						</Box>

						<Box>
							<Box sx={{ mb: 2 }}>
								<Box sx={{ overflowX: "auto" }}>
									<GlassTable
										columns={columns}
										data={items}
									/>
								</Box>
							</Box>

							<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
								<GlassButton type="button" variant="secondary" onClick={addItem} size="sm">
									<AddIcon className="mr-1" fontSize="small" />
									Tambah Baris
								</GlassButton>
								<Typography variant="h6" sx={{ fontWeight: 700 }}>
									Total: {formatRupiah(grandTotal, 0)}
								</Typography>
							</Box>
						</Box>

						<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
							<GlassButton type="submit" variant="primary" disabled={saving}>
								<SaveIcon className="mr-2" fontSize="small" />
								Simpan Pembelian
							</GlassButton>
						</Box>
					</Stack>
				</Box>

				{/* KANAN */}
				<Box
					sx={{
						flexShrink: 0,
						width: { md: 420 },
						minWidth: 0,
					}}
				>
					<Box sx={{ position: { md: "sticky" }, top: { md: 20 } }}>
						<Stack spacing={1.5}>
							<Typography variant="h6" sx={{ fontWeight: 700 }}>
								Preview Nota (1/2 A4)
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
										aspectRatio: `${A5_W_MM} / ${A5_H_MM}`,
										overflow: "hidden",
										display: "flex",
										justifyContent: "center",
										alignItems: "flex-start",
										bgcolor: "white",
									}}
								>
									{/* Invoice asli scale supaya muat */}
									<Box
										sx={{
											transform: "scale(0.75)",
											transformOrigin: "top center",
											width: `${A5_W_MM}mm`,
										}}
									>
										<Invoice data={invoiceData} />
									</Box>
								</Box>
							</Box>

								
						</Stack>
					</Box>
				</Box>
			</Box>

			{/* NODE KHUSUS PRINT/PDF: disembunyikan, TANPA SCALE */}
			<Box
				sx={{
					position: "fixed",
					left: "-10000px",
					top: 0,
					width: `${A5_W_MM}mm`,
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

