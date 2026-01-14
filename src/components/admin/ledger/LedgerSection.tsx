import { ReactNode } from "react";
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

export function LedgerSection({
  title,
  type,
  entries,
  totalCount,
  totalNominal,
  extraHeaderContent,
}: Props) {
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
      <LedgerTable entries={entries} />
    </section>
  );
}

