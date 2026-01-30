"use client";

import { ReactNode, useState } from "react";
import { LedgerEntry } from "./types";
import { toCurrency } from "./formatters";
import { LedgerTable } from "./LedgerTable";

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

  const totalPages = Math.ceil(entries.length / PAGE_SIZE);
  const startIdx = (page - 1) * PAGE_SIZE;
  const currentEntries = entries.slice(startIdx, startIdx + PAGE_SIZE);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

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
        </div>
      </div>
      <LedgerTable entries={currentEntries} />
      
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
    </section>
  );
}

