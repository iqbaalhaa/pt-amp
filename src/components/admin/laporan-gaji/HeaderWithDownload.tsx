"use client";

import { useState } from "react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import GlassButton from "@/components/ui/GlassButton";

export default function LaporanGajiHeaderWithDownload({
  title,
}: {
  title: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        <div className="flex items-center gap-2">
          <GlassButton
            type="button"
            variant="secondary"
            onClick={() => setOpen(true)}
            className="text-[11px] px-3 py-1"
          >
            Download
          </GlassButton>
          <Link
            href="/admin/ledger?type=production"
            className="text-[11px] font-medium text-slate-600 hover:text-slate-900"
          >
            Lihat detail di Pembukuan &rarr;
          </Link>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Download Laporan Gaji"
      >
        <div className="space-y-3 text-sm">
          <p className="text-slate-700">
            Pilih format file yang ingin diunduh.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <GlassButton
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              className="text-[11px] px-3 py-1"
            >
              Excel
            </GlassButton>
            <GlassButton
              type="button"
              variant="primary"
              onClick={() => setOpen(false)}
              className="text-[11px] px-3 py-1"
            >
              PDF
            </GlassButton>
          </div>
        </div>
      </Modal>
    </>
  );
}
