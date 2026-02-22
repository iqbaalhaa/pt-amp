import { prisma } from "@/lib/prisma";
import { LedgerSection } from "@/components/admin/ledger/LedgerSection";
import { LedgerTabs } from "@/components/admin/ledger/LedgerTabs";
import { ProductionCostSummary } from "@/components/admin/ledger/ProductionCostSummary";
import { LedgerEntry } from "@/components/admin/ledger/types";
import {
  formatDateTime,
  toCurrency,
} from "@/components/admin/ledger/formatters";
import LedgerFiltersClient from "@/components/admin/ledger/LedgerFiltersClient";

type SearchParams = {
  start?: string;
  end?: string;
  type?: "purchase" | "sale" | "production" | "invoice";
  subType?: string;
  status?: "draft" | "posted" | "cancelled";
  affectStockOnly?: "true" | "false";
  itemType?: string;
  party?: string;
  q?: string;
  min?: string;
  max?: string;
  page?: string;
  size?: string;
  selected?: string;
  id?: string;
  shift?: "siang" | "malam";
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
  setIf("itemType");
  setIf("party");
  setIf("q");
  setIf("min");
  setIf("max");
  setIf("size");
  setIf("page");
  setIf("shift");
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

  const [
    purchases,
    sales,
    productions,
    pengikisanList,
    pemotonganList,
    penjemuranList,
    pengemasanList,
    produksiLainnyaList,
    pensortiranList,
    qcPotongSortirList,
  ] = await Promise.all([
    prisma.purchase.findMany({
      where: {
        ...(params.id ? { id: BigInt(params.id) } : {}),
        ...(start ? { date: { gte: start } } : {}),
        ...(end ? { date: { lte: end } } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.party
          ? {
              OR: [
                { supplier: { contains: params.party, mode: "insensitive" } },
                {
                  createdByName: {
                    contains: params.party,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
        ...(params.itemType
          ? {
              purchaseItems: {
                some: { itemTypeId: BigInt(params.itemType) },
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
          include: { itemType: true, unit: true },
        },
      },
    }),
    prisma.sale.findMany({
      where: {
        ...(params.id ? { id: BigInt(params.id) } : {}),
        ...(start ? { date: { gte: start } } : {}),
        ...(end ? { date: { lte: end } } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.party
          ? {
              OR: [
                { customer: { contains: params.party, mode: "insensitive" } },
                {
                  createdByName: {
                    contains: params.party,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
        ...(params.itemType
          ? {
              saleItems: {
                some: { itemTypeId: BigInt(params.itemType) },
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
          include: { itemType: true },
        },
      },
    }),
    prisma.production.findMany({
      where: {
        ...(start ? { date: { gte: start } } : {}),
        ...(end ? { date: { lte: end } } : {}),
        ...(params.status ? { status: params.status as any } : {}),
        ...(params.party
          ? {
              productionWorkers: {
                some: {
                  worker: {
                    name: { contains: params.party, mode: "insensitive" },
                  },
                },
              },
            }
          : {}),
        ...(params.itemType
          ? {
              OR: [
                {
                  productionInputs: {
                    some: { itemTypeId: BigInt(params.itemType) },
                  },
                },
                {
                  productionOutputs: {
                    some: { itemTypeId: BigInt(params.itemType) },
                  },
                },
              ],
            }
          : {}),
        ...(params.q
          ? { OR: [{ notes: { contains: params.q, mode: "insensitive" } }] }
          : {}),
      },
      orderBy: { date: "desc" },
      include: {
        productionInputs: { include: { itemType: true } },
        productionOutputs: { include: { itemType: true } },
        productionType: true,
        productionWorkers: { include: { worker: true } },
      },
    }),
    (async () => {
      try {
        return await prisma.pengikisan.findMany({
          where: {
            ...(start ? { date: { gte: start } } : {}),
            ...(end ? { date: { lte: end } } : {}),
            ...(params.shift ? { shift: params.shift } : {}),
            ...(params.q
              ? { OR: [{ notes: { contains: params.q, mode: "insensitive" } }] }
              : {}),
          },
          orderBy: { date: "desc" },
          include: { pengikisanItems: true },
        });
      } catch {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Failed to load pengikisan ledger data, returning empty list as fallback"
          );
        }
        return [];
      }
    })(),
    (async () => {
      try {
        return await prisma.pemotongan.findMany({
          where: {
            ...(start ? { date: { gte: start } } : {}),
            ...(end ? { date: { lte: end } } : {}),
            ...(params.shift ? { shift: params.shift } : {}),
            ...(params.q
              ? { OR: [{ notes: { contains: params.q, mode: "insensitive" } }] }
              : {}),
          },
          orderBy: { date: "desc" },
          include: { pemotonganItems: true },
        });
      } catch {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Failed to load pemotongan ledger data, returning empty list as fallback"
          );
        }
        return [];
      }
    })(),
    prisma.penjemuran.findMany({
      where: {
        ...(start ? { date: { gte: start } } : {}),
        ...(end ? { date: { lte: end } } : {}),
        ...(params.q
          ? { OR: [{ notes: { contains: params.q, mode: "insensitive" } }] }
          : {}),
      },
      orderBy: { date: "desc" },
      include: { penjemuranItems: true },
    }),
    (async () => {
      try {
        return await prisma.pengemasan.findMany({
          where: {
            ...(start ? { date: { gte: start } } : {}),
            ...(end ? { date: { lte: end } } : {}),
            ...(params.shift ? { shift: params.shift } : {}),
            ...(params.q
              ? { OR: [{ notes: { contains: params.q, mode: "insensitive" } }] }
              : {}),
          },
          orderBy: { date: "desc" },
          include: { pengemasanItems: true },
        });
      } catch {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Failed to load pengemasan ledger data, returning empty list as fallback"
          );
        }
        return [];
      }
    })(),
    (async () => {
      try {
        return await prisma.produksiLainnya.findMany({
          where: {
            ...(start ? { date: { gte: start } } : {}),
            ...(end ? { date: { lte: end } } : {}),
            ...(params.q
              ? {
                  OR: [{ notes: { contains: params.q, mode: "insensitive" } }],
                }
              : {}),
          },
          orderBy: { date: "desc" },
          include: { produksiLainnyaItems: true },
        });
      } catch {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Failed to load produksi_lainnya ledger data, returning empty list as fallback"
          );
        }
        return [];
      }
    })(),
    (async () => {
      try {
        return await prisma.pensortiran.findMany({
          where: {
            ...(start ? { date: { gte: start } } : {}),
            ...(end ? { date: { lte: end } } : {}),
            ...(params.q
              ? { OR: [{ notes: { contains: params.q, mode: "insensitive" } }] }
              : {}),
          },
          orderBy: { date: "desc" },
          include: { pensortiranItems: true },
        });
      } catch {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Failed to load pensortiran ledger data, returning empty list as fallback"
          );
        }
        return [];
      }
    })(),
    (async () => {
      try {
        return await prisma.qcPotongSortir.findMany({
          where: {
            ...(start ? { date: { gte: start } } : {}),
            ...(end ? { date: { lte: end } } : {}),
            ...(params.q
              ? { OR: [{ notes: { contains: params.q, mode: "insensitive" } }] }
              : {}),
          },
          orderBy: { date: "desc" },
          include: { qcPotongSortirItems: true },
        });
      } catch {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Failed to load qc_potong_sortir ledger data, returning empty list as fallback"
          );
        }
        return [];
      }
    })(),
  ]);
  const anyPrisma = prisma as any;
  let expenses: Array<{
    id: bigint;
    date: Date;
    status: any;
    createdByName: string | null;
    notes: string | null;
    items: Array<{ purpose: string; amount: any }>;
  }> = [];
  if (anyPrisma?.expense?.findMany) {
    expenses = (await prisma.expense.findMany({
      where: {
        ...(params.id ? { id: BigInt(params.id) } : {}),
        ...(start ? { date: { gte: start } } : {}),
        ...(end ? { date: { lte: end } } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.party
          ? {
              OR: [
                {
                  createdByName: {
                    contains: params.party,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
        ...(params.q
          ? { OR: [{ notes: { contains: params.q, mode: "insensitive" } }] }
          : {}),
      },
      orderBy: { date: "desc" },
      include: { items: true },
    })) as any;
  } else {
    // Fallback to raw SQL aggregation (without per-line details)
    const whereClauses: string[] = [];
    const paramsArr: any[] = [];
    if (params.id) {
      whereClauses.push(`e."id" = $${paramsArr.length + 1}::bigint`);
      paramsArr.push(params.id);
    }
    if (start) {
      whereClauses.push(`e."date" >= $${paramsArr.length + 1}::date`);
      paramsArr.push(start.toISOString().slice(0, 10));
    }
    if (end) {
      whereClauses.push(`e."date" <= $${paramsArr.length + 1}::date`);
      paramsArr.push(end.toISOString().slice(0, 10));
    }
    if (params.status) {
      whereClauses.push(`e."status" = $${paramsArr.length + 1}::text`);
      paramsArr.push(params.status);
    }
    if (params.party) {
      whereClauses.push(
        `e."created_by_name" ILIKE '%' || $${paramsArr.length + 1} || '%'`
      );
      paramsArr.push(params.party);
    }
    if (params.q) {
      whereClauses.push(
        `e."notes" ILIKE '%' || $${paramsArr.length + 1} || '%'`
      );
      paramsArr.push(params.q);
    }
    const whereSql =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const headers = await prisma.$queryRawUnsafe<
      Array<{
        id: bigint;
        date: Date;
        status: string;
        created_by_name: string | null;
        notes: string | null;
        total: string;
        item_count: string;
      }>
    >(
      `
        SELECT e."id", e."date", e."status", e."created_by_name", e."notes",
               COALESCE(SUM(i."amount"), 0) AS total,
               COUNT(i."id") AS item_count
        FROM "public"."expenses" e
        LEFT JOIN "public"."expense_items" i ON i."expense_id" = e."id"
        ${whereSql}
        GROUP BY e."id", e."date", e."status", e."created_by_name", e."notes"
        ORDER BY e."date" DESC
        `,
      ...paramsArr
    );
    // Build minimal expense objects without line details
    expenses = headers.map((h) => ({
      id: h.id,
      date: h.date,
      status: h.status,
      createdByName: h.created_by_name,
      notes: h.notes,
      // simpan total agregat untuk dipakai saat items tidak dimuat
      total: h.total,
      items: [],
    })) as any;
  }

  // Build filter option lists
  const partySet = new Set<string>();
  purchases.forEach((p) => {
    if (p.supplier) partySet.add(p.supplier);
    if (p.createdByName) partySet.add(p.createdByName);
  });
  sales.forEach((s) => {
    if (s.customer) partySet.add(s.customer);
    if (s.createdByName) partySet.add(s.createdByName);
  });
  productions.forEach((pr) => {
    pr.productionWorkers.forEach((pw) => {
      if (pw.worker?.name) partySet.add(pw.worker.name);
    });
  });
  expenses.forEach((e) => {
    if (e.createdByName) partySet.add(e.createdByName);
  });
  const partyOptions = Array.from(partySet).sort((a, b) => a.localeCompare(b));

  const itemTypeMap = new Map<string, string>();
  purchases.forEach((p) =>
    p.purchaseItems.forEach((it) => {
      if (it.itemType)
        itemTypeMap.set(it.itemType.id.toString(), it.itemType.name);
    })
  );
  sales.forEach((s) =>
    s.saleItems.forEach((it) => {
      if (it.itemType)
        itemTypeMap.set(it.itemType.id.toString(), it.itemType.name);
    })
  );
  productions.forEach((pr) => {
    pr.productionInputs.forEach((it) => {
      if (it.itemType)
        itemTypeMap.set(it.itemType.id.toString(), it.itemType.name);
    });
    pr.productionOutputs.forEach((it) => {
      if (it.itemType)
        itemTypeMap.set(it.itemType.id.toString(), it.itemType.name);
    });
  });
  const itemTypeOptions = Array.from(itemTypeMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

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
      createdByName: p.createdByName || null,
      total: totalValue,
      stockImpact: "IN",
      notes: p.notes,
      itemCount: p.purchaseItems.length,
      lines: p.purchaseItems.map((it) => {
        const qty = parseFloat(it.qty.toString());
        const price = parseFloat(it.unitCost.toString());
        const subtotal =
          (isFinite(qty) ? qty : 0) * (isFinite(price) ? price : 0);
        return {
          name: it.itemType?.name ?? `Item ${it.itemTypeId.toString()}`,
          qty: isFinite(qty) ? qty : 0,
          unit: it.unit?.name ?? null,
          price: isFinite(price) ? price : 0,
          subtotal,
        };
      }),
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
      createdByName: s.createdByName || null,
      total: totalValue,
      stockImpact: "OUT",
      notes: s.notes,
      itemCount: s.saleItems.length,
      lines: s.saleItems.map((it) => {
        const qty = parseFloat(it.qty.toString());
        const price = parseFloat(it.unitPrice.toString());
        const subtotal =
          (isFinite(qty) ? qty : 0) * (isFinite(price) ? price : 0);
        return {
          name: it.itemType?.name ?? `Item ${it.itemTypeId.toString()}`,
          qty: isFinite(qty) ? qty : 0,
          unit: null,
          price: isFinite(price) ? price : 0,
          subtotal,
        };
      }),
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
    const workerNames = pr.productionWorkers
      .map((pw) => pw.worker.name)
      .join(", ");
    return {
      id: pr.id.toString(),
      type: "production",
      date: pr.date.toISOString(),
      status: pr.status as any,
      reference: pr.id.toString(),
      counterparty: workerNames || "-",
      total: costValue,
      stockImpact: "NEUTRAL",
      notes: pr.notes,
      itemCount,
      productionCost: costValue,
      subType: pr.productionType?.name ?? "Production",
    };
  });

  const expenseEntries: LedgerEntry[] = expenses.map((e) => {
    const derivedTotal =
      e.items && e.items.length > 0
        ? e.items.reduce((sum, it) => {
            const a = parseFloat(it.amount.toString());
            return sum + (isFinite(a) ? a : 0);
          }, 0)
        : parseFloat((e as any).total || "0");
    const total = isFinite(derivedTotal) ? derivedTotal : 0;
    const totalValue = total > 0 ? total : null;
    return {
      id: e.id.toString(),
      type: "invoice",
      date: e.date.toISOString(),
      status: e.status as any,
      reference: e.id.toString(),
      counterparty: e.createdByName || "Expense",
      createdByName: e.createdByName || null,
      total: totalValue,
      stockImpact: "NEUTRAL",
      notes: e.notes,
      itemCount: e.items.length,
      lines: e.items.map((it) => {
        const price = parseFloat(it.amount.toString());
        const subtotal = isFinite(price) ? price : 0;
        return {
          name: it.purpose,
          qty: 0,
          unit: "",
          price: isFinite(price) ? price : 0,
          subtotal,
        };
      }),
    };
  });

  const pengikisanEntries: LedgerEntry[] = pengikisanList.map((p) => {
    const total = parseFloat(p.totalUpah?.toString() || "0");
    const names = Array.from(
      new Set(p.pengikisanItems.map((i) => i.nama))
    ).join(", ");
    return {
      id: `pengikisan-${p.id}`,
      type: "production",
      date: p.date.toISOString(),
      status: "completed" as any,
      reference: `PK-${p.id}`,
      createdByName: p.petugas || null,
      counterparty: names || "-",
      total: total > 0 ? total : null,
      stockImpact: "NEUTRAL",
      notes: p.notes,
      itemCount: p.pengikisanItems.length,
      productionCost: total,
      subType: "Pengikisan",
      pengikisanItems: p.pengikisanItems.map((it) => ({
        nama: it.nama,
        kaKg: Number(it.kaKg ?? 0),
        stikKg: Number(it.stikKg ?? 0),
        upahKa: Number(it.upahKa ?? 0),
        upahStik: Number(it.upahStik ?? 0),
        total: Number(it.total ?? 0),
      })),
    };
  });

  const pemotonganEntries: LedgerEntry[] = pemotonganList.map((p) => {
    const total = parseFloat(p.totalUpah?.toString() || "0");
    const names = Array.from(
      new Set(p.pemotonganItems.map((i) => i.nama))
    ).join(", ");
    return {
      id: `pemotongan-${p.id}`,
      type: "production",
      date: p.date.toISOString(),
      status: "completed" as any,
      reference: `PM-${p.id}`,
      createdByName: (p as any).petugas || null,
      counterparty: names || "-",
      total: total > 0 ? total : null,
      stockImpact: "NEUTRAL",
      notes: p.notes,
      itemCount: p.pemotonganItems.length,
      productionCost: total,
      subType: "Pemotongan",
      pemotonganItems: p.pemotonganItems.map((it) => ({
        nama: it.nama,
        qty: Number(it.qty ?? 0),
        total: Number(it.total ?? 0),
      })),
    };
  });

  const penjemuranEntries: LedgerEntry[] = penjemuranList.map((p) => {
    const total = parseFloat(p.totalUpah?.toString() || "0");
    const names = Array.from(
      new Set(p.penjemuranItems.map((i) => i.nama))
    ).join(", ");
    return {
      id: `penjemuran-${p.id}`,
      type: "production",
      date: p.date.toISOString(),
      status: "completed" as any,
      reference: `PJ-${p.id}`,
      createdByName: (p as any).petugas || null,
      counterparty: names || "-",
      total: total > 0 ? total : null,
      stockImpact: "NEUTRAL",
      notes: p.notes,
      itemCount: p.penjemuranItems.length,
      productionCost: total,
      subType: "Penjemuran",
      penjemuranItems: p.penjemuranItems.map((it) => ({
        nama: it.nama,
        hari: Number(it.hari ?? 0),
        lemburJam: Number(it.lemburJam ?? 0),
        upahPerHari: Number(it.upahPerHari ?? 0),
        upahLemburPerJam: Number(it.upahLemburPerJam ?? 0),
        total: Number(it.total ?? 0),
      })),
    };
  });

  const pengemasanEntries: LedgerEntry[] = pengemasanList.map((p) => {
    const total = parseFloat(p.totalUpah?.toString() || "0");
    const names = Array.from(
      new Set(p.pengemasanItems.map((i) => i.nama))
    ).join(", ");
    return {
      id: `pengemasan-${p.id}`,
      type: "production",
      date: p.date.toISOString(),
      status: "completed" as any,
      reference: `PG-${p.id}`,
      createdByName: (p as any).petugas || null,
      counterparty: names || "-",
      total: total > 0 ? total : null,
      stockImpact: "NEUTRAL",
      notes: p.notes,
      itemCount: p.pengemasanItems.length,
      productionCost: total,
      subType: "Pengemasan",
      pengemasanItems: p.pengemasanItems.map((it) => ({
        nama: it.nama,
        bungkus: Number(it.bungkus ?? 0),
        upahPerBungkus: Number(it.upahPerBungkus ?? 0),
        total: Number(it.total ?? 0),
      })),
    };
  });

  const produksiLainnyaEntries: LedgerEntry[] = produksiLainnyaList.map((p) => {
    const total = parseFloat(p.totalBiaya?.toString() || "0");
    const names = Array.from(
      new Set(p.produksiLainnyaItems.map((i) => i.namaPekerja))
    ).join(", ");
    return {
      id: `produksi-lainnya-${p.id}`,
      type: "production",
      date: p.date.toISOString(),
      status: "completed" as any,
      reference: `PL-${p.id}`,
      createdByName: p.petugas || null,
      counterparty: names || "-",
      total: total > 0 ? total : null,
      stockImpact: "NEUTRAL",
      notes: p.notes,
      itemCount: p.produksiLainnyaItems.length,
      productionCost: total,
      subType: "Produksi Lainnya",
      produksiLainnyaItems: p.produksiLainnyaItems.map((it) => ({
        namaPekerja: it.namaPekerja,
        namaPekerjaan: it.namaPekerjaan,
        qty: Number(it.qty ?? 0),
        satuan: it.satuan,
        upah: Number(it.upah ?? 0),
        total: Number(it.total ?? 0),
      })),
    };
  });

  const pensortiranEntries: LedgerEntry[] = pensortiranList.map((p) => {
    const total = parseFloat(p.totalUpah?.toString() || "0");
    const names = Array.from(
      new Set(p.pensortiranItems.map((i) => i.nama))
    ).join(", ");
    return {
      id: `pensortiran-${p.id}`,
      type: "production",
      date: p.date.toISOString(),
      status: "completed" as any,
      reference: `PS-${p.id}`,
      createdByName: (p as any).petugas || null,
      counterparty: names || "-",
      total: total > 0 ? total : null,
      stockImpact: "NEUTRAL",
      notes: p.notes,
      itemCount: p.pensortiranItems.length,
      productionCost: total,
      subType: "Pensortiran",
      pemotonganItems: p.pensortiranItems.map((it) => ({
        nama: it.nama,
        qty: Number(it.qty ?? 0),
        total: Number(it.total ?? 0),
      })),
    };
  });

  const qcPotongSortirEntries: LedgerEntry[] = qcPotongSortirList.map((p) => {
    const total = parseFloat(p.totalUpah?.toString() || "0");
    const names = Array.from(
      new Set(p.qcPotongSortirItems.map((i) => i.nama))
    ).join(", ");
    return {
      id: `qc-potong-sortir-${p.id}`,
      type: "production",
      date: p.date.toISOString(),
      status: "completed" as any,
      reference: `QC-${p.id}`,
      createdByName: (p as any).petugas || null,
      counterparty: names || "-",
      total: total > 0 ? total : null,
      stockImpact: "NEUTRAL",
      notes: p.notes,
      itemCount: p.qcPotongSortirItems.length,
      productionCost: total,
      subType: "QC Potong & Sortir",
      penjemuranItems: p.qcPotongSortirItems.map((it) => ({
        nama: it.nama,
        hari: Number(it.hari ?? 0),
        lemburJam: Number(it.lemburJam ?? 0),
        upahPerHari: Number(it.upahPerHari ?? 0),
        upahLemburPerJam: Number(it.upahLemburPerJam ?? 0),
        total: Number(it.total ?? 0),
      })),
    };
  });

  const allProductions = [
    ...productionEntries,
    ...pengikisanEntries,
    ...pemotonganEntries,
    ...penjemuranEntries,
    ...pengemasanEntries,
    ...produksiLainnyaEntries,
    ...pensortiranEntries,
    ...qcPotongSortirEntries,
  ];

  let filteredPurchases: LedgerEntry[] = purchaseEntries;
  let filteredSales: LedgerEntry[] = saleEntries;
  let filteredProductions: LedgerEntry[] = allProductions;
  let filteredExpenses: LedgerEntry[] = expenseEntries;

  // Filter productions to only include known types
  const knownProductionTypes = [
    "Pengikisan",
    "Pemotongan",
    "Penjemuran",
    "Pengemasan",
    "Pensortiran",
    "QC Potong & Sortir",
    "Produksi Lainnya",
  ];
  filteredProductions = filteredProductions.filter((p) =>
    knownProductionTypes.includes(p.subType || "")
  );

  if (params.affectStockOnly === "true") {
    filteredPurchases = filteredPurchases.filter((e) => e.itemCount > 0);
    filteredSales = filteredSales.filter((e) => e.itemCount > 0);
  }

  const typeFilter = params.type;
  if (typeFilter) {
    if (typeFilter !== "purchase") filteredPurchases = [];
    if (typeFilter !== "sale") filteredSales = [];
    if (typeFilter !== "production") filteredProductions = [];
    if (typeFilter !== "invoice") filteredExpenses = [];
  }

  const min = params.min ? parseFloat(params.min) : undefined;
  const max = params.max ? parseFloat(params.max) : undefined;
  const applyAmountFilter = (
    list: LedgerEntry[],
    selector: (e: LedgerEntry) => number | null | undefined
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
    (e) => e.productionCost ?? null
  );
  filteredExpenses = applyAmountFilter(filteredExpenses, (e) => e.total);

  const sortEntries = (list: LedgerEntry[]) =>
    [...list].sort((a, b) =>
      a.date < b.date ? 1 : a.date > b.date ? -1 : a.type.localeCompare(b.type)
    );

  const sortedPurchases = sortEntries(filteredPurchases);
  const sortedSales = sortEntries(filteredSales);
  const sortedProductions = sortEntries(filteredProductions);
  const sortedExpenses = sortEntries(filteredExpenses);

  const purchaseCount = sortedPurchases.length;
  const saleCount = sortedSales.length;
  const productionCount = sortedProductions.length;
  const expenseCount = sortedExpenses.length;

  const purchaseNominal = sortedPurchases
    .filter((e) => e.status !== "cancelled")
    .reduce((sum, e) => sum + (e.total ?? 0), 0);
  const saleNominal = sortedSales
    .filter((e) => e.status !== "cancelled")
    .reduce((sum, e) => sum + (e.total ?? 0), 0);
  const productionCostTotal = sortedProductions
    .filter((e) => e.status !== "cancelled")
    .reduce((sum, e) => sum + (e.productionCost ?? 0), 0);
  const expenseNominal = sortedExpenses
    .filter((e) => e.status !== "cancelled")
    .reduce((sum, e) => sum + (e.total ?? 0), 0);

  // Group productions by subType
  const productionGroups: Record<string, LedgerEntry[]> = {};
  sortedProductions.forEach((p) => {
    const type = p.subType || "Lainnya";
    if (!productionGroups[type]) productionGroups[type] = [];
    productionGroups[type].push(p);
  });

  const allProductionTypes = Array.from(
    new Set([...knownProductionTypes, ...Object.keys(productionGroups)])
  ).sort((a, b) => {
    const idxA = knownProductionTypes.indexOf(a);
    const idxB = knownProductionTypes.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  const totalCount = purchaseCount + saleCount + productionCount + expenseCount;
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
    <main className="w-full px-4 py-6">
      <section className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">Pembukuan</h1>
        <p className="text-sm text-slate-600">
          Rekap transaksi & pergerakan stok dari data yang terekam
        </p>
      </section>

      <section className="mb-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <LedgerFiltersClient
          params={params}
          partyOptions={partyOptions}
          itemTypeOptions={itemTypeOptions}
        />
      </section>

      <section className="mb-4">
        <LedgerTabs />
      </section>

      {(() => {
        const typeParam = params.type ?? "purchase";
        const subTypeParam = params.subType ?? null;
        if (typeParam === "purchase") {
          return (
            <section className="mb-4">
              <LedgerSection
                title="Rekap transaksi & pergerakan stok dari data yang terekam"
                type="purchase"
                entries={sortedPurchases}
                totalCount={purchaseCount}
                totalNominal={purchaseNominal}
              />
            </section>
          );
        }
        if (typeParam === "sale") {
          return (
            <section className="mb-4">
              <LedgerSection
                title="Penjualan"
                type="sale"
                entries={sortedSales}
                totalCount={saleCount}
                totalNominal={saleNominal}
              />
            </section>
          );
        }
        if (typeParam === "invoice") {
          return (
            <section className="mb-4">
              <LedgerSection
                title="Pengeluaran"
                type="invoice"
                entries={sortedExpenses}
                totalCount={expenseCount}
                totalNominal={expenseNominal}
              />
            </section>
          );
        }
        // production
        const type = subTypeParam ?? "Pengikisan";
        const items = productionGroups[type] || [];
        const count = items.length;
        const nominal = items
          .filter((e) => e.status !== "cancelled")
          .reduce((sum, e) => sum + (e.productionCost || 0), 0);
        return (
          <section className="mb-4">
            <LedgerSection
              title={type}
              type="production"
              subType={type}
              entries={items}
              totalCount={count}
              totalNominal={nominal}
              extraHeaderContent={<ProductionCostSummary totalCost={nominal} />}
            />
          </section>
        );
      })()}

      {selected && (
        <section className="mt-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              Detail Transaksi
            </h2>
            <a
              href={`/admin/ledger?${buildQuery(params)}`}
              className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-800 hover:bg-slate-200"
            >
              Tutup
            </a>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="space-y-1 text-xs">
              <div>
                <span className="font-medium">ID:</span> {selected.id}
              </div>
              <div>
                <span className="font-medium">Tanggal:</span>{" "}
                {formatDateTime(selected.date)}
              </div>
              <div>
                <span className="font-medium">Jenis:</span> {selected.type}
              </div>
              {selected.subType && (
                <div>
                  <span className="font-medium">Sub Jenis:</span>{" "}
                  {selected.subType}
                </div>
              )}
              {selected.shift && (
                <div>
                  <span className="font-medium">Shift:</span>{" "}
                  <span className="capitalize">{selected.shift}</span>
                </div>
              )}
              <div>
                <span className="font-medium">Status:</span>{" "}
                {selected.status.toUpperCase()}
              </div>
              <div>
                <span className="font-medium">Counterparty:</span>{" "}
                {selected.counterparty || "-"}
              </div>
              <div>
                <span className="font-medium">Total:</span>{" "}
                {selected.total != null ? toCurrency(selected.total) : "-"}
              </div>
              {selected.type === "production" &&
                selected.productionCost != null && (
                  <div>
                    <span className="font-medium">Biaya produksi:</span>{" "}
                    {toCurrency(selected.productionCost)}
                  </div>
                )}
              <div>
                <span className="font-medium">Catatan:</span>{" "}
                {selected.notes || "-"}
              </div>
            </div>
            <div className="space-y-2 text-xs">
              {selected.subType === "Pengikisan" &&
              selected.pengikisanItems &&
              selected.pengikisanItems.length > 0 ? (
                <table className="w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700">
                      <th className="border border-slate-200 px-2 py-1 text-left w-8">
                        #
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-left">
                        Pekerja
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        KA (kg)
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Stik (kg)
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Upah KA
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Upah Stik
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.pengikisanItems.map((it, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-200 px-2 py-1">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-200 px-2 py-1">
                          {it.nama}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {it.kaKg}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {it.stikKg}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {toCurrency(it.upahKa)}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {toCurrency(it.upahStik)}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {toCurrency(it.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        className="border border-slate-200 px-2 py-1 font-semibold"
                        colSpan={6}
                      >
                        Total
                      </td>
                      <td className="border border-slate-200 px-2 py-1 text-right font-semibold">
                        {toCurrency(
                          selected.pengikisanItems.reduce(
                            (s, it) => s + it.total,
                            0
                          )
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : selected.subType === "Pemotongan" &&
                selected.pemotonganItems &&
                selected.pemotonganItems.length > 0 ? (
                <table className="w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700">
                      <th className="border border-slate-200 px-2 py-1 text-left w-8">
                        #
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-left">
                        Pekerja
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Qty (kg)
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Total (Rp)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.pemotonganItems.map((it, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-200 px-2 py-1">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-200 px-2 py-1">
                          {it.nama}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {it.qty}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {toCurrency(it.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        className="border border-slate-200 px-2 py-1 font-semibold"
                        colSpan={3}
                      >
                        Total
                      </td>
                      <td className="border border-slate-200 px-2 py-1 text-right font-semibold">
                        {toCurrency(
                          selected.pemotonganItems.reduce(
                            (s, it) => s + it.total,
                            0
                          )
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : selected.subType === "Penjemuran" &&
                selected.penjemuranItems &&
                selected.penjemuranItems.length > 0 ? (
                <table className="w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700">
                      <th className="border border-slate-200 px-2 py-1 text-left w-8">
                        #
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-left">
                        Pekerja
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Hari
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Lembur (jam)
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Upah Harian
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Upah Lembur
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.penjemuranItems.map((it, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-200 px-2 py-1">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-200 px-2 py-1">
                          {it.nama}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {it.hari}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {it.lemburJam}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {toCurrency(it.upahPerHari)}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {toCurrency(it.upahLemburPerJam)}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {toCurrency(it.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        className="border border-slate-200 px-2 py-1 font-semibold"
                        colSpan={6}
                      >
                        Total
                      </td>
                      <td className="border border-slate-200 px-2 py-1 text-right font-semibold">
                        {toCurrency(
                          selected.penjemuranItems.reduce(
                            (s, it) => s + it.total,
                            0
                          )
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : selected.subType === "Pengemasan" &&
                selected.pengemasanItems &&
                selected.pengemasanItems.length > 0 ? (
                <table className="w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700">
                      <th className="border border-slate-200 px-2 py-1 text-left w-8">
                        #
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-left">
                        Pekerja
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Bungkus
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Upah / Bungkus
                      </th>
                      <th className="border border-slate-200 px-2 py-1 text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.pengemasanItems.map((it, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-200 px-2 py-1">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-200 px-2 py-1">
                          {it.nama}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {it.bungkus}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {toCurrency(it.upahPerBungkus)}
                        </td>
                        <td className="border border-slate-200 px-2 py-1 text-right">
                          {toCurrency(it.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        className="border border-slate-200 px-2 py-1 font-semibold"
                        colSpan={4}
                      >
                        Total
                      </td>
                      <td className="border border-slate-200 px-2 py-1 text-right font-semibold">
                        {toCurrency(
                          selected.pengemasanItems.reduce(
                            (s, it) => s + it.total,
                            0
                          )
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : null}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
