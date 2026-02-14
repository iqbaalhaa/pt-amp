"use client";
import React from "react";

type Option = { id: string; name: string };

export function LedgerFilters({
  params,
  partyOptions,
  itemTypeOptions,
}: {
  params: Record<string, any>;
  partyOptions: string[];
  itemTypeOptions: Option[];
}) {
  const buildQuery = (extra: Record<string, string>) => {
    const usp = new URLSearchParams(params as any);
    Object.entries(extra).forEach(([k, v]) => {
      if (v) usp.set(k, v);
      else usp.delete(k);
    });
    return `/admin/ledger?${usp.toString()}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
      <div>
        <label className="block text-[11px] text-slate-500 mb-1">Pihak</label>
        <select
          className="w-full border rounded-md px-2 py-1"
          defaultValue={params.party || ""}
          onChange={(e) => (window.location.href = buildQuery({ party: e.target.value }))}
        >
          <option value="">Semua</option>
          {partyOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[11px] text-slate-500 mb-1">Jenis Barang</label>
        <select
          className="w-full border rounded-md px-2 py-1"
          defaultValue={params.itemType || ""}
          onChange={(e) => (window.location.href = buildQuery({ itemType: e.target.value }))}
        >
          <option value="">Semua</option>
          {itemTypeOptions.map((it) => (
            <option key={it.id} value={it.id}>
              {it.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[11px] text-slate-500 mb-1">Status</label>
        <select
          className="w-full border rounded-md px-2 py-1"
          defaultValue={params.status || ""}
          onChange={(e) => (window.location.href = buildQuery({ status: e.target.value }))}
        >
          <option value="">Semua</option>
          <option value="posted">posted</option>
          <option value="draft">draft</option>
          <option value="cancelled">cancelled</option>
        </select>
      </div>
      <div>
        <label className="block text-[11px] text-slate-500 mb-1">Pencarian</label>
        <input
          className="w-full border rounded-md px-2 py-1"
          defaultValue={params.q || ""}
          placeholder="kata kunci"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const v = (e.target as HTMLInputElement).value;
              window.location.href = buildQuery({ q: v });
            }
          }}
        />
      </div>
    </div>
  );
}
