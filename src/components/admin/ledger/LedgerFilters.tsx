"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type LedgerFilterParams = {
  start?: string;
  end?: string;
  type?: "purchase" | "sale" | "production";
  status?: "draft" | "posted" | "cancelled";
  affectStockOnly?: "true" | "false";
  product?: string;
  party?: string;
  q?: string;
  min?: string;
  max?: string;
  page?: string;
  size?: string;
};

type Props = {
  params: LedgerFilterParams;
};

export function LedgerFilters({ params }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [party, setParty] = useState(params.party ?? "");
  const [q, setQ] = useState(params.q ?? "");
  const [min, setMin] = useState(params.min ?? "");
  const [max, setMax] = useState(params.max ?? "");

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
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams],
  );

  useEffect(() => {
    const handle = setTimeout(() => {
      updateSearchParam("party", party.trim() || null);
    }, 400);
    return () => clearTimeout(handle);
  }, [party, updateSearchParam]);

  useEffect(() => {
    const handle = setTimeout(() => {
      updateSearchParam("q", q.trim() || null);
    }, 400);
    return () => clearTimeout(handle);
  }, [q, updateSearchParam]);

  useEffect(() => {
    const handle = setTimeout(() => {
      updateSearchParam("min", min.trim() || null);
    }, 400);
    return () => clearTimeout(handle);
  }, [min, updateSearchParam]);

  useEffect(() => {
    const handle = setTimeout(() => {
      updateSearchParam("max", max.trim() || null);
    }, 400);
    return () => clearTimeout(handle);
  }, [max, updateSearchParam]);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 md:grid-cols-5">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-600">
            Tanggal mulai
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
            Jenis transaksi
          </label>
          <select
            defaultValue={params.type ?? ""}
            onChange={(e) =>
              updateSearchParam("type", e.target.value || null)
            }
            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="">Semua</option>
            <option value="purchase">Purchase</option>
            <option value="sale">Sales</option>
            <option value="production">Processing</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-600">
            Status
          </label>
          <select
            defaultValue={params.status ?? ""}
            onChange={(e) =>
              updateSearchParam("status", e.target.value || null)
            }
            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="">Semua</option>
            <option value="draft">Draft</option>
            <option value="posted">Posted</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 text-[11px] font-medium text-slate-700">
            <input
              type="checkbox"
              defaultChecked={params.affectStockOnly === "true"}
              onChange={(e) =>
                updateSearchParam(
                  "affectStockOnly",
                  e.target.checked ? "true" : null,
                )
              }
              className="h-3.5 w-3.5 rounded border-slate-300 text-slate-700 focus:ring-slate-400"
            />
            Hanya yang mengubah stok
          </label>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-600">
            Worker / Supplier / Customer
          </label>
          <input
            type="text"
            value={party}
            onChange={(e) => setParty(e.target.value)}
            placeholder="Nama pihak terkait"
            className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-600">
            Produk (ID)
          </label>
          <input
            type="text"
            defaultValue={params.product ?? ""}
            onChange={(e) =>
              updateSearchParam("product", e.target.value || null)
            }
            placeholder="ID produk"
            className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-slate-600">
            Pencarian bebas
          </label>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Catatan / referensi"
            className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-600">
              Min (Rp)
            </label>
            <input
              type="number"
              min={0}
              value={min}
              onChange={(e) => setMin(e.target.value)}
              className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-600">
              Max (Rp)
            </label>
            <input
              type="number"
              min={0}
              value={max}
              onChange={(e) => setMax(e.target.value)}
              className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-600">
              Baris/hal
            </label>
            <input
              type="number"
              min={10}
              max={100}
              defaultValue={params.size ?? "20"}
              onChange={(e) =>
                updateSearchParam("size", e.target.value || null)
              }
              className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
