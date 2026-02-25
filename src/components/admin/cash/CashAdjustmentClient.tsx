"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { createCashAdjustment, deleteCashAdjustment } from "@/actions/cash-adjustment-actions";
import { AdjustmentType } from "@/generated/client";

interface CashAdjustmentClientProps {
  adjustments: any[];
}

export default function CashAdjustmentClient({ adjustments }: CashAdjustmentClientProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    type: "IN" as AdjustmentType,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await createCashAdjustment({
        date: formData.date,
        amount: parseFloat(formData.amount),
        type: formData.type,
        notes: formData.notes,
      });

      if (res.success) {
        setIsAdding(false);
        setFormData({
          date: new Date().toISOString().split("T")[0],
          amount: "",
          type: "IN",
          notes: "",
        });
      }
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan penyesuaian");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus penyesuaian ini?")) return;
    setLoading(true);
    try {
      await deleteCashAdjustment(id);
    } catch (err: any) {
      alert(err.message || "Gagal menghapus penyesuaian");
    } finally {
      setLoading(false);
    }
  };

  const toCurrency = (n: number) => {
    const rounded = Math.round(n || 0);
    return `Rp ${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-700">
          Daftar Penyesuaian
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-black"
        >
          {isAdding ? "Batal" : (
            <>
              <Plus className="h-3.5 w-3.5" />
              Tambah Penyesuaian
            </>
          )}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-600">Tanggal</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full h-9 rounded-lg border border-zinc-300 bg-white px-3 text-xs focus:border-[var(--brand)] focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-600">Tipe</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as AdjustmentType })}
                className="w-full h-9 rounded-lg border border-zinc-300 bg-white px-3 text-xs focus:border-[var(--brand)] focus:outline-none"
              >
                <option value="IN">Masuk (Debit)</option>
                <option value="OUT">Keluar (Kredit)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-600">Nominal</label>
              <input
                type="number"
                required
                placeholder="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full h-9 rounded-lg border border-zinc-300 bg-white px-3 text-xs focus:border-[var(--brand)] focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-600">Keterangan</label>
              <input
                type="text"
                placeholder="Alasan penyesuaian..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full h-9 rounded-lg border border-zinc-300 bg-white px-3 text-xs focus:border-[var(--brand)] focus:outline-none"
              />
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </div>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-[var(--brand)] px-4 py-2 text-xs font-medium text-white shadow-sm hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Penyesuaian"}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-zinc-200">
        <table className="min-w-full border-collapse text-[11px] md:text-xs">
          <thead className="bg-zinc-50">
            <tr>
              <th className="border-b border-zinc-200 px-3 py-2 text-left font-semibold text-zinc-700 w-28">Tanggal</th>
              <th className="border-b border-zinc-200 px-3 py-2 text-left font-semibold text-zinc-700">Keterangan</th>
              <th className="border-b border-zinc-200 px-3 py-2 text-right font-semibold text-zinc-700 w-32">Masuk</th>
              <th className="border-b border-zinc-200 px-3 py-2 text-right font-semibold text-zinc-700 w-32">Keluar</th>
              <th className="border-b border-zinc-200 px-3 py-2 text-right font-semibold text-zinc-700 w-16">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {adjustments.map((adj) => (
              <tr key={adj.id} className="hover:bg-zinc-50 transition-colors">
                <td className="border-b border-zinc-200 px-3 py-2 text-zinc-600">
                  {format(new Date(adj.date), "dd MMM yyyy", { locale: id })}
                </td>
                <td className="border-b border-zinc-200 px-3 py-2 text-zinc-800 font-medium">
                  {adj.notes || "-"}
                </td>
                <td className="border-b border-zinc-200 px-3 py-2 text-right text-emerald-600 font-medium">
                  {adj.type === "IN" ? toCurrency(adj.amount) : "-"}
                </td>
                <td className="border-b border-zinc-200 px-3 py-2 text-right text-rose-600 font-medium">
                  {adj.type === "OUT" ? toCurrency(adj.amount) : "-"}
                </td>
                <td className="border-b border-zinc-200 px-3 py-2 text-right">
                  <button
                    onClick={() => handleDelete(adj.id)}
                    className="p-1 text-zinc-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {adjustments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-12 text-center text-zinc-500 italic">
                  Belum ada data penyesuaian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
