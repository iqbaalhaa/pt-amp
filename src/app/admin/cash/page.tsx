import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";

function toCurrency(n: number) {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n || 0);
  } catch {
    return `Rp ${Math.round(n || 0).toLocaleString("id-ID")}`;
  }
}

export default async function CashPage() {
  const [sales, purchases, productions, pengikisanList, pemotonganList, penjemuranList, pengemasanList] =
    await Promise.all([
      prisma.sale.findMany({
        where: { status: "posted" },
        include: { saleItems: true },
      }),
      prisma.purchase.findMany({
        where: { status: "posted" },
        include: { purchaseItems: true },
      }),
      prisma.production.findMany({
        include: {
          productionInputs: true,
          productionType: true,
        },
      }),
      prisma.pengikisan.findMany({}),
      prisma.pemotongan.findMany({}),
      prisma.penjemuran.findMany({}),
      prisma.pengemasan.findMany({}),
    ]);
  const anyPrisma = prisma as any;
  let totalExpense = 0;
  let totalExpenseDraft = 0;
  if (anyPrisma?.expense?.findMany) {
    const [postedExpenses, draftExpenses] = await Promise.all([
      prisma.expense.findMany({
        where: { status: "posted" },
        include: { items: true },
      }),
      prisma.expense.findMany({
        where: { status: "draft" },
        include: { items: true },
      }),
    ]);
    const sumItems = (list: typeof postedExpenses) =>
      list.reduce((sum, e) => {
        const t = e.items.reduce((acc, it) => {
          const a = parseFloat(it.amount.toString());
          return acc + (isFinite(a) ? a : 0);
        }, 0);
        return sum + t;
      }, 0) || 0;
    totalExpense = sumItems(postedExpenses);
    totalExpenseDraft = sumItems(draftExpenses);
  } else {
    const postedRows =
      await prisma.$queryRaw<Array<{ total: any }>>`
        SELECT COALESCE(SUM(i.amount), 0) AS total
        FROM "public"."expenses" e
        LEFT JOIN "public"."expense_items" i ON i."expense_id" = e."id"
        WHERE e."status" = 'posted'
      `;
    const draftRows =
      await prisma.$queryRaw<Array<{ total: any }>>`
        SELECT COALESCE(SUM(i.amount), 0) AS total
        FROM "public"."expenses" e
        LEFT JOIN "public"."expense_items" i ON i."expense_id" = e."id"
        WHERE e."status" = 'draft'
      `;
    const toNum = (v: any) => {
      if (v == null) return 0;
      if (typeof v === "number") return v;
      const s = typeof v === "string" ? v : v.toString?.() ?? "0";
      const n = parseFloat(s);
      return isFinite(n) ? n : 0;
    };
    totalExpense = toNum(postedRows?.[0]?.total);
    totalExpenseDraft = toNum(draftRows?.[0]?.total);
  }

  const pendapatan =
    sales.reduce((sum, s) => {
      const t = s.saleItems.reduce((acc, it) => {
        const q = parseFloat(it.qty.toString());
        const p = parseFloat(it.unitPrice.toString());
        const v = (isFinite(q) ? q : 0) * (isFinite(p) ? p : 0);
        return acc + v;
      }, 0);
      return sum + t;
    }, 0) || 0;

  const pembelian =
    purchases.reduce((sum, p) => {
      const t = p.purchaseItems.reduce((acc, it) => {
        const q = parseFloat(it.qty.toString());
        const c = parseFloat(it.unitCost.toString());
        const v = (isFinite(q) ? q : 0) * (isFinite(c) ? c : 0);
        return acc + v;
      }, 0);
      return sum + t;
    }, 0) || 0;

  const biayaProduksiInputs =
    productions.reduce((sum, pr) => {
      const t = pr.productionInputs.reduce((acc, it) => {
        const q = parseFloat(it.qty.toString());
        const c = parseFloat(it.unitCost.toString());
        const v = (isFinite(q) ? q : 0) * (isFinite(c) ? c : 0);
        return acc + v;
      }, 0);
      return sum + t;
    }, 0) || 0;

  const biayaUpahPengikisan =
    pengikisanList.reduce((sum, p) => sum + parseFloat(p.totalUpah?.toString() || "0"), 0) || 0;
  const biayaUpahPemotongan =
    pemotonganList.reduce((sum, p) => sum + parseFloat(p.totalUpah?.toString() || "0"), 0) || 0;
  const biayaUpahPenjemuran =
    penjemuranList.reduce((sum, p) => sum + parseFloat(p.totalUpah?.toString() || "0"), 0) || 0;
  const biayaUpahPengemasan =
    pengemasanList.reduce((sum, p) => sum + parseFloat(p.totalUpah?.toString() || "0"), 0) || 0;

  const pengeluaran =
    pembelian +
    biayaProduksiInputs +
    biayaUpahPengikisan +
    biayaUpahPemotongan +
    biayaUpahPenjemuran +
    biayaUpahPengemasan +
    totalExpense;

  const saldo = pendapatan - pengeluaran;

  return (
    <main className="w-full px-4 py-6">
      <section className="mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Kas & Saldo</h1>
            <p className="text-sm text-slate-600">
              Ringkasan arus kas dari penjualan, pembelian, dan biaya produksi.
            </p>
          </div>
          <div className="hidden md:flex gap-2">
            <a
              href="/admin/expenses"
              className="rounded-md bg-[var(--brand)] px-3 py-1.5 text-[11px] font-medium text-white shadow-sm hover:opacity-90"
            >
              Catat Expense
            </a>
            <a
              href="/admin/ledger?type=sale"
              className="rounded-md bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-black"
            >
              Lihat Pembukuan
            </a>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-gradient-to-b from-emerald-50 to-white p-4 shadow-sm ring-1 ring-emerald-100">
          <div className="text-xs text-slate-500">Pendapatan</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{toCurrency(pendapatan)}</div>
          <div className="mt-2">
            <a
              className="text-[11px] text-[var(--brand)] hover:underline"
              href={`/admin/ledger?type=sale&status=posted`}
            >
              Lihat di Pembukuan
            </a>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-b from-rose-50 to-white p-4 shadow-sm ring-1 ring-rose-100">
          <div className="text-xs text-slate-500">Pengeluaran</div>
          <div className="mt-1 text-2xl font-bold text-rose-600">{toCurrency(pengeluaran)}</div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-slate-100 p-2">
              <div className="text-[11px] text-slate-500">Pembelian</div>
              <div className="font-semibold text-slate-800">{toCurrency(pembelian)}</div>
            </div>
            <div className="rounded-lg border border-slate-100 p-2">
              <div className="text-[11px] text-slate-500">Biaya Produksi (Input)</div>
              <div className="font-semibold text-slate-800">{toCurrency(biayaProduksiInputs)}</div>
            </div>
            <div className="rounded-lg border border-slate-100 p-2">
              <div className="text-[11px] text-slate-500">Expense (posted)</div>
              <div className="font-semibold text-slate-800">{toCurrency(totalExpense)}</div>
              {totalExpenseDraft > 0 && (
                <div className="mt-1 text-[10px] text-slate-500">
                  Draft: {toCurrency(totalExpenseDraft)} (belum dihitung)
                </div>
              )}
            </div>
            <div className="rounded-lg border border-slate-100 p-2">
              <div className="text-[11px] text-slate-500">Upah Pengikisan</div>
              <div className="font-semibold text-slate-800">{toCurrency(biayaUpahPengikisan)}</div>
            </div>
            <div className="rounded-lg border border-slate-100 p-2">
              <div className="text-[11px] text-slate-500">Upah Pemotongan</div>
              <div className="font-semibold text-slate-800">{toCurrency(biayaUpahPemotongan)}</div>
            </div>
            <div className="rounded-lg border border-slate-100 p-2">
              <div className="text-[11px] text-slate-500">Upah Penjemuran</div>
              <div className="font-semibold text-slate-800">{toCurrency(biayaUpahPenjemuran)}</div>
            </div>
            <div className="rounded-lg border border-slate-100 p-2">
              <div className="text-[11px] text-slate-500">Upah Pengemasan</div>
              <div className="font-semibold text-slate-800">{toCurrency(biayaUpahPengemasan)}</div>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <a className="text-[11px] text-[var(--brand)] hover:underline" href={`/admin/ledger?type=purchase&status=posted`}>Lihat di Pembukuan</a>
            <span className="text-[10px] text-slate-400">•</span>
            <a className="text-[11px] text-[var(--brand)] hover:underline" href={`/admin/ledger?type=invoice&status=posted`}>Lihat Invoice Expense</a>
            {totalExpenseDraft > 0 && (
              <>
                <span className="text-[10px] text-slate-400">•</span>
                <a className="text-[11px] text-[var(--brand)] hover:underline" href={`/admin/ledger?type=invoice&status=draft`}>Lihat Draft Expense</a>
              </>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="text-xs text-slate-500">Kas / Saldo</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{toCurrency(saldo)}</div>
          <div className="mt-1 text-[11px] text-slate-500">
            Per {format(new Date(), "dd MMM yyyy, HH:mm", { locale: id })} WIB
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="mb-2 text-sm font-semibold text-slate-800">Integrasi</h2>
        <div className="text-xs text-slate-600">
          - Pendapatan bersumber dari transaksi Penjualan berstatus posted.
          <br />
          - Pengeluaran mencakup total Pembelian posted, biaya input produksi, upah proses produksi, dan Expense berstatus posted.
        </div>
      </section>
    </main>
  );
}
