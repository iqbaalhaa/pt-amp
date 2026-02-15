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
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import * as XLSX from "xlsx";
import { quickCreateItemType } from "@/actions/item-type-actions";
import { quickCreateUnit } from "@/actions/unit-actions";
import { createPurchase } from "@/actions/purchase-actions";
import { quickCreateSupplier } from "@/actions/supplier-actions";
import { createPengikisan } from "@/actions/pengikisan-actions";
import { createPemotongan } from "@/actions/pemotongan-actions";
import { createPenjemuran } from "@/actions/penjemuran-actions";
import { createPengemasan } from "@/actions/pengemasan-actions";

type Props = {
  title: string;
  type: LedgerEntry["type"];
  subType?: string;
  entries: LedgerEntry[];
  totalCount: number;
  totalNominal: number;
  extraHeaderContent?: ReactNode;
};

export function LedgerSection({
  title,
  type,
  subType,
  entries,
  totalCount,
  totalNominal,
  extraHeaderContent,
}: Props) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | "all">(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openApprove, setOpenApprove] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [openView, setOpenView] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [openMass, setOpenMass] = useState(false);
  const [massBusy, setMassBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [massReport, setMassReport] = useState<{
    success: number;
    failed: number;
    errors: { row: number; reason: string }[];
  } | null>(null);

  type MassRow = {
    date: string;
    party: string; // supplier or petugas
    item: string; // nama barang or nama pekerja
    // Purchase specific
    unit?: string;
    qty?: number;
    price?: number;
    // Production specific
    val1?: number; // kaKg, qty, hari, bungkus
    val2?: number; // stikKg, lemburJam
    rate1?: number; // upahPerKg, upahPerHari, upahPerBungkus
    rate2?: number; // upahLemburPerJam
    _row: number;
  };
  const [massRows, setMassRows] = useState<MassRow[] | null>(null);
  const [sortColumn, setSortColumn] = useState<keyof LedgerEntry>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const sortedEntries = useMemo(() => {
    const sorted = [...entries].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1; // nulls last
      if (bVal === null || bVal === undefined) return -1;

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [entries, sortColumn, sortDirection]);

  const totalPages =
    pageSize === "all"
      ? 1
      : Math.max(1, Math.ceil(sortedEntries.length / pageSize));
  const startIdx = pageSize === "all" ? 0 : (page - 1) * pageSize;
  const currentEntries =
    pageSize === "all"
      ? sortedEntries
      : sortedEntries.slice(startIdx, startIdx + pageSize);
  const currentIds = useMemo(
    () => currentEntries.map((e) => e.id),
    [currentEntries]
  );

  const handleSort = (column: keyof LedgerEntry) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setPage(1);
  };

  const draftSelectedIds = useMemo(
    () =>
      selectedIds.filter((id) =>
        currentEntries.find((e) => e.id === id && e.status === "draft")
      ),
    [selectedIds, currentEntries]
  );
  const cancellableSelectedIds = useMemo(
    () =>
      selectedIds.filter((id) => {
        const entry = currentEntries.find((e) => e.id === id);
        return entry && entry.status !== "cancelled";
      }),
    [selectedIds, currentEntries]
  );

  const totalSum = useMemo(
    () =>
      currentEntries.reduce(
        (acc, curr) =>
          acc + (curr.status === "cancelled" ? 0 : curr.total ?? 0),
        0
      ),
    [currentEntries]
  );

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const toggleId = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
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
    } else if (type === "pengeluaran") {
      const { approveExpense } = await import("@/actions/expense-actions");
      for (const id of draftSelectedIds) await approveExpense(id);
    }
    setSelectedIds([]);
    setOpenApprove(false);
  };

  const handleRejectMass = async () => {
    if (cancellableSelectedIds.length === 0 || rejectReason.trim().length === 0)
      return;
    // reuse single reject from LedgerActions via server actions:
    if (type === "purchase") {
      const { revokePurchase } = await import("@/actions/purchase-actions");
      for (const id of cancellableSelectedIds)
        await revokePurchase(id, rejectReason.trim());
    } else if (type === "sale") {
      const { revokeSale } = await import("@/actions/sale-actions");
      for (const id of cancellableSelectedIds)
        await revokeSale(id, rejectReason.trim());
    } else if (type === "pengeluaran") {
      const { revokeExpense } = await import("@/actions/expense-actions");
      for (const id of cancellableSelectedIds)
        await revokeExpense(id, rejectReason.trim());
    } else if (type === "production") {
      const { revokeProduction } = await import("@/actions/production-actions");
      for (const id of cancellableSelectedIds) {
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
          await revokeProduction(id, rejectReason.trim());
        }
      }
    }
    setSelectedIds([]);
    setRejectReason("");
    setOpenReject(false);
  };

  const handleMassUpload = async (file: File) => {
    setMassBusy(true);
    setMassReport(null);
    setMassRows(null);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any[]>(sheet, {
        header: 1,
        raw: false,
        dateNF: "yyyy-mm-dd",
      }) as any[][];
      const data = rows.slice(1); // skip header

      const valid: MassRow[] = [];
      const errors: { row: number; reason: string }[] = [];

      data.forEach((cols, idx) => {
        const rowNum = idx + 2; // 1-based including header

        let dateStr = "";
        const rawC0 = cols?.[0];
        const c0String = (rawC0 ?? "").toString();

        if (rawC0 instanceof Date) {
          try {
            dateStr = rawC0.toISOString().slice(0, 10);
          } catch {
            dateStr = "";
          }
        } else {
          dateStr = c0String.trim();

          // Handle potential Excel serial number
          if (
            !isNaN(Number(dateStr)) &&
            Number(dateStr) > 20000 &&
            Number(dateStr) < 60000
          ) {
            const serial = Number(dateStr);
            // Excel base date correction
            const d = new Date(Math.round((serial - 25569) * 86400 * 1000));
            dateStr = d.toISOString().slice(0, 10);
          }
        }

        // Basic validation for blank row
        const hasContent = cols.some(
          (c) => c != null && c.toString().trim() !== ""
        );
        if (!hasContent) return;

        if (!dateStr) {
          errors.push({ row: rowNum, reason: "tanggal kosong" });
          return;
        }
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) {
          errors.push({ row: rowNum, reason: "format tanggal salah" });
          return;
        }
        const year = d.getFullYear();
        if (year < 2000 || year > 2100) {
          errors.push({
            row: rowNum,
            reason: `tahun tidak valid (${year})`,
          });
          return;
        }
        const date = d.toISOString().slice(0, 10);

        if (type === "purchase") {
          const c1 = (cols?.[1] ?? "").toString(); // Supplier
          const c2 = (cols?.[2] ?? "").toString(); // Item
          const c3 = (cols?.[3] ?? "").toString(); // Unit
          const c4 = (cols?.[4] ?? "").toString(); // Qty
          const c5 = (cols?.[5] ?? "").toString(); // Price

          const supplier = c1.trim().toUpperCase();
          const item = c2.trim().toUpperCase();
          const unit = c3.trim().toUpperCase();
          const qtyRaw = c4;
          const priceRaw = c5;
          const qty = parseFloat(qtyRaw.replace(/[^0-9.\-]/g, ""));
          const price = parseFloat(priceRaw.replace(/[^0-9.\-]/g, ""));

          if (!supplier) {
            errors.push({ row: rowNum, reason: "supplier kosong" });
            return;
          }
          if (!item) {
            errors.push({ row: rowNum, reason: "nama barang kosong" });
            return;
          }
          if (!isFinite(qty)) {
            errors.push({ row: rowNum, reason: "qty harus angka" });
            return;
          }
          if (!isFinite(price)) {
            errors.push({ row: rowNum, reason: "harga harus angka" });
            return;
          }
          valid.push({
            date,
            party: supplier,
            item,
            unit,
            qty,
            price,
            _row: rowNum,
          });
        } else if (type === "production") {
          const c1 = (cols?.[1] ?? "").toString(); // Nama Pekerja (Item)
          // Petugas diisi otomatis oleh session login
          const petugas = "";

          const worker = c1.trim().toUpperCase();
          if (!worker) {
            errors.push({ row: rowNum, reason: "nama pekerja kosong" });
            return;
          }

          if (subType === "Pengikisan") {
            const ka = parseFloat(
              (cols?.[2] ?? "0").toString().replace(/[^0-9.\-]/g, "")
            );
            const stik = parseFloat(
              (cols?.[3] ?? "0").toString().replace(/[^0-9.\-]/g, "")
            );
            valid.push({
              date,
              party: petugas,
              item: worker,
              val1: ka,
              val2: stik,
              _row: rowNum,
            });
          } else if (subType === "Pemotongan") {
            const qty = parseFloat(
              (cols?.[2] ?? "0").toString().replace(/[^0-9.\-]/g, "")
            );
            const rate = parseFloat(
              (cols?.[3] ?? "0").toString().replace(/[^0-9.\-]/g, "")
            );
            valid.push({
              date,
              party: petugas,
              item: worker,
              val1: qty,
              rate1: rate,
              _row: rowNum,
            });
          } else if (subType === "Penjemuran") {
            const hari = parseFloat(
              (cols?.[2] ?? "0").toString().replace(/[^0-9.\-]/g, "")
            );
            const lembur = parseFloat(
              (cols?.[3] ?? "0").toString().replace(/[^0-9.\-]/g, "")
            );
            const rateHarian = parseFloat(
              (cols?.[4] ?? "0").toString().replace(/[^0-9.\-]/g, "")
            );
            const rateLembur = parseFloat(
              (cols?.[5] ?? "0").toString().replace(/[^0-9.\-]/g, "")
            );
            valid.push({
              date,
              party: petugas,
              item: worker,
              val1: hari,
              val2: lembur,
              rate1: rateHarian,
              rate2: rateLembur,
              _row: rowNum,
            });
          } else if (subType === "Pengemasan") {
            const bungkus = parseFloat(
              (cols?.[2] ?? "0").toString().replace(/[^0-9.\-]/g, "")
            );
            const rate = parseFloat(
              (cols?.[3] ?? "0").toString().replace(/[^0-9.\-]/g, "")
            );
            valid.push({
              date,
              party: petugas,
              item: worker,
              val1: bungkus,
              rate1: rate,
              _row: rowNum,
            });
          }
        }
      });

      setMassRows(valid);
      setMassReport({
        success: valid.length,
        failed: errors.length,
        errors,
      });
    } catch (_err) {
      setMassReport({
        success: 0,
        failed: 1,
        errors: [{ row: 0, reason: "Gagal memproses file XLSX" }],
      });
    } finally {
      setMassBusy(false);
    }
  };

  const handleMassCommit = async () => {
    if (!massRows || massRows.length === 0) return;
    setMassBusy(true);
    try {
      if (type === "purchase") {
        const byKey = new Map<string, MassRow[]>();
        massRows.forEach((r) => {
          const key = JSON.stringify({ s: r.party, d: r.date });
          const arr = byKey.get(key) ?? [];
          arr.push(r);
          byKey.set(key, arr);
        });
        const uniqueSuppliers = new Set(massRows.map((r) => r.party));
        for (const s of uniqueSuppliers) {
          await quickCreateSupplier(s);
        }
        for (const [key, items] of byKey.entries()) {
          const { s: supplier, d: date } = JSON.parse(key);
          const itemInputs = [];
          for (const r of items) {
            const it = await quickCreateItemType(r.item);
            const u = r.unit ? await quickCreateUnit(r.unit) : null;
            itemInputs.push({
              itemTypeId: it.id,
              qty: String(r.qty),
              unitId: u ? u.id : undefined,
              unitCost: String(r.price),
            });
          }
          await createPurchase({
            supplier,
            date,
            status: "draft",
            notes: null,
            items: itemInputs,
          });
        }
      } else if (type === "production") {
        // Group by date + petugas + rates
        // Construct key based on subType requirements
        const byKey = new Map<string, MassRow[]>();

        massRows.forEach((r) => {
          let keyObj: any = { p: r.party, d: r.date };
          if (subType === "Pemotongan" || subType === "Pengemasan") {
            keyObj.r1 = r.rate1;
          } else if (subType === "Penjemuran") {
            keyObj.r1 = r.rate1;
            keyObj.r2 = r.rate2;
          }
          // Pengikisan no rates needed in key (constants)

          const key = JSON.stringify(keyObj);
          const arr = byKey.get(key) ?? [];
          arr.push(r);
          byKey.set(key, arr);
        });

        for (const [key, items] of byKey.entries()) {
          const keyObj = JSON.parse(key);
          const { p: petugas, d: date } = keyObj;

          if (subType === "Pengikisan") {
            await createPengikisan({
              date,
              petugas: petugas || null,
              items: items.map((r) => ({
                nama: r.item,
                kaKg: String(r.val1 || 0),
                stikKg: String(r.val2 || 0),
              })),
            });
          } else if (subType === "Pemotongan") {
            await createPemotongan({
              date,
              petugas: petugas || null,
              upahPerKg: String(keyObj.r1 || 0),
              items: items.map((r) => ({
                nama: r.item,
                qty: String(r.val1 || 0),
              })),
            });
          } else if (subType === "Penjemuran") {
            await createPenjemuran({
              date,
              petugas: petugas || null,
              upahPerHari: String(keyObj.r1 || 0),
              upahLemburPerJam: String(keyObj.r2 || 0),
              items: items.map((r) => ({
                nama: r.item,
                hari: String(r.val1 || 0),
                lemburJam: String(r.val2 || 0),
              })),
            });
          } else if (subType === "Pengemasan") {
            await createPengemasan({
              date,
              petugas: petugas || null,
              upahPerBungkus: String(keyObj.r1 || 0),
              items: items.map((r) => ({
                nama: r.item,
                bungkus: String(r.val1 || 0),
              })),
            });
          }
        }
      }
      setOpenMass(false);
      setMassRows(null);
    } finally {
      setMassBusy(false);
    }
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
          {(type === "purchase" ||
            type === "sale" ||
            type === "pengeluaran" ||
            type === "production") && (
            <div className="flex items-center gap-2">
              {(type === "purchase" || type === "production") && (
                <button
                  onClick={() => setOpenMass(true)}
                  className="flex items-center gap-1 rounded-md bg-indigo-600 px-2 py-1 text-[11px] text-white hover:bg-indigo-700"
                >
                  <UploadIcon fontSize="small" />
                  Input Massal
                </button>
              )}
              <button
                onClick={() => {
                  const style = `
                    <style>
                      @page { size: A4; margin: 20mm; }
                      body { font-family: Arial, sans-serif; color: #0f172a; }
                      .header { display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px; }
                      .header img { height: 40px; }
                      .title { font-size: 16px; font-weight: 700; }
                      .meta { font-size: 12px; color: #475569; }
                      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                      th, td { border: 1px solid #e2e8f0; padding: 6px 8px; font-size: 12px; }
                      th { background: #f8fafc; text-align: left; }
                      tfoot td { font-weight: 700; }
                    </style>
                  `;
                  const rows = sortedEntries.map((e) => ({
                    Tanggal: new Date(e.date).toLocaleString(),
                    Jenis: e.type,
                    Status: e.status.toUpperCase(),
                    Pihak: e.counterparty ?? "-",
                    Total: e.total != null ? toCurrency(e.total) : "-",
                    Catatan: e.notes ?? "-",
                  }));
                  const headers = [
                    "Tanggal",
                    "Jenis",
                    "Status",
                    "Pihak",
                    "Total",
                    "Catatan",
                  ];
                  const tableHead = `<tr>${headers
                    .map((h) => `<th>${h}</th>`)
                    .join("")}</tr>`;
                  const tableBody = rows
                    .map(
                      (r) =>
                        `<tr>${headers
                          .map((h) => `<td>${(r as any)[h]}</td>`)
                          .join("")}</tr>`
                    )
                    .join("");
                  const totalSum = sortedEntries.reduce(
                    (s, e) => s + (e.status === "cancelled" ? 0 : e.total ?? 0),
                    0
                  );
                  const titleMap: Record<string, string> = {
                    purchase: "Pembelian",
                    sale: "Penjualan",
                    pengeluaran: "Pengeluaran",
                    production: "Produksi",
                  };
                  const reportTitle = titleMap[type] || "Laporan";
                  const html = `
                    <html>
                    <head>${style}</head>
                    <body>
                      <div class="header">
                        <img src="/logoAMP.png" alt="Logo" />
                        <div>
                          <div class="title">Laporan ${reportTitle}</div>
                          <div class="meta">Dibuat: ${new Date().toLocaleString()}</div>
                        </div>
                      </div>
                      <table>
                        <thead>${tableHead}</thead>
                        <tbody>${tableBody}</tbody>
                        <tfoot><tr><td colspan="4">Total</td><td>${toCurrency(
                          totalSum
                        )}</td><td></td></tr></tfoot>
                      </table>
                    </body>
                    </html>
                  `;
                  const win = window.open("", "_blank");
                  if (win) {
                    win.document.open();
                    win.document.write(html);
                    win.document.close();
                    setTimeout(() => win.print(), 300);
                  }
                }}
                className="flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-[11px] text-white hover:bg-blue-700"
                title="Download PDF"
              >
                <DownloadIcon fontSize="small" />
                PDF
              </button>
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
                disabled={cancellableSelectedIds.length === 0}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] ${
                  cancellableSelectedIds.length === 0
                    ? "bg-red-100 text-red-400 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                <CancelIcon fontSize="small" />
                Batalkan Massal
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
            setSelectedIds((prev) =>
              prev.filter((id) => !currentIds.includes(id))
            );
          } else {
            toggleAll(ids);
          }
        }}
        onView={(entry) => {
          setSelectedEntry(entry);
          setOpenView(true);
        }}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        counterpartyHeader={type === "production" ? "Total Pekerja" : "Pihak"}
      />

      {entries.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="text-[11px] text-slate-500">
              Halaman {page} dari {totalPages}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500">Tampilkan</span>
              <select
                value={pageSize === "all" ? "all" : String(pageSize)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "all") {
                    setPageSize("all");
                    setPage(1);
                  } else {
                    const n = parseInt(v, 10);
                    setPageSize(isNaN(n) ? 10 : n);
                    setPage(1);
                  }
                }}
                className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 bg-white"
              >
                <option value="10">10</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="all">Semua</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={page === 1 || totalPages <= 1}
              className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={page === totalPages || totalPages <= 1}
              className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
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
              onClick={handleApproveMass}
              className="rounded-md bg-emerald-600 px-3 py-1 text-[12px] text-white hover:bg-emerald-700"
            >
              Setujui
            </button>
          </>
        }
      >
        <div className="text-sm text-slate-700">
          Anda akan menyetujui {draftSelectedIds.length} transaksi (status
          draft). Lanjutkan?
        </div>
      </GlassDialog>

      <GlassDialog
        open={openReject}
        title="Konfirmasi Pembatalan"
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
              onClick={handleRejectMass}
              className="rounded-md bg-red-600 px-3 py-1 text-[12px] text-white hover:bg-red-700"
            >
              Proses
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          <div className="text-sm text-slate-700">
            Anda akan membatalkan {cancellableSelectedIds.length} transaksi yang
            dipilih. Transaksi yang sudah diposting akan dikembalikan stoknya.
          </div>
          <TextField
            label="Alasan pembatalan (wajib)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            size="small"
          />
        </div>
      </GlassDialog>

      <GlassDialog
        open={openView}
        title="Detail Transaksi"
        onClose={() => setOpenView(false)}
        fullWidth
        maxWidth="lg"
        actions={
          <>
            <button
              onClick={() => setOpenView(false)}
              className="rounded-md bg-slate-100 px-3 py-1 text-[12px] text-slate-800 hover:bg-slate-200"
            >
              Tutup
            </button>
          </>
        }
      >
        {selectedEntry ? (
          <div className="grid gap-3 text-sm">
            <div className="space-y-1">
              <div>
                <span className="font-medium">Tanggal:</span>{" "}
                {new Date(selectedEntry.date).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Supplier:</span>{" "}
                {selectedEntry.counterparty || "-"}
              </div>
              <div>
                <span className="font-medium">Catatan:</span>{" "}
                {selectedEntry.notes || "-"}
              </div>
            </div>
            <div className="overflow-auto">
              {selectedEntry.lines && selectedEntry.lines.length > 0 ? (
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700">
                      <th className="border border-slate-200 px-2 py-1 text-left w-10">
                        #
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-left">
                        Barang
                      </th>
                      {selectedEntry.type !== "production" && (
                        <th className="border border-slate-200 px-2 py-1 text-left">
                          Qty - Satuan
                        </th>
                      )}
                      {selectedEntry.subType === "Pengikisan" && (
                        <>
                          <th className="border border-slate-200 px-2 py-1 text-right">
                            KA (kg)
                          </th>
                          <th className="border border-slate-200 px-2 py-1 text-right">
                            Stik (kg)
                          </th>
                        </>
                      )}
                      {selectedEntry.subType === "Pemotongan" && (
                        <th className="border border-slate-200 px-2 py-1 text-right">
                          Qty (kg)
                        </th>
                      )}
                      {selectedEntry.subType === "Penjemuran" && (
                        <>
                          <th className="border border-slate-200 px-2 py-1 text-right">
                            Hari
                          </th>
                          <th className="border border-slate-200 px-2 py-1 text-right">
                            Lembur (Jam)
                          </th>
                        </>
                      )}
                      {selectedEntry.subType === "Pengemasan" && (
                        <th className="border border-slate-200 px-2 py-1 text-right">
                          Bungkus
                        </th>
                      )}
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Harga
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEntry.lines.map((ln, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-200 px-2 py-1">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-200 px-2 py-1">
                          {ln.name}
                        </td>
                        {selectedEntry.type !== "production" && (
                          <td className="border border-slate-200 px-2 py-1">
                            {ln.qty} {ln.unit ?? ""}
                          </td>
                        )}
                        {selectedEntry.subType === "Pengikisan" && (
                          <>
                            <td className="border border-slate-200 px-2 py-1 text-right">
                              {ln.kaKg}
                            </td>
                            <td className="border border-slate-200 px-2 py-1 text-right">
                              {ln.stikKg}
                            </td>
                          </>
                        )}
                        {selectedEntry.subType === "Pemotongan" && (
                          <td className="border border-slate-200 px-2 py-1 text-right">
                            {ln.pemotonganQty}
                          </td>
                        )}
                        {selectedEntry.subType === "Penjemuran" && (
                          <>
                            <td className="border border-slate-200 px-2 py-1 text-right">
                              {ln.penjemuranHari}
                            </td>
                            <td className="border border-slate-200 px-2 py-1 text-right">
                              {ln.penjemuranLembur}
                            </td>
                          </>
                        )}
                        {selectedEntry.subType === "Pengemasan" && (
                          <td className="border border-slate-200 px-2 py-1 text-right">
                            {ln.pengemasanBungkus}
                          </td>
                        )}
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {toCurrency(ln.price)}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {toCurrency(ln.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        className="border border-slate-200 px-2 py-1 font-semibold"
                        colSpan={
                          selectedEntry.type !== "production"
                            ? 4
                            : selectedEntry.subType === "Pengikisan" ||
                              selectedEntry.subType === "Penjemuran"
                            ? 5
                            : 4
                        }
                      >
                        Total
                      </td>
                      <td className="border border-slate-200 px-2 py-1 text-right font-semibold">
                        {toCurrency(
                          selectedEntry.lines.reduce(
                            (s, l) => s + l.subtotal,
                            0
                          )
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <div className="text-xs text-slate-500">Tidak ada item</div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-600">Tidak ada data</div>
        )}
      </GlassDialog>

      {(type === "purchase" || type === "production") && (
        <GlassDialog
          open={openMass}
          title={`Input Massal ${
            type === "purchase" ? "Pembelian" : `Produksi (${subType})`
          }`}
          onClose={() => !massBusy && setOpenMass(false)}
          fullWidth
          maxWidth="lg"
          actions={
            <>
              <button
                onClick={() => {
                  let headers: string[] = [];
                  if (type === "purchase") {
                    headers = [
                      "tanggal",
                      "nama suplier",
                      "nama barang",
                      "satuan",
                      "qty",
                      "harga",
                    ];
                  } else if (type === "production") {
                    if (subType === "Pengikisan")
                      headers = [
                        "tanggal",
                        "nama pekerja",
                        "ka (kg)",
                        "stik (kg)",
                      ];
                    else if (subType === "Pemotongan")
                      headers = [
                        "tanggal",
                        "nama pekerja",
                        "qty (kg)",
                        "upah per kg",
                      ];
                    else if (subType === "Penjemuran")
                      headers = [
                        "tanggal",
                        "nama pekerja",
                        "hari",
                        "lembur (jam)",
                        "upah harian",
                        "upah lembur",
                      ];
                    else if (subType === "Pengemasan")
                      headers = [
                        "tanggal",
                        "nama pekerja",
                        "bungkus",
                        "upah per bungkus",
                      ];
                  }

                  const ws = XLSX.utils.aoa_to_sheet([headers]);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "Template");
                  const out = XLSX.write(wb, {
                    type: "array",
                    bookType: "xlsx",
                  });
                  const blob = new Blob([out], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `template-${type}-${subType || "purchase"}.xlsx`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="rounded-md bg-blue-600 px-3 py-1 text-[12px] text-white hover:bg-blue-700"
              >
                Download Template (XLSX)
              </button>
              <button
                onClick={handleMassCommit}
                disabled={massBusy || !massRows || massRows.length === 0}
                className={`rounded-md px-3 py-1 text-[12px] ${
                  massBusy || !massRows || massRows.length === 0
                    ? "bg-emerald-100 text-emerald-400 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
                title="Masukkan data hasil preview ke database"
              >
                Masukkan ke Database
              </button>
              <button
                onClick={() => setOpenMass(false)}
                disabled={massBusy}
                className="rounded-md bg-slate-100 px-3 py-1 text-[12px] text-slate-800 hover:bg-slate-200 disabled:opacity-50"
              >
                Tutup
              </button>
            </>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border border-slate-200 p-3">
              <div className="font-medium mb-2">Unduh Template</div>
              <p className="text-xs text-slate-600 mb-3">
                Gunakan template ini untuk mengisi data. Jangan ubah urutan
                kolom. Tanggal harus format YYYY-MM-DD atau format tanggal
                Excel.
              </p>
            </div>
            <div
              className={`rounded-md border border-dashed p-3 flex flex-col items-center justify-center gap-2 transition-colors ${
                dragOver ? "border-indigo-400 bg-indigo-50" : "border-slate-300"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={async (e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (!file) return;
                await handleMassUpload(file);
              }}
            >
              <div className="font-medium">Drop atau klik untuk upload</div>
              <div className="text-xs text-slate-600">Terima .xlsx</div>
              <input
                id="mass-upload-input"
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  await handleMassUpload(file);
                }}
              />
              <button
                onClick={() =>
                  document.getElementById("mass-upload-input")?.click()
                }
                className="rounded-md border border-slate-300 px-3 py-1 text-[12px] hover:bg-slate-50"
              >
                Pilih File XLSX
              </button>
            </div>
            {massReport && (
              <div className="md:col-span-2 rounded-md border border-slate-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Ringkasan Upload</div>
                  <div className="text-xs text-slate-600">
                    Berhasil:{" "}
                    <span className="font-semibold text-emerald-700">
                      {massReport.success}
                    </span>{" "}
                    &nbsp;|&nbsp; Gagal:{" "}
                    <span className="font-semibold text-rose-700">
                      {massReport.failed}
                    </span>
                  </div>
                </div>
                {massReport.errors.length > 0 ? (
                  <table className="w-full text-xs border border-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="border border-slate-200 px-2 py-1 w-20">
                          Baris
                        </th>
                        <th className="border border-slate-200 px-2 py-1">
                          Penyebab
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {massReport.errors.map((e, i) => (
                        <tr key={i}>
                          <td className="border border-slate-200 px-2 py-1 text-center">
                            {e.row}
                          </td>
                          <td className="border border-slate-200 px-2 py-1">
                            {e.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-xs text-emerald-700">
                    Semua baris berhasil diproses.
                  </div>
                )}
              </div>
            )}
            {massRows && massRows.length > 0 && (
              <div className="md:col-span-2 rounded-md border border-slate-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Preview Data</div>
                  <div className="text-xs text-slate-600">
                    Total baris valid: {massRows.length}
                  </div>
                </div>
                <div className="max-h-72 overflow-auto">
                  <table className="w-full text-xs border border-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="border border-slate-200 px-2 py-1 w-24">
                          Tanggal
                        </th>
                        <th className="border border-slate-200 px-2 py-1">
                          {type === "purchase" ? "Supplier" : "Petugas"}
                        </th>
                        <th className="border border-slate-200 px-2 py-1">
                          {type === "purchase" ? "Nama Barang" : "Nama Pekerja"}
                        </th>
                        {type === "purchase" && (
                          <>
                            <th className="border border-slate-200 px-2 py-1">
                              Satuan
                            </th>
                            <th className="border border-slate-200 px-2 py-1 text-right">
                              Qty
                            </th>
                            <th className="border border-slate-200 px-2 py-1 text-right">
                              Harga
                            </th>
                          </>
                        )}
                        {subType === "Pengikisan" && (
                          <>
                            <th className="border border-slate-200 px-2 py-1 text-right">
                              KA (kg)
                            </th>
                            <th className="border border-slate-200 px-2 py-1 text-right">
                              Stik (kg)
                            </th>
                          </>
                        )}
                        {subType === "Pemotongan" && (
                          <>
                            <th className="border border-slate-200 px-2 py-1 text-right">
                              Qty (kg)
                            </th>
                            <th className="border border-slate-200 px-2 py-1 text-right">
                              Upah/kg
                            </th>
                          </>
                        )}
                        {subType === "Penjemuran" && (
                          <>
                            <th className="border border-slate-200 px-2 py-1 text-right">
                              Hari
                            </th>
                            <th className="border border-slate-200 px-2 py-1 text-right">
                              Lembur (jam)
                            </th>
                            <th className="border border-slate-200 px-2 py-1 text-right">
                              Upah Harian
                            </th>
                            <th className="border border-slate-200 px-2 py-1 text-right">
                              Upah Lembur
                            </th>
                          </>
                        )}
                        {subType === "Pengemasan" && (
                          <>
                            <th className="border border-slate-200 px-2 py-1 text-right">
                              Bungkus
                            </th>
                            <th className="border border-slate-200 px-2 py-1 text-right">
                              Upah/Bungkus
                            </th>
                          </>
                        )}
                        <th className="border border-slate-200 px-2 py-1 w-20 text-center">
                          Baris
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {massRows.map((r, i) => (
                        <tr key={i}>
                          <td className="border border-slate-200 px-2 py-1 text-center">
                            {r.date}
                          </td>
                          <td className="border border-slate-200 px-2 py-1">
                            {r.party}
                          </td>
                          <td className="border border-slate-200 px-2 py-1">
                            {r.item}
                          </td>
                          {type === "purchase" && (
                            <>
                              <td className="border border-slate-200 px-2 py-1">
                                {r.unit}
                              </td>
                              <td className="border border-slate-200 px-2 py-1 text-right">
                                {r.qty}
                              </td>
                              <td className="border border-slate-200 px-2 py-1 text-right">
                                {r.price}
                              </td>
                            </>
                          )}
                          {subType === "Pengikisan" && (
                            <>
                              <td className="border border-slate-200 px-2 py-1 text-right">
                                {r.val1}
                              </td>
                              <td className="border border-slate-200 px-2 py-1 text-right">
                                {r.val2}
                              </td>
                            </>
                          )}
                          {subType === "Pemotongan" && (
                            <>
                              <td className="border border-slate-200 px-2 py-1 text-right">
                                {r.val1}
                              </td>
                              <td className="border border-slate-200 px-2 py-1 text-right">
                                {r.rate1}
                              </td>
                            </>
                          )}
                          {subType === "Penjemuran" && (
                            <>
                              <td className="border border-slate-200 px-2 py-1 text-right">
                                {r.val1}
                              </td>
                              <td className="border border-slate-200 px-2 py-1 text-right">
                                {r.val2}
                              </td>
                              <td className="border border-slate-200 px-2 py-1 text-right">
                                {r.rate1}
                              </td>
                              <td className="border border-slate-200 px-2 py-1 text-right">
                                {r.rate2}
                              </td>
                            </>
                          )}
                          {subType === "Pengemasan" && (
                            <>
                              <td className="border border-slate-200 px-2 py-1 text-right">
                                {r.val1}
                              </td>
                              <td className="border border-slate-200 px-2 py-1 text-right">
                                {r.rate1}
                              </td>
                            </>
                          )}
                          <td className="border border-slate-200 px-2 py-1 text-center">
                            {r._row}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </GlassDialog>
      )}
    </section>
  );
}
