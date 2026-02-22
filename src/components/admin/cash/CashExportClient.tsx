"use client";

import jsPDF from "jspdf";
import * as XLSX from "xlsx";

type Props = {
	rangeLabel: string;
	pendapatan: number;
	pengeluaran: number;
	saldo: number;
	pembelian: number;
	biayaProduksiInputs: number;
	biayaUpahPengikisan: number;
	biayaUpahPemotongan: number;
	biayaUpahPenjemuran: number;
	biayaUpahPengemasan: number;
	biayaUpahPensortiran: number;
	biayaUpahQcPotongSortir: number;
	totalExpense: number;
	totalExpenseDraft: number;
};

function toCurrencyClient(n: number) {
	try {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			maximumFractionDigits: 0,
		}).format(n || 0);
	} catch {
		return `Rp ${Math.round(n || 0).toLocaleString("id-ID")}`;
	}
}

export default function CashExportClient({
	rangeLabel,
	pendapatan,
	pengeluaran,
	saldo,
	pembelian,
	biayaProduksiInputs,
	biayaUpahPengikisan,
	biayaUpahPemotongan,
	biayaUpahPenjemuran,
	biayaUpahPengemasan,
	biayaUpahPensortiran,
	biayaUpahQcPotongSortir,
	totalExpense,
	totalExpenseDraft,
}: Props) {
	const handleDownloadExcel = () => {
		const rows: (string | number)[][] = [
			["Periode", rangeLabel],
			[],
			["Ringkasan"],
			["Pendapatan", pendapatan],
			["Pengeluaran", pengeluaran],
			["Saldo", saldo],
			[],
			["Rincian Pengeluaran"],
			["Pembelian", pembelian],
			["Biaya Produksi (Input)", biayaProduksiInputs],
			["Upah Pengikisan", biayaUpahPengikisan],
			["Upah Pemotongan", biayaUpahPemotongan],
			["Upah Penjemuran", biayaUpahPenjemuran],
			["Upah Pengemasan", biayaUpahPengemasan],
			["Upah Pensortiran", biayaUpahPensortiran],
			["Upah QC Potong & Sortir", biayaUpahQcPotongSortir],
			["Expense (posted)", totalExpense],
		];

		if (totalExpenseDraft > 0) {
			rows.push([
				"Expense Draft (tidak dihitung)",
				totalExpenseDraft,
			]);
		}

		const ws = XLSX.utils.aoa_to_sheet(rows);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Kas");
		const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
		const blob = new Blob([out], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		const dateStr = new Date().toISOString().slice(0, 10);
		a.download = `laporan-kas-${dateStr}.xlsx`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleDownloadPdf = () => {
		const pdf = new jsPDF({
			orientation: "p",
			unit: "mm",
			format: "a4",
		});

		const margin = 15;
		const pageWidth = pdf.internal.pageSize.getWidth();

		let y = margin;

		pdf.setFont("helvetica", "bold");
		pdf.setFontSize(14);
		pdf.text("LAPORAN KAS", pageWidth / 2, y, { align: "center" });
		y += 8;

		pdf.setFontSize(10);
		pdf.setFont("helvetica", "normal");
		pdf.text(`Periode: ${rangeLabel}`, margin, y);
		y += 6;

		const now = new Date();
		const printedAt = `${now.toLocaleDateString("id-ID")} ${now.toLocaleTimeString("id-ID")}`;
		pdf.text(`Dicetak: ${printedAt}`, margin, y);
		y += 10;

		pdf.setFont("helvetica", "bold");
		pdf.setFontSize(11);
		pdf.text("Ringkasan", margin, y);
		y += 6;

		pdf.setFont("helvetica", "normal");
		const summaryRows: [string, string][] = [
			["Pendapatan", toCurrencyClient(pendapatan)],
			["Pengeluaran", toCurrencyClient(pengeluaran)],
			["Saldo", toCurrencyClient(saldo)],
		];

		summaryRows.forEach(([label, value]) => {
			pdf.text(label, margin, y);
			pdf.text(value, pageWidth - margin, y, { align: "right" });
			y += 6;
		});

		y += 4;

		pdf.setFont("helvetica", "bold");
		pdf.text("Rincian Pengeluaran", margin, y);
		y += 6;
		pdf.setFont("helvetica", "normal");

		const detailRows: [string, string][] = [
			["Pembelian", toCurrencyClient(pembelian)],
			["Biaya Produksi (Input)", toCurrencyClient(biayaProduksiInputs)],
			["Upah Pengikisan", toCurrencyClient(biayaUpahPengikisan)],
			["Upah Pemotongan", toCurrencyClient(biayaUpahPemotongan)],
			["Upah Penjemuran", toCurrencyClient(biayaUpahPenjemuran)],
			["Upah Pengemasan", toCurrencyClient(biayaUpahPengemasan)],
			["Upah Pensortiran", toCurrencyClient(biayaUpahPensortiran)],
			["Upah QC Potong & Sortir", toCurrencyClient(biayaUpahQcPotongSortir)],
			["Expense (posted)", toCurrencyClient(totalExpense)],
		];

		if (totalExpenseDraft > 0) {
			detailRows.push([
				"Expense Draft (tidak dihitung)",
				toCurrencyClient(totalExpenseDraft),
			]);
		}

		detailRows.forEach(([label, value]) => {
			if (y > pdf.internal.pageSize.getHeight() - margin) {
				pdf.addPage();
				y = margin;
			}
			pdf.text(label, margin, y);
			pdf.text(value, pageWidth - margin, y, { align: "right" });
			y += 6;
		});

		const dateStr = now.toISOString().slice(0, 10);
		pdf.save(`laporan-kas-${dateStr}.pdf`);
	};

	return (
		<div className="mt-2 flex items-center gap-2 md:mt-0 md:ml-4">
			<button
				type="button"
				onClick={handleDownloadPdf}
				className="rounded-md bg-zinc-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-zinc-700"
			>
				PDF
			</button>
			<button
				type="button"
				onClick={handleDownloadExcel}
				className="rounded-md bg-zinc-200 px-4 py-1.5 text-xs font-medium text-zinc-800 shadow-sm hover:bg-zinc-300"
			>
				Excel
			</button>
		</div>
	);
}

