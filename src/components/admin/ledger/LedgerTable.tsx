import { LedgerEntry } from "./types";
import { formatDateShort, toCurrency } from "./formatters";
import { LedgerActions } from "./LedgerActions";
import { useMemo } from "react";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

type Props = {
  entries: LedgerEntry[];
  selectedIds?: string[];
  onToggle?: (id: string) => void;
  onToggleAll?: (ids: string[]) => void;
  onView?: (entry: LedgerEntry) => void;
  sortColumn?: keyof LedgerEntry;
  sortDirection?: "asc" | "desc";
  onSort?: (column: keyof LedgerEntry) => void;
  showShift?: boolean;
  showParty?: boolean;
};

export function LedgerTable({
  entries,
  selectedIds = [],
  onToggle,
  onToggleAll,
  onView,
  sortColumn,
  sortDirection,
  onSort,
  showShift = false,
  showParty = true,
}: Props) {
  const currentIds = useMemo(() => entries.map((e) => e.id), [entries]);
  const allSelected =
    currentIds.length > 0 && currentIds.every((id) => selectedIds.includes(id));

  const saleStatusLabel = (s: LedgerEntry["status"]) =>
    s === "posted" ? "Selesai" : s === "cancelled" ? "Batal" : "Perkiraan";

  const renderSortIcon = (column: keyof LedgerEntry) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? (
      <ArrowUpwardIcon fontSize="inherit" className="ml-1 inline h-3 w-3" />
    ) : (
      <ArrowDownwardIcon fontSize="inherit" className="ml-1 inline h-3 w-3" />
    );
  };

  const renderHeader = (label: string, column: keyof LedgerEntry) => (
    <th
      className={`px-3 py-2 cursor-pointer hover:bg-slate-100 select-none ${
        column === "total" ? "text-right" : ""
      }`}
      onClick={() => onSort?.(column)}
    >
      <div
        className={`flex items-center gap-1 ${
          column === "total" ? "justify-end" : ""
        }`}
      >
        {label}
        {renderSortIcon(column)}
      </div>
    </th>
  );

  return (
    <div className="max-h-[56vh] overflow-auto">
      <table className="min-w-full border-collapse text-left text-xs">
        <thead className="sticky top-0 z-10 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2 w-10">
              {onToggleAll ? (
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) =>
                    onToggleAll(e.target.checked ? currentIds : [])
                  }
                />
              ) : null}
            </th>
            {renderHeader("Tanggal", "date")}
            {showShift && renderHeader("Shift", "shift")}
            {renderHeader("Petugas", "createdByName")}
            {showParty && renderHeader("Pihak", "counterparty")}
            {renderHeader("Total (Rp)", "total")}
            {renderHeader("Status", "status")}
            <th className="px-3 py-2 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {entries.map((e) => {
            const dStr = formatDateShort(e.date);
            return (
              <tr key={`${e.type}-${e.id}`} className="hover:bg-slate-50">
                <td className="px-3 py-2 text-center">
                  {onToggle ? (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(e.id)}
                      onChange={() => onToggle(e.id)}
                    />
                  ) : null}
                </td>
                <td className="px-3 py-2">{dStr}</td>
                {showShift && (
                  <td className="px-3 py-2 capitalize">{e.shift || "-"}</td>
                )}
                <td className="px-3 py-2">{e.createdByName || "-"}</td>
                {showParty && (
                  <td className="px-3 py-2">{e.counterparty || "-"}</td>
                )}
                <td className="px-3 py-2 text-right">
                  {e.total != null ? toCurrency(e.total) : "-"}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                      e.status === "posted"
                        ? "bg-green-100 text-green-700"
                        : e.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {e.type === "sale" ? saleStatusLabel(e.status) : e.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <LedgerActions
                    id={e.id}
                    type={e.type}
                    status={e.status}
                    entry={e}
                    onView={onView}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
