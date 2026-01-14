"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPurchase } from "@/actions/purchase-actions";
import { TransactionStatus } from "@/generated/prisma";
import { Invoice, type InvoiceData } from "@/components/Invoice";
import { formatRupiah } from "@/lib/currency";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type ProductOption = {
  id: string;
  name: string;
  unit: string;
  type: "raw" | "finished";
};

type Props = {
  products: ProductOption[];
};

type ItemRow = {
  id: string;
  productId: string;
  qty: string;
  unitCost: string;
};

const A6_W_MM = 105;
const A6_H_MM = 148;
const PRINT_MARGIN_MM = 6;

export default function PembelianPage({ products }: Props) {
  const router = useRouter();

  const [ownerName, setOwnerName] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemRow[]>(
    () =>
      products.map((p, idx) => ({
        id: `row-${idx + 1}`,
        productId: p.id,
        qty: "",
        unitCost: "",
      })) as ItemRow[]
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  const updateRow = (rowId: string, field: keyof ItemRow, value: string) => {
    setItems((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  };

  const findProduct = (id: string) => products.find((p) => p.id === id);

  const lineTotal = (row: ItemRow) => {
    const q = parseFloat(row.qty || "0");
    const c = parseFloat(row.unitCost || "0");
    const v = q * c;
    return Number.isFinite(v) ? v : 0;
  };

  const grandTotal = useMemo(
    () => items.reduce((sum, row) => sum + lineTotal(row), 0),
    [items]
  );

  const hasValidItems = items.some((r) => r.productId && r.qty && r.unitCost);

  const isValid =
    ownerName.trim().length > 0 && hasValidItems;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        supplier: ownerName || null,
        date,
        status: "draft" as TransactionStatus,
        notes: notes || null,
        items: items
          .filter((r) => r.productId && r.qty && r.unitCost)
          .map((r) => ({
            productId: r.productId,
            qty: r.qty,
            unitCost: r.unitCost,
          })),
      };

      const res = await createPurchase(payload);

      if (res && res.success) {
        setMessage({
          type: "success",
          text: "Pembelian berhasil disimpan",
        });

        setOwnerName("");
        setNotes("");
        setItems(
          products.map((p, idx) => ({
            id: `row-${idx + 1}`,
            productId: p.id,
            qty: "",
            unitCost: "",
          }))
        );

        router.refresh();
      } else {
        setMessage({
          type: "error",
          text: "Gagal menyimpan pembelian",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat menyimpan pembelian",
      });
    } finally {
      setSaving(false);
    }
  };

  const invoiceItems = useMemo(
    () =>
      items
        .map((row) => {
          const product = findProduct(row.productId);
          const total = lineTotal(row);

          return {
            productName: product ? product.name : "",
            qty: row.qty || "0",
            unit: product ? product.unit : "-",
            price: row.unitCost || "0",
            total: total.toString(),
          };
        })
        .filter(
          (it) => parseFloat(it.qty) > 0 || parseFloat(it.price) > 0
        ),
    [items, products]
  );

  const invoiceData: InvoiceData = {
    id: "DRAFT",
    date: date || new Date().toISOString(),
    partyName: ownerName || null,
    partyType: "Supplier",
    type: "Purchase Invoice",
    notes: notes || null,
    items: invoiceItems,
    totalAmount: grandTotal.toString(),
  };

  const invoicePrintRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = useReactToPrint({
    contentRef: invoicePrintRef,
    documentTitle: `nota-pembelian-${date || "draft"}`,
    pageStyle: `
      @page { size: ${A6_W_MM}mm ${A6_H_MM}mm; margin: ${PRINT_MARGIN_MM}mm; }
      html, body { margin: 0; padding: 0; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    `,
  });

  const handleDownloadPdf = async () => {
    if (!invoicePrintRef.current) return;

    const canvas = await html2canvas(invoicePrintRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0,
      windowWidth: invoicePrintRef.current.scrollWidth,
      windowHeight: invoicePrintRef.current.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: [A6_W_MM, A6_H_MM],
    });

    const pageW = A6_W_MM;
    const pageH = A6_H_MM;
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

    pdf.save(`nota-pembelian-${date || "draft"}.pdf`);
  };

  const canExport = isValid && invoiceItems.length > 0;

  return (
    <form
      onSubmit={handleSave}
      className="flex flex-col gap-6 lg:flex-row lg:items-start"
    >
      <div className="flex-1 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Pembelian
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Input transaksi pembelian dengan preview nota ukuran A6.
          </p>
        </div>

        <div className="grid gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Nama Pemilik Barang
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-xs outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Nama pemilik / supplier"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Catatan
            </label>
            <textarea
              className="w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm shadow-xs outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan (opsional)"
            />
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Daftar Barang
              </h2>
              <p className="text-xs text-slate-500">
                Semua barang aktif ditampilkan. Isi Qty dan Harga Satuan.
              </p>
            </div>
          </div>

          <div className="max-h-[360px] overflow-auto rounded-lg border border-slate-100">
            <table className="min-w-full border-collapse text-left text-xs">
              <thead className="sticky top-0 z-10 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="w-10 px-3 py-2 font-semibold">No</th>
                  <th className="min-w-[180px] px-3 py-2 font-semibold">
                    Nama Barang
                  </th>
                  <th className="w-24 px-3 py-2 text-right font-semibold">
                    Qty
                  </th>
                  <th className="w-32 px-3 py-2 text-right font-semibold">
                    Harga Satuan
                  </th>
                  <th className="w-32 px-3 py-2 text-right font-semibold">
                    Subtotal
                  </th>
                  <th className="w-12 px-3 py-2" />
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {items.map((row, idx) => {
                  const subtotal = lineTotal(row);
                  const product = findProduct(row.productId);

                  return (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="px-3 py-1.5 text-center text-[11px] text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-1.5">
                        <div className="text-xs font-medium text-slate-900">
                          {product ? product.name : "-"}
                          <span className="ml-1 text-[10px] text-slate-500">
                            {product ? `(${product.unit})` : ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.0001"
                          className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-right text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
                          value={row.qty}
                          onChange={(e) =>
                            updateRow(row.id, "qty", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-right text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
                          value={row.unitCost}
                          onChange={(e) =>
                            updateRow(row.id, "unitCost", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-3 py-1.5 text-right text-xs text-slate-800">
                        {subtotal > 0 ? formatRupiah(subtotal, 0) : "-"}
                      </td>
                      <td className="px-3 py-1.5 text-center" />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Gunakan minimal satu baris dengan Qty dan Harga untuk menyimpan.
            </p>
            <div className="text-right text-sm font-semibold text-slate-900">
              <span className="mr-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                Total
              </span>
              {formatRupiah(grandTotal, 0)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {message && (
            <div
              className={`rounded-md px-3 py-2 text-xs ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                  : "bg-red-50 text-red-700 ring-1 ring-red-100"
              }`}
            >
              {message.text}
            </div>
          )}
          <button
            type="submit"
            disabled={!isValid || saving}
            className="ml-auto inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Pembelian"}
          </button>
        </div>
      </div>

      <aside className="mt-2 w-full space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 lg:sticky lg:top-4 lg:mt-0 lg:w-80 lg:shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Preview Nota (A6)
            </h2>
            <p className="text-xs text-slate-500">
              Pratinjau sebelum download atau cetak.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={canExport ? handleDownloadPdf : undefined}
              disabled={!canExport}
              className="inline-flex items-center rounded-md bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Download PDF
            </button>
            <button
              type="button"
              onClick={canExport ? handlePrint : undefined}
              disabled={!canExport}
              className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1.5 text-[11px] font-medium text-slate-800 shadow-sm hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cetak
            </button>
          </div>
        </div>

        <div className="flex justify-center rounded-lg border border-slate-100 bg-slate-50/80 p-2">
          <div className="flex w-full max-w-[360px] items-start justify-center bg-white">
            <div
              className="origin-top scale-75"
              style={{ width: `${A6_W_MM}mm` }}
            >
              <Invoice data={invoiceData} />
            </div>
          </div>
        </div>

        {!canExport && (
          <p className="text-[11px] text-slate-500">
            Lengkapi nama pemilik dan minimal satu baris Qty & Harga agar
            nota bisa di-download atau dicetak.
          </p>
        )}

        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/80 p-3 shadow-[0_-4px_12px_rgba(15,23,42,0.12)] backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs">
              <div className="font-semibold text-slate-700">Total</div>
              <div className="font-semibold text-slate-900">
                {formatRupiah(grandTotal, 0)}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={canExport ? handlePrint : undefined}
                disabled={!canExport}
                className="inline-flex items-center rounded-md bg-slate-100 px-3 py-2 text-[11px] font-medium text-slate-800 shadow-sm hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Cetak
              </button>
              <button
                type="submit"
                disabled={!isValid || saving}
                className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div
        className="fixed left-[-10000px] top-0 z-[-1] bg-white"
        style={{ width: `${A6_W_MM}mm` }}
      >
        <Invoice ref={invoicePrintRef} data={invoiceData} />
      </div>
    </form>
  );
}
