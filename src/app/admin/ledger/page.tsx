import { prisma } from "@/lib/prisma";
import { LedgerFilters } from "@/components/admin/ledger/LedgerFilters";
import { LedgerSection } from "@/components/admin/ledger/LedgerSection";
import { ProductionCostSummary } from "@/components/admin/ledger/ProductionCostSummary";
import { LedgerEntry } from "@/components/admin/ledger/types";
import { formatDateTime, toCurrency } from "@/components/admin/ledger/formatters";

type SearchParams = {
  start?: string;
  end?: string;
  type?: "purchase" | "sale" | "production";
  status?: "draft" | "posted" | "cancelled";
  affectStockOnly?: "true" | "false";
  product?: string;
  party?: string;
  q?: string;
  min?: string;
  max?: string;
  page?: string;
  size?: string;
  selected?: string;
};

function parseDateRange(params: SearchParams) {
  const start = params.start ? new Date(params.start) : undefined;
  const end = params.end ? new Date(params.end) : undefined;
  return { start, end };
}

function buildQuery(params: SearchParams, extra?: Record<string, string>) {
  const usp = new URLSearchParams();
  const setIf = (key: keyof SearchParams) => {
    const v = params[key];
    if (typeof v === "string" && v.length > 0) usp.set(key as string, v);
  };
  setIf("start");
  setIf("end");
  setIf("type");
  setIf("status");
  setIf("affectStockOnly");
  setIf("product");
  setIf("party");
  setIf("q");
  setIf("min");
  setIf("max");
  setIf("size");
  setIf("page");
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (typeof v === "string" && v.length > 0) usp.set(k, v);
    }
  }
  return usp.toString();
}

export default async function AdminLedgerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const { start, end } = parseDateRange(params);
  const page = Math.max(1, parseInt(params.page || "1") || 1);
  const size = Math.min(100, Math.max(10, parseInt(params.size || "20") || 20));

  const [purchases, sales, productions] = await Promise.all([
    prisma.purchase.findMany({
      where: {
        ...(start ? { date: { gte: start } } : {}),
        ...(end ? { date: { lte: end } } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.party
          ? { supplier: { contains: params.party, mode: "insensitive" } }
          : {}),
        ...(params.product
          ? {
              purchaseItems: {
                some: { productId: BigInt(params.product) },
              },
            }
          : {}),
        ...(params.q
          ? { OR: [{ notes: { contains: params.q, mode: "insensitive" } }] }
          : {}),
      },
      orderBy: { date: "desc" },
      include: {
        purchaseItems: {
          include: { product: true },
        },
      },
    }),
    prisma.sale.findMany({
      where: {
        ...(start ? { date: { gte: start } } : {}),
        ...(end ? { date: { lte: end } } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.party
          ? { customer: { contains: params.party, mode: "insensitive" } }
          : {}),
        ...(params.product
          ? {
              saleItems: {
                some: { productId: BigInt(params.product) },
              },
            }
          : {}),
        ...(params.q
          ? { OR: [{ notes: { contains: params.q, mode: "insensitive" } }] }
          : {}),
      },
      orderBy: { date: "desc" },
      include: {
        saleItems: {
          include: { product: true },
        },
      },
    }),
    prisma.production.findMany({
      where: {
        ...(start ? { date: { gte: start } } : {}),
        ...(end ? { date: { lte: end } } : {}),
        ...(params.status ? { status: params.status as any } : {}),
        ...(params.product
          ? {
              OR: [
                { productionInputs: { some: { productId: BigInt(params.product) } } },
                { productionOutputs: { some: { productId: BigInt(params.product) } } },
              ],
            }
          : {}),
        ...(params.q
          ? { OR: [{ notes: { contains: params.q, mode: "insensitive" } }] }
          : {}),
      },
      orderBy: { date: "desc" },
      include: {
        productionInputs: { include: { product: true } },
        productionOutputs: { include: { product: true } },
        productionType: true,
      },
    }),
  ]);

  const purchaseEntries: LedgerEntry[] = purchases.map((p) => {
    const total =
      p.purchaseItems.reduce((sum, it) => {
        const q = parseFloat(it.qty.toString());
        const c = parseFloat(it.unitCost.toString());
        const v = q * c;
        return sum + (isFinite(v) ? v : 0);
      }, 0) || 0;
    const totalValue = total > 0 ? total : null;
    return {
      id: p.id.toString(),
      type: "purchase",
      date: p.date.toISOString(),
      status: p.status,
      reference: p.id.toString(),
      counterparty: p.supplier,
      total: totalValue,
      stockImpact: "IN",
      notes: p.notes,
      itemCount: p.purchaseItems.length,
    };
  });

  const saleEntries: LedgerEntry[] = sales.map((s) => {
    const total =
      s.saleItems.reduce((sum, it) => {
        const q = parseFloat(it.qty.toString());
        const c = parseFloat(it.unitPrice.toString());
        const v = q * c;
        return sum + (isFinite(v) ? v : 0);
      }, 0) || 0;
    const totalValue = total > 0 ? total : null;
    return {
      id: s.id.toString(),
      type: "sale",
      date: s.date.toISOString(),
      status: s.status,
      reference: s.id.toString(),
      counterparty: s.customer,
      total: totalValue,
      stockImpact: "OUT",
      notes: s.notes,
      itemCount: s.saleItems.length,
    };
  });

  const productionEntries: LedgerEntry[] = productions.map((pr) => {
    const itemCount = pr.productionInputs.length + pr.productionOutputs.length;
    const productionCost =
      pr.productionInputs.reduce((sum, it) => {
        const q = parseFloat(it.qty.toString());
        const c = parseFloat(it.unitCost.toString());
        const v = q * c;
        return sum + (isFinite(v) ? v : 0);
      }, 0) || 0;
    const costValue = productionCost > 0 ? productionCost : null;
    return {
      id: pr.id.toString(),
      type: "production",
      date: pr.date.toISOString(),
      status: pr.status as any,
      reference: pr.id.toString(),
      counterparty: pr.productionType?.name ?? null,
      total: null,
      stockImpact: "NEUTRAL",
      notes: pr.notes,
      itemCount,
      productionCost: costValue,
    };
  });

  let filteredPurchases: LedgerEntry[] = purchaseEntries;
  let filteredSales: LedgerEntry[] = saleEntries;
  let filteredProductions: LedgerEntry[] = productionEntries;

  if (params.affectStockOnly === "true") {
    filteredPurchases = filteredPurchases.filter((e) => e.itemCount > 0);
    filteredSales = filteredSales.filter((e) => e.itemCount > 0);
  }

  const typeFilter = params.type;
  if (typeFilter) {
    if (typeFilter !== "purchase") filteredPurchases = [];
    if (typeFilter !== "sale") filteredSales = [];
    if (typeFilter !== "production") filteredProductions = [];
  }

  const min = params.min ? parseFloat(params.min) : undefined;
  const max = params.max ? parseFloat(params.max) : undefined;
  const applyAmountFilter = (
    list: LedgerEntry[],
    selector: (e: LedgerEntry) => number | null | undefined,
  ) => {
    if (min === undefined && max === undefined) return list;
    return list.filter((e) => {
      const value = selector(e);
      const num = value != null ? value : NaN;
      if (!isFinite(num)) return false;
      if (min !== undefined && num < min) return false;
      if (max !== undefined && num > max) return false;
      return true;
    });
  };

  filteredPurchases = applyAmountFilter(filteredPurchases, (e) => e.total);
  filteredSales = applyAmountFilter(filteredSales, (e) => e.total);
  filteredProductions = applyAmountFilter(
    filteredProductions,
    (e) => e.productionCost ?? null,
  );

  const sortEntries = (list: LedgerEntry[]) =>
    [...list].sort((a, b) =>
      a.date < b.date ? 1 : a.date > b.date ? -1 : a.type.localeCompare(b.type),
    );

  const sortedPurchases = sortEntries(filteredPurchases);
  const sortedSales = sortEntries(filteredSales);
  const sortedProductions = sortEntries(filteredProductions);

  const purchaseCount = sortedPurchases.length;
  const saleCount = sortedSales.length;
  const productionCount = sortedProductions.length;

  const purchaseNominal = sortedPurchases.reduce(
    (sum, e) => sum + (e.total ?? 0),
    0,
  );
  const saleNominal = sortedSales.reduce(
    (sum, e) => sum + (e.total ?? 0),
    0,
  );
  const productionCostTotal = sortedProductions.reduce(
    (sum, e) => sum + (e.productionCost ?? 0),
    0,
  );

  const startIdx = (page - 1) * size;
  const purchasePageItems = sortedPurchases.slice(startIdx, startIdx + size);
  const salePageItems = sortedSales.slice(startIdx, startIdx + size);
  const productionPageItems = sortedProductions.slice(
    startIdx,
    startIdx + size,
  );

  const totalCount = purchaseCount + saleCount + productionCount;
  const visibleRows =
    purchasePageItems.length +
    salePageItems.length +
    productionPageItems.length;
  const summaryTotalTransaksi = totalCount;
  const summaryTotalNominal = purchaseNominal + saleNominal;
  const breakdown = {
    purchase: purchaseCount,
    sale: saleCount,
    production: productionCount,
  };

  const selectedId = params.selected;
  const allEntries: LedgerEntry[] = [
    ...sortedPurchases,
    ...sortedSales,
    ...sortedProductions,
  ];
  const selected = selectedId
    ? allEntries.find((e) => e.id === selectedId)
    : undefined;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6">
      <section className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">Pembukuan</h1>
        <p className="text-sm text-slate-600">
          Rekap transaksi & pergerakan stok dari data yang terekam
        </p>
      </section>

      <section className="mb-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <LedgerFilters params={params} />
      </section>

      <section className="mb-4">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800">
            Total transaksi: {summaryTotalTransaksi}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800">
            Total nominal: {toCurrency(summaryTotalNominal)}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800">
            Purchase: {breakdown.purchase}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800">
            Sales: {breakdown.sale}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800">
            Processing: {breakdown.production}
          </span>
        </div>
      </section>

      <section className="mb-4 grid gap-4 md:grid-cols-2">
        {purchaseCount > 0 && (
          <LedgerSection
            title="Pembelian"
            type="purchase"
            entries={purchasePageItems}
            totalCount={purchaseCount}
            totalNominal={purchaseNominal}
          />
        )}
        {saleCount > 0 && (
          <LedgerSection
            title="Penjualan"
            type="sale"
            entries={salePageItems}
            totalCount={saleCount}
            totalNominal={saleNominal}
          />
        )}
      </section>

      {productionCount > 0 && (
        <section className="mb-4">
          <LedgerSection
            title="Produksi"
            type="production"
            entries={productionPageItems}
            totalCount={productionCount}
            totalNominal={productionCostTotal}
            extraHeaderContent={
              <ProductionCostSummary totalCost={productionCostTotal} />
            }
          />
        </section>
      )}

      <section className="rounded-xl bg-white p-0 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="text-xs text-slate-600">
            Menampilkan {visibleRows} dari {totalCount} transaksi
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/ledger?${buildQuery(params, {
                  page: String(page - 1),
                  size: String(size),
                })}`}
                className="rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-800 hover:bg-slate-200"
              >
                Prev
              </a>
            )}
            {startIdx + size < totalCount && (
              <a
                href={`/admin/ledger?${buildQuery(params, {
                  page: String(page + 1),
                  size: String(size),
                })}`}
                className="rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-800 hover:bg-slate-200"
              >
                Next
              </a>
            )}
          </div>
        </div>
      </section>

      {selected && (
        <section className="mt-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Detail Transaksi</h2>
            <a href={`/admin/ledger?${buildQuery(params)}`} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-800 hover:bg-slate-200">
              Tutup
            </a>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="space-y-1 text-xs">
              <div><span className="font-medium">ID:</span> {selected.id}</div>
              <div><span className="font-medium">Tanggal:</span> {formatDateTime(selected.date)}</div>
              <div><span className="font-medium">Jenis:</span> {selected.type}</div>
              <div><span className="font-medium">Status:</span> {selected.status.toUpperCase()}</div>
              <div><span className="font-medium">Counterparty:</span> {selected.counterparty || "-"}</div>
              <div>
                <span className="font-medium">Total:</span>{" "}
                {selected.total != null ? toCurrency(selected.total) : "-"}
              </div>
              {selected.type === "production" && selected.productionCost != null && (
                <div>
                  <span className="font-medium">Biaya produksi:</span>{" "}
                  {toCurrency(selected.productionCost)}
                </div>
              )}
              <div><span className="font-medium">Catatan:</span> {selected.notes || "-"}</div>
            </div>
            <div className="space-y-2 text-xs" />
          </div>
        </section>
      )}
    </main>
  );
}
