"use client";

import { ReactNode, useMemo, useState } from "react";
import { LedgerEntry } from "./types";
import { toCurrency } from "./formatters";
import { LedgerTable } from "./LedgerTable";
import { approvePurchase } from "@/actions/purchase-actions";
import { approveSale } from "@/actions/sale-actions";
import GlassDialog from "@/components/ui/GlassDialog";
import { TextField } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

type Props = {
  title: string;
  type: LedgerEntry["type"];
  entries: LedgerEntry[];
  totalCount: number;
  totalNominal: number;
  extraHeaderContent?: ReactNode;
};

const PAGE_SIZE = 5;

export function LedgerSection({
  title,
  type,
  entries,
  totalCount,
  totalNominal,
  extraHeaderContent,
}: Props) {
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openApprove, setOpenApprove] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const totalPages = Math.ceil(entries.length / PAGE_SIZE);
  const startIdx = (page - 1) * PAGE_SIZE;
  const currentEntries = entries.slice(startIdx, startIdx + PAGE_SIZE);
  const currentIds = useMemo(() => currentEntries.map((e) => e.id), [currentEntries]);
  const draftSelectedIds = useMemo(
    () => selectedIds.filter((id) => currentEntries.find((e) => e.id === id && e.status === "draft")),
    [selectedIds, currentEntries]
  );

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const toggleId = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
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
    }
    setSelectedIds([]);
    setOpenApprove(false);
  };

  const handleRejectMass = async () => {
    if (draftSelectedIds.length === 0 || rejectReason.trim().length === 0) return;
    // reuse single reject from LedgerActions via server actions:
    if (type === "purchase") {
      const { revokePurchase } = await import("@/actions/purchase-actions");
      for (const id of draftSelectedIds) await revokePurchase(id, rejectReason.trim());
    } else if (type === "sale") {
      const { revokeSale } = await import("@/actions/sale-actions");
      for (const id of draftSelectedIds) await revokeSale(id, rejectReason.trim());
    }
    setSelectedIds([]);
    setRejectReason("");
    setOpenReject(false);
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
          {(type === "purchase" || type === "sale") && (
            <div className="flex items-center gap-2">
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
                disabled={draftSelectedIds.length === 0}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] ${
                  draftSelectedIds.length === 0
                    ? "bg-red-100 text-red-400 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                <CancelIcon fontSize="small" />
                Tolak Massal
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
            setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
          } else {
            toggleAll(ids);
          }
        }}
      />
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
          <div className="text-[11px] text-slate-500">
            Halaman {page} dari {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <GlassDialog open={openApprove} title="Konfirmasi Persetujuan" onClose={() => setOpenApprove(false)} actions={[
        { label: "Batal", onClick: () => setOpenApprove(false) },
        { label: "Setujui", onClick: handleApproveMass, variant: "primary" },
      ]}>
        <div className="text-sm text-slate-700">
          Anda akan menyetujui {draftSelectedIds.length} transaksi (status draft). Lanjutkan?
        </div>
      </GlassDialog>

      <GlassDialog open={openReject} title="Konfirmasi Penolakan" onClose={() => setOpenReject(false)} actions={[
        { label: "Batal", onClick: () => setOpenReject(false) },
        { label: "Tolak", onClick: handleRejectMass, variant: "danger" },
      ]}>
        <div className="flex flex-col gap-2">
          <div className="text-sm text-slate-700">
            Anda akan menolak {draftSelectedIds.length} transaksi (status draft).
          </div>
          <TextField
            label="Alasan penolakan"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            size="small"
          />
        </div>
      </GlassDialog>
    </section>
  );
}
