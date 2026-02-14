"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import jsPDF from "jspdf";
import DeleteIcon from "@mui/icons-material/Delete";
import { createPemotongan } from "@/actions/pemotongan-actions";
import { Autocomplete, TextField } from "@mui/material";
import { getWorkers, WorkerDTO } from "@/actions/worker-actions";

type Row = {
	id: number;
	nama: string;
	qty: number;
};

const F4_W_MM = 210;
const F4_H_MM = 330;
const PER_LEMBAR_H_MM = 100;
const PRINT_MARGIN_MM = 10;

let logoImagePromise: Promise<HTMLImageElement | null> | null = null;

function loadLogoImage() {
	if (logoImagePromise) return logoImagePromise;

	logoImagePromise = new Promise((resolve) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => resolve(null);
		img.src = "/logoAMP.png";
	});

	return logoImagePromise;
}

function SafeModal({
	open,
	title,
	onClose,
	children,
	footer,
}: {
	open: boolean;
	title?: string;
	onClose: () => void;
	children: React.ReactNode;
	footer?: React.ReactNode;
}) {
	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
			role="dialog"
			aria-modal="true"
		>
			<button
				type="button"
				aria-label="Tutup dialog"
				onClick={onClose}
				className="absolute inset-0 bg-black/40"
			/>

			<div className="relative w-full max-w-lg max-h-[90vh] rounded-2xl border border-[var(--glass-border)] bg-white/95 text-black shadow-xl flex flex-col">
				<div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-black/10">
					<div className="font-semibold text-sm">{title ?? "Dialog"}</div>
					<button
						type="button"
						onClick={onClose}
						className="text-xs px-2 py-1 rounded-md border border-black/20 hover:bg-black/5"
					>
						Tutup
					</button>
				</div>

				<div className="p-4 overflow-auto flex-1">{children}</div>

				{footer ? (
					<div className="px-4 py-3 border-t border-black/10 flex justify-end gap-2">
						{footer}
					</div>
				) : null}
			</div>
		</div>
	);
}

export default function PemotonganPage() {
	const [rows, setRows] = useState<Row[]>([{ id: 1, nama: "", qty: 0 }]);
	const [date, setDate] = useState(
		() => new Date().toISOString().split("T")[0]
	);
	const [notes, setNotes] = useState("");
	const [saving, setSaving] = useState(false);
	const [openPreview, setOpenPreview] = useState(false);
	const [lastSavedId, setLastSavedId] = useState<string | null>(null);
    const [workerOptions, setWorkerOptions] = useState<WorkerDTO[]>([]);

    useEffect(() => {
        getWorkers().then((data) => {
            setWorkerOptions(data.filter((w) => w.isActive));
        });
    }, []);

	const [upahPerKg, setUpahPerKg] = useState<string>("0");

	const [newNama, setNewNama] = useState("");
	const [newQty, setNewQty] = useState<string>("");

	const invoiceRef = useRef<HTMLDivElement>(null);

	const addRow = () => {
		setRows((prev) => {
			const nextId = prev.length ? prev[prev.length - 1].id + 1 : 1;
			return [...prev, { id: nextId, nama: "", qty: 0 }];
		});
	};

	const removeRow = (id: number) => {
		setRows((prev) => prev.filter((r) => r.id !== id));
	};

	const addFromForm = () => {
		const qty = Number(newQty);
		const namaTrimmed = newNama.trim();

		setRows((prev) => {
			if (prev.length === 1 && prev[0].nama === "" && prev[0].qty === 0) {
				return [
					{
						...prev[0],
						nama: namaTrimmed,
						qty: Number.isFinite(qty) ? qty : 0,
					},
				];
			}

			const nextId = prev.length ? prev[prev.length - 1].id + 1 : 1;
			return [
				...prev,
				{
					id: nextId,
					nama: namaTrimmed,
					qty: Number.isFinite(qty) ? qty : 0,
				},
			];
		});

		setNewNama("");
		setNewQty("");
	};

	const handleChange = (id: number, field: keyof Row, value: string) => {
		setRows((prev) =>
			prev.map((r) =>
				r.id === id
					? {
							...r,
							[field]:
								field === "nama"
									? value
									: Number.isFinite(Number(value))
									? Number(value)
									: 0,
					  }
					: r
			)
		);
	};

	const getRowTotal = (row: Row) => {
		const q = Number.isFinite(row.qty) ? row.qty : 0;
		const upah = parseFloat(upahPerKg || "0");
		return q * upah;
	};

	const totalSemua = useMemo(
		() => rows.reduce((sum, row) => sum + getRowTotal(row), 0),
		[rows, upahPerKg]
	);

	const activeRows = useMemo(
		() => rows.filter((r) => r.nama || r.qty > 0),
		[rows]
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!date) return;

		try {
			setSaving(true);

			const payload = {
				date,
				notes: notes || null,
				upahPerKg,
				items: rows.map((r) => ({
					nama: r.nama,
					qty: String(r.qty),
				})),
			};

			const res = await createPemotongan(payload);
			if (res?.success) {
				setLastSavedId(res.id);
				setOpenPreview(true);
			}
		} finally {
			setSaving(false);
		}
	};

	const handleDownloadPerLembar = async () => {
		const logo = await loadLogoImage();

		const pdf = new jsPDF({
			orientation: "l",
			unit: "mm",
			format: [F4_W_MM, PER_LEMBAR_H_MM],
		});

		const margin = PRINT_MARGIN_MM;
		const pageW = F4_W_MM;
		const pageH = PER_LEMBAR_H_MM;
		const lineY = (y: number) => Math.min(Math.max(y, margin), pageH - margin);

		const rowsForPrint = activeRows.length ? activeRows : rows;

		rowsForPrint.forEach((row, idx) => {
			if (idx > 0) pdf.addPage([pageW, pageH], "l");

			const total = getRowTotal(row);

			let y = margin + 4;

			if (logo) {
				const logoW = 26;
				const ratio = logo.height / logo.width || 1;
				const logoH = logoW * ratio;

				pdf.addImage(logo, "PNG", margin, y, logoW, logoH);

				pdf.setFont("helvetica", "bold");
				pdf.setFontSize(11);
				pdf.text(
					"PT AURORA MITRA PRAKARSA (AMP)",
					margin + logoW + 6,
					lineY(y + 5)
				);

				pdf.setFont("helvetica", "normal");
				pdf.setFontSize(7);
				pdf.text(
					"(General Contractor, Supplier, Infrastructure)",
					margin + logoW + 6,
					lineY(y + 11)
				);

				pdf.setFont("helvetica", "bold");
				pdf.setFontSize(9);
				pdf.text("NOTA PEMOTONGAN", pageW - margin, lineY(y + 5), {
					align: "right",
				});

				y += logoH + 6;

				pdf.setDrawColor(26, 35, 126);
				pdf.setLineWidth(0.4);
				pdf.line(margin, lineY(y), pageW - margin, lineY(y));
				y += 4;
			} else {
				pdf.setFont("helvetica", "bold");
				pdf.setFontSize(12);
				pdf.text("NOTA PEMOTONGAN", pageW / 2, lineY(y), { align: "center" });
				y += 8;
				pdf.setDrawColor(26, 35, 126);
				pdf.setLineWidth(0.4);
				pdf.line(margin, lineY(y), pageW - margin, lineY(y));
				y += 4;
			}

			pdf.setFont("helvetica", "normal");
			pdf.setFontSize(9);
			pdf.text(
				`Tanggal: ${date ? new Date(date).toLocaleDateString("id-ID") : "-"}`,
				margin,
				lineY(y)
			);
			y += 5;

			pdf.setFont("helvetica", "bold");
			pdf.text(`Nama: ${row.nama || "-"}`, margin, lineY(y));
			y += 6;

			pdf.setFont("helvetica", "normal");
			pdf.setFontSize(9);
			pdf.text(
				`Hasil Potong: ${row.qty.toLocaleString("id-ID")} Kg`,
				margin,
				lineY(y)
			);
			y += 5;

			const upah = parseFloat(upahPerKg || "0");
			pdf.text(
				`Upah per Kg: Rp ${upah.toLocaleString("id-ID")}`,
				margin,
				lineY(y)
			);
			y += 7;

			pdf.setDrawColor(0, 0, 0);
			pdf.setLineWidth(0.3);
			pdf.line(margin, lineY(y), pageW - margin, lineY(y));
			y += 7;

			pdf.setFont("helvetica", "bold");
			pdf.setFontSize(11);
			pdf.text(
				`Total: Rp ${total.toLocaleString("id-ID")}`,
				pageW - margin,
				lineY(y),
				{ align: "right" }
			);
		});

		pdf.save(`nota-pemotongan-perlembar-${date || "draft"}.pdf`);
	};

	const handleDownloadPdf = async () => {
		const logo = await loadLogoImage();

		const pdf = new jsPDF({
			orientation: "p",
			unit: "mm",
			format: [F4_W_MM, F4_H_MM],
		});

		const margin = PRINT_MARGIN_MM;
		const pageW = F4_W_MM;
		const pageH = F4_H_MM;

		let y = margin + 4;

		if (logo) {
			const logoW = 26;
			const ratio = logo.height / logo.width || 1;
			const logoH = logoW * ratio;

			pdf.addImage(logo, "PNG", margin, y, logoW, logoH);

			pdf.setFont("helvetica", "bold");
			pdf.setFontSize(11);
			pdf.text("PT AURORA MITRA PRAKARSA (AMP)", margin + logoW + 6, y + 5);

			pdf.setFont("helvetica", "normal");
			pdf.setFontSize(7);
			pdf.text(
				"(General Contractor, Supplier, Infrastructure)",
				margin + logoW + 6,
				y + 11
			);

			pdf.setFont("helvetica", "bold");
			pdf.setFontSize(9);
			pdf.text("REKAP PEMOTONGAN", pageW - margin, y + 5, { align: "right" });

			y += logoH + 6;

			pdf.setDrawColor(26, 35, 126);
			pdf.setLineWidth(0.4);
			pdf.line(margin, y, pageW - margin, y);
			y += 4;
		} else {
			pdf.setFont("helvetica", "bold");
			pdf.setFontSize(12);
			pdf.text("REKAP PEMOTONGAN", pageW / 2, y, { align: "center" });
			y += 8;
			pdf.setDrawColor(26, 35, 126);
			pdf.setLineWidth(0.4);
			pdf.line(margin, y, pageW - margin, y);
			y += 4;
		}

		pdf.setFont("helvetica", "normal");
		pdf.setFontSize(9);
		pdf.text(
			`Tanggal: ${date ? new Date(date).toLocaleDateString("id-ID") : "-"}`,
			margin,
			y
		);
		y += 5;
		if (notes) {
			pdf.text(`Catatan: ${notes}`, margin, y);
			y += 5;
		}

		y += 2;

		const colNoX = margin;
		const colNamaX = colNoX + 12;
		const colQtyX = colNamaX + 60;
		const colTotalX = colQtyX + 25;
		const rowHeight = 6;

		const tableTop = y;

		pdf.setFont("helvetica", "bold");
		pdf.setFontSize(9);
		pdf.text("No", colNoX, y);
		pdf.text("Nama", colNamaX, y);
		pdf.text("Hasil (Kg)", colQtyX, y);
		pdf.text("Total (Rp)", colTotalX, y);

		y += 2;

		pdf.setDrawColor(0, 0, 0);
		pdf.setLineWidth(0.2);

		const rowsForPrint = activeRows.length ? activeRows : rows;
		const tableBottomY = tableTop + rowHeight * (rowsForPrint.length + 2);

		pdf.line(colNoX - 2, tableTop - 3, colTotalX + 25, tableTop - 3);
		pdf.line(colNoX - 2, tableBottomY, colTotalX + 25, tableBottomY);

		const colXs = [
			colNoX - 2,
			colNoX + 8,
			colNamaX + 60,
			colQtyX + 20,
			colTotalX + 25,
		];
		colXs.forEach((x) => {
			pdf.line(x, tableTop - 3, x, tableBottomY);
		});

		y = tableTop + rowHeight;
		pdf.setFont("helvetica", "normal");

		rowsForPrint.forEach((row, idx) => {
			const total = getRowTotal(row);

			pdf.text(String(idx + 1), colNoX, y);
			pdf.text(row.nama || "-", colNamaX, y);
			pdf.text(row.qty.toLocaleString("id-ID"), colQtyX, y, {
				align: "right",
			});
			pdf.text(`Rp ${total.toLocaleString("id-ID")}`, colTotalX + 20, y, {
				align: "right",
			});

			y += rowHeight;
		});

		y += 4;

		pdf.setFont("helvetica", "bold");
		pdf.text("Total Semua", colQtyX, y);
		pdf.text(`Rp ${totalSemua.toLocaleString("id-ID")}`, colTotalX + 20, y, {
			align: "right",
		});

		pdf.save(`nota-pemotongan-rekap-${date || "draft"}.pdf`);
	};

	return (
		<div className="space-y-4">
			<form onSubmit={handleSubmit}>
				<GlassCard className="p-4 md:p-6">
					<div className="flex items-start justify-between mb-4 gap-4">
						<div>
							<div className="text-lg font-semibold">Pemotongan</div>
							<div className="text-xs text-secondary">
								Input hasil potong (Kg) per pekerja
							</div>

							<div className="mt-4 rounded-2xl glass px-3 py-3 md:px-4 md:py-4 shadow-soft">
								<div className="flex items-center justify-between gap-3 mb-3">
									<div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-primary">
										Form Input Pemotongan
									</div>
									<div className="hidden md:block text-[11px] text-secondary">
										Tambahkan baris pekerja dengan cepat
									</div>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
									<div className="flex flex-col gap-1">
										<span className="text-[11px] font-medium text-primary">
											Tanggal
										</span>
										<input
											type="date"
											value={date}
											onChange={(e) => setDate(e.target.value)}
											className="w-full px-2 py-1.5 rounded-xl border border-[var(--glass-border)] bg-[rgba(255,255,255,0.95)] text-xs outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-[var(--brand)]"
										/>
									</div>
									<div className="md:col-span-2 flex flex-col gap-1">
										<span className="text-[11px] font-medium text-primary">
											Catatan
										</span>
										<input
											type="text"
											value={notes}
											onChange={(e) => setNotes(e.target.value)}
											className="w-full px-2 py-1.5 rounded-xl border border-[var(--glass-border)] bg-[rgba(255,255,255,0.95)] text-xs outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-[var(--brand)]"
											placeholder="Catatan tambahan (opsional)"
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mt-3">
									<div className="flex flex-col gap-1 md:col-span-1">
										<span className="text-[11px] font-medium text-primary">
											Nama
										</span>
                                        <Autocomplete
											options={workerOptions.map((w) => w.name)}
											value={newNama || null}
											onChange={(_, newValue) => setNewNama(newValue ?? "")}
											renderInput={(params) => (
												<TextField
													{...params}
													placeholder="Pilih Nama"
													size="small"
													sx={{
														"& .MuiOutlinedInput-root": {
															borderRadius: "0.75rem",
															backgroundColor: "rgba(255,255,255,0.98)",
															fontSize: "0.875rem",
															padding: "2px 8px !important",
															"& fieldset": {
																borderColor: "var(--glass-border)",
															},
															"&:hover fieldset": {
																borderColor: "var(--brand)",
															},
															"&.Mui-focused fieldset": {
																borderColor: "var(--brand)",
																borderWidth: "2px",
															},
														},
														"& input": {
															textTransform: "uppercase",
															letterSpacing: "0.025em",
															padding: "4px 0 !important",
														},
													}}
												/>
											)}
										/>
									</div>
									<div className="flex flex-col gap-1">
										<span className="text-[11px] font-medium text-primary">
											Hasil (Kg)
										</span>
										<input
											type="number"
											min={0}
											value={newQty}
											onChange={(e) => setNewQty(e.target.value)}
											className="w-full px-2 py-1.5 text-right rounded-xl border border-[var(--glass-border)] bg-[rgba(255,255,255,0.98)] text-sm outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-[var(--brand)]"
											placeholder="0"
											inputMode="decimal"
										/>
									</div>
									<div className="flex items-end">
										<GlassButton
											type="button"
											variant="primary"
											className="w-full justify-center shadow-[0_8px_18px_rgba(213,14,12,0.3)]"
											onClick={addFromForm}
										>
											Tambahkan
										</GlassButton>
									</div>
								</div>
							</div>
						</div>

						<div className="text-xs text-secondary text-right space-y-1">
							<div className="flex flex-col gap-1">
								<span className="text-[11px] font-medium text-primary">
									Upah per Kg
								</span>
								<input
									type="number"
									min={0}
									value={upahPerKg}
									onChange={(e) => setUpahPerKg(e.target.value)}
									className="w-full px-2 py-1.5 text-right rounded-xl border border-[var(--glass-border)] bg-[rgba(255,255,255,0.98)] text-xs outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-[var(--brand)]"
									inputMode="decimal"
								/>
							</div>
						</div>
					</div>

					<div className="overflow-x-auto border border-[var(--glass-border)] rounded-xl">
						<table className="w-full text-sm text-left">
							<thead className="text-xs uppercase tracking-wider text-black bg-[rgba(255,255,255,0.08)] border-b border-[var(--glass-border)]">
								<tr>
									<th className="px-3 py-3 w-10 text-center">No</th>
									<th className="px-3 py-3 min-w-[160px]">Nama</th>
									<th className="px-3 py-3 text-center min-w-[90px]">
										Hasil (Kg)
									</th>
									<th className="px-3 py-3 text-right min-w-[140px]">
										Total (Rp)
									</th>
									<th className="px-3 py-3 w-16 text-center">Aksi</th>
								</tr>
							</thead>
							<tbody>
								{rows.map((row, idx) => {
									const total = getRowTotal(row);
									return (
										<tr
											key={row.id}
											className="border-b border-[var(--glass-border)]"
										>
											<td className="px-3 py-2 text-center">{idx + 1}</td>
											<td className="px-3 py-2">
                                                <Autocomplete
                                                    options={workerOptions.map((w) => w.name)}
                                                    value={row.nama || null}
                                                    onChange={(_, newValue) =>
                                                        handleChange(row.id, "nama", newValue ?? "")
                                                    }
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            placeholder="Pilih Nama"
                                                            size="small"
                                                            sx={{
                                                                "& .MuiOutlinedInput-root": {
                                                                    borderRadius: "0.5rem",
                                                                    backgroundColor: "rgba(255,255,255,0.9)",
                                                                    fontSize: "0.875rem",
                                                                    padding: "2px 8px !important",
                                                                    "& fieldset": {
                                                                        borderColor: "var(--glass-border)",
                                                                    },
                                                                    "&:hover fieldset": {
                                                                        borderColor: "var(--brand)",
                                                                    },
                                                                    "&.Mui-focused fieldset": {
                                                                        borderColor: "var(--brand)",
                                                                        borderWidth: "2px",
                                                                    },
                                                                },
                                                                "& input": {
                                                                    textTransform: "uppercase",
                                                                    letterSpacing: "0.025em",
                                                                    padding: "4px 0 !important",
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                />
											</td>
											<td className="px-3 py-2">
												<input
													type="number"
													min={0}
													value={row.qty === 0 ? "" : row.qty}
													onChange={(e) =>
														handleChange(row.id, "qty", e.target.value)
													}
													className="w-full px-2 py-1.5 text-right rounded-lg border border-[var(--glass-border)] bg-[rgba(255,255,255,0.9)] text-sm outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-[var(--brand)]"
													placeholder="0"
													inputMode="decimal"
												/>
											</td>

											<td className="px-3 py-2 text-right font-semibold">
												Rp {total.toLocaleString("id-ID")}
											</td>

											<td className="px-3 py-2 text-center">
												<button
													type="button"
													onClick={() => removeRow(row.id)}
													className="inline-flex items-center justify-center text-red-600 hover:text-red-700"
												>
													<DeleteIcon fontSize="small" />
												</button>
											</td>
										</tr>
									);
								})}
							</tbody>

							<tfoot className="border-t border-[var(--glass-border)] bg-[rgba(255,255,255,0.04)]">
								<tr>
									<td className="px-3 py-3 text-xs text-secondary" colSpan={2}>
										Baris bisa ditambah.
									</td>
									<td className="px-3 py-3 text-right text-sm font-semibold">
										Total Semua
									</td>
									<td className="px-3 py-3 text-right text-sm font-bold">
										Rp {totalSemua.toLocaleString("id-ID")}
									</td>
									<td />
								</tr>
							</tfoot>
						</table>
					</div>

					<div className="mt-4 flex flex-wrap items-center justify-between gap-2">
						<div className="flex gap-2">
							<button
								type="button"
								onClick={addRow}
								className="text-xs rounded-lg border border-[var(--glass-border)] px-3 py-1.5 bg-[rgba(255,255,255,0.9)] hover:bg-[rgba(255,255,255,1)]"
							>
								Tambah baris
							</button>
						</div>

						<GlassButton type="submit" variant="primary" disabled={saving}>
							{saving ? "Menyimpan..." : "Simpan ke Database"}
						</GlassButton>
					</div>

					{lastSavedId && (
						<div className="mt-2 text-xs text-green-700">
							Tersimpan dengan ID #{lastSavedId}
						</div>
					)}
				</GlassCard>
			</form>

			<SafeModal
				open={openPreview}
				title="Preview Rekap Pemotongan"
				onClose={() => setOpenPreview(false)}
				footer={
					<>
						<GlassButton variant="ghost" onClick={() => setOpenPreview(false)}>
							Tutup
						</GlassButton>
						<GlassButton variant="primary" onClick={handleDownloadPerLembar}>
							Download Per Lembar
						</GlassButton>
						<GlassButton variant="primary" onClick={handleDownloadPdf}>
							Download Rekap
						</GlassButton>
					</>
				}
			>
				<div className="flex justify-center">
					<div
						ref={invoiceRef}
						className="bg-white text-black border border-gray-300 rounded-lg shadow-sm w-full max-w-xl p-4 text-xs"
					>
						<div className="mb-3 flex items-center justify-between">
							<div className="font-semibold text-sm">Rekap Pemotongan</div>
							<div className="text-right space-y-0.5">
								<div>
									Tanggal:{" "}
									{date ? new Date(date).toLocaleDateString("id-ID") : "-"}
								</div>
								{notes ? <div>Catatan: {notes}</div> : null}
							</div>
						</div>

						<table className="w-full text-xs">
							<thead>
								<tr className="font-semibold">
									<td className="py-1">No</td>
									<td className="py-1">Nama</td>
									<td className="py-1 text-right">Hasil (Kg)</td>
									<td className="py-1 text-right">Total (Rp)</td>
								</tr>
							</thead>
							<tbody>
								{(activeRows.length ? activeRows : rows).map((row, idx) => {
									const total = getRowTotal(row);
									return (
										<tr key={row.id}>
											<td className="py-1">{idx + 1}</td>
											<td className="py-1">{row.nama || "-"}</td>
											<td className="py-1 text-right">
												{row.qty.toLocaleString("id-ID")}
											</td>
											<td className="py-1 text-right">
												Rp {total.toLocaleString("id-ID")}
											</td>
										</tr>
									);
								})}
							</tbody>
							<tfoot>
								<tr className="font-semibold">
									<td colSpan={3} className="py-1 text-right">
										Total Semua
									</td>
									<td className="py-1 text-right">
										Rp {totalSemua.toLocaleString("id-ID")}
									</td>
								</tr>
							</tfoot>
						</table>
					</div>
				</div>
			</SafeModal>
		</div>
	);
}
