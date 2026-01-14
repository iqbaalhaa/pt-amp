"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { revokePurchase } from "@/actions/purchase-actions";
import { revokeSale } from "@/actions/sale-actions";
import { revokeProduction } from "@/actions/production-actions";

type Props = {
  id: string;
  type: "purchase" | "sale" | "production";
  status: "draft" | "posted" | "cancelled";
};

export function LedgerActions({ id, type, status }: Props) {
  const router = useRouter();
  const canPrint = type === "purchase" || type === "sale";
  const isCancelled = status === "cancelled";

  const handleRevoke = async () => {
    if (isCancelled) return;
    const ok = confirm("Batalkan transaksi ini? Status akan menjadi CANCELLED.");
    if (!ok) return;
    const reason = prompt("Alasan pembatalan (wajib diisi):", "");
    if (!reason || reason.trim().length === 0) {
      alert("Alasan wajib diisi.");
      return;
    }
    try {
      if (type === "purchase") {
        await revokePurchase(id, reason.trim());
      } else if (type === "sale") {
        await revokeSale(id, reason.trim());
      } else {
        await revokeProduction(id, reason.trim());
      }
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Gagal membatalkan transaksi.");
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <Link
        href={canPrint ? `/admin/invoice/print?type=${type}&id=${id}` : "#"}
        aria-disabled={!canPrint}
        className={`rounded-md px-2 py-1 text-[11px] ${
          canPrint
            ? "bg-slate-100 text-slate-800 hover:bg-slate-200"
            : "bg-slate-50 text-slate-400 cursor-not-allowed"
        }`}
      >
        Print Invoice
      </Link>
      <button
        onClick={handleRevoke}
        disabled={isCancelled}
        className={`rounded-md px-2 py-1 text-[11px] ${
          isCancelled
            ? "bg-red-100 text-red-400 cursor-not-allowed"
            : "bg-red-600 text-white hover:bg-red-700"
        }`}
      >
        Revoke
      </button>
    </div>
  );
}

