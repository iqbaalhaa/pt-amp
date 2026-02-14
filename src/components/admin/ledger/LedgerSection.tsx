import React from "react";
import { LedgerEntry } from "./types";
import { toCurrency, formatDateTime } from "./formatters";

export function LedgerSection({
  title,
  type,
  entries,
  totalCount,
  totalNominal,
  extraHeaderContent,
}: {
  title: string;
  type: "purchase" | "sale" | "production" | "invoice";
  entries: LedgerEntry[];
  totalCount: number;
  totalNominal: number;
  extraHeaderContent?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          <div className="text-xs text-slate-500">
            {totalCount} transaksi • Total {toCurrency(totalNominal)}
          </div>
        </div>
        {extraHeaderContent}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-[11px] text-slate-500">
            <tr>
              <th className="text-left p-2">Tanggal</th>
              <th className="text-left p-2">Ref</th>
              <th className="text-left p-2">Pihak</th>
              <th className="text-right p-2">Nominal</th>
              <th className="text-left p-2">Catatan</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={`${type}-${e.id}`} className="border-t border-slate-100">
                <td className="p-2">{formatDateTime(e.date)}</td>
                <td className="p-2">
                  <a
                    className="text-[var(--brand)] hover:underline"
                    href={`/admin/ledger?type=${type}&selected=${e.id}`}
                  >
                    {e.reference}
                  </a>
                </td>
                <td className="p-2">{e.counterparty || "-"}</td>
                <td className="p-2 text-right">
                  {e.total != null ? toCurrency(e.total) : "-"}
                </td>
                <td className="p-2">{e.notes || "-"}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-center text-slate-400">
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

