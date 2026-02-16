"use client";

import { useMemo, useRef, useState } from "react";
import { Invoice, type InvoiceData } from "@/components/Invoice";
import { useReactToPrint } from "react-to-print";
import { createExpense } from "@/actions/expense-actions";
import SuccessModal from "./SuccessModal";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function formatRupiah(val: number) {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  } catch {
    return `Rp ${Math.round(val || 0).toLocaleString("id-ID")}`;
  }
}

export default function ExpenseForm({ inputBy }: { inputBy: string | null }) {
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const newId = () =>
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const [items, setItems] = useState<
    { id: string; purpose: string; amount: string }[]
  >([{ id: newId(), purpose: "", amount: "" }]);

  const grandTotal = useMemo(() => {
    return items.reduce((sum, it) => {
      const n = parseFloat(it.amount || "0");
      return sum + (isFinite(n) && n > 0 ? n : 0);
    }, 0);
  }, [items]);

  const canExport = useMemo(
    () =>
      items.some(
        (it) =>
          it.purpose.trim().length > 0 &&
          isFinite(parseFloat(it.amount)) &&
          parseFloat(it.amount) > 0
      ),
    [items]
  );

  const addItem = () =>
    setItems((prev) => [...prev, { id: newId(), purpose: "", amount: "" }]);
  const removeItem = (id: string) =>
    setItems((prev) =>
      prev.length <= 1 ? prev : prev.filter((x) => x.id !== id)
    );
  const updateItem = (id: string, key: "purpose" | "amount", val: string) => {
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, [key]: val } : x))
    );
  };

  const invoiceData: InvoiceData = {
    id: "-",
    date: new Date(date).toISOString(),
    partyName: "Expense",
    partyType: "Supplier",
    type: "Purchase Invoice",
    notes: notes || null,
    items: items
      .filter(
        (it) =>
          it.purpose.trim().length > 0 &&
          isFinite(parseFloat(it.amount)) &&
          parseFloat(it.amount) > 0
      )
      .map((it) => {
        const amt = String(parseFloat(it.amount));
        return {
          productName: it.purpose,
          qty: "",
          unit: "",
          price: amt,
          total: amt,
        };
      }),
    totalAmount: String(grandTotal),
    inputBy: inputBy || undefined,
  };

  // A5 (1/2 A4) portrait: 148mm × 210mm
  const A5_W_MM = 148;
  const A5_H_MM = 210;
  const PRINT_MARGIN_MM = 10;

  // Node khusus cetak/pdf tanpa scale
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: printRef.current.scrollWidth,
      windowHeight: printRef.current.scrollHeight,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: [A5_W_MM, A5_H_MM],
    });
    const pageW = A5_W_MM;
    const pageH = A5_H_MM;
    const margin = PRINT_MARGIN_MM;
    const contentW = pageW - margin * 2;
    const contentH = pageH - margin * 2;
    const imgHeightMm = (canvas.height * contentW) / canvas.width;
    let heightLeft = imgHeightMm;
    let offsetY = 0;
    pdf.addImage(imgData, "PNG", margin, margin, contentW, imgHeightMm);
    heightLeft -= contentH;
    while (heightLeft > 0) {
      offsetY += contentH;
      pdf.addPage([pageW, pageH], "p");
      pdf.addImage(
        imgData,
        "PNG",
        margin,
        margin - offsetY,
        contentW,
        imgHeightMm
      );
      heightLeft -= contentH;
    }
    pdf.save(`faktur-expense-${date || "draft"}.pdf`);
  };

  const handleSaveClick = () => {
    const validItems = items.filter(
      (it) =>
        it.purpose.trim().length > 0 &&
        isFinite(parseFloat(it.amount)) &&
        parseFloat(it.amount) > 0
    );
    if (validItems.length === 0) {
      setMessage("Isi minimal satu baris dengan keterangan dan biaya > 0.");
      return;
    }
    setMessage(null);
    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    const validItems = items.filter(
      (it) =>
        it.purpose.trim().length > 0 &&
        isFinite(parseFloat(it.amount)) &&
        parseFloat(it.amount) > 0
    );

    setSaving(true);
    try {
      const payload = {
        date,
        notes: notes || null,
        items: validItems.map(({ id, ...rest }) => rest),
      };
      const res = await createExpense(payload);
      if (res && res.success) {
        setShowSuccess(true);
        setConfirmOpen(false);
      } else {
        setMessage("Gagal menyimpan expense.");
      }
    } catch (err) {
      setMessage("Terjadi kesalahan saat menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] items-start">
      <SuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        onDownload={handleDownloadPdf}
        onNewInvoice={() => {
          setNotes("");
          setItems([{ id: newId(), purpose: "", amount: "" }]);
          setShowSuccess(false);
        }}
      />
      <div className="space-y-3 min-w-0">
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Input Pengeluaran
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-slate-600">
                Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-[var(--brand)]"
              />
            </div>
            <div className="flex items-end justify-end">
              <button
                type="button"
                onClick={addItem}
                className="rounded-md bg-slate-900 px-3 py-2 text-[11px] font-medium text-white shadow-sm hover:bg-black"
              >
                Tambah Baris
              </button>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-slate-100 overflow-hidden">
            <table className="min-w-full border-collapse text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="w-10 px-3 py-2 font-semibold">No</th>
                  <th className="min-w-[220px] px-3 py-2 font-semibold">
                    Keterangan Keperluan
                  </th>
                  <th className="w-40 px-3 py-2 text-right font-semibold">
                    Biaya
                  </th>
                  <th className="w-10 px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {items.map((row, idx) => {
                  const amtNum = parseFloat(row.amount || "0");
                  return (
                    <tr key={row.id}>
                      <td className="px-3 py-1.5 text-slate-700">{idx + 1}</td>
                      <td className="px-3 py-1.5">
                        <input
                          type="text"
                          value={row.purpose}
                          onChange={(e) =>
                            updateItem(row.id, "purpose", e.target.value)
                          }
                          placeholder="Contoh: Beli BBM, makan kru, dll."
                          className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-[var(--brand)]"
                        />
                      </td>
                      <td className="px-3 py-1.5">
                        <input
                          type="number"
                          inputMode="decimal"
                          placeholder="0"
                          value={row.amount}
                          onChange={(e) =>
                            updateItem(row.id, "amount", e.target.value)
                          }
                          className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-right text-sm outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-[var(--brand)]"
                        />
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(row.id)}
                          className="rounded-md bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700 ring-1 ring-rose-100 hover:bg-rose-100 disabled:opacity-50"
                          disabled={items.length <= 1}
                          title="Hapus baris"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-1 mt-3">
            <label className="text-[11px] font-medium text-slate-600">
              Catatan
            </label>
            <textarea
              placeholder="Opsional"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-[var(--brand)]"
              rows={3}
            />
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <div className="text-xs">
              <div className="font-semibold text-slate-700">Total</div>
              <div className="font-semibold text-slate-900">
                {formatRupiah(grandTotal)}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveClick}
                className="inline-flex items-center rounded-md bg-[var(--brand)] px-2.5 py-1.5 text-[11px] font-medium text-white shadow-sm hover:opacity-90 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                type="button"
                onClick={canExport ? handlePrint : undefined}
                disabled={!canExport}
                className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1.5 text-[11px] font-medium text-slate-800 shadow-sm hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Cetak
              </button>
            </div>
          </div>

          {message && (
            <div className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-[11px] text-amber-800 ring-1 ring-amber-100">
              {message}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 min-w-0">
        <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-2 shadow-sm">
          <div className="flex w-full max-w-[560px] md:max-w-[620px] items-start justify-center bg-white mx-auto">
            <div className="origin-top scale-75" style={{ width: "148mm" }}>
              <div>
                <Invoice data={invoiceData} hideQty />
              </div>
            </div>
          </div>
          {!canExport && (
            <p className="mt-2 text-[11px] text-slate-500 text-center">
              Lengkapi keterangan dan biaya untuk mencetak struk.
            </p>
          )}
        </div>
        {/* Node khusus untuk print/PDF tanpa scale */}
        <div
          style={{
            position: "fixed",
            left: "-10000px",
            top: 0,
            width: `${A5_W_MM}mm`,
            backgroundColor: "white",
            zIndex: -1,
          }}
        >
          <div ref={printRef as any}>
            <Invoice data={invoiceData} hideQty />
          </div>
        </div>
      </div>
      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSave}
        loading={saving}
        title="Simpan Pengeluaran"
        content={`Apakah Anda yakin ingin menyimpan pengeluaran ini dengan total ${formatRupiah(
          grandTotal
        )}?`}
      />
    </div>
  );
}
