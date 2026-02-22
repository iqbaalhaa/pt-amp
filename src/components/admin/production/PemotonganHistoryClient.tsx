"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getPemotonganHistory,
  deletePemotongan,
} from "@/actions/pemotongan-actions";
import Toast from "@/components/ui/Toast";
import { formatRupiah } from "@/lib/currency";
import PageHeader from "@/components/ui/PageHeader";
import GlassButton from "@/components/ui/GlassButton";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import StickyNote2RoundedIcon from "@mui/icons-material/StickyNote2Rounded";
import ListAltRoundedIcon from "@mui/icons-material/ListAltRounded";
import NumbersRoundedIcon from "@mui/icons-material/NumbersRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

type HistoryItem = {
  id: string;
  date: string | Date;
  notes: string | null;
  totalUpah: number;
  items: Array<{ nama?: string; [k: string]: any }>;
};

type ToastState = {
  open: boolean;
  message: string;
  type: "success" | "danger" | "info";
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function safeDateToID(value: string | Date) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID");
}

export default function PemotonganHistoryClient() {
  const [data, setData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [toastState, setToastState] = useState<ToastState>({
    open: false,
    message: "",
    type: "info",
  });

  const [query, setQuery] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getPemotonganHistory();
      setData(res as HistoryItem[]);
    } catch (error) {
      console.error("Failed to fetch history:", error);
      setToastState({
        open: true,
        message: "Gagal memuat riwayat",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;

    return data.filter((row) => {
      const tanggal = safeDateToID(row.date).toLowerCase();
      const notes = (row.notes || "").toLowerCase();
      const pekerja = (row.items || [])
        .map((i) => i?.nama || "")
        .join(", ")
        .toLowerCase();

      return tanggal.includes(q) || notes.includes(q) || pekerja.includes(q);
    });
  }, [data, query]);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
      const res = await deletePemotongan(id);
      if (res?.success) {
        setToastState({
          open: true,
          message: "Data berhasil dihapus",
          type: "success",
        });
        fetchData();
      } else {
        setToastState({
          open: true,
          message: "Gagal menghapus data",
          type: "danger",
        });
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      setToastState({
        open: true,
        message: "Gagal menghapus data",
        type: "danger",
      });
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Riwayat Pemotongan"
        subtitle="Daftar input pemotongan yang tersimpan (bisa cari & hapus)."
        actions={
          <>
            <Link href="/admin/pemotongan">
              <GlassButton variant="secondary" size="sm">
                <ArrowBackRoundedIcon fontSize="small" className="mr-2" />
                Kembali
              </GlassButton>
            </Link>

            <GlassButton variant="secondary" size="sm" onClick={fetchData}>
              <ReplayRoundedIcon fontSize="small" className="mr-2" />
              Refresh
            </GlassButton>
          </>
        }
      />

      <div className="w-full border border-[var(--glass-border)] bg-transparent rounded-xl p-4 md:p-5">
        {/* Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative w-full md:max-w-md">
            <SearchRoundedIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={cx(
                "w-full h-[38px] pl-10 pr-3 rounded-lg",
                "border border-[var(--glass-border)] bg-white/95 text-[12px]",
                "outline-none focus:ring-2 focus:ring-[var(--brand)]/25 focus:border-[var(--brand)]"
              )}
              placeholder="Cari tanggal / catatan / pekerja…"
            />
          </div>

          <div className="text-xs text-black/55">
            {loading ? "Memuat…" : `${filtered.length} data`}
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--glass-border)] bg-transparent">
          <table className="w-full min-w-[980px] text-[12px] text-left">
            <thead className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-[var(--glass-border)]">
              <tr className="text-[11px] font-extrabold tracking-wide text-black/75 uppercase">
                <th className="px-3 py-3 w-12 text-center">
                  <span className="inline-flex items-center justify-center gap-1">
                    <NumbersRoundedIcon
                      sx={{ fontSize: 16 }}
                      className="text-black/45"
                    />
                    No
                  </span>
                </th>

                <th className="px-3 py-3 min-w-[140px]">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarMonthRoundedIcon
                      sx={{ fontSize: 16 }}
                      className="text-black/45"
                    />
                    Tanggal
                  </span>
                </th>

                <th className="px-3 py-3 min-w-[160px] text-right">
                  <span className="inline-flex items-center gap-1.5 justify-end w-full">
                    <PaymentsRoundedIcon
                      sx={{ fontSize: 16 }}
                      className="text-black/45"
                    />
                    Total Upah
                  </span>
                </th>

                <th className="px-3 py-3 min-w-[260px]">
                  <span className="inline-flex items-center gap-1.5">
                    <StickyNote2RoundedIcon
                      sx={{ fontSize: 16 }}
                      className="text-black/45"
                    />
                    Catatan
                  </span>
                </th>

                <th className="px-3 py-3 min-w-[280px]">
                  <span className="inline-flex items-center gap-1.5">
                    <ListAltRoundedIcon
                      sx={{ fontSize: 16 }}
                      className="text-black/45"
                    />
                    Detail
                  </span>
                </th>

                <th className="px-3 py-3 w-20 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--glass-border)]">
                    <td className="px-3 py-3">
                      <div className="h-4 w-6 bg-black/10 rounded" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-24 bg-black/10 rounded" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-28 bg-black/10 rounded ml-auto" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-40 bg-black/10 rounded" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-56 bg-black/10 rounded" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-8 w-10 bg-black/10 rounded mx-auto" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-black/55"
                  >
                    Tidak ada data yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((row, idx) => {
                  const pekerjaPreview = (row.items || [])
                    .map((i) => i?.nama)
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-[var(--glass-border)] hover:bg-black/[0.02] transition-colors"
                    >
                      <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-[var(--glass-border)] bg-white/70 text-[12px] font-semibold">
                          {idx + 1}
                        </span>
                      </td>

                      <td className="px-3 py-2 font-semibold text-black/80">
                        {safeDateToID(row.date)}
                      </td>

                      <td className="px-3 py-2 text-right font-extrabold text-black/80">
                        {formatRupiah(row.totalUpah || 0)}
                      </td>

                      <td className="px-3 py-2 text-black/70">
                        {row.notes ? (
                          row.notes
                        ) : (
                          <span className="text-black/40">-</span>
                        )}
                      </td>

                      <td className="px-3 py-2">
                        <div className="text-[12px] text-black/70">
                          <span className="font-semibold text-black/80">
                            {row.items?.length || 0}
                          </span>{" "}
                          pekerja
                        </div>
                        {pekerjaPreview ? (
                          <div className="text-[11px] text-black/50 truncate max-w-[420px]">
                            {pekerjaPreview}
                          </div>
                        ) : (
                          <div className="text-[11px] text-black/40">-</div>
                        )}
                      </td>

                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id)}
                          className={cx(
                            "inline-flex items-center justify-center",
                            "w-9 h-9 rounded-lg border border-[var(--glass-border)]",
                            "bg-white/70 hover:bg-red-50 transition"
                          )}
                          title="Hapus"
                        >
                          <DeleteRoundedIcon
                            fontSize="small"
                            className="text-red-600"
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Toast
        open={toastState.open}
        message={toastState.message}
        type={toastState.type as any}
        onClose={() => setToastState((s) => ({ ...s, open: false }))}
      />
    </div>
  );
}
