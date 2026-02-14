import { LedgerEntry } from "./types";
import { formatDateShort, toCurrency } from "./formatters";
import { LedgerActions } from "./LedgerActions";
import { useMemo } from "react";

type Props = {
  entries: LedgerEntry[];
  selectedIds?: string[];
  onToggle?: (id: string) => void;
  onToggleAll?: (ids: string[]) => void;
};

export function LedgerTable({ entries, selectedIds = [], onToggle, onToggleAll }: Props) {
  const currentIds = useMemo(() => entries.map((e) => e.id), [entries]);
  const allSelected = currentIds.length > 0 && currentIds.every((id) => selectedIds.includes(id));
  return (
    <div className="max-h-[56vh] overflow-auto">
      <table className="min-w-full border-collapse text-left text-xs">
        <thead className="sticky top-0 z-10 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2">
              {onToggleAll ? (
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onToggleAll(e.target.checked ? currentIds : [])}
                />
              ) : null}
            </th>
            <th className="px-3 py-2">Tanggal</th>
            <th className="px-3 py-2">Petugas</th>
            <th className="px-3 py-2">Supplier/Customer</th>
            <th className="px-3 py-2">Total (Rp)</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {entries.map((e) => {
            const dStr = formatDateShort(e.date);
            return (
              <tr key={`${e.type}-${e.id}`} className="hover:bg-slate-50">
                <td className="px-3 py-2">
                  {onToggle ? (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(e.id)}
                      onChange={() => onToggle(e.id)}
                    />
                  ) : null}
                </td>
                <td className="px-3 py-2">{dStr}</td>
                <td className="px-3 py-2">{e.createdByName || "-"}</td>
                <td className="px-3 py-2">{e.counterparty || "-"}</td>
                <td className="px-3 py-2">
                  {e.total != null ? toCurrency(e.total) : "-"}
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
