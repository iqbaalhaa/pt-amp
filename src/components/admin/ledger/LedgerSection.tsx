"use client";

import { ReactNode, useMemo, useState } from "react";
import jsPDF from "jspdf";
import { LedgerEntry } from "./types";
import { toCurrency } from "./formatters";
import { LedgerTable } from "./LedgerTable";
import { approvePurchase } from "@/actions/purchase-actions";
import { approveSale } from "@/actions/sale-actions";
import GlassDialog from "@/components/ui/GlassDialog";
import { TextField } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import * as XLSX from "xlsx";
import { quickCreateItemType } from "@/actions/item-type-actions";
import { quickCreateUnit } from "@/actions/unit-actions";
import { createPurchase } from "@/actions/purchase-actions";
import { quickCreateSupplier } from "@/actions/supplier-actions";
import { createPengikisan } from "@/actions/pengikisan-actions";
import { createPemotongan } from "@/actions/pemotongan-actions";
import { createPenjemuran } from "@/actions/penjemuran-actions";
import { createPengemasan } from "@/actions/pengemasan-actions";

const REPORT_MARGIN_MM = 10;

let reportLogoPromise: Promise<HTMLImageElement | null> | null = null;

function loadReportLogo() {
  if (reportLogoPromise) return reportLogoPromise;
  if (typeof window === "undefined") {
    reportLogoPromise = Promise.resolve(null);
    return reportLogoPromise;
  }
  reportLogoPromise = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = "/logoAMP.png";
  });
  return reportLogoPromise;
}

type Props = {
  title: string;
  type: LedgerEntry["type"];
  subType?: string;
  entries: LedgerEntry[];
  totalCount: number;
  totalNominal: number;
  extraHeaderContent?: ReactNode;
};

export function LedgerSection({
  title,
  type,
  subType,
  entries,
  totalCount,
  totalNominal,
  extraHeaderContent,
}: Props) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | "all">(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openApprove, setOpenApprove] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [openView, setOpenView] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [openMass, setOpenMass] = useState(false);
  const [massBusy, setMassBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [massReport, setMassReport] = useState<{
    success: number;
    failed: number;
    errors: { row: number; reason: string }[];
  } | null>(null);
  const [openReport, setOpenReport] = useState(false);
  const [reportMode, setReportMode] = useState<"range" | "month">("month");
  const [reportStart, setReportStart] = useState("");
  const [reportEnd, setReportEnd] = useState("");
  const [reportMonth, setReportMonth] = useState("");
  const [reportYear, setReportYear] = useState("");

  type MassRow = {
    date: string;
    party: string; // supplier or petugas
    item: string; // nama barang or nama pekerja
    // Purchase specific
    unit?: string;
    qty?: number;
    price?: number;
    // Production specific
    val1?: number; // kaKg, qty, hari, bungkus
    val2?: number; // stikKg, lemburJam
    rate1?: number; // upahPerKg, upahPerHari, upahPerBungkus
    rate2?: number; // upahLemburPerJam
    _row: number;
  };
  const [massRows, setMassRows] = useState<MassRow[] | null>(null);
  const [sortColumn, setSortColumn] = useState<keyof LedgerEntry>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const sortedEntries = useMemo(() => {
    const sorted = [...entries].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [entries, sortColumn, sortDirection]);

  const getProductionValue = (e: LedgerEntry) => {
    if (e.type === "production" && typeof e.productionCost === "number") {
      return e.productionCost;
    }
    if (typeof e.total === "number") {
      return e.total;
    }
    return 0;
  };

  const getReportEntriesForRange = (mode: "monthly" | "weekly") => {
    if (sortedEntries.length === 0) return [];
    const now = new Date();
    if (mode === "monthly") {
      const month = now.getMonth();
      const year = now.getFullYear();
      return sortedEntries.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });
    }
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 6
    );
    return sortedEntries.filter((e) => {
      const d = new Date(e.date);
      return d >= start && d <= now;
    });
  };

  const handleDownloadReport = (mode: "monthly" | "weekly") => {
    const reportEntries = getReportEntriesForRange(mode);
    if (reportEntries.length === 0) {
      return;
    }

    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    });

    const margin = 15;
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    let y = margin;

    const now = new Date();
    const rangeLabel =
      mode === "monthly"
        ? now.toLocaleString("id-ID", {
            month: "long",
            year: "numeric",
          })
        : `${new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 6
          ).toLocaleDateString("id-ID")} - ${now.toLocaleDateString("id-ID")}`;

    const reportTitleBase =
      type === "production" && subType ? subType : title;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text(
      `LAPORAN ${reportTitleBase.toUpperCase()} ${
        mode === "monthly" ? "BULANAN" : "MINGGUAN"
      }`,
      pageW / 2,
      y,
      { align: "center" }
    );
    y += 7;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Periode: ${rangeLabel}`, margin, y);
    y += 6;
    const printedAt = `${now.toLocaleDateString(
      "id-ID"
    )} ${now.toLocaleTimeString("id-ID")}`;
    pdf.text(`Dicetak: ${printedAt}`, margin, y);
    y += 8;

    const totalSum = reportEntries.reduce(
      (sum, e) => sum + getProductionValue(e),
      0
    );

    pdf.setFont("helvetica", "bold");
    pdf.text(
      `Total Transaksi: ${reportEntries.length} | Total: ${toCurrency(
        totalSum
      )}`,
      margin,
      y
    );
    y += 8;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);

    const colTanggalX = margin;
    const colPetugasX = colTanggalX + 32;
    const colPihakX = colPetugasX + 32;
    const colTotalX = pageW - margin - 30;
    const colStatusX = pageW - margin;

    pdf.text("Tanggal", colTanggalX, y);
    pdf.text("Petugas", colPetugasX, y);
    pdf.text("Pihak", colPihakX, y);
    pdf.text("Total", colTotalX, y, { align: "right" });
    pdf.text("Status", colStatusX, y, { align: "right" });
    y += 5;

    pdf.setFont("helvetica", "normal");

    reportEntries.forEach((e) => {
      if (y > pageH - margin) {
        pdf.addPage();
        y = margin;
      }
      const d = new Date(e.date);
      const dateStr = `${d.toLocaleDateString(
        "id-ID"
      )} ${d.toLocaleTimeString("id-ID").slice(0, 5)}`;
      const petugas = e.createdByName || "-";
      const pihak = e.counterparty || "-";
      const totalVal = getProductionValue(e);
      const status = e.status.toUpperCase();

      pdf.text(dateStr, colTanggalX, y);
      pdf.text(petugas, colPetugasX, y);
      pdf.text(pihak, colPihakX, y);
      pdf.text(toCurrency(totalVal), colTotalX, y, { align: "right" });
      pdf.text(status, colStatusX, y, { align: "right" });
      y += 5;
    });

    const fileNameMode = mode === "monthly" ? "bulanan" : "mingguan";
    const fileTypeSlug =
      type === "production" && subType
        ? `produksi-${subType.toLowerCase()}`
        : type;
    pdf.save(
      `laporan-${fileTypeSlug}-${fileNameMode}-${now
        .toISOString()
        .slice(0, 10)}.pdf`
    );
  };

  const handleDownloadProductionRangePdfReport = async () => {
    if (entries.length === 0) return;
    if (type !== "production" || !subType) return;

    let startDate: Date | null = null;
    let endDate: Date | null = null;
    let periodeLabel = "";

    if (reportMode === "range") {
      if (!reportStart || !reportEnd) return;
      const s = new Date(reportStart);
      const e = new Date(reportEnd);
      if (isNaN(s.getTime()) || isNaN(e.getTime()) || s > e) return;
      startDate = new Date(s.getFullYear(), s.getMonth(), s.getDate());
      endDate = new Date(
        e.getFullYear(),
        e.getMonth(),
        e.getDate(),
        23,
        59,
        59,
        999
      );
      periodeLabel = `${s.toLocaleDateString("id-ID")} - ${e.toLocaleDateString(
        "id-ID"
      )}`;
    } else {
      if (!reportMonth || !reportYear) return;
      const yearNum = Number(reportYear);
      const monthNum = Number(reportMonth);
      if (!yearNum || !monthNum) return;
      startDate = new Date(yearNum, monthNum - 1, 1);
      endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
      const base = new Date(yearNum, monthNum - 1, 1);
      const monthName = base.toLocaleString("id-ID", { month: "long" });
      periodeLabel = `${monthName} ${yearNum}`;
    }

    if (!startDate || !endDate) return;

    const reportEntries = sortedEntries.filter((e) => {
      if (e.type !== "production" || e.subType !== subType) return false;
      const d = new Date(e.date);
      return d >= startDate! && d <= endDate!;
    });

    if (reportEntries.length === 0) return;

    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    });

    const margin = 15;
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    let y = margin;

    const reportTitleBase = subType;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text(
      `LAPORAN PRODUKSI ${reportTitleBase.toUpperCase()}`,
      pageW / 2,
      y,
      { align: "center" }
    );
    y += 7;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Periode: ${periodeLabel}`, margin, y);
    y += 6;
    const now = new Date();
    const printedAt = `${now.toLocaleDateString(
      "id-ID"
    )} ${now.toLocaleTimeString("id-ID")}`;
    pdf.text(`Dicetak: ${printedAt}`, margin, y);
    y += 8;

    const totalSum = reportEntries.reduce(
      (sum, e) => sum + getProductionValue(e),
      0
    );

    pdf.setFont("helvetica", "bold");
    pdf.text(
      `Total Transaksi: ${reportEntries.length} | Total: ${toCurrency(
        totalSum
      )}`,
      margin,
      y
    );
    y += 8;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);

    const colTanggalX = margin;
    const colPetugasX = colTanggalX + 32;
    const colPihakX = colPetugasX + 32;
    const colTotalX = pageW - margin - 30;
    const colStatusX = pageW - margin;

    pdf.text("Tanggal", colTanggalX, y);
    pdf.text("Petugas", colPetugasX, y);
    pdf.text("Pihak", colPihakX, y);
    pdf.text("Total", colTotalX, y, { align: "right" });
    pdf.text("Status", colStatusX, y, { align: "right" });
    y += 5;

    pdf.setFont("helvetica", "normal");

    reportEntries.forEach((e) => {
      if (y > pageH - margin) {
        pdf.addPage();
        y = margin;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text("Tanggal", colTanggalX, y);
        pdf.text("Petugas", colPetugasX, y);
        pdf.text("Pihak", colPihakX, y);
        pdf.text("Total", colTotalX, y, { align: "right" });
        pdf.text("Status", colStatusX, y, { align: "right" });
        y += 5;
        pdf.setFont("helvetica", "normal");
      }
      const d = new Date(e.date);
      const dateStr = `${d.toLocaleDateString(
        "id-ID"
      )} ${d.toLocaleTimeString("id-ID").slice(0, 5)}`;
      const petugas = e.createdByName || "-";
      const pihak = e.counterparty || "-";
      const totalVal = getProductionValue(e);
      const status = e.status.toUpperCase();

      pdf.text(dateStr, colTanggalX, y);
      pdf.text(petugas, colPetugasX, y);
      pdf.text(pihak, colPihakX, y);
      pdf.text(toCurrency(totalVal), colTotalX, y, { align: "right" });
      pdf.text(status, colStatusX, y, { align: "right" });
      y += 5;
    });

    const suffix =
      reportMode === "range"
        ? "range"
        : `bulan-${reportMonth}-${reportYear}`;
    pdf.save(
      `laporan-produksi-${subType.toLowerCase()}-${suffix}.pdf`
    );
    setOpenReport(false);
  };

  const handleDownloadPengikisanExcelReport = () => {
    if (entries.length === 0) return;
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    let periodeLabel = "";
    if (reportMode === "range") {
      if (!reportStart || !reportEnd) return;
      const s = new Date(reportStart);
      const e = new Date(reportEnd);
      if (isNaN(s.getTime()) || isNaN(e.getTime()) || s > e) return;
      startDate = new Date(s.getFullYear(), s.getMonth(), s.getDate());
      endDate = new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999);
      periodeLabel = `${s.toLocaleDateString("id-ID")} - ${e.toLocaleDateString("id-ID")}`;
    } else {
      if (!reportMonth || !reportYear) return;
      const yearNum = Number(reportYear);
      const monthNum = Number(reportMonth);
      if (!yearNum || !monthNum) return;
      startDate = new Date(yearNum, monthNum - 1, 1);
      endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
      const base = new Date(yearNum, monthNum - 1, 1);
      const monthName = base.toLocaleString("id-ID", { month: "long" });
      periodeLabel = `${monthName} ${yearNum}`;
    }
    if (!startDate || !endDate) return;

    const filtered = entries.filter((e) => {
      if (e.type !== "production" || e.subType !== "Pengikisan") return false;
      if (!e.pengikisanItems || e.pengikisanItems.length === 0) return false;
      const d = new Date(e.date);
      return d >= startDate! && d <= endDate!;
    });
    if (filtered.length === 0) return;

    type RowInfo = {
      name: string;
      ket: "KA" | "STIK";
      values: Record<string, number>;
      harga: number;
    };

    const dateKeySet = new Set<string>();
    const rowsMap = new Map<string, RowInfo>();

    const ensureRow = (name: string, ket: "KA" | "STIK", harga: number) => {
      const key = `${name}|${ket}`;
      let row = rowsMap.get(key);
      if (!row) {
        row = { name, ket, values: {}, harga };
        rowsMap.set(key, row);
      }
      if (!row.harga && harga > 0) row.harga = harga;
      return row;
    };

    filtered.forEach((entry) => {
      const d = new Date(entry.date);
      const dateKey = d.toISOString().slice(0, 10);
      dateKeySet.add(dateKey);
      entry.pengikisanItems?.forEach((it) => {
        const baseName = it.nama || "-";
        const ka = typeof it.kaKg === "number" ? it.kaKg : Number(it.kaKg ?? 0);
        const stik = typeof it.stikKg === "number" ? it.stikKg : Number(it.stikKg ?? 0);
        const upahKa = typeof it.upahKa === "number" ? it.upahKa : Number(it.upahKa ?? 0);
        const upahStik = typeof it.upahStik === "number" ? it.upahStik : Number(it.upahStik ?? 0);

        if (ka > 0) {
          const rowKa = ensureRow(baseName, "KA", upahKa);
          rowKa.values[dateKey] = (rowKa.values[dateKey] ?? 0) + ka;
        }
        if (stik > 0) {
          const rowStik = ensureRow(baseName, "STIK", upahStik);
          rowStik.values[dateKey] = (rowStik.values[dateKey] ?? 0) + stik;
        }
      });
    });

    if (rowsMap.size === 0) return;

    const dateKeys = Array.from(dateKeySet).sort();
    const dateHeaders = dateKeys.map((key) => {
      const d = new Date(key);
      const day = d.getDate().toString().padStart(2, "0");
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const weekday = d.toLocaleDateString("id-ID", { weekday: "short" }).toUpperCase();
      return `${day}/${month} ${weekday}`;
    });

    const data: (string | number)[][] = [];
    data.push(["PERIODE", periodeLabel]);
    data.push([]);
    const header: (string | number)[] = [
      "NO",
      "NAMA",
      "KET",
      ...dateHeaders,
      "JUMLAH",
      "HARGA",
      "TOTAL",
      "JUMLAH UPAH",
    ];
    data.push(header);

    const names = Array.from(
      new Set(Array.from(rowsMap.values()).map((r) => r.name))
    ).sort((a, b) => a.localeCompare(b));

    const totalUpahByName = new Map<string, number>();
    names.forEach((name) => {
      const rowKa = rowsMap.get(`${name}|KA`);
      const rowStik = rowsMap.get(`${name}|STIK`);
      let totalUpah = 0;
      [rowKa, rowStik].forEach((row) => {
        if (!row) return;
        const jumlahRow = Object.values(row.values).reduce(
          (sum, v) => sum + v,
          0
        );
        const hargaRow = row.harga || 0;
        totalUpah += jumlahRow * hargaRow;
      });
      totalUpahByName.set(name, totalUpah);
    });

    let counter = 1;
    names.forEach((name) => {
      const rowsForName: RowInfo[] = [];
      const rowKa = rowsMap.get(`${name}|KA`);
      const rowStik = rowsMap.get(`${name}|STIK`);
      if (rowKa) rowsForName.push(rowKa);
      if (rowStik) rowsForName.push(rowStik);
      rowsForName.forEach((row, idx) => {
        const jumlah = dateKeys.reduce(
          (sum, key) => sum + (row.values[key] ?? 0),
          0
        );
        const harga = row.harga || 0;
        const total = jumlah * harga;
        const jumlahUpah = row.ket === "STIK" ? total : 0;
        const perDate = dateKeys.map((key) => row.values[key] ?? 0);
        data.push([
          idx === 0 ? counter : "",
          row.name,
          row.ket,
          ...perDate,
          jumlah,
          harga,
          total,
          jumlahUpah,
        ]);
      });
      counter += 1;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const suffix =
      reportMode === "range"
        ? "range"
        : `bulan-${reportMonth}-${reportYear}`;
    a.download = `laporan-pengikisan-${suffix}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    setOpenReport(false);
  };

  const handleDownloadPengikisanPdfReport = async () => {
    if (entries.length === 0) return;
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    let periodeLabel = "";
    if (reportMode === "range") {
      if (!reportStart || !reportEnd) return;
      const s = new Date(reportStart);
      const e = new Date(reportEnd);
      if (isNaN(s.getTime()) || isNaN(e.getTime()) || s > e) return;
      startDate = new Date(s.getFullYear(), s.getMonth(), s.getDate());
      endDate = new Date(
        e.getFullYear(),
        e.getMonth(),
        e.getDate(),
        23,
        59,
        59,
        999
      );
      periodeLabel = `${s.toLocaleDateString("id-ID")} - ${e.toLocaleDateString(
        "id-ID"
      )}`;
    } else {
      if (!reportMonth || !reportYear) return;
      const yearNum = Number(reportYear);
      const monthNum = Number(reportMonth);
      if (!yearNum || !monthNum) return;
      startDate = new Date(yearNum, monthNum - 1, 1);
      endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
      const base = new Date(yearNum, monthNum - 1, 1);
      const monthName = base.toLocaleString("id-ID", { month: "long" });
      periodeLabel = `${monthName} ${yearNum}`;
    }
    if (!startDate || !endDate) return;

    const filtered = entries.filter((e) => {
      if (e.type !== "production" || e.subType !== "Pengikisan") return false;
      if (!e.pengikisanItems || e.pengikisanItems.length === 0) return false;
      const d = new Date(e.date);
      return d >= startDate! && d <= endDate!;
    });
    if (filtered.length === 0) return;

    type RowInfo = {
      name: string;
      ket: "KA" | "STIK";
      values: Record<string, number>;
      harga: number;
    };

    const dateKeySet = new Set<string>();
    const rowsMap = new Map<string, RowInfo>();

    const ensureRow = (name: string, ket: "KA" | "STIK", harga: number) => {
      const key = `${name}|${ket}`;
      let row = rowsMap.get(key);
      if (!row) {
        row = { name, ket, values: {}, harga };
        rowsMap.set(key, row);
      }
      if (!row.harga && harga > 0) row.harga = harga;
      return row;
    };

    filtered.forEach((entry) => {
      const d = new Date(entry.date);
      const dateKey = d.toISOString().slice(0, 10);
      dateKeySet.add(dateKey);
      entry.pengikisanItems?.forEach((it) => {
        const baseName = it.nama || "-";
        const ka = typeof it.kaKg === "number" ? it.kaKg : Number(it.kaKg ?? 0);
        const stik =
          typeof it.stikKg === "number" ? it.stikKg : Number(it.stikKg ?? 0);
        const upahKa =
          typeof it.upahKa === "number" ? it.upahKa : Number(it.upahKa ?? 0);
        const upahStik =
          typeof it.upahStik === "number"
            ? it.upahStik
            : Number(it.upahStik ?? 0);

        if (ka > 0) {
          const rowKa = ensureRow(baseName, "KA", upahKa);
          rowKa.values[dateKey] = (rowKa.values[dateKey] ?? 0) + ka;
        }
        if (stik > 0) {
          const rowStik = ensureRow(baseName, "STIK", upahStik);
          rowStik.values[dateKey] = (rowStik.values[dateKey] ?? 0) + stik;
        }
      });
    });

    if (rowsMap.size === 0) return;

    const dateKeys = Array.from(dateKeySet).sort();
    const isMonthlyReport = reportMode === "month";

    const names = Array.from(
      new Set(Array.from(rowsMap.values()).map((r) => r.name))
    ).sort((a, b) => a.localeCompare(b));

    const totalUpahByNamePdf = new Map<string, number>();
    names.forEach((name) => {
      const rowKa = rowsMap.get(`${name}|KA`);
      const rowStik = rowsMap.get(`${name}|STIK`);
      let totalUpah = 0;
      [rowKa, rowStik].forEach((row) => {
        if (!row) return;
        const jumlahRow = Object.values(row.values).reduce(
          (sum, v) => sum + v,
          0
        );
        const hargaRow = row.harga || 0;
        totalUpah += jumlahRow * hargaRow;
      });
      totalUpahByNamePdf.set(name, totalUpah);
    });

    const pdf = new jsPDF({
      orientation: "l",
      unit: "mm",
      format: "a4",
    });

    const margin = REPORT_MARGIN_MM;
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    let y = margin;

    const logo = await loadReportLogo();
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
        y + 5
      );

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.text(
        "(General Contractor, Supplier, Infrastructure)",
        margin + logoW + 6,
        y + 11
      );

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text("LAPORAN PENGIKISAN", pageW - margin, y + 5, {
        align: "right",
      });

      y += logoH + 6;

      pdf.setDrawColor(26, 35, 126);
      pdf.setLineWidth(0.4);
      pdf.line(margin, y, pageW - margin, y);
      y += 4;
    } else {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text("LAPORAN PENGIKISAN", pageW / 2, y, { align: "center" });
      y += 8;
      pdf.setDrawColor(26, 35, 126);
      pdf.setLineWidth(0.4);
      pdf.line(margin, y, pageW - margin, y);
      y += 4;
    }

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(`Periode: ${periodeLabel}`, margin, y);
    const now = new Date();
    const printedAt = `${now.toLocaleDateString(
      "id-ID"
    )} ${now.toLocaleTimeString("id-ID")}`;
    pdf.text(`Dicetak: ${printedAt}`, pageW - margin, y, { align: "right" });
    y += 6;

    pdf.setFont("helvetica", "bold");

    const tableStartY = y;
    let counter = 1;

    if (!isMonthlyReport) {
      const maxColsPerPage = 13;
      const chunks: { keys: string[]; headers: string[] }[] = [];
      for (let i = 0; i < dateKeys.length; i += maxColsPerPage) {
        const keys = dateKeys.slice(i, i + maxColsPerPage);
        const headers = keys.map((key) => {
          const d = new Date(key);
          return d.getDate().toString().padStart(2, "0");
        });
        chunks.push({ keys, headers });
      }

      chunks.forEach((chunk, chunkIndex) => {
        const chunkKeys = chunk.keys;
        const chunkHeaders = chunk.headers;

        if (chunkIndex === 0) {
          y = tableStartY;
        } else {
          pdf.addPage("a4", "l");
          y = margin;
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          pdf.text(`Periode: ${periodeLabel}`, margin, y);
          pdf.text(`Dicetak: ${printedAt}`, pageW - margin, y, {
            align: "right",
          });
          y += 6;
          pdf.setFont("helvetica", "bold");
        }

        const colNoX = margin;
        const colNamaX = colNoX + 10;
        const colKetX = colNamaX + 38;
        const dateColWidth = 14;
        const firstDateX = colKetX + 12;
        const colJumlahX =
          firstDateX + chunkHeaders.length * dateColWidth + 2;
        const colHargaX = colJumlahX + 18;
        const colTotalX = colHargaX + 22;
        const colJumlahUpahX = colTotalX + 26;
        const tableRightX = colJumlahUpahX + 26;

        const headerYTop = y;
        const headerHeight = 7;

        pdf.setDrawColor(148, 163, 184);
        pdf.setLineWidth(0.2);
        pdf.rect(colNoX, headerYTop, tableRightX - colNoX, headerHeight);

        pdf.text("NO", colNoX + 2, headerYTop + 4);
        pdf.text("NAMA", colNamaX + 1, headerYTop + 4);
        pdf.text("KET", colKetX + 1, headerYTop + 4);
        chunkHeaders.forEach((h, idx) => {
          const x = firstDateX + idx * dateColWidth;
          pdf.text(h, x + 1, headerYTop + 4);
        });
        pdf.text("JML", colJumlahX + 1, headerYTop + 4);
        pdf.text("HARGA", colHargaX + 1, headerYTop + 4);
        pdf.text("TOTAL", colTotalX + 1, headerYTop + 4);
        pdf.text("JML UPAH", colJumlahUpahX + 1, headerYTop + 4);

        const headerColumnXs: number[] = [
          colNoX,
          colNamaX - 2,
          colKetX - 2,
          firstDateX - 2,
          colJumlahX - 2,
          colHargaX - 2,
          colTotalX - 2,
          colJumlahUpahX - 2,
          tableRightX,
        ];
        headerColumnXs.forEach((x) => {
          pdf.line(x, headerYTop, x, headerYTop + headerHeight);
        });

        y = headerYTop + headerHeight;
        pdf.setFont("helvetica", "normal");

        names.forEach((name) => {
          const rowsForName: RowInfo[] = [];
          const rowKa = rowsMap.get(`${name}|KA`);
          const rowStik = rowsMap.get(`${name}|STIK`);
          if (rowKa) rowsForName.push(rowKa);
          if (rowStik) rowsForName.push(rowStik);

          const totalUpahName = totalUpahByNamePdf.get(name) ?? 0;

          rowsForName.forEach((row, idx) => {
            if (y > pageH - margin) {
              pdf.addPage("a4", "l");
              y = margin;
            }

            const rowHeight = 6;
            pdf.rect(colNoX, y, tableRightX - colNoX, rowHeight);
            headerColumnXs.forEach((x) => {
              pdf.line(x, y, x, y + rowHeight);
            });

            const jumlah = Object.values(row.values).reduce(
              (sum, v) => sum + v,
              0
            );
            const harga = row.harga || 0;
            const total = jumlah * harga;
            const perDate = chunkKeys.map((key) => row.values[key] ?? 0);

            const textY = y + 4;

            if (idx === 0) {
              pdf.text(String(counter), colNoX + 2, textY);
            }
            pdf.text(row.name, colNamaX + 1, textY);
            pdf.text(row.ket, colKetX + 1, textY);
            perDate.forEach((val, i) => {
              const x = firstDateX + i * dateColWidth;
              if (val !== 0) {
                pdf.text(String(val), x + 1, textY);
              }
            });
            if (jumlah !== 0) {
              pdf.text(String(jumlah), colJumlahX + 1, textY);
            }
            if (harga !== 0) {
              pdf.text(toCurrency(harga), colHargaX + 16, textY, {
                align: "right",
              });
            }
            if (total !== 0) {
              pdf.text(toCurrency(total), colTotalX + 20, textY, {
                align: "right",
              });
            }
            if (row.ket === "STIK" && totalUpahName !== 0) {
              pdf.text(
                toCurrency(totalUpahName),
                colJumlahUpahX + 24,
                textY,
                {
                  align: "right",
                }
              );
            }

            y += rowHeight;
          });
          counter += 1;
        });
      });
    } else {
      const daysInMonth = endDate.getDate();
      const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

      const chunkDayRanges: number[][] = [];
      const firstEnd = Math.min(13, daysInMonth);
      if (firstEnd > 0) {
        chunkDayRanges.push(allDays.slice(0, firstEnd));
      }
      if (firstEnd < daysInMonth) {
        const secondStart = firstEnd + 1;
        const secondEnd = Math.min(secondStart + 12, daysInMonth);
        chunkDayRanges.push(allDays.slice(secondStart - 1, secondEnd));
        if (secondEnd < daysInMonth) {
          chunkDayRanges.push(allDays.slice(secondEnd, daysInMonth));
        }
      }

      type Chunk = {
        days: number[];
        showJml: boolean;
        showJumlahUpah: boolean;
      };

      const chunks: Chunk[] = chunkDayRanges.map((days, idx, arr) => ({
        days,
        showJml: idx === arr.length - 1,
        showJumlahUpah: idx === arr.length - 1,
      }));

      const yearNum = startDate.getFullYear();
      const monthNum = startDate.getMonth();

      const makeDateKey = (day: number) =>
        new Date(yearNum, monthNum, day).toISOString().slice(0, 10);

      chunks.forEach((chunk, chunkIndex) => {
        const chunkHeaders = chunk.days.map((d) =>
          d.toString().padStart(2, "0")
        );

        if (chunkIndex === 0) {
          y = tableStartY;
        } else {
          pdf.addPage("a4", "l");
          y = margin;
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          pdf.text(`Periode: ${periodeLabel}`, margin, y);
          pdf.text(`Dicetak: ${printedAt}`, pageW - margin, y, {
            align: "right",
          });
          y += 6;
          pdf.setFont("helvetica", "bold");
        }

        const colNoX = margin;
        const colNamaX = colNoX + 10;
        const colKetX = colNamaX + 38;
        const dateColWidth = 14;
        const firstDateX = colKetX + 12;

        let colJumlahX: number | null = null;
        let colJumlahUpahX: number | null = null;
        let tableRightX = firstDateX + chunkHeaders.length * dateColWidth + 2;

        if (chunk.showJml || chunk.showJumlahUpah) {
          colJumlahX = tableRightX + 2;
          tableRightX = colJumlahX + 22;
          if (chunk.showJumlahUpah) {
            colJumlahUpahX = tableRightX + 2;
            tableRightX = colJumlahUpahX + 26;
          }
        }

        const headerYTop = y;
        const headerHeight = 7;

        pdf.setDrawColor(148, 163, 184);
        pdf.setLineWidth(0.2);
        pdf.rect(colNoX, headerYTop, tableRightX - colNoX, headerHeight);

        pdf.text("NO", colNoX + 2, headerYTop + 4);
        pdf.text("NAMA", colNamaX + 1, headerYTop + 4);
        pdf.text("KET", colKetX + 1, headerYTop + 4);
        chunkHeaders.forEach((h, idx) => {
          const x = firstDateX + idx * dateColWidth;
          pdf.text(h, x + 1, headerYTop + 4);
        });
        if (chunk.showJml && colJumlahX != null) {
          pdf.text("JML", colJumlahX + 1, headerYTop + 4);
        }
        if (chunk.showJumlahUpah && colJumlahUpahX != null) {
          pdf.text("JML UPAH", colJumlahUpahX + 1, headerYTop + 4);
        }

        const headerColumnXs: number[] = [
          colNoX,
          colNamaX - 2,
          colKetX - 2,
          firstDateX - 2,
        ];
        if (chunk.showJml && colJumlahX != null) {
          headerColumnXs.push(colJumlahX - 2);
        }
        if (chunk.showJumlahUpah && colJumlahUpahX != null) {
          headerColumnXs.push(colJumlahUpahX - 2);
        }
        headerColumnXs.push(tableRightX);
        headerColumnXs.forEach((x) => {
          pdf.line(x, headerYTop, x, headerYTop + headerHeight);
        });

        y = headerYTop + headerHeight;
        pdf.setFont("helvetica", "normal");

        names.forEach((name) => {
          const rowsForName: RowInfo[] = [];
          const rowKa = rowsMap.get(`${name}|KA`);
          const rowStik = rowsMap.get(`${name}|STIK`);
          if (rowKa) rowsForName.push(rowKa);
          if (rowStik) rowsForName.push(rowStik);

          rowsForName.forEach((row, idx) => {
            if (y > pageH - margin) {
              pdf.addPage("a4", "l");
              y = margin;
            }

            const rowHeight = 6;
            pdf.rect(colNoX, y, tableRightX - colNoX, rowHeight);
            headerColumnXs.forEach((x) => {
              pdf.line(x, y, x, y + rowHeight);
            });

            const jumlah = Object.values(row.values).reduce(
              (sum, v) => sum + v,
              0
            );
            const harga = row.harga || 0;
            const total = jumlah * harga;
            const totalUpahName = totalUpahByNamePdf.get(name) ?? 0;
            const perDate = chunk.days.map((day) => {
              const key = makeDateKey(day);
              return row.values[key] ?? 0;
            });

            const textY = y + 4;

            if (idx === 0) {
              pdf.text(String(counter), colNoX + 2, textY);
            }
            pdf.text(row.name, colNamaX + 1, textY);
            pdf.text(row.ket, colKetX + 1, textY);
            perDate.forEach((val, i) => {
              const x = firstDateX + i * dateColWidth;
              if (val !== 0) {
                pdf.text(String(val), x + 1, textY);
              }
            });
            if (chunk.showJml && colJumlahX != null && jumlah !== 0) {
              pdf.text(String(jumlah), colJumlahX + 1, textY);
            }
            if (
              chunk.showJumlahUpah &&
              colJumlahUpahX != null &&
              row.ket === "STIK" &&
              totalUpahName !== 0
            ) {
              pdf.text(
                toCurrency(totalUpahName),
                colJumlahUpahX + 24,
                textY,
                {
                  align: "right",
                }
              );
            }

            y += rowHeight;
          });
          counter += 1;
        });
      });
    }

    const suffix =
      reportMode === "range"
        ? "range"
        : `bulan-${reportMonth}-${reportYear}`;
    pdf.save(`laporan-pengikisan-${suffix}.pdf`);
    setOpenReport(false);
  };

  const handleDownloadUpahMonthlyPdfReport = async () => {
    if (reportMode !== "month") {
      handleDownloadProductionRangePdfReport();
      return;
    }

    if (!subType) return;
    if (
      subType !== "Pemotongan" &&
      subType !== "Penjemuran" &&
      subType !== "Pengemasan" &&
      subType !== "Produksi Lainnya"
    )
      return;

    if (!reportMonth || !reportYear) return;
    const yearNum = Number(reportYear);
    const monthNum = Number(reportMonth);
    if (!yearNum || !monthNum) return;

    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

    const base = new Date(yearNum, monthNum - 1, 1);
    const monthName = base.toLocaleString("id-ID", { month: "long" });
    const periodeLabel = `${monthName} ${yearNum}`;

    type RowInfo = {
      name: string;
      ket: string;
      values: Record<string, number>;
    };

    const rowsMap = new Map<string, RowInfo>();
    const totalUpahByNamePdf = new Map<string, number>();

    const ensureRow = (name: string, ket: string) => {
      const key = `${name}|${ket}`;
      let row = rowsMap.get(key);
      if (!row) {
        row = { name, ket, values: {} };
        rowsMap.set(key, row);
      }
      return row;
    };

    entries.forEach((entry) => {
      if (entry.type !== "production" || entry.subType !== subType) return;
      const d = new Date(entry.date);
      if (d < startDate || d > endDate) return;
      const dateKey = d.toISOString().slice(0, 10);

      if (subType === "Pemotongan") {
        entry.pemotonganItems?.forEach((it) => {
          const name = it.nama || "-";
          const qty =
            typeof it.qty === "number" ? it.qty : Number(it.qty ?? 0);
          const total =
            typeof it.total === "number" ? it.total : Number(it.total ?? 0);
          if (qty > 0) {
            const row = ensureRow(name, "KG");
            row.values[dateKey] = (row.values[dateKey] ?? 0) + qty;
          }
          if (total > 0) {
            totalUpahByNamePdf.set(
              name,
              (totalUpahByNamePdf.get(name) ?? 0) + total
            );
          }
        });
      } else if (subType === "Penjemuran") {
        entry.penjemuranItems?.forEach((it) => {
          const name = it.nama || "-";
          const hari =
            typeof it.hari === "number" ? it.hari : Number(it.hari ?? 0);
          const total =
            typeof it.total === "number" ? it.total : Number(it.total ?? 0);
          if (hari > 0) {
            const row = ensureRow(name, "HARI");
            row.values[dateKey] = (row.values[dateKey] ?? 0) + hari;
          }
          if (total > 0) {
            totalUpahByNamePdf.set(
              name,
              (totalUpahByNamePdf.get(name) ?? 0) + total
            );
          }
        });
      } else if (subType === "Pengemasan") {
        entry.pengemasanItems?.forEach((it) => {
          const name = it.nama || "-";
          const bungkus =
            typeof it.bungkus === "number"
              ? it.bungkus
              : Number(it.bungkus ?? 0);
          const total =
            typeof it.total === "number" ? it.total : Number(it.total ?? 0);
          if (bungkus > 0) {
            const row = ensureRow(name, "BKS");
            row.values[dateKey] = (row.values[dateKey] ?? 0) + bungkus;
          }
          if (total > 0) {
            totalUpahByNamePdf.set(
              name,
              (totalUpahByNamePdf.get(name) ?? 0) + total
            );
          }
        });
      } else if (subType === "Produksi Lainnya") {
        entry.produksiLainnyaItems?.forEach((it) => {
          const name = it.namaPekerja || "-";
          const ketBase = it.satuan || it.namaPekerjaan || "-";
          const ket = ketBase.toString().toUpperCase();
          const qty =
            typeof it.qty === "number" ? it.qty : Number(it.qty ?? 0);
          const total =
            typeof it.total === "number" ? it.total : Number(it.total ?? 0);
          if (qty > 0) {
            const row = ensureRow(name, ket);
            row.values[dateKey] = (row.values[dateKey] ?? 0) + qty;
          }
          if (total > 0) {
            totalUpahByNamePdf.set(
              name,
              (totalUpahByNamePdf.get(name) ?? 0) + total
            );
          }
        });
      }
    });

    if (rowsMap.size === 0) return;

    const names = Array.from(
      new Set(Array.from(rowsMap.values()).map((r) => r.name))
    ).sort((a, b) => a.localeCompare(b));

    const pdf = new jsPDF({
      orientation: "l",
      unit: "mm",
      format: "a4",
    });

    const margin = REPORT_MARGIN_MM;
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    let y = margin;

    const logo = await loadReportLogo();
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
        y + 5
      );

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.text(
        "(General Contractor, Supplier, Infrastructure)",
        margin + logoW + 6,
        y + 11
      );

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text(
        `LAPORAN ${subType.toUpperCase()}`,
        pageW - margin,
        y + 5,
        {
          align: "right",
        }
      );

      y += logoH + 6;

      pdf.setDrawColor(26, 35, 126);
      pdf.setLineWidth(0.4);
      pdf.line(margin, y, pageW - margin, y);
      y += 4;
    } else {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text(`LAPORAN ${subType.toUpperCase()}`, pageW / 2, y, {
        align: "center",
      });
      y += 8;
      pdf.setDrawColor(26, 35, 126);
      pdf.setLineWidth(0.4);
      pdf.line(margin, y, pageW - margin, y);
      y += 4;
    }

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(`Periode: ${periodeLabel}`, margin, y);
    const now = new Date();
    const printedAt = `${now.toLocaleDateString(
      "id-ID"
    )} ${now.toLocaleTimeString("id-ID")}`;
    pdf.text(`Dicetak: ${printedAt}`, pageW - margin, y, {
      align: "right",
    });
    y += 6;

    pdf.setFont("helvetica", "bold");

    const tableStartY = y;

    const daysInMonth = endDate.getDate();
    const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const chunkDayRanges: number[][] = [];
    const firstEnd = Math.min(13, daysInMonth);
    if (firstEnd > 0) {
      chunkDayRanges.push(allDays.slice(0, firstEnd));
    }
    if (firstEnd < daysInMonth) {
      const secondStart = firstEnd + 1;
      const secondEnd = Math.min(secondStart + 12, daysInMonth);
      chunkDayRanges.push(allDays.slice(secondStart - 1, secondEnd));
      if (secondEnd < daysInMonth) {
        chunkDayRanges.push(allDays.slice(secondEnd, daysInMonth));
      }
    }

    type Chunk = {
      days: number[];
      showJml: boolean;
      showJumlahUpah: boolean;
    };

    const chunks: Chunk[] = chunkDayRanges.map((days, idx, arr) => ({
      days,
      showJml: idx === arr.length - 1,
      showJumlahUpah: idx === arr.length - 1,
    }));

    const makeDateKey = (day: number) =>
      new Date(yearNum, monthNum - 1, day).toISOString().slice(0, 10);

    let counter = 1;

    chunks.forEach((chunk, chunkIndex) => {
      const chunkHeaders = chunk.days.map((d) =>
        d.toString().padStart(2, "0")
      );

      if (chunkIndex === 0) {
        y = tableStartY;
      } else {
        pdf.addPage("a4", "l");
        y = margin;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text(`Periode: ${periodeLabel}`, margin, y);
        pdf.text(`Dicetak: ${printedAt}`, pageW - margin, y, {
          align: "right",
        });
        y += 6;
        pdf.setFont("helvetica", "bold");
      }

      const colNoX = margin;
      const colNamaX = colNoX + 10;
      const colKetX = colNamaX + 38;
      const dateColWidth = 14;
      const firstDateX = colKetX + 12;

      let colJumlahX: number | null = null;
      let colJumlahUpahX: number | null = null;
      let tableRightX = firstDateX + chunkHeaders.length * dateColWidth + 2;

      if (chunk.showJml || chunk.showJumlahUpah) {
        colJumlahX = tableRightX + 2;
        tableRightX = colJumlahX + 22;
        if (chunk.showJumlahUpah) {
          colJumlahUpahX = tableRightX + 2;
          tableRightX = colJumlahUpahX + 26;
        }
      }

      const headerYTop = y;
      const headerHeight = 7;

      pdf.setDrawColor(148, 163, 184);
      pdf.setLineWidth(0.2);
      pdf.rect(colNoX, headerYTop, tableRightX - colNoX, headerHeight);

      pdf.text("NO", colNoX + 2, headerYTop + 4);
      pdf.text("NAMA", colNamaX + 1, headerYTop + 4);
      pdf.text("KET", colKetX + 1, headerYTop + 4);
      chunkHeaders.forEach((h, idx) => {
        const x = firstDateX + idx * dateColWidth;
        pdf.text(h, x + 1, headerYTop + 4);
      });
      if (chunk.showJml && colJumlahX != null) {
        pdf.text("JML", colJumlahX + 1, headerYTop + 4);
      }
      if (chunk.showJumlahUpah && colJumlahUpahX != null) {
        pdf.text("JML UPAH", colJumlahUpahX + 1, headerYTop + 4);
      }

      const headerColumnXs: number[] = [
        colNoX,
        colNamaX - 2,
        colKetX - 2,
        firstDateX - 2,
      ];
      if (chunk.showJml && colJumlahX != null) {
        headerColumnXs.push(colJumlahX - 2);
      }
      if (chunk.showJumlahUpah && colJumlahUpahX != null) {
        headerColumnXs.push(colJumlahUpahX - 2);
      }
      headerColumnXs.push(tableRightX);
      headerColumnXs.forEach((x) => {
        pdf.line(x, headerYTop, x, headerYTop + headerHeight);
      });

      y = headerYTop + headerHeight;
      pdf.setFont("helvetica", "normal");

      names.forEach((name) => {
        const row =
          Array.from(rowsMap.values()).find((r) => r.name === name) || null;
        if (!row) return;

        if (y > pageH - margin) {
          pdf.addPage("a4", "l");
          y = margin;
        }

        const rowHeight = 6;
        pdf.rect(colNoX, y, tableRightX - colNoX, rowHeight);
        headerColumnXs.forEach((x) => {
          pdf.line(x, y, x, y + rowHeight);
        });

        const jumlah = Object.values(row.values).reduce(
          (sum, v) => sum + v,
          0
        );
        const totalUpahName = totalUpahByNamePdf.get(name) ?? 0;
        const perDate = chunk.days.map((day) => {
          const key = makeDateKey(day);
          return row.values[key] ?? 0;
        });

        const textY = y + 4;

        pdf.text(String(counter), colNoX + 2, textY);
        pdf.text(row.name, colNamaX + 1, textY);
        pdf.text(row.ket, colKetX + 1, textY);
        perDate.forEach((val, i) => {
          const x = firstDateX + i * dateColWidth;
          if (val !== 0) {
            pdf.text(String(val), x + 1, textY);
          }
        });
        if (chunk.showJml && colJumlahX != null && jumlah !== 0) {
          pdf.text(String(jumlah), colJumlahX + 1, textY);
        }
        if (
          chunk.showJumlahUpah &&
          colJumlahUpahX != null &&
          totalUpahName !== 0
        ) {
          pdf.text(
            toCurrency(totalUpahName),
            colJumlahUpahX + 24,
            textY,
            {
              align: "right",
            }
          );
        }

        y += rowHeight;
        counter += 1;
      });
    });

    const suffix = `bulan-${reportMonth}-${reportYear}`;
    pdf.save(`laporan-${subType.toLowerCase()}-${suffix}.pdf`);
    setOpenReport(false);
  };

  const totalPages =
    pageSize === "all"
      ? 1
      : Math.max(1, Math.ceil(sortedEntries.length / pageSize));
  const startIdx = pageSize === "all" ? 0 : (page - 1) * pageSize;
  const currentEntries =
    pageSize === "all"
      ? sortedEntries
      : sortedEntries.slice(startIdx, startIdx + pageSize);
  const currentIds = useMemo(
    () => currentEntries.map((e) => e.id),
    [currentEntries]
  );

  const handleSort = (column: keyof LedgerEntry) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setPage(1);
  };

  const draftSelectedIds = useMemo(
    () =>
      selectedIds.filter((id) =>
        currentEntries.find((e) => e.id === id && e.status === "draft")
      ),
    [selectedIds, currentEntries]
  );
  const cancellableSelectedIds = useMemo(
    () =>
      selectedIds.filter((id) => {
        const entry = currentEntries.find((e) => e.id === id);
        return entry && entry.status !== "cancelled";
      }),
    [selectedIds, currentEntries]
  );

  const totalSum = useMemo(
    () =>
      currentEntries.reduce(
        (acc, curr) =>
          acc + (curr.status === "cancelled" ? 0 : curr.total ?? 0),
        0
      ),
    [currentEntries]
  );

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const toggleId = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  const toggleAll = (ids: string[]) =>
    setSelectedIds((prev) => {
      const set = new Set(prev);
      ids.forEach((id) => set.add(id));
      // if empty means uncheck all
      if (ids.length === 0) {
        return prev.filter((id) => !currentIds.includes(id));
      }
      return Array.from(set);
    });

  const handleApproveMass = async () => {
    if (draftSelectedIds.length === 0) return;
    if (type === "purchase") {
      for (const id of draftSelectedIds) await approvePurchase(id);
    } else if (type === "sale") {
      for (const id of draftSelectedIds) await approveSale(id);
    } else if (type === "invoice") {
      const { approveExpense } = await import("@/actions/expense-actions");
      for (const id of draftSelectedIds) await approveExpense(id);
    }
    setSelectedIds([]);
    setOpenApprove(false);
  };

  const handleRejectMass = async () => {
    if (cancellableSelectedIds.length === 0 || rejectReason.trim().length === 0)
      return;
    // reuse single reject from LedgerActions via server actions:
    if (type === "purchase") {
      const { revokePurchase } = await import("@/actions/purchase-actions");
      for (const id of cancellableSelectedIds)
        await revokePurchase(id, rejectReason.trim());
    } else if (type === "sale") {
      const { revokeSale } = await import("@/actions/sale-actions");
      for (const id of cancellableSelectedIds)
        await revokeSale(id, rejectReason.trim());
    } else if (type === "invoice") {
      const { revokeExpense } = await import("@/actions/expense-actions");
      for (const id of cancellableSelectedIds)
        await revokeExpense(id, rejectReason.trim());
    } else if (type === "production") {
      const { revokeProduction } = await import("@/actions/production-actions");
      for (const id of cancellableSelectedIds) {
        if (id.startsWith("pengikisan-")) {
          const { deletePengikisan } = await import(
            "@/actions/pengikisan-actions"
          );
          await deletePengikisan(id.replace("pengikisan-", ""));
        } else if (id.startsWith("pemotongan-")) {
          const { deletePemotongan } = await import(
            "@/actions/pemotongan-actions"
          );
          await deletePemotongan(id.replace("pemotongan-", ""));
        } else if (id.startsWith("penjemuran-")) {
          const { deletePenjemuran } = await import(
            "@/actions/penjemuran-actions"
          );
          await deletePenjemuran(id.replace("penjemuran-", ""));
        } else if (id.startsWith("pengemasan-")) {
          const { deletePengemasan } = await import(
            "@/actions/pengemasan-actions"
          );
          await deletePengemasan(id.replace("pengemasan-", ""));
        } else {
          await revokeProduction(id, rejectReason.trim());
        }
      }
    }
    setSelectedIds([]);
    setRejectReason("");
    setOpenReject(false);
  };

  const handleMassUpload = async (file: File) => {
    setMassBusy(true);
    setMassReport(null);
    setMassRows(null);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any[]>(sheet, {
        header: 1,
        raw: false,
        dateNF: "yyyy-mm-dd",
      }) as any[][];
      const data = rows.slice(1); // skip header

      const valid: MassRow[] = [];
      const errors: { row: number; reason: string }[] = [];

      data.forEach((cols, idx) => {
        const rowNum = idx + 2; // 1-based including header

        let dateStr = "";
        const rawC0 = cols?.[0];
        const c0String = (rawC0 ?? "").toString();

        if (rawC0 instanceof Date) {
          try {
            dateStr = rawC0.toISOString().slice(0, 10);
          } catch {
            dateStr = "";
          }
        } else {
          dateStr = c0String.trim();

          // Handle potential Excel serial number
          if (
            !isNaN(Number(dateStr)) &&
            Number(dateStr) > 20000 &&
            Number(dateStr) < 60000
          ) {
            const serial = Number(dateStr);
            // Excel base date correction
            const d = new Date(Math.round((serial - 25569) * 86400 * 1000));
            dateStr = d.toISOString().slice(0, 10);
          }
        }

        // Basic validation for blank row
        const hasContent = cols.some(
          (c) => c != null && c.toString().trim() !== ""
        );
        if (!hasContent) return;

        if (!dateStr) {
          errors.push({ row: rowNum, reason: "tanggal kosong" });
          return;
        }
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) {
          errors.push({ row: rowNum, reason: "format tanggal salah" });
          return;
        }
        const year = d.getFullYear();
        if (year < 2000 || year > 2100) {
          errors.push({
            row: rowNum,
            reason: `tahun tidak valid (${year})`,
          });
          return;
        }
        const date = d.toISOString().slice(0, 10);

        if (type === "purchase") {
          const c1 = (cols?.[1] ?? "").toString(); // Supplier
          const c2 = (cols?.[2] ?? "").toString(); // Item
          const c3 = (cols?.[3] ?? "").toString(); // Unit
          const c4 = (cols?.[4] ?? "").toString(); // Qty
          const c5 = (cols?.[5] ?? "").toString(); // Price

          const supplier = c1.trim().toUpperCase();
          const item = c2.trim().toUpperCase();
          const unit = c3.trim().toUpperCase();
          const qtyRaw = c4;
          const priceRaw = c5;
          const qty = parseFloat(qtyRaw.replace(/[^0-9.\-]/g, ""));
          const price = parseFloat(priceRaw.replace(/[^0-9.\-]/g, ""));

          if (!supplier) {
            errors.push({ row: rowNum, reason: "supplier kosong" });
            return;
          }
          if (!item) {
            errors.push({ row: rowNum, reason: "nama barang kosong" });
            return;
          }
          if (!isFinite(qty)) {
            errors.push({ row: rowNum, reason: "qty harus angka" });
            return;
          }
          if (!isFinite(price)) {
            errors.push({ row: rowNum, reason: "harga harus angka" });
            return;
          }
          valid.push({
            date,
            party: supplier,
            item,
            unit,
            qty,
            price,
            _row: rowNum,
          });
        } else if (type === "production") {
          const c1 = (cols?.[1] ?? "").toString(); // Nama Pekerja (Item)
          // Petugas diisi otomatis oleh session login
          const petugas = "";

          const worker = c1.trim().toUpperCase();
          if (!worker) {
            errors.push({ row: rowNum, reason: "nama pekerja kosong" });
            return;
          }

          if (subType === "Pengikisan") {
            const ka = parseFloat(
              (cols?.[2] ?? "0").toString().replace(/[^0-9.\-]/g, "")
            );
            const stik = parseFloat(
              (cols?.[3] ?? "0").toString().replace(/[^0-9.\-]/g, "")
            );
            valid.push({
              date,
              party: petugas,
              item: worker,
              val1: ka,
              val2: stik,
              _row: rowNum,
            });
          } else if (subType === "Pemotongan") {
            const qty = parseFloat(
              (cols?.[2] ?? "0").toString().replace(/[^0-9.\-]/g, "")
            );
            const rate = parseFloat(
              (cols?.[3] ?? "0").toString().replace(/[^0-9.\-]/g, "")
            );
            valid.push({
              date,
              party: petugas,
              item: worker,
              val1: qty,
              rate1: rate,
              _row: rowNum,
            });
          } else if (subType === "Penjemuran") {
            const hari = parseFloat(
              (cols?.[2] ?? "0").toString().replace(/[^0-9.\-]/g, "")
            );
            const lembur = parseFloat(
              (cols?.[3] ?? "0").toString().replace(/[^0-9.\-]/g, "")
            );
            const rateHarian = parseFloat(
              (cols?.[4] ?? "0").toString().replace(/[^0-9.\-]/g, "")
            );
            const rateLembur = parseFloat(
              (cols?.[5] ?? "0").toString().replace(/[^0-9.\-]/g, "")
            );
            valid.push({
              date,
              party: petugas,
              item: worker,
              val1: hari,
              val2: lembur,
              rate1: rateHarian,
              rate2: rateLembur,
              _row: rowNum,
            });
          } else if (subType === "Pengemasan") {
            const bungkus = parseFloat(
              (cols?.[2] ?? "0").toString().replace(/[^0-9.\-]/g, "")
            );
            const rate = parseFloat(
              (cols?.[3] ?? "0").toString().replace(/[^0-9.\-]/g, "")
            );
            valid.push({
              date,
              party: petugas,
              item: worker,
              val1: bungkus,
              rate1: rate,
              _row: rowNum,
            });
          }
        }
      });

      setMassRows(valid);
      setMassReport({
        success: valid.length,
        failed: errors.length,
        errors,
      });
    } catch (_err) {
      setMassReport({
        success: 0,
        failed: 1,
        errors: [{ row: 0, reason: "Gagal memproses file XLSX" }],
      });
    } finally {
      setMassBusy(false);
    }
  };

  const handleMassCommit = async () => {
    if (!massRows || massRows.length === 0) return;
    setMassBusy(true);
    try {
      if (type === "purchase") {
        const byKey = new Map<string, MassRow[]>();
        massRows.forEach((r) => {
          const key = JSON.stringify({ s: r.party, d: r.date });
          const arr = byKey.get(key) ?? [];
          arr.push(r);
          byKey.set(key, arr);
        });
        const uniqueSuppliers = new Set(massRows.map((r) => r.party));
        for (const s of uniqueSuppliers) {
          await quickCreateSupplier(s);
        }
        for (const [key, items] of byKey.entries()) {
          const { s: supplier, d: date } = JSON.parse(key);
          const itemInputs = [];
          for (const r of items) {
            const it = await quickCreateItemType(r.item);
            const u = r.unit ? await quickCreateUnit(r.unit) : null;
            itemInputs.push({
              itemTypeId: it.id,
              qty: String(r.qty),
              unitId: u ? u.id : undefined,
              unitCost: String(r.price),
            });
          }
          await createPurchase({
            supplier,
            date,
            status: "draft",
            notes: null,
            items: itemInputs,
          });
        }
      } else if (type === "production") {
        // Group by date + petugas + rates
        // Construct key based on subType requirements
        const byKey = new Map<string, MassRow[]>();

        massRows.forEach((r) => {
          let keyObj: any = { p: r.party, d: r.date };
          if (subType === "Pemotongan" || subType === "Pengemasan") {
            keyObj.r1 = r.rate1;
          } else if (subType === "Penjemuran") {
            keyObj.r1 = r.rate1;
            keyObj.r2 = r.rate2;
          }
          // Pengikisan no rates needed in key (constants)

          const key = JSON.stringify(keyObj);
          const arr = byKey.get(key) ?? [];
          arr.push(r);
          byKey.set(key, arr);
        });

        for (const [key, items] of byKey.entries()) {
          const keyObj = JSON.parse(key);
          const { p: petugas, d: date } = keyObj;

          if (subType === "Pengikisan") {
            await createPengikisan({
              date,
              petugas: petugas || null,
              items: items.map((r) => ({
                nama: r.item,
                kaKg: String(r.val1 || 0),
                stikKg: String(r.val2 || 0),
              })),
            });
          } else if (subType === "Pemotongan") {
            await createPemotongan({
              date,
              petugas: petugas || null,
              upahPerKg: String(keyObj.r1 || 0),
              items: items.map((r) => ({
                nama: r.item,
                qty: String(r.val1 || 0),
              })),
            });
          } else if (subType === "Penjemuran") {
            await createPenjemuran({
              date,
              petugas: petugas || null,
              upahPerHari: String(keyObj.r1 || 0),
              upahLemburPerJam: String(keyObj.r2 || 0),
              items: items.map((r) => ({
                nama: r.item,
                hari: String(r.val1 || 0),
                lemburJam: String(r.val2 || 0),
              })),
            });
          } else if (subType === "Pengemasan") {
            await createPengemasan({
              date,
              petugas: petugas || null,
              upahPerBungkus: String(keyObj.r1 || 0),
              items: items.map((r) => ({
                nama: r.item,
                bungkus: String(r.val1 || 0),
              })),
            });
          }
        }
      }
      setOpenMass(false);
      setMassRows(null);
    } finally {
      setMassBusy(false);
    }
  };

  return (
    <section className="rounded-xl bg-white p-0 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-900">{title}</span>
          <span className="text-[11px] text-slate-500">
            {totalCount} transaksi {type === "production" ? "produksi" : ""}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-800">
            Total nominal: {toCurrency(totalNominal)}
          </span>
          {extraHeaderContent}
          {(type === "purchase" ||
            type === "sale" ||
            type === "invoice" ||
            type === "production") && (
            <div className="flex items-center gap-2">
              {(type === "purchase" || type === "production") && (
                <button
                  onClick={() => setOpenMass(true)}
                  className="flex items-center gap-1 rounded-md bg-indigo-600 px-2 py-1 text-[11px] text-white hover:bg-indigo-700"
                >
                  <UploadIcon fontSize="small" />
                  Input Massal
                </button>
              )}
              {type === "production" && subType && (
                <button
                  onClick={() => {
                    const shouldOpenModal =
                      subType === "Pengikisan" ||
                      subType === "Pemotongan" ||
                      subType === "Penjemuran" ||
                      subType === "Pengemasan" ||
                      subType === "Produksi Lainnya";
                    if (shouldOpenModal) {
                      const now = new Date();
                      if (!reportYear)
                        setReportYear(String(now.getFullYear()));
                      if (!reportMonth)
                        setReportMonth(String(now.getMonth() + 1));
                      setReportMode("month");
                      setOpenReport(true);
                    } else {
                      handleDownloadReport("monthly");
                    }
                  }}
                  className="flex items-center gap-1 rounded-md bg-emerald-700 px-2 py-1 text-[11px] text-white hover:bg-emerald-800"
                  title="Download laporan produksi"
                >
                  <DownloadIcon fontSize="small" />
                  Download Laporan
                </button>
              )}
              <button
                onClick={() => {
                  const style = `
                    <style>
                      @page { size: A4; margin: 20mm; }
                      body { font-family: Arial, sans-serif; color: #0f172a; }
                      .header { display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px; }
                      .header img { height: 40px; }
                      .title { font-size: 16px; font-weight: 700; }
                      .meta { font-size: 12px; color: #475569; }
                      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                      th, td { border: 1px solid #e2e8f0; padding: 6px 8px; font-size: 12px; }
                      th { background: #f8fafc; text-align: left; }
                      tfoot td { font-weight: 700; }
                    </style>
                  `;
                  const rows = sortedEntries.map((e) => ({
                    Tanggal: new Date(e.date).toLocaleString(),
                    Jenis: e.type,
                    Status: e.status.toUpperCase(),
                    Pihak: e.counterparty ?? "-",
                    Total: e.total != null ? toCurrency(e.total) : "-",
                    Catatan: e.notes ?? "-",
                  }));
                  const headers = [
                    "Tanggal",
                    "Jenis",
                    "Status",
                    "Pihak",
                    "Total",
                    "Catatan",
                  ];
                  const tableHead = `<tr>${headers
                    .map((h) => `<th>${h}</th>`)
                    .join("")}</tr>`;
                  const tableBody = rows
                    .map(
                      (r) =>
                        `<tr>${headers
                          .map((h) => `<td>${(r as any)[h]}</td>`)
                          .join("")}</tr>`
                    )
                    .join("");
                  const totalSum = sortedEntries.reduce(
                    (s, e) => s + (e.status === "cancelled" ? 0 : e.total ?? 0),
                    0
                  );
                  const titleMap: Record<string, string> = {
                    purchase: "Pembelian",
                    sale: "Penjualan",
                    invoice: "Invoice",
                    production: "Produksi",
                  };
                  const reportTitle = titleMap[type] || "Laporan";
                  const html = `
                    <html>
                    <head>${style}</head>
                    <body>
                      <div class="header">
                        <img src="/logoAMP.png" alt="Logo" />
                        <div>
                          <div class="title">Laporan ${reportTitle}</div>
                          <div class="meta">Dibuat: ${new Date().toLocaleString()}</div>
                        </div>
                      </div>
                      <table>
                        <thead>${tableHead}</thead>
                        <tbody>${tableBody}</tbody>
                        <tfoot><tr><td colspan="4">Total</td><td>${toCurrency(
                          totalSum
                        )}</td><td></td></tr></tfoot>
                      </table>
                    </body>
                    </html>
                  `;
                  const win = window.open("", "_blank");
                  if (win) {
                    win.document.open();
                    win.document.write(html);
                    win.document.close();
                    setTimeout(() => win.print(), 300);
                  }
                }}
                className="flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-[11px] text-white hover:bg-blue-700"
                title="Download PDF"
              >
                <DownloadIcon fontSize="small" />
                PDF
              </button>
              <button
                onClick={() => setOpenApprove(true)}
                disabled={draftSelectedIds.length === 0}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] ${
                  draftSelectedIds.length === 0
                    ? "bg-emerald-100 text-emerald-400 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                <CheckCircleIcon fontSize="small" />
                Setujui Massal
              </button>
              <button
                onClick={() => setOpenReject(true)}
                disabled={cancellableSelectedIds.length === 0}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] ${
                  cancellableSelectedIds.length === 0
                    ? "bg-red-100 text-red-400 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                <CancelIcon fontSize="small" />
                Batalkan Massal
              </button>
            </div>
          )}
        </div>
      </div>
      <LedgerTable
        entries={currentEntries}
        selectedIds={selectedIds}
        onToggle={toggleId}
        onToggleAll={(ids) => {
          if (ids.length === 0) {
            // unselect current page
            setSelectedIds((prev) =>
              prev.filter((id) => !currentIds.includes(id))
            );
          } else {
            toggleAll(ids);
          }
        }}
        onView={(entry) => {
          setSelectedEntry(entry);
          setOpenView(true);
        }}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {entries.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="text-[11px] text-slate-500">
              Halaman {page} dari {totalPages}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500">Tampilkan</span>
              <select
                value={pageSize === "all" ? "all" : String(pageSize)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "all") {
                    setPageSize("all");
                    setPage(1);
                  } else {
                    const n = parseInt(v, 10);
                    setPageSize(isNaN(n) ? 10 : n);
                    setPage(1);
                  }
                }}
                className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 bg-white"
              >
                <option value="10">10</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="all">Semua</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={page === 1 || totalPages <= 1}
              className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={page === totalPages || totalPages <= 1}
              className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <GlassDialog
        open={openApprove}
        title="Konfirmasi Persetujuan"
        onClose={() => setOpenApprove(false)}
        actions={
          <>
            <button
              onClick={() => setOpenApprove(false)}
              className="rounded-md bg-slate-100 px-3 py-1 text-[12px] text-slate-800 hover:bg-slate-200"
            >
              Batal
            </button>
            <button
              onClick={handleApproveMass}
              className="rounded-md bg-emerald-600 px-3 py-1 text-[12px] text-white hover:bg-emerald-700"
            >
              Setujui
            </button>
          </>
        }
      >
        <div className="text-sm text-slate-700">
          Anda akan menyetujui {draftSelectedIds.length} transaksi (status
          draft). Lanjutkan?
        </div>
      </GlassDialog>

      <GlassDialog
        open={openReject}
        title="Konfirmasi Pembatalan"
        onClose={() => setOpenReject(false)}
        actions={
          <>
            <button
              onClick={() => setOpenReject(false)}
              className="rounded-md bg-slate-100 px-3 py-1 text-[12px] text-slate-800 hover:bg-slate-200"
            >
              Batal
            </button>
            <button
              onClick={handleRejectMass}
              className="rounded-md bg-red-600 px-3 py-1 text-[12px] text-white hover:bg-red-700"
            >
              Proses
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          <div className="text-sm text-slate-700">
            Anda akan membatalkan {cancellableSelectedIds.length} transaksi yang
            dipilih. Transaksi yang sudah diposting akan dikembalikan stoknya.
          </div>
          <TextField
            label="Alasan pembatalan (wajib)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            size="small"
          />
        </div>
      </GlassDialog>

      <GlassDialog
        open={openView}
        title="Detail Transaksi"
        onClose={() => setOpenView(false)}
        fullWidth
        maxWidth="lg"
        actions={
          <>
            <button
              onClick={() => setOpenView(false)}
              className="rounded-md bg-slate-100 px-3 py-1 text-[12px] text-slate-800 hover:bg-slate-200"
            >
              Tutup
            </button>
          </>
        }
      >
        {selectedEntry ? (
          <div className="grid gap-3 text-sm">
            <div className="space-y-1">
              <div>
                <span className="font-medium">Tanggal:</span>{" "}
                {new Date(selectedEntry.date).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Supplier:</span>{" "}
                {selectedEntry.counterparty || "-"}
              </div>
              <div>
                <span className="font-medium">Catatan:</span>{" "}
                {selectedEntry.notes || "-"}
              </div>
            </div>
            <div className="overflow-auto">
              {selectedEntry.subType === "Pengikisan" &&
              selectedEntry.pengikisanItems &&
              selectedEntry.pengikisanItems.length > 0 ? (
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700">
                      <th className="border border-slate-200 px-2 py-1 text-left w-10">
                        #
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-left">
                        Pekerja
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        KA (kg)
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Stik (kg)
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Upah KA
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Upah Stik
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEntry.pengikisanItems.map((it, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-200 px-2 py-1">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-200 px-2 py-1">
                          {it.nama}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {it.kaKg}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {it.stikKg}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {toCurrency(it.upahKa)}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {toCurrency(it.upahStik)}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {toCurrency(it.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        className="border border-slate-200 px-2 py-1 font-semibold"
                        colSpan={6}
                      >
                        Total
                      </td>
                      <td className="border border-slate-200 px-2 py-1 text-right font-semibold">
                        {toCurrency(
                          selectedEntry.pengikisanItems.reduce(
                            (s, it) => s + it.total,
                            0
                          )
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : selectedEntry.subType === "Pemotongan" &&
                selectedEntry.pemotonganItems &&
                selectedEntry.pemotonganItems.length > 0 ? (
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700">
                      <th className="border border-slate-200 px-2 py-1 text-left w-10">
                        #
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-left">
                        Pekerja
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Qty (kg)
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEntry.pemotonganItems.map((it, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-200 px-2 py-1">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-200 px-2 py-1">
                          {it.nama}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {it.qty}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {toCurrency(it.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        className="border border-slate-200 px-2 py-1 font-semibold"
                        colSpan={3}
                      >
                        Total
                      </td>
                      <td className="border border-slate-200 px-2 py-1 text-right font-semibold">
                        {toCurrency(
                          selectedEntry.pemotonganItems.reduce(
                            (s, it) => s + it.total,
                            0
                          )
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : selectedEntry.subType === "Penjemuran" &&
                selectedEntry.penjemuranItems &&
                selectedEntry.penjemuranItems.length > 0 ? (
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700">
                      <th className="border border-slate-200 px-2 py-1 text-left w-10">
                        #
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-left">
                        Pekerja
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Hari
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Lembur (jam)
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Upah Harian
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Upah Lembur
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEntry.penjemuranItems.map((it, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-200 px-2 py-1">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-200 px-2 py-1">
                          {it.nama}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {it.hari}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {it.lemburJam}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {toCurrency(it.upahPerHari)}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {toCurrency(it.upahLemburPerJam)}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {toCurrency(it.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        className="border border-slate-200 px-2 py-1 font-semibold"
                        colSpan={6}
                      >
                        Total
                      </td>
                      <td className="border border-slate-200 px-2 py-1 text-right font-semibold">
                        {toCurrency(
                          selectedEntry.penjemuranItems.reduce(
                            (s, it) => s + it.total,
                            0
                          )
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : selectedEntry.subType === "Pengemasan" &&
                selectedEntry.pengemasanItems &&
                selectedEntry.pengemasanItems.length > 0 ? (
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700">
                      <th className="border border-slate-200 px-2 py-1 text-left w-10">
                        #
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-left">
                        Pekerja
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Bungkus
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Upah/Bungkus
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEntry.pengemasanItems.map((it, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-200 px-2 py-1">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-200 px-2 py-1">
                          {it.nama}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {it.bungkus}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {toCurrency(it.upahPerBungkus)}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {toCurrency(it.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        className="border border-slate-200 px-2 py-1 font-semibold"
                        colSpan={4}
                      >
                        Total
                      </td>
                      <td className="border border-slate-200 px-2 py-1 text-right font-semibold">
                        {toCurrency(
                          selectedEntry.pengemasanItems.reduce(
                            (s, it) => s + it.total,
                            0
                          )
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : selectedEntry.lines && selectedEntry.lines.length > 0 ? (
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700">
                      <th className="border border-slate-200 px-2 py-1 text-left w-10">
                        #
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-left">
                        Barang
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-left">
                        Qty - Satuan
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Harga
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEntry.lines.map((ln, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-200 px-2 py-1">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-200 px-2 py-1">
                          {ln.name}
                        </td>
                        <td className="border border-slate-200 px-2 py-1">
                          {ln.qty} {ln.unit ?? ""}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {toCurrency(ln.price)}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {toCurrency(ln.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        className="border border-slate-200 px-2 py-1 font-semibold"
                        colSpan={4}
                      >
                        Total
                      </td>
                      <td className="border border-slate-200 px-2 py-1 text-right font-semibold">
                        {toCurrency(
                          selectedEntry.lines.reduce(
                            (s, l) => s + l.subtotal,
                            0
                          )
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <div className="text-xs text-slate-500">Tidak ada item</div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-600">Tidak ada data</div>
        )}
      </GlassDialog>

      {type === "production" &&
        subType &&
        (subType === "Pengikisan" ||
          subType === "Pemotongan" ||
          subType === "Penjemuran" ||
          subType === "Pengemasan" ||
          subType === "Produksi Lainnya") && (
        <GlassDialog
          open={openReport}
          title={`Download Laporan Produksi (${subType})`}
          onClose={() => setOpenReport(false)}
          fullWidth
          maxWidth="sm"
          actions={
            <>
              <button
                onClick={() => setOpenReport(false)}
                className="rounded-md bg-slate-100 px-3 py-1 text-[12px] text-slate-800 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (subType === "Pengikisan") {
                    handleDownloadPengikisanPdfReport();
                  } else if (
                    reportMode === "month" &&
                    (subType === "Pemotongan" ||
                      subType === "Penjemuran" ||
                      subType === "Pengemasan" ||
                      subType === "Produksi Lainnya")
                  ) {
                    handleDownloadUpahMonthlyPdfReport();
                  } else {
                    handleDownloadProductionRangePdfReport();
                  }
                }}
                className="rounded-md bg-indigo-600 px-3 py-1 text-[12px] text-white hover:bg-indigo-700"
              >
                Download PDF
              </button>
            </>
          }
        >
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex gap-4">
              <label className="flex items-center gap-1 text-[13px]">
                <input
                  type="radio"
                  className="h-3 w-3"
                  checked={reportMode === "range"}
                  onChange={() => setReportMode("range")}
                />
                <span>Per Tanggal</span>
              </label>
              <label className="flex items-center gap-1 text-[13px]">
                <input
                  type="radio"
                  className="h-3 w-3"
                  checked={reportMode === "month"}
                  onChange={() => setReportMode("month")}
                />
                <span>Per Bulan</span>
              </label>
            </div>
            {reportMode === "range" ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-20 text-[13px] text-slate-700">
                    Dari
                  </span>
                  <input
                    type="date"
                    value={reportStart}
                    onChange={(e) => setReportStart(e.target.value)}
                    className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-[13px]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-20 text-[13px] text-slate-700">
                    Sampai
                  </span>
                  <input
                    type="date"
                    value={reportEnd}
                    onChange={(e) => setReportEnd(e.target.value)}
                    className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-[13px]"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-20 text-[13px] text-slate-700">Bulan</span>
                <select
                  value={reportMonth}
                  onChange={(e) => setReportMonth(e.target.value)}
                  className="rounded-md border border-slate-200 px-2 py-1 text-[13px]"
                >
                  <option value="">Pilih bulan</option>
                  <option value="1">Januari</option>
                  <option value="2">Februari</option>
                  <option value="3">Maret</option>
                  <option value="4">April</option>
                  <option value="5">Mei</option>
                  <option value="6">Juni</option>
                  <option value="7">Juli</option>
                  <option value="8">Agustus</option>
                  <option value="9">September</option>
                  <option value="10">Oktober</option>
                  <option value="11">November</option>
                  <option value="12">Desember</option>
                </select>
                <span className="text-[13px] text-slate-700">Tahun</span>
                <input
                  type="number"
                  value={reportYear}
                  onChange={(e) => setReportYear(e.target.value)}
                  className="w-24 rounded-md border border-slate-200 px-2 py-1 text-[13px]"
                />
              </div>
            )}
            <div className="text-[11px] text-slate-500">
              Laporan akan diunduh sebagai file Excel dengan format baris per
              pekerja dan kolom tanggal, mirip dengan contoh yang Anda kirim.
            </div>
          </div>
        </GlassDialog>
      )}

      {(type === "purchase" || type === "production") && (
        <GlassDialog
          open={openMass}
          title={`Input Massal ${
            type === "purchase" ? "Pembelian" : `Produksi (${subType})`
          }`}
          onClose={() => !massBusy && setOpenMass(false)}
          fullWidth
          maxWidth="lg"
          actions={
            <>
              <button
                onClick={() => {
                  let headers: string[] = [];
                  if (type === "purchase") {
                    headers = [
                      "tanggal",
                      "nama suplier",
                      "nama barang",
                      "satuan",
                      "qty",
                      "harga",
                    ];
                  } else if (type === "production") {
                    if (subType === "Pengikisan")
                      headers = [
                        "tanggal",
                        "nama pekerja",
                        "ka (kg)",
                        "stik (kg)",
                      ];
                    else if (subType === "Pemotongan")
                      headers = [
                        "tanggal",
                        "nama pekerja",
                        "qty (kg)",
                        "upah per kg",
                      ];
                    else if (subType === "Penjemuran")
                      headers = [
                        "tanggal",
                        "nama pekerja",
                        "hari",
                        "lembur (jam)",
                        "upah harian",
                        "upah lembur",
                      ];
                    else if (subType === "Pengemasan")
                      headers = [
                        "tanggal",
                        "nama pekerja",
                        "bungkus",
                        "upah per bungkus",
                      ];
                  }

                  const ws = XLSX.utils.aoa_to_sheet([headers]);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "Template");
                  const out = XLSX.write(wb, {
                    type: "array",
                    bookType: "xlsx",
                  });
                  const blob = new Blob([out], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `template-${type}-${subType || "purchase"}.xlsx`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="rounded-md bg-blue-600 px-3 py-1 text-[12px] text-white hover:bg-blue-700"
              >
                Download Template (XLSX)
              </button>
              <button
                onClick={handleMassCommit}
                disabled={massBusy || !massRows || massRows.length === 0}
                className={`rounded-md px-3 py-1 text-[12px] ${
                  massBusy || !massRows || massRows.length === 0
                    ? "bg-emerald-100 text-emerald-400 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
                title="Masukkan data hasil preview ke database"
              >
                Masukkan ke Database
              </button>
              <button
                onClick={() => setOpenMass(false)}
                disabled={massBusy}
                className="rounded-md bg-slate-100 px-3 py-1 text-[12px] text-slate-800 hover:bg-slate-200 disabled:opacity-50"
              >
                Tutup
              </button>
            </>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border border-slate-200 p-3">
              <div className="font-medium mb-2">Unduh Template</div>
              <p className="text-xs text-slate-600 mb-3">
                Gunakan template ini untuk mengisi data. Jangan ubah urutan
                kolom. Tanggal harus format YYYY-MM-DD atau format tanggal
                Excel.
              </p>
            </div>
            <div
              className={`rounded-md border border-dashed p-3 flex flex-col items-center justify-center gap-2 transition-colors ${
                dragOver ? "border-indigo-400 bg-indigo-50" : "border-slate-300"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={async (e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (!file) return;
                await handleMassUpload(file);
              }}
            >
              <div className="font-medium">Drop atau klik untuk upload</div>
              <div className="text-xs text-slate-600">Terima .xlsx</div>
              <input
                id="mass-upload-input"
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  await handleMassUpload(file);
                }}
              />
              <button
                onClick={() =>
                  document.getElementById("mass-upload-input")?.click()
                }
                className="rounded-md border border-slate-300 px-3 py-1 text-[12px] hover:bg-slate-50"
              >
                Pilih File XLSX
              </button>
            </div>
            {massReport && (
              <div className="md:col-span-2 rounded-md border border-slate-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Ringkasan Upload</div>
                  <div className="text-xs text-slate-600">
                    Berhasil:{" "}
                    <span className="font-semibold text-emerald-700">
                      {massReport.success}
                    </span>{" "}
                    &nbsp;|&nbsp; Gagal:{" "}
                    <span className="font-semibold text-rose-700">
                      {massReport.failed}
                    </span>
                  </div>
                </div>
                {massReport.errors.length > 0 ? (
                  <table className="w-full text-xs border border-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="border border-slate-200 px-2 py-1 w-20">
                          Baris
                        </th>
                        <th className="border border-slate-200 px-2 py-1">
                          Penyebab
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {massReport.errors.map((e, i) => (
                        <tr key={i}>
                          <td className="border border-slate-200 px-2 py-1 text-center">
                            {e.row}
                          </td>
                          <td className="border border-slate-200 px-2 py-1">
                            {e.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-xs text-emerald-700">
                    Semua baris berhasil diproses.
                  </div>
                )}
              </div>
            )}
            {massRows && massRows.length > 0 && (
              <div className="md:col-span-2 rounded-md border border-slate-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Preview Data</div>
                  <div className="text-xs text-slate-600">
                    Total baris valid: {massRows.length}
                  </div>
                </div>
                <div className="max-h-72 overflow-auto">
                  <table className="w-full text-xs border border-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="border border-slate-200 px-2 py-1 w-24">
                          Tanggal
                        </th>
                        <th className="border border-slate-200 px-2 py-1">
                          {type === "purchase" ? "Supplier" : "Petugas"}
                        </th>
                        <th className="border border-slate-200 px-2 py-1">
                          {type === "purchase" ? "Nama Barang" : "Nama Pekerja"}
                        </th>
                        {type === "purchase" && (
                          <>
                            <th className="border border-slate-200 px-2 py-1">
                              Satuan
                            </th>
                            <th className="border border-slate-200 px-2 py-1 text-right">
                              Qty
                            </th>
                            <th className="border border-slate-200 px-2 py-1 text-right">
                              Harga
                            </th>
                          </>
                        )}
                        {subType === "Pengikisan" && (
                          <>
                            <th className="border border-slate-200 px-2 py-1 text-right">
                              KA (kg)
                            </th>
                            <th className="border border-slate-200 px-2 py-1 text-right">
                              Stik (kg)
                            </th>
                          </>
                        )}
                        {subType === "Pemotongan" && (
                          <>
                            <th className="border border-slate-200 px-2 py-1 text-right">
                              Qty (kg)
                            </th>
                            <th className="border border-slate-200 px-2 py-1 text-right">
                              Upah/kg
                            </th>
                          </>
                        )}
                        {subType === "Penjemuran" && (
                          <>
                            <th className="border border-slate-200 px-2 py-1 text-right">
                              Hari
                            </th>
                            <th className="border border-slate-200 px-2 py-1 text-right">
                              Lembur (jam)
                            </th>
                            <th className="border border-slate-200 px-2 py-1 text-right">
                              Upah Harian
                            </th>
                            <th className="border border-slate-200 px-2 py-1 text-right">
                              Upah Lembur
                            </th>
                          </>
                        )}
                        {subType === "Pengemasan" && (
                          <>
                            <th className="border border-slate-200 px-2 py-1 text-right">
                              Bungkus
                            </th>
                            <th className="border border-slate-200 px-2 py-1 text-right">
                              Upah/Bungkus
                            </th>
                          </>
                        )}
                        <th className="border border-slate-200 px-2 py-1 w-20 text-center">
                          Baris
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {massRows.map((r, i) => (
                        <tr key={i}>
                          <td className="border border-slate-200 px-2 py-1 text-center">
                            {r.date}
                          </td>
                          <td className="border border-slate-200 px-2 py-1">
                            {r.party}
                          </td>
                          <td className="border border-slate-200 px-2 py-1">
                            {r.item}
                          </td>
                          {type === "purchase" && (
                            <>
                              <td className="border border-slate-200 px-2 py-1">
                                {r.unit}
                              </td>
                              <td className="border border-slate-200 px-2 py-1 text-right">
                                {r.qty}
                              </td>
                              <td className="border border-slate-200 px-2 py-1 text-right">
                                {r.price}
                              </td>
                            </>
                          )}
                          {subType === "Pengikisan" && (
                            <>
                              <td className="border border-slate-200 px-2 py-1 text-right">
                                {r.val1}
                              </td>
                              <td className="border border-slate-200 px-2 py-1 text-right">
                                {r.val2}
                              </td>
                            </>
                          )}
                          {subType === "Pemotongan" && (
                            <>
                              <td className="border border-slate-200 px-2 py-1 text-right">
                                {r.val1}
                              </td>
                              <td className="border border-slate-200 px-2 py-1 text-right">
                                {r.rate1}
                              </td>
                            </>
                          )}
                          {subType === "Penjemuran" && (
                            <>
                              <td className="border border-slate-200 px-2 py-1 text-right">
                                {r.val1}
                              </td>
                              <td className="border border-slate-200 px-2 py-1 text-right">
                                {r.val2}
                              </td>
                              <td className="border border-slate-200 px-2 py-1 text-right">
                                {r.rate1}
                              </td>
                              <td className="border border-slate-200 px-2 py-1 text-right">
                                {r.rate2}
                              </td>
                            </>
                          )}
                          {subType === "Pengemasan" && (
                            <>
                              <td className="border border-slate-200 px-2 py-1 text-right">
                                {r.val1}
                              </td>
                              <td className="border border-slate-200 px-2 py-1 text-right">
                                {r.rate1}
                              </td>
                            </>
                          )}
                          <td className="border border-slate-200 px-2 py-1 text-center">
                            {r._row}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </GlassDialog>
      )}
    </section>
  );
}
