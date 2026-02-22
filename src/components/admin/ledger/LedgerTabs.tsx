"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type TabKey =
  | "purchase"
  | "sale"
  | "invoice"
  | "production:Pengikisan"
  | "production:Pemotongan"
  | "production:Penjemuran"
  | "production:Pengemasan"
  | "production:Pensortiran"
  | "production:QC Potong & Sortir"
  | "production:Produksi Lainnya";

const TABS: { key: TabKey; label: string }[] = [
  { key: "purchase", label: "Pembelian" },
  { key: "sale", label: "Penjualan" },
  { key: "invoice", label: "Pengeluaran" },
  { key: "production:Pengikisan", label: "Pengikisan" },
  { key: "production:Pemotongan", label: "Pemotongan" },
  { key: "production:Penjemuran", label: "Penjemuran" },
  { key: "production:Pengemasan", label: "Pengemasan" },
  { key: "production:Pensortiran", label: "Pensortiran" },
  { key: "production:QC Potong & Sortir", label: "QC Potong & Sortir" },
  { key: "production:Produksi Lainnya", label: "Produksi Lainnya" },
];

export function LedgerTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentType = searchParams?.get("type") ?? "purchase";
  const currentSubType = searchParams?.get("subType") ?? null;
  const currentShift = searchParams?.get("shift") ?? "";
  const activeKey: TabKey =
    currentType === "production" && currentSubType
      ? (`production:${currentSubType}` as TabKey)
      : (currentType as TabKey);

  const handleClick = (key: TabKey) => {
    const usp = new URLSearchParams(searchParams?.toString() ?? "");
    const [type, subType] = key.split(":");
    usp.set("type", type);
    if (subType) {
      usp.set("subType", subType);
    } else {
      usp.delete("subType");
    }
    usp.set("page", "1");
    router.replace(usp.toString() ? `${pathname}?${usp.toString()}` : pathname);
  };

  const handleShiftChange = (value: "" | "siang" | "malam") => {
    const usp = new URLSearchParams(searchParams?.toString() ?? "");
    if (!value) {
      usp.delete("shift");
    } else {
      usp.set("shift", value);
    }
    usp.set("page", "1");
    router.replace(usp.toString() ? `${pathname}?${usp.toString()}` : pathname);
  };

  const showShiftToggle =
    currentType === "production" &&
    (currentSubType === "Pengikisan" ||
      currentSubType === "Pemotongan" ||
      currentSubType === "Pengemasan");

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const isActive = t.key === activeKey;
          return (
            <button
              key={t.key}
              onClick={() => handleClick(t.key)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-800 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {showShiftToggle ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium text-slate-600">Shift:</span>
          <button
            onClick={() => handleShiftChange("")}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
              currentShift === "" || currentShift == null
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-800 hover:bg-slate-200"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => handleShiftChange("siang")}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
              currentShift === "siang"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-800 hover:bg-slate-200"
            }`}
          >
            Siang
          </button>
          <button
            onClick={() => handleShiftChange("malam")}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
              currentShift === "malam"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-800 hover:bg-slate-200"
            }`}
          >
            Malam
          </button>
        </div>
      ) : null}
    </>
  );
}
