"use client";

import { Printer } from "lucide-react";

export default function SalaryReportPrintClient() {
  const handlePrint = () => {
    const usp = new URLSearchParams(window.location.search);
    const url = `/admin-print/laporan-gaji?${usp.toString()}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handlePrint}
      className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm no-print"
    >
      <Printer className="h-3.5 w-3.5" />
      Cetak Laporan (Tab Baru)
    </button>
  );
}
