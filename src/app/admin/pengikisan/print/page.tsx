import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toCurrency } from "@/components/admin/ledger/formatters";

type SearchParams = {
  id?: string;
};

export default async function PengikisanPrintPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  if (!params.id) {
    notFound();
  }

  const pengikisan = await prisma.pengikisan.findUnique({
    where: { id: BigInt(params.id) },
    include: { pengikisanItems: true },
  });

  if (!pengikisan) {
    notFound();
  }

  const totalUpah = parseFloat(pengikisan.totalUpah?.toString() || "0");
  const shiftText =
    ((pengikisan as any).shift &&
      String((pengikisan as any).shift).toLowerCase()) ||
    null;
  const shiftDisplay = shiftText
    ? shiftText.charAt(0).toUpperCase() + shiftText.slice(1)
    : "-";

  return (
    <main className="mx-auto w-full max-w-[210mm] p-6">
      <section className="mb-6">
        <h1 className="text-center text-lg font-bold uppercase">
          Rekap Pengikisan
        </h1>
        <div className="mt-4 flex justify-between text-sm">
          <div>
            <div>
              <span className="font-semibold">Tanggal: </span>
              <span>{pengikisan.date.toISOString().slice(0, 10)}</span>
            </div>
            <div>
              <span className="font-semibold">Shift: </span>
              <span>{shiftDisplay}</span>
            </div>
            <div>
              <span className="font-semibold">Petugas: </span>
              <span>{pengikisan.petugas || "-"}</span>
            </div>
          </div>
          <div className="text-right">
            <div>
              <span className="font-semibold">No. Referensi: </span>
              <span>{`PK-${pengikisan.id.toString()}`}</span>
            </div>
          </div>
        </div>
        {pengikisan.notes ? (
          <div className="mt-2 text-sm">
            <span className="font-semibold">Catatan: </span>
            <span>{pengikisan.notes}</span>
          </div>
        ) : null}
      </section>

      <section>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 px-2 py-1 text-left w-10">
                #
              </th>
              <th className="border border-slate-300 px-2 py-1 text-left">
                Pekerja
              </th>
              <th className="border border-slate-300 px-2 py-1 text-right">
                KA (kg)
              </th>
              <th className="border border-slate-300 px-2 py-1 text-right">
                Stik (kg)
              </th>
              <th className="border border-slate-300 px-2 py-1 text-right">
                Upah KA
              </th>
              <th className="border border-slate-300 px-2 py-1 text-right">
                Upah Stik
              </th>
              <th className="border border-slate-300 px-2 py-1 text-right">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {pengikisan.pengikisanItems.map((it, idx) => {
              const kaKg = parseFloat(it.kaKg?.toString() || "0");
              const stikKg = parseFloat(it.stikKg?.toString() || "0");
              const upahKa = parseFloat(it.upahKa?.toString() || "0");
              const upahStik = parseFloat(it.upahStik?.toString() || "0");
              const total =
                parseFloat(it.total?.toString() || "0") ||
                kaKg * upahKa + stikKg * upahStik;

              return (
                <tr key={idx}>
                  <td className="border border-slate-300 px-2 py-1 text-center">
                    {idx + 1}
                  </td>
                  <td className="border border-slate-300 px-2 py-1">
                    {it.nama}
                  </td>
                  <td className="border border-slate-300 px-2 py-1 text-right">
                    {kaKg || ""}
                  </td>
                  <td className="border border-slate-300 px-2 py-1 text-right">
                    {stikKg || ""}
                  </td>
                  <td className="border border-slate-300 px-2 py-1 text-right">
                    {upahKa ? toCurrency(upahKa) : ""}
                  </td>
                  <td className="border border-slate-300 px-2 py-1 text-right">
                    {upahStik ? toCurrency(upahStik) : ""}
                  </td>
                  <td className="border border-slate-300 px-2 py-1 text-right">
                    {toCurrency(total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td
                className="border border-slate-300 px-2 py-1 text-right font-semibold"
                colSpan={6}
              >
                Total Upah
              </td>
              <td className="border border-slate-300 px-2 py-1 text-right font-semibold">
                {toCurrency(totalUpah)}
              </td>
            </tr>
          </tfoot>
        </table>
      </section>
    </main>
  );
}

