"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import { revokePurchase } from "@/actions/purchase-actions";
import { revokeSale } from "@/actions/sale-actions";
import { revokeProduction } from "@/actions/production-actions";
import { approvePurchase } from "@/actions/purchase-actions";
import { approveSale } from "@/actions/sale-actions";
import GlassDialog from "@/components/ui/GlassDialog";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PrintIcon from "@mui/icons-material/Print";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { LedgerEntry } from "./types";

type Props = {
  id: string;
  type: "purchase" | "sale" | "production" | "invoice";
  status: "draft" | "posted" | "cancelled";
  entry?: LedgerEntry;
  onView?: (entry: LedgerEntry) => void;
};

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

export function LedgerActions({ id, type, status, entry, onView }: Props) {
  const router = useRouter();
  const canPrint =
    type === "purchase" ||
    type === "sale" ||
    type === "invoice" ||
    (type === "production" &&
      (entry?.subType === "Pengikisan" ||
        entry?.subType === "Pemotongan" ||
        entry?.subType === "Penjemuran" ||
        entry?.subType === "Pengemasan" ||
        entry?.subType === "Produksi Lainnya"));
  const isCancelled = status === "cancelled";
  const canApprove =
    status === "draft" &&
    (type === "purchase" || type === "sale" || type === "invoice");
  const canReject = status !== "cancelled";
  const [openApprove, setOpenApprove] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleRejectConfirm = async () => {
    const reason = rejectReason.trim();
    if (!reason) return;
    try {
      if (type === "purchase") {
        await revokePurchase(id, reason);
      } else if (type === "sale") {
        await revokeSale(id, reason);
      } else if (type === "production") {
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
          await revokeProduction(id, reason);
        }
      } else if (type === "invoice") {
        const { revokeExpense } = await import("@/actions/expense-actions");
        await revokeExpense(id, reason);
      }
      setOpenReject(false);
      setRejectReason("");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleApprove = async () => {
    if (!canApprove) return;
    try {
      if (type === "purchase") {
        await approvePurchase(id);
      } else if (type === "sale") {
        await approveSale(id);
      } else if (type === "invoice") {
        const { approveExpense } = await import("@/actions/expense-actions");
        await approveExpense(id);
      }
      setOpenApprove(false);
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleView = () => {
    if (entry && onView) {
      onView(entry);
      return;
    }
    const search = new URLSearchParams(window.location.search);
    search.set("selected", id);
    router.replace(`${window.location.pathname}?${search.toString()}`);
  };

  const handlePrintPengikisan = async () => {
    if (!entry || !entry.pengikisanItems || entry.pengikisanItems.length === 0)
      return;

    const logo = await loadLogoImage();

    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: [F4_W_MM, F4_H_MM],
    });

    const margin = PRINT_MARGIN_MM;
    const pageW = F4_W_MM;

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
      pdf.text("REKAP PENGIKISAN", pageW - margin, y + 5, {
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
      pdf.text("REKAP PENGIKISAN", pageW / 2, y, { align: "center" });
      y += 8;
      pdf.setDrawColor(26, 35, 126);
      pdf.setLineWidth(0.4);
      pdf.line(margin, y, pageW - margin, y);
      y += 4;
    }

    const dateStr = new Date(entry.date).toLocaleDateString("id-ID");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(`Tanggal: ${dateStr}`, margin, y);
    y += 5;

    if (entry.reference) {
      pdf.text(`Ref: ${entry.reference}`, margin, y);
      y += 5;
    }

    if (entry.notes) {
      pdf.text(`Catatan: ${entry.notes}`, margin, y);
      y += 5;
    }

    y += 2;

    const colNoX = margin;
    const colPekerjaX = colNoX + 10;
    const colKaX = colPekerjaX + 40;
    const colStikX = colKaX + 25;
    const colUpahKaX = colStikX + 25;
    const colUpahStikX = colUpahKaX + 25;
    const colTotalX = colUpahStikX + 30;

    const rowHeight = 6;
    const tableTop = y;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("No", colNoX, y);
    pdf.text("Pekerja", colPekerjaX, y);
    pdf.text("KA (Kg)", colKaX, y);
    pdf.text("Stik (Kg)", colStikX, y);
    pdf.text("Upah KA", colUpahKaX, y);
    pdf.text("Upah Stik", colUpahStikX, y);
    pdf.text("Total (Rp)", colTotalX, y);

    y += 2;

    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.2);

    const items = entry.pengikisanItems;
    const tableBottomY = tableTop + rowHeight * (items.length + 2);

    pdf.line(colNoX - 2, tableTop - 3, pageW - margin, tableTop - 3);
    pdf.line(colNoX - 2, tableBottomY, pageW - margin, tableBottomY);
    pdf.line(colNoX - 2, y, pageW - margin, y);

    y += 4;
    pdf.setFont("helvetica", "normal");

    let grandTotal = 0;

    items.forEach((it, idx) => {
      const ka = it.kaKg ?? 0;
      const stik = it.stikKg ?? 0;
      const upahKa = it.upahKa ?? 0;
      const upahStik = it.upahStik ?? 0;
      const total = it.total ?? ka * upahKa + stik * upahStik;

      grandTotal += total;

      pdf.text(String(idx + 1), colNoX, y);
      pdf.text(it.nama || "-", colPekerjaX, y);
      pdf.text(ka ? ka.toLocaleString("id-ID") : "-", colKaX, y);
      pdf.text(stik ? stik.toLocaleString("id-ID") : "-", colStikX, y);
      pdf.text(
        upahKa ? upahKa.toLocaleString("id-ID") : "-",
        colUpahKaX,
        y,
        { align: "right" }
      );
      pdf.text(
        upahStik ? upahStik.toLocaleString("id-ID") : "-",
        colUpahStikX,
        y,
        { align: "right" }
      );
      pdf.text(total.toLocaleString("id-ID"), colTotalX, y, {
        align: "right",
      });

      y += rowHeight;
    });

    y += 4;

    pdf.setFont("helvetica", "bold");
    pdf.text("Total Semua", colUpahStikX, y);
    pdf.text(grandTotal.toLocaleString("id-ID"), colTotalX, y, {
      align: "right",
    });

    const rawId = entry.id.startsWith("pengikisan-")
      ? entry.id.replace("pengikisan-", "")
      : entry.id;
    pdf.save(`invoice-pengikisan-${rawId}.pdf`);
  };

  const handlePrintPemotongan = async () => {
    if (
      !entry ||
      entry.subType !== "Pemotongan" ||
      !entry.pemotonganItems ||
      entry.pemotonganItems.length === 0
    )
      return;

    const logo = await loadLogoImage();

    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: [F4_W_MM, F4_H_MM],
    });

    const margin = PRINT_MARGIN_MM;
    const pageW = F4_W_MM;

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
      pdf.text("REKAP PEMOTONGAN", pageW - margin, y + 5, {
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
      pdf.text("REKAP PEMOTONGAN", pageW / 2, y, { align: "center" });
      y += 8;
      pdf.setDrawColor(26, 35, 126);
      pdf.setLineWidth(0.4);
      pdf.line(margin, y, pageW - margin, y);
      y += 4;
    }

    const dateStr = new Date(entry.date).toLocaleDateString("id-ID");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(`Tanggal: ${dateStr}`, margin, y);
    y += 5;

    if (entry.notes) {
      pdf.text(`Catatan: ${entry.notes}`, margin, y);
      y += 5;
    }

    y += 2;

    const colNoX = margin;
    const colPekerjaX = colNoX + 10;
    const colQtyX = colPekerjaX + 80;
    const colTotalX = colQtyX + 50;

    const rowHeight = 6;
    const tableTop = y;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("No", colNoX, y);
    pdf.text("Pekerja", colPekerjaX, y);
    pdf.text("Qty (Kg)", colQtyX, y);
    pdf.text("Total (Rp)", colTotalX, y);

    y += 2;

    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.2);

    const items = entry.pemotonganItems;
    const tableBottomY = tableTop + rowHeight * (items.length + 2);

    pdf.line(colNoX - 2, tableTop - 3, pageW - margin, tableTop - 3);
    pdf.line(colNoX - 2, tableBottomY, pageW - margin, tableBottomY);
    pdf.line(colNoX - 2, y, pageW - margin, y);

    y += 4;
    pdf.setFont("helvetica", "normal");

    let grandTotal = 0;

    items.forEach((it, idx) => {
      const qty = it.qty ?? 0;
      const total = it.total ?? 0;

      grandTotal += total;

      pdf.text(String(idx + 1), colNoX, y);
      pdf.text(it.nama || "-", colPekerjaX, y);
      pdf.text(qty.toLocaleString("id-ID"), colQtyX, y);
      pdf.text(total.toLocaleString("id-ID"), colTotalX, y, {
        align: "right",
      });

      y += rowHeight;
    });

    y += 4;

    pdf.setFont("helvetica", "bold");
    pdf.text("Total Semua", colQtyX, y);
    pdf.text(grandTotal.toLocaleString("id-ID"), colTotalX, y, {
      align: "right",
    });

    const rawId = entry.id.startsWith("pemotongan-")
      ? entry.id.replace("pemotongan-", "")
      : entry.id;
    pdf.save(`invoice-pemotongan-${rawId}.pdf`);
  };

  const handlePrintProduksiLainnya = async () => {
    if (
      !entry ||
      entry.subType !== "Produksi Lainnya" ||
      !entry.produksiLainnyaItems ||
      entry.produksiLainnyaItems.length === 0
    )
      return;

    const logo = await loadLogoImage();

    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: [F4_W_MM, F4_H_MM],
    });

    const margin = PRINT_MARGIN_MM;
    const pageW = F4_W_MM;

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
      pdf.text("REKAP PRODUKSI LAINNYA", pageW - margin, y + 5, {
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
      pdf.text("REKAP PRODUKSI LAINNYA", pageW / 2, y, { align: "center" });
      y += 8;
      pdf.setDrawColor(26, 35, 126);
      pdf.setLineWidth(0.4);
      pdf.line(margin, y, pageW - margin, y);
      y += 4;
    }

    const dateStr = new Date(entry.date).toLocaleDateString("id-ID");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(`Tanggal: ${dateStr}`, margin, y);
    y += 5;

    if (entry.reference) {
      pdf.text(`Ref: ${entry.reference}`, margin, y);
      y += 5;
    }

    if (entry.notes) {
      pdf.text(`Catatan: ${entry.notes}`, margin, y);
      y += 5;
    }

    y += 2;

    const colNoX = margin;
    const colPekerjaX = colNoX + 10;
    const colPekerjaanX = colPekerjaX + 40;
    const colQtyX = colPekerjaanX + 40;
    const colSatuanX = colQtyX + 20;
    const colUpahX = colSatuanX + 18;
    const colTotalX = colUpahX + 28;

    const rowHeight = 6;
    const tableTop = y;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("No", colNoX, y);
    pdf.text("Pekerja", colPekerjaX, y);
    pdf.text("Pekerjaan", colPekerjaanX, y);
    pdf.text("Qty", colQtyX, y);
    pdf.text("Satuan", colSatuanX, y);
    pdf.text("Upah", colUpahX, y);
    pdf.text("Total (Rp)", colTotalX, y);

    y += 2;

    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.2);

    const items = entry.produksiLainnyaItems;
    const tableBottomY = tableTop + rowHeight * (items.length + 2);

    pdf.line(colNoX - 2, tableTop - 3, pageW - margin, tableTop - 3);
    pdf.line(colNoX - 2, tableBottomY, pageW - margin, tableBottomY);
    pdf.line(colNoX - 2, y, pageW - margin, y);

    y += 4;
    pdf.setFont("helvetica", "normal");

    let grandTotal = 0;

    items.forEach((it, idx) => {
      const qty = it.qty ?? 0;
      const upah = it.upah ?? 0;
      const total = it.total ?? qty * upah;

      grandTotal += total;

      pdf.text(String(idx + 1), colNoX, y);
      pdf.text(it.namaPekerja || "-", colPekerjaX, y);
      pdf.text(it.namaPekerjaan || "-", colPekerjaanX, y);
      pdf.text(qty ? qty.toLocaleString("id-ID") : "-", colQtyX, y);
      pdf.text(it.satuan || "-", colSatuanX, y);
      pdf.text(
        upah ? upah.toLocaleString("id-ID") : "-",
        colUpahX,
        y,
        { align: "right" }
      );
      pdf.text(total.toLocaleString("id-ID"), colTotalX, y, {
        align: "right",
      });

      y += rowHeight;
    });

    y += 4;

    pdf.setFont("helvetica", "bold");
    pdf.text("Total Semua", colUpahX, y);
    pdf.text(grandTotal.toLocaleString("id-ID"), colTotalX, y, {
      align: "right",
    });

    const rawId = entry.id.startsWith("produksi-lainnya-")
      ? entry.id.replace("produksi-lainnya-", "")
      : entry.id;
    pdf.save(`invoice-produksi-lainnya-${rawId}.pdf`);
  };

  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={handleView}
        className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-800 hover:bg-slate-200"
      >
        <VisibilityIcon fontSize="small" /> Lihat
      </button>
      {canApprove && (
        <button
          onClick={() => setOpenApprove(true)}
          className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[11px] text-white hover:bg-emerald-700"
        >
          <CheckCircleIcon fontSize="small" /> Setujui
        </button>
      )}
      {type === "production" && entry?.subType === "Pengikisan" ? (
        <button
          onClick={handlePrintPengikisan}
          disabled={!canPrint}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] ${
            canPrint
              ? "bg-slate-100 text-slate-800 hover:bg-slate-200"
              : "bg-slate-50 text-slate-400 cursor-not-allowed"
          }`}
        >
          <PrintIcon fontSize="small" /> Print Invoice
        </button>
      ) : type === "production" && entry?.subType === "Pemotongan" ? (
        <button
          onClick={handlePrintPemotongan}
          disabled={!canPrint}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] ${
            canPrint
              ? "bg-slate-100 text-slate-800 hover:bg-slate-200"
              : "bg-slate-50 text-slate-400 cursor-not-allowed"
          }`}
        >
          <PrintIcon fontSize="small" /> Print Invoice
        </button>
      ) : type === "production" && entry?.subType === "Produksi Lainnya" ? (
        <button
          onClick={handlePrintProduksiLainnya}
          disabled={!canPrint}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] ${
            canPrint
              ? "bg-slate-100 text-slate-800 hover:bg-slate-200"
              : "bg-slate-50 text-slate-400 cursor-not-allowed"
          }`}
        >
          <PrintIcon fontSize="small" /> Print Invoice
        </button>
      ) : (
        <Link
          href={
            canPrint
              ? `/admin/invoice/print?type=${
                  type === "invoice" ? "expense" : type
                }&id=${id}`
              : "#"
          }
          aria-disabled={!canPrint}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] ${
            canPrint
              ? "bg-slate-100 text-slate-800 hover:bg-slate-200"
              : "bg-slate-50 text-slate-400 cursor-not-allowed"
          }`}
        >
          <PrintIcon fontSize="small" /> Print Invoice
        </Link>
      )}
      {canReject && (
        <button
          onClick={() => setOpenReject(true)}
          className="flex items-center gap-1 rounded-md bg-red-600 px-2 py-1 text-[11px] text-white hover:bg-red-700"
        >
          <CancelIcon fontSize="small" />{" "}
          {status === "draft" ? "Tolak" : "Batalkan"}
        </button>
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
              onClick={handleApprove}
              className="rounded-md bg-emerald-600 px-3 py-1 text-[12px] text-white hover:bg-emerald-700"
            >
              Setujui
            </button>
          </>
        }
      >
        <div className="text-sm text-slate-700">
          Status transaksi akan diubah menjadi POSTED. Lanjutkan?
        </div>
      </GlassDialog>

      <GlassDialog
        open={openReject}
        title="Konfirmasi Penolakan"
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
              onClick={handleRejectConfirm}
              className="rounded-md bg-red-600 px-3 py-1 text-[12px] text-white hover:bg-red-700"
            >
              Tolak
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          <div className="text-sm text-slate-700">
            Status transaksi akan diubah menjadi CANCELLED.
          </div>
          <input
            type="text"
            placeholder="Alasan penolakan (wajib)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="rounded-md border border-slate-200 px-2 py-1 text-sm"
          />
        </div>
      </GlassDialog>
    </div>
  );
}
