"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  
  // Initialize month/year only if they exactly match a full month range
  const initialMonthYear = useMemo(() => {
    if (params.start && params.end) {
      const s = new Date(`${params.start}T00:00:00Z`);
      const e = new Date(`${params.end}T00:00:00Z`);
      
      const isFirstDay = s.getUTCDate() === 1;
      const lastDayOfS = new Date(s.getUTCFullYear(), s.getUTCMonth() + 1, 0).getDate();
      const isLastDay = e.getUTCDate() === lastDayOfS;
      const sameMonth = s.getUTCMonth() === e.getUTCMonth();
      const sameYear = s.getUTCFullYear() === e.getUTCFullYear();

      if (isFirstDay && isLastDay && sameMonth && sameYear) {
        return {
          month: String(s.getUTCMonth() + 1).padStart(2, "0"),
          year: String(s.getUTCFullYear())
        };
      }
    }
    return { month: "", year: "" };
  }, [params.start, params.end]);

  const [month, setMonth] = useState(initialMonthYear.month);
  const [year, setYear] = useState(initialMonthYear.year);

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

  // Manual month change
  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
    if (newMonth && year) {
      const m = parseInt(newMonth, 10);
      const y = parseInt(year, 10);
      const startStr = `${y}-${String(m).padStart(2, "0")}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      const endStr = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      
      const current = new URLSearchParams(searchParams?.toString() ?? "");
      current.set("start", startStr);
      current.set("end", endStr);
      current.set("page", "1");
      router.replace(`${pathname}?${current.toString()}`);
    } else if (!newMonth) {
      // If "Semua" is selected, don't necessarily clear start/end unless year is also cleared
      if (!year) {
        updateSearchParam("start", null);
        updateSearchParam("end", null);
      }
    }
  };

  // Manual year change
   const handleYearChange = (newYear: string) => {
     setYear(newYear);
     if (month && newYear) {
       const m = parseInt(month, 10);
       const y = parseInt(newYear, 10);
       const startStr = `${y}-${String(m).padStart(2, "0")}-01`;
       const lastDay = new Date(y, m, 0).getDate();
       const endStr = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
       
       const current = new URLSearchParams(searchParams?.toString() ?? "");
       current.set("start", startStr);
       current.set("end", endStr);
       current.set("page", "1");
       router.replace(`${pathname}?${current.toString()}`);
     } else if (!newYear) {
       updateSearchParam("start", null);
       updateSearchParam("end", null);
     }
   };

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

   // Sync month/year display if params.start/end change from outside (like manual date input)
   useEffect(() => {
     setMonth(initialMonthYear.month);
     setYear(initialMonthYear.year);
   }, [initialMonthYear]);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 md:grid-cols-6">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-600">
            Bulan
          </label>
          <select
            value={month}
            onChange={(e) => handleMonthChange(e.target.value)}
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
            onChange={(e) => handleYearChange(e.target.value)}
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
            value={params.start ?? ""}
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
            value={params.end ?? ""}
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
