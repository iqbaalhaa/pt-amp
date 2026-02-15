"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { revokePurchase } from "@/actions/purchase-actions";
import { revokeSale } from "@/actions/sale-actions";
import { revokeProduction } from "@/actions/production-actions";
import { approvePurchase } from "@/actions/purchase-actions";
import { approveSale } from "@/actions/sale-actions";
import GlassDialog from "@/components/ui/GlassDialog";
import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PrintIcon from "@mui/icons-material/Print";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { LedgerEntry } from "./types";

type Props = {
  id: string;
  type: "purchase" | "sale" | "production" | "pengeluaran";
  status: "draft" | "posted" | "cancelled";
  entry?: LedgerEntry;
  onView?: (entry: LedgerEntry) => void;
};

export function LedgerActions({ id, type, status, entry, onView }: Props) {
  const router = useRouter();
  const canPrint =
    type === "purchase" || type === "sale" || type === "pengeluaran";
  const isCancelled = status === "cancelled";
  const canApprove =
    status === "draft" &&
    (type === "purchase" || type === "sale" || type === "pengeluaran");
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
      } else if (type === "pengeluaran") {
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
      } else if (type === "pengeluaran") {
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
      <Link
        href={
          canPrint
            ? `/admin/invoice/print?type=${
                type === "pengeluaran" ? "expense" : type
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
