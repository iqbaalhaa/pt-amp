"use client";
import React from "react";

export function LedgerTabs() {
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const active = params.get("type") || "purchase";
  const base = (type: string) => {
    const usp = new URLSearchParams(params);
    usp.set("type", type);
    if (type !== "production") {
      usp.delete("subType");
    }
    return `/admin/ledger?${usp.toString()}`;
  };
  const tab = (type: string, label: string) => {
    const isActive = active === type || (type === "purchase" && !params.get("type"));
    return (
      <a
        key={type}
        href={base(type)}
        className={`px-3 py-1 rounded-md text-xs font-semibold ${
          isActive ? "bg-[var(--brand)] text-white" : "bg-slate-100 text-slate-700"
        }`}
      >
        {label}
      </a>
    );
  };
  return (
    <div className="flex gap-2">
      {tab("purchase", "Pembelian")}
      {tab("sale", "Penjualan")}
      {tab("production", "Produksi")}
      {tab("invoice", "Invoice Expense")}
    </div>
  );
}
