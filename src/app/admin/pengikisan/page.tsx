"use client";

import { useMemo, useRef, useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import jsPDF from "jspdf";
import { createPengikisan } from "@/actions/pengikisan-actions";

type Row = {
	id: number;
	nama: string;
	kaKg: number;
	stikKg: number;
};

const UPAH_KA = 1000;
const UPAH_STIK = 1200;

const F4_W_MM = 210;
const F4_H_MM = 330;
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

/** Modal yang aman: kalau open=false, tidak render overlay sama sekali */
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
			{/* Backdrop */}
			<button
				type="button"
				aria-label="Tutup dialog"
				onClick={onClose}
				className="absolute inset-0 bg-black/40"
			/>

			{/* Panel */}
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

export default function PengikisanPage() {
	const [rows, setRows] = useState<Row[]>([
		{ id: 1, nama: "", kaKg: 0, stikKg: 0 },
	]);
	const [date, setDate] = useState(
		() => new Date().toISOString().split("T")[0]
	);
	const [notes, setNotes] = useState("");
	const [saving, setSaving] = useState(false);
	const [openPreview, setOpenPreview] = useState(false);
	const [lastSavedId, setLastSavedId] = useState<string | null>(null);

	// Form atas untuk menambah baris
	const [newNama, setNewNama] = useState("");
	const [newKaKg, setNewKaKg] = useState<string>("");
	const [newStikKg, setNewStikKg] = useState<string>("");

	const invoiceRef = useRef<HTMLDivElement>(null);

	const handleChange = (
		id: number,
		field: keyof Omit<Row, "id">,
		value: string
	) => {
		setRows((prev) =>
			prev.map((row) => {
				if (row.id !== id) return row;

				if (field === "kaKg" || field === "stikKg") {
					// izinkan kosong saat user hapus input
					if (value.trim() === "") return { ...row, [field]: 0 };

					// sanitasi angka
					const v = Number(value.replace(/[^0-9.]/g, ""));
					return { ...row, [field]: Number.isFinite(v) ? v : 0 };
				}

				return { ...row, [field]: value };
			})
		);
	};

	const addRow = () => {
		setRows((prev) => {
			const nextId = prev.length ? prev[prev.length - 1].id + 1 : 1;
			return [...prev, { id: nextId, nama: "", kaKg: 0, stikKg: 0 }];
		});
	};

	const removeRow = (id: number) => {
		setRows((prev) =>
			prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)
		);
	};

	const addFromForm = () => {
		const ka = Number(newKaKg);
		const st = Number(newStikKg);
		const namaTrimmed = newNama.trim();

		setRows((prev) => {
			// Kalau hanya ada 1 baris kosong, isi baris itu sebagai baris pertama.
			if (
				prev.length === 1 &&
				prev[0].nama === "" &&
				prev[0].kaKg === 0 &&
				prev[0].stikKg === 0
			) {
				return [
					{
						...prev[0],
						nama: namaTrimmed,
						kaKg: Number.isFinite(ka) ? ka : 0,
						stikKg: Number.isFinite(st) ? st : 0,
					},
				];
			}

			const nextId = prev.length ? prev[prev.length - 1].id + 1 : 1;
			return [
				...prev,
				{
					id: nextId,
					nama: namaTrimmed,
					kaKg: Number.isFinite(ka) ? ka : 0,
					stikKg: Number.isFinite(st) ? st : 0,
				},
			];
		});

		setNewNama("");
		setNewKaKg("");
		setNewStikKg("");
	};

	const getRowTotal = (row: Row) => row.kaKg * UPAH_KA + row.stikKg * UPAH_STIK;

	const totalSemua = useMemo(
		() => rows.reduce((sum, row) => sum + getRowTotal(row), 0),
		[rows]
	);

	const activeRows = useMemo(
		() => rows.filter((r) => r.nama || r.kaKg > 0 || r.stikKg > 0),
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
				items: rows.map((r) => ({
					nama: r.nama,
					kaKg: String(r.kaKg),
					stikKg: String(r.stikKg),
				})),
			};

			const res = await createPengikisan(payload);
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
			orientation: "p",
			unit: "mm",
			format: [F4_W_MM, F4_H_MM],
		});

		const margin = PRINT_MARGIN_MM;
		const pageW = F4_W_MM;
		const pageH = F4_H_MM;
		const lineY = (y: number) => Math.min(Math.max(y, margin), pageH - margin);

		const rowsForPrint = activeRows.length ? activeRows : rows;

		rowsForPrint.forEach((row, idx) => {
			if (idx > 0) pdf.addPage([pageW, pageH], "p");

			const jumlahKg = row.kaKg + row.stikKg;
			const total = getRowTotal(row);

			let y = margin + 4;

			if (logo) {
				const logoW = 30;
				const ratio = logo.height / logo.width || 1;
				const logoH = logoW * ratio;

				pdf.addImage(logo, "PNG", margin, y, logoW, logoH);

				pdf.setFont("helvetica", "bold");
				pdf.setFontSize(11);
				pdf.text("PT AURORA MITRA PRAKARSA", margin + logoW + 5, lineY(y + 5));
				pdf.setFontSize(9);
				pdf.text("Nota Pengikisan", margin + logoW + 5, lineY(y + 11));

				y += logoH + 4;
			} else {
				pdf.setFont("helvetica", "bold");
				pdf.setFontSize(12);
				pdf.text("Nota Pengikisan", pageW / 2, lineY(y), { align: "center" });
				y += 8;
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
			pdf.text(
				`KA (kg): ${row.kaKg.toLocaleString("id-ID")}`,
				margin,
				lineY(y)
			);
			y += 5;
			pdf.text(
				`STIK (kg): ${row.stikKg.toLocaleString("id-ID")}`,
				margin,
				lineY(y)
			);
			y += 5;
			pdf.text(
				`Jumlah (kg): ${jumlahKg.toLocaleString("id-ID")}`,
				margin,
				lineY(y)
			);
			y += 5;

			pdf.text(
				`Upah KA: Rp ${UPAH_KA.toLocaleString("id-ID")}/kg`,
				margin,
				lineY(y)
			);
			y += 5;
			pdf.text(
				`Upah STIK: Rp ${UPAH_STIK.toLocaleString("id-ID")}/kg`,
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

		pdf.save(`nota-pengikisan-perlembar-${date || "draft"}.pdf`);
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
			pdf.text("PT AURORA MITRA PRAKARSA", margin + logoW + 5, y + 5);
			pdf.setFontSize(9);
			pdf.text("Rekap Pengikisan", margin + logoW + 5, y + 11);

			y += logoH + 4;
		} else {
			pdf.setFont("helvetica", "bold");
			pdf.setFontSize(12);
			pdf.text("Rekap Pengikisan", pageW / 2, y, { align: "center" });
			y += 8;
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
		const colKaX = colNamaX + 70;
		const colStikX = colKaX + 25;
		const colJumlahX = colStikX + 25;
		const colTotalX = colJumlahX + 25;
		const rowHeight = 6;

		const tableTop = y;

		pdf.setFont("helvetica", "bold");
		pdf.setFontSize(9);
		pdf.text("No", colNoX, y);
		pdf.text("Nama", colNamaX, y);
		pdf.text("KA (kg)", colKaX, y);
		pdf.text("STIK (kg)", colStikX, y);
		pdf.text("Jumlah (kg)", colJumlahX, y);
		pdf.text("Total (Rp)", colTotalX, y);

		y += 2;

		pdf.setDrawColor(0, 0, 0);
		pdf.setLineWidth(0.2);

		const tableBottomY = tableTop + rowHeight * (activeRows.length + 2);

		pdf.line(colNoX - 2, tableTop - 3, colTotalX + 25, tableTop - 3);
		pdf.line(colNoX - 2, tableBottomY, colTotalX + 25, tableBottomY);

		const colXs = [
			colNoX - 2,
			colNoX + 8,
			colNamaX + 60,
			colKaX + 20,
			colStikX + 20,
			colJumlahX + 20,
			colTotalX + 25,
		];
		colXs.forEach((x) => {
			pdf.line(x, tableTop - 3, x, tableBottomY);
		});

		y = tableTop + rowHeight;
		pdf.setFont("helvetica", "normal");

		const rowsForPrint = activeRows.length ? activeRows : rows;

		rowsForPrint.forEach((row, idx) => {
			const jumlahKg = row.kaKg + row.stikKg;
			const total = getRowTotal(row);

			pdf.text(String(idx + 1), colNoX, y);
			pdf.text(row.nama || "-", colNamaX, y);
			pdf.text(row.kaKg.toLocaleString("id-ID"), colKaX, y, {
				align: "right",
			});
			pdf.text(row.stikKg.toLocaleString("id-ID"), colStikX, y, {
				align: "right",
			});
			pdf.text(jumlahKg.toLocaleString("id-ID"), colJumlahX, y, {
				align: "right",
			});
			pdf.text(`Rp ${total.toLocaleString("id-ID")}`, colTotalX + 20, y, {
				align: "right",
			});

			y += rowHeight;
		});

		y += 4;

		pdf.setFont("helvetica", "bold");
		pdf.text("Total Semua", colJumlahX, y);
		pdf.text(`Rp ${totalSemua.toLocaleString("id-ID")}`, colTotalX + 20, y, {
			align: "right",
		});

		pdf.save(`nota-pengikisan-rekap-${date || "draft"}.pdf`);
	};

	return (
		<div className="space-y-4">
			<form onSubmit={handleSubmit}>
				<GlassCard className="p-4 md:p-6">
					<div className="flex items-start justify-between mb-4 gap-4">
						<div>
							<div className="text-lg font-semibold">Pengikisan</div>
							<div className="text-xs text-secondary">
								Input jumlah kilo per jenis (KA dan STIK)
							</div>

							<div className="mt-4 rounded-2xl glass px-3 py-3 md:px-4 md:py-4 shadow-soft">
								<div className="flex items-center justify-between gap-3 mb-3">
									<div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-primary">
										Form Input Pengikisan
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
											placeholder="Opsional"
										/>
									</div>
								</div>
								<div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
									<div className="md:col-span-2 flex flex-col gap-1">
										<span className="text-[11px] font-medium text-primary">
											Nama pekerja
										</span>
										<input
											type="text"
											value={newNama}
											onChange={(e) => setNewNama(e.target.value.toUpperCase())}
											className="w-full px-2 py-1.5 rounded-xl border border-[var(--glass-border)] bg-[rgba(255,255,255,0.98)] text-sm outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-[var(--brand)] uppercase tracking-wide"
											placeholder="Masukkan nama"
										/>
									</div>
									<div className="flex flex-col gap-1">
										<span className="text-[11px] font-medium text-primary">
											KA (kg)
										</span>
										<input
											type="number"
											min={0}
											value={newKaKg}
											onChange={(e) => setNewKaKg(e.target.value)}
											className="w-full px-2 py-1.5 text-right rounded-xl border border-[var(--glass-border)] bg-[rgba(255,255,255,0.98)] text-sm outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-[var(--brand)]"
											placeholder="0"
											inputMode="decimal"
										/>
									</div>
									<div className="flex flex-col gap-1">
										<span className="text-[11px] font-medium text-primary">
											STIK (kg)
										</span>
										<input
											type="number"
											min={0}
											value={newStikKg}
											onChange={(e) => setNewStikKg(e.target.value)}
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

						<div className="text-xs text-secondary text-right">
							<div>Upah KA: Rp {UPAH_KA.toLocaleString("id-ID")}/kg</div>
							<div>Upah STIK: Rp {UPAH_STIK.toLocaleString("id-ID")}/kg</div>
						</div>
					</div>

					<div className="overflow-x-auto border border-[var(--glass-border)] rounded-xl">
						<table className="w-full text-sm text-left">
							<thead className="text-xs uppercase tracking-wider text-black bg-[rgba(255,255,255,0.08)] border-b border-[var(--glass-border)]">
								<tr>
									<th className="px-3 py-3 w-10 text-center">No</th>
									<th className="px-3 py-3 min-w-[160px]">Nama</th>
									<th className="px-3 py-3 text-center" colSpan={2}>
										Jenis
									</th>
									<th className="px-3 py-3 text-right min-w-[120px]">
										Jumlah (kg)
									</th>
									<th className="px-3 py-3 text-right min-w-[140px]">
										Total (Rp)
									</th>
									<th className="px-3 py-3 w-16 text-center">Aksi</th>
								</tr>
								<tr className="border-t border-[var(--glass-border)] bg-[rgba(255,255,255,0.04)]">
									<th />
									<th />
									<th className="px-3 py-2 text-center min-w-[90px] border-l border-[var(--glass-border)]">
										KA
									</th>
									<th className="px-3 py-2 text-center min-w-[90px] border-r border-[var(--glass-border)]">
										STIK
									</th>
									<th />
									<th />
									<th />
								</tr>
							</thead>

							<tbody className="divide-y divide-[var(--glass-border)]">
								{rows.map((row, index) => {
									const jumlahKg = row.kaKg + row.stikKg;
									const total = getRowTotal(row);

									return (
										<tr
											key={row.id}
											className="hover:bg-[rgba(255,255,255,0.04)]"
										>
											<td className="px-3 py-2 text-center text-secondary">
												{index + 1}
											</td>

											<td className="px-3 py-2">
												<input
													type="text"
													value={row.nama}
													onChange={(e) =>
														handleChange(row.id, "nama", e.target.value)
													}
													className="w-full px-2 py-1.5 rounded-lg border border-[var(--glass-border)] bg-[rgba(255,255,255,0.9)] text-sm outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-[var(--brand)]"
													placeholder="Nama"
												/>
											</td>

											<td className="px-3 py-2">
												<input
													type="number"
													min={0}
													value={row.kaKg === 0 ? "" : row.kaKg}
													onChange={(e) =>
														handleChange(row.id, "kaKg", e.target.value)
													}
													className="w-full px-2 py-1.5 text-right rounded-lg border border-[var(--glass-border)] bg-[rgba(255,255,255,0.9)] text-sm outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-[var(--brand)]"
													placeholder="0"
													inputMode="decimal"
												/>
											</td>

											<td className="px-3 py-2">
												<input
													type="number"
													min={0}
													value={row.stikKg === 0 ? "" : row.stikKg}
													onChange={(e) =>
														handleChange(row.id, "stikKg", e.target.value)
													}
													className="w-full px-2 py-1.5 text-right rounded-lg border border-[var(--glass-border)] bg-[rgba(255,255,255,0.9)] text-sm outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-[var(--brand)]"
													placeholder="0"
													inputMode="decimal"
												/>
											</td>

											<td className="px-3 py-2 text-right text-secondary">
												{jumlahKg.toLocaleString("id-ID")}
											</td>

											<td className="px-3 py-2 text-right font-semibold">
												Rp {total.toLocaleString("id-ID")}
											</td>

											<td className="px-3 py-2 text-center">
												<button
													type="button"
													onClick={() => removeRow(row.id)}
													className="text-xs text-red-600 hover:text-red-700 disabled:opacity-40"
													disabled={rows.length <= 1}
												>
													Hapus
												</button>
											</td>
										</tr>
									);
								})}
							</tbody>

							<tfoot className="border-t border-[var(--glass-border)] bg-[rgba(255,255,255,0.04)]">
								<tr>
									<td className="px-3 py-3 text-xs text-secondary" colSpan={4}>
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
						<div className="flex gap-2"></div>

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
				title="Preview Nota Pengikisan"
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
						style={{
							transform: "scale(0.7)",
							transformOrigin: "top center",
						}}
					>
						<div
							ref={invoiceRef}
							className="bg-white text-black border border-gray-300 rounded-lg shadow-sm"
							style={{
								width: "210mm",
								minHeight: "330mm",
								padding: "10mm",
							}}
						>
							<div className="flex items-start justify-between mb-3 border-b border-gray-300 pb-2">
								<div className="flex items-center gap-2">
									<img
										src="/logoAMP.png"
										alt="Logo PT AMP"
										className="h-10 w-auto"
									/>
									<div>
										<div className="font-bold text-xs tracking-wide">
											PT AURORA MITRA PRAKARSA
										</div>
										<div className="text-[10px]">Rekap Pengikisan</div>
									</div>
								</div>
								<div className="text-right text-[10px] space-y-0.5">
									<div>
										Tanggal:{" "}
										{date ? new Date(date).toLocaleDateString("id-ID") : "-"}
									</div>
									{notes && <div>Catatan: {notes}</div>}
								</div>
							</div>

							<table className="w-full text-[10px] border border-black border-collapse">
								<thead>
									<tr>
										<th className="border border-black px-1 py-0.5 w-8">No</th>
										<th className="border border-black px-1 py-0.5">Nama</th>
										<th className="border border-black px-1 py-0.5" colSpan={2}>
											Jenis
										</th>
										<th className="border border-black px-1 py-0.5 w-16">
											Jumlah
										</th>
										<th className="border border-black px-1 py-0.5 w-20">
											Total
										</th>
									</tr>
									<tr>
										<th className="border border-black px-1 py-0.5" />
										<th className="border border-black px-1 py-0.5" />
										<th className="border border-black px-1 py-0.5 w-12">KA</th>
										<th className="border border-black px-1 py-0.5 w-12">
											STIK
										</th>
										<th className="border border-black px-1 py-0.5" />
										<th className="border border-black px-1 py-0.5" />
									</tr>
								</thead>

								<tbody>
									{activeRows.map((row, idx) => {
										const total = getRowTotal(row);
										const jumlahKg = row.kaKg + row.stikKg;

										return (
											<tr key={row.id}>
												<td className="border border-black px-1 py-0.5 text-center">
													{idx + 1}
												</td>
												<td className="border border-black px-1 py-0.5">
													{row.nama || "-"}
												</td>
												<td className="border border-black px-1 py-0.5 text-right">
													{row.kaKg.toLocaleString("id-ID")}
												</td>
												<td className="border border-black px-1 py-0.5 text-right">
													{row.stikKg.toLocaleString("id-ID")}
												</td>
												<td className="border border-black px-1 py-0.5 text-right">
													{jumlahKg.toLocaleString("id-ID")} kg
												</td>
												<td className="border border-black px-1 py-0.5 text-right">
													Rp {total.toLocaleString("id-ID")}
												</td>
											</tr>
										);
									})}
								</tbody>

								<tfoot>
									<tr>
										<td
											className="border border-black px-1 py-0.5 text-right"
											colSpan={5}
										>
											Total
										</td>
										<td className="border border-black px-1 py-0.5 text-right font-semibold">
											Rp {totalSemua.toLocaleString("id-ID")}
										</td>
									</tr>
								</tfoot>
							</table>
						</div>
					</div>
				</div>
			</SafeModal>
		</div>
	);
}
