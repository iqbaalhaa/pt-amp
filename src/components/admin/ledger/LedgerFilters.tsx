"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Autocomplete, TextField } from "@mui/material";

type LedgerFilterParams = {
  start?: string;
  end?: string;
  itemType?: string;
  party?: string;
  page?: string;
  shift?: string;
};

type Props = {
  params: LedgerFilterParams;
  partyOptions?: string[];
  itemTypeOptions?: Array<{ id: string; name: string }>;
};

export function LedgerFilters({
  params,
  partyOptions = [],
  itemTypeOptions = [],
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [party, setParty] = useState(params.party ?? "");
  const [itemType, setItemType] = useState(params.itemType ?? "");
  const [month, setMonth] = useState<string>(() => {
    if (params.start && params.end) {
      const s = new Date(params.start);
      const e = new Date(params.end);
      if (
        s.getFullYear() === e.getFullYear() &&
        s.getMonth() === e.getMonth()
      ) {
        return String(s.getMonth() + 1).padStart(2, "0");
      }
    }
    return "";
  });
  const [year, setYear] = useState<string>(() => {
    if (params.start) {
      const s = new Date(params.start);
      return String(s.getFullYear());
    }
    return "";
  });

  const updateSearchParam = useCallback(
    (key: string, value: string | null) => {
      const current = new URLSearchParams(searchParams?.toString() ?? "");
      if (value == null || value === "") {
        current.delete(key);
      } else {
        current.set(key, value);
      }
      current.set("page", "1");
      const qs = current.toString();
      if (qs === searchParams?.toString()) return;
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams]
  );

  useEffect(() => {
    const handle = setTimeout(() => {
      updateSearchParam("party", party.trim() || null);
    }, 400);
    return () => clearTimeout(handle);
  }, [party, updateSearchParam]);

  useEffect(() => {
    const handle = setTimeout(() => {
      updateSearchParam("itemType", itemType.trim() || null);
    }, 400);
    return () => clearTimeout(handle);
  }, [itemType, updateSearchParam]);

  useEffect(() => {
    if (!month || !year) return;
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (!isFinite(m) || !isFinite(y)) return;
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0);
    const toISO = (d: Date) => d.toISOString().slice(0, 10);
    updateSearchParam("start", toISO(start));
    updateSearchParam("end", toISO(end));
  }, [month, year, updateSearchParam]);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 md:grid-cols-6">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-600">
            Bulan
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="">Semua</option>
            {Array.from({ length: 12 }, (_, i) =>
              String(i + 1).padStart(2, "0")
            ).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-600">
            Tahun
          </label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="">Semua</option>
            {(() => {
              const now = new Date().getFullYear();
              const years = Array.from({ length: 6 }, (_, i) =>
                String(now - 4 + i)
              );
              return years;
            })().map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-600">
            Tanggal awal
          </label>
          <input
            type="date"
            defaultValue={params.start ?? ""}
            onChange={(e) => updateSearchParam("start", e.target.value || null)}
            className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-600">
            Tanggal akhir
          </label>
          <input
            type="date"
            defaultValue={params.end ?? ""}
            onChange={(e) => updateSearchParam("end", e.target.value || null)}
            className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-600">
            Pekerja / Customer
          </label>
          <Autocomplete
            freeSolo
            options={partyOptions}
            value={party}
            onChange={(_e, v) => setParty(v ?? "")}
            onInputChange={(_e, v) => setParty(v)}
            renderInput={(params) => (
              <TextField
                {...params}
                id="ledger-filter-party"
                size="small"
                placeholder="Ketik nama pihak terkait"
              />
            )}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-600">
            Jenis barang
          </label>
          <Autocomplete
            options={itemTypeOptions}
            getOptionLabel={(opt) => opt.name}
            value={itemTypeOptions.find((it) => it.id === itemType) ?? null}
            onChange={(_e, v) => setItemType(v?.id ?? "")}
            renderInput={(params) => (
              <TextField
                {...params}
                id="ledger-filter-item-type"
                size="small"
                placeholder="Cari jenis barang"
              />
            )}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-600">
            Shift
          </label>
          <select
            value={params.shift ?? ""}
            onChange={(e) => updateSearchParam("shift", e.target.value || null)}
            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="">Semua</option>
            <option value="siang">Siang</option>
            <option value="malam">Malam</option>
          </select>
        </div>
      </div>
    </div>
  );
}
