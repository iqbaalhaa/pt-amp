import React from "react";

export type InvoiceItem = {
  productName: string;
  qty: string;
  unit: string;
  price: string;
  total: string;
};

export type InvoiceData = {
  id: string;
  date: string;
  partyName: string;
  partyType: string;
  type: string;
  notes?: string | null;
  items: InvoiceItem[];
  totalAmount: string;
};

export function Invoice({
  data,
  hideQty,
}: {
  data: InvoiceData;
  hideQty?: boolean;
}) {
  const fmt = (v: string) =>
    new Intl.NumberFormat("id-ID").format(parseFloat(v || "0"));
  return (
    <div className="p-4 text-slate-900">
      <div className="mb-4">
        <div className="text-lg font-bold">{data.type}</div>
        <div className="text-xs text-slate-600">ID: {data.id}</div>
        <div className="text-xs text-slate-600">
          Tanggal: {new Date(data.date).toLocaleDateString("id-ID")}
        </div>
        <div className="text-xs text-slate-600">
          {data.partyType}: {data.partyName}
        </div>
      </div>
      <table className="w-full text-sm border border-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="border border-slate-200 p-2 text-left">Uraian</th>
            {!hideQty && (
              <th className="border border-slate-200 p-2 text-right">Qty</th>
            )}
            {!hideQty && (
              <th className="border border-slate-200 p-2 text-left">Satuan</th>
            )}
            <th className="border border-slate-200 p-2 text-right">Harga</th>
            <th className="border border-slate-200 p-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((it, i) => (
            <tr key={i}>
              <td className="border border-slate-200 p-2">{it.productName}</td>
              {!hideQty && (
                <td className="border border-slate-200 p-2 text-right">
                  {it.qty || "-"}
                </td>
              )}
              {!hideQty && (
                <td className="border border-slate-200 p-2">{it.unit || "-"}</td>
              )}
              <td className="border border-slate-200 p-2 text-right">
                Rp {fmt(it.price)}
              </td>
              <td className="border border-slate-200 p-2 text-right">
                Rp {fmt(it.total)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td
              className="border border-slate-200 p-2 text-right font-bold"
              colSpan={hideQty ? 3 : 4}
            >
              Total
            </td>
            <td className="border border-slate-200 p-2 text-right font-bold">
              Rp {fmt(data.totalAmount)}
            </td>
          </tr>
        </tfoot>
      </table>
      {data.notes ? (
        <div className="mt-3 text-xs text-slate-600">Catatan: {data.notes}</div>
      ) : null}
    </div>
  );
}

