"use client";

import { useState, useEffect } from "react";
import GlassDialog from "@/components/ui/GlassDialog";
import { TextField } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { LedgerEntry } from "./types";
import {
  generatePengikisanReport,
  generateProductionRangeReport,
  generateWagesMonthlyReport,
  generateWagesRangeReport,
} from "./PdfReportGenerator";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  type: string;
  subType?: string;
  entries: LedgerEntry[]; // Should be sortedEntries
};

export function ReportDownloadModal({
  isOpen,
  onClose,
  type,
  subType,
  entries,
}: Props) {
  const [reportMode, setReportMode] = useState<"range" | "month">("month");
  const [reportStart, setReportStart] = useState("");
  const [reportEnd, setReportEnd] = useState("");
  const [reportMonth, setReportMonth] = useState("");
  const [reportYear, setReportYear] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize defaults
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setReportMonth(String(now.getMonth() + 1));
      setReportYear(String(now.getFullYear()));
      setReportMode("month");
      setReportStart("");
      setReportEnd("");
    }
  }, [isOpen]);

  const handleDownload = async (reportType: "production" | "wages") => {
    if (!subType) return;
    setIsGenerating(true);

    try {
      if (reportType === "production") {
        if (subType === "Pengikisan") {
          // Pengikisan usually has special handling, or treat as production?
          // User mentioned "JUMLAH UPAH Pengikisan", which implies wages.
          // But Pengikisan is a production type.
          // Let's assume standard Pengikisan report covers both or uses specific generator.
          // In the generator, I created generatePengikisanReport.
          await generatePengikisanReport(
            entries,
            reportMode,
            reportStart,
            reportEnd,
            reportMonth,
            reportYear
          );
        } else {
          await generateProductionRangeReport(
            entries,
            type,
            subType,
            reportMode,
            reportStart,
            reportEnd,
            reportMonth,
            reportYear
          );
        }
      } else {
        // Wages
        if (reportMode === "month") {
          await generateWagesMonthlyReport(
            entries,
            type,
            subType,
            reportMode,
            reportStart,
            reportEnd,
            reportMonth,
            reportYear
          );
        } else {
          await generateWagesRangeReport(
            entries,
            type,
            subType,
            reportMode,
            reportStart,
            reportEnd,
            reportMonth,
            reportYear
          );
        }
      }
      onClose();
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Gagal membuat laporan. Silakan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <GlassDialog
      open={isOpen}
      title={`Download Laporan ${subType || ""}`}
      onClose={onClose}
      actions={
        <>
          <button
            onClick={onClose}
            className="rounded-md bg-slate-100 px-3 py-1 text-[12px] text-slate-800 hover:bg-slate-200"
          >
            Batal
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4 p-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportMode("month")}
            className={`rounded-md px-3 py-1 text-xs transition-colors ${
              reportMode === "month"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Bulanan
          </button>
          <button
            onClick={() => setReportMode("range")}
            className={`rounded-md px-3 py-1 text-xs transition-colors ${
              reportMode === "range"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Rentang Tanggal
          </button>
        </div>

        {reportMode === "month" ? (
          <div className="flex gap-2">
            <TextField
              select
              label="Bulan"
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              size="small"
              SelectProps={{ native: true }}
              className="flex-1"
            >
              <option value="">Pilih Bulan</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(0, m - 1).toLocaleString("id-ID", {
                    month: "long",
                  })}
                </option>
              ))}
            </TextField>
            <TextField
              label="Tahun"
              value={reportYear}
              onChange={(e) => setReportYear(e.target.value)}
              size="small"
              className="w-24"
            />
          </div>
        ) : (
          <div className="flex gap-2">
            <TextField
              type="date"
              label="Dari"
              value={reportStart}
              onChange={(e) => setReportStart(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              className="flex-1"
            />
            <TextField
              type="date"
              label="Sampai"
              value={reportEnd}
              onChange={(e) => setReportEnd(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              className="flex-1"
            />
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 mt-2">
          <div className="text-[11px] text-slate-500 mb-2">
            Pilih jenis laporan yang ingin diunduh:
          </div>
          <button
            onClick={() => handleDownload("production")}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            <DownloadIcon fontSize="small" />
            {isGenerating ? "Memproses..." : "Laporan Produksi (PDF)"}
          </button>

          {(subType === "Pemotongan" ||
            subType === "Penjemuran" ||
            subType === "Pengemasan" ||
            subType === "Produksi Lainnya") && (
            <button
              onClick={() => handleDownload("wages")}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <DownloadIcon fontSize="small" />
              {isGenerating ? "Memproses..." : "Laporan Upah (PDF)"}
            </button>
          )}
        </div>
      </div>
    </GlassDialog>
  );
}
