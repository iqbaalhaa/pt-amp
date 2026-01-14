import { LedgerEntry } from "./types";
import { formatDateShort, toCurrency } from "./formatters";
import { LedgerActions } from "./LedgerActions";

type Props = {
  entries: LedgerEntry[];
};

export function LedgerTable({ entries }: Props) {
  return (
    <div className="max-h-[56vh] overflow-auto">
      <table className="min-w-full border-collapse text-left text-xs">
        <thead className="sticky top-0 z-10 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2">Tanggal</th>
            <th className="px-3 py-2">Jenis</th>
            <th className="px-3 py-2">No Dokumen</th>
            <th className="px-3 py-2">Worker/Supplier/Customer</th>
            <th className="px-3 py-2">Total (Rp)</th>
            <th className="px-3 py-2">Stock</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {entries.map((e) => {
            const dStr = formatDateShort(e.date);
            const typeLabel =
              e.type === "purchase"
                ? "Purchase"
                : e.type === "sale"
                ? "Sales"
                : "Processing";
            return (
              <tr key={`${e.type}-${e.id}`} className="hover:bg-slate-50">
                <td className="px-3 py-2">{dStr}</td>
                <td className="px-3 py-2">{typeLabel}</td>
                <td className="px-3 py-2">{e.reference}</td>
                <td className="px-3 py-2">{e.counterparty || "-"}</td>
                <td className="px-3 py-2">
                  {e.total != null ? toCurrency(e.total) : "-"}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                      e.stockImpact === "IN"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                        : e.stockImpact === "OUT"
                        ? "bg-red-50 text-red-700 ring-1 ring-red-100"
                        : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                    }`}
                  >
                    {e.stockImpact}
                  </span>
                </td>
                <td className="px-3 py-2">{e.status.toUpperCase()}</td>
                <td className="px-3 py-2 text-right">
                  <LedgerActions id={e.id} type={e.type} status={e.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

