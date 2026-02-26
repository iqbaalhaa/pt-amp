import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import { ArrowDownRight, ArrowUpRight, Filter, Wallet } from "lucide-react";
import CashExportClient from "@/components/admin/cash/CashExportClient";
import CashSummaryClient from "@/components/admin/cash/CashSummaryClient";
import CashAdjustmentClient from "@/components/admin/cash/CashAdjustmentClient";

export const dynamic = "force-dynamic";

function toCurrency(n: number) {
	const rounded = Math.round(n || 0);
	return `Rp ${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

type CashTab = "overview" | "buku" | "penyesuaian";

type CashSearchParams = {
	month?: string; // YYYY-MM
	tab?: CashTab;
};

export default async function CashPage({
	searchParams,
}: {
	searchParams: Promise<CashSearchParams>;
}) {
	const params = (await searchParams) ?? {};
	const anyPrisma = prisma as any;

	let start: Date | undefined;
	let end: Date | undefined;
	let startStr: string | undefined;
	let endStr: string | undefined;

	if (params.month) {
		const [year, month] = params.month.split("-").map(Number);
		// Gunakan ISO string murni YYYY-MM-DD untuk Prisma agar tidak terkena pergeseran timezone
		const sStr = `${year}-${String(month).padStart(2, "0")}-01`;
		const eDate = new Date(year, month, 0);
		const eStr = `${year}-${String(month).padStart(2, "0")}-${String(eDate.getDate()).padStart(2, "0")}`;

		start = new Date(sStr);
		end = new Date(eStr);
		startStr = sStr;
		endStr = eStr;
	}

	// Calculate Saldo Awal (Opening Balance) if there's a filter
	let saldoAwal = 0;
	if (startStr) {
		const [
			prevSales,
			prevPurchases,
			prevPengikisan,
			prevPemotongan,
			prevPenjemuran,
			prevPengemasan,
			prevPensortiran,
			prevQc,
			prevProduksiLainnya,
			prevExpenses,
			prevProductions,
			prevAdjustments,
		] = await Promise.all([
			prisma.sale.findMany({ where: { status: "posted", date: { lt: start } }, include: { saleItems: true } }),
			prisma.purchase.findMany({ where: { status: "posted", date: { lt: start } }, include: { purchaseItems: true } }),
			prisma.pengikisan.findMany({ where: { date: { lt: start } } }),
			prisma.pemotongan.findMany({ where: { date: { lt: start } } }),
			prisma.penjemuran.findMany({ where: { date: { lt: start } } }),
			prisma.pengemasan.findMany({ where: { date: { lt: start } } }),
			prisma.pensortiran.findMany({ where: { date: { lt: start } } }),
			prisma.qcPotongSortir.findMany({ where: { date: { lt: start } } }),
			prisma.produksiLainnya.findMany({ where: { date: { lt: start } } }),
			prisma.expense.findMany({ where: { status: "posted", date: { lt: start } }, include: { items: true } }),
			prisma.production.findMany({ where: { date: { lt: start } }, include: { productionInputs: true } }),
			anyPrisma.cashAdjustment?.findMany({ where: { date: { lt: start } } }) ?? Promise.resolve([]),
		]);

		const sumDebit = 
			prevSales.reduce((sum, s) => sum + s.saleItems.reduce((acc, it) => acc + (parseFloat(it.qty.toString()) * parseFloat(it.unitPrice.toString())), 0), 0) +
			prevAdjustments
				.filter((a: { type: string }) => a.type === "IN")
				.reduce((sum: number, a: { amount: number | string }) => sum + parseFloat(a.amount.toString()), 0);

		const sumCredit = 
			prevPurchases.reduce((sum, p) => sum + p.purchaseItems.reduce((acc, it) => acc + (parseFloat(it.qty.toString()) * parseFloat(it.unitCost.toString())), 0), 0) +
			prevPengikisan.reduce((sum, p) => sum + parseFloat(p.totalUpah?.toString() || "0"), 0) +
			prevPemotongan.reduce((sum, p) => sum + parseFloat(p.totalUpah?.toString() || "0"), 0) +
			prevPenjemuran.reduce((sum, p) => sum + parseFloat(p.totalUpah?.toString() || "0"), 0) +
			prevPengemasan.reduce((sum, p) => sum + parseFloat(p.totalUpah?.toString() || "0"), 0) +
			prevPensortiran.reduce((sum, p) => sum + parseFloat(p.totalUpah?.toString() || "0"), 0) +
			prevQc.reduce((sum, p) => sum + parseFloat(p.totalUpah?.toString() || "0"), 0) +
			prevProduksiLainnya.reduce((sum, p) => sum + parseFloat(p.totalBiaya?.toString() || "0"), 0) +
			prevExpenses.reduce((sum, e) => sum + e.items.reduce((acc, it) => acc + parseFloat(it.amount.toString()), 0), 0) +
			prevProductions.reduce((sum, pr) => sum + pr.productionInputs.reduce((acc, it) => acc + (parseFloat(it.qty.toString()) * parseFloat(it.unitCost.toString())), 0), 0) +
			prevAdjustments
				.filter((a: { type: string }) => a.type === "OUT")
				.reduce((sum: number, a: { amount: number | string }) => sum + parseFloat(a.amount.toString()), 0);
		
		saldoAwal = sumDebit - sumCredit;
	}

	const [
		sales,
		purchases,
		productions,
		pengikisanList,
		pemotonganList,
		penjemuranList,
		pengemasanList,
		pensortiranList,
		qcPotongSortirList,
		produksiLainnyaList,
		cashAdjustments,
	] = await Promise.all([
		prisma.sale.findMany({
			where: {
				status: "posted",
				...(startStr ? { date: { gte: start } } : {}),
				...(endStr ? { date: { lte: end } } : {}),
			},
			include: { saleItems: true },
		}),
		prisma.purchase.findMany({
			where: {
				status: "posted",
				...(startStr ? { date: { gte: start } } : {}),
				...(endStr ? { date: { lte: end } } : {}),
			},
			include: {
				purchaseItems: {
					include: { itemType: true },
				},
			},
		}),
		prisma.production.findMany({
			where: {
				...(startStr ? { date: { gte: start } } : {}),
				...(endStr ? { date: { lte: end } } : {}),
			},
			include: {
				productionInputs: true,
				productionType: true,
			},
		}),
		(async () => {
			try {
				return await prisma.pengikisan.findMany({
					where: {
						...(startStr ? { date: { gte: start } } : {}),
						...(endStr ? { date: { lte: end } } : {}),
					},
				});
			} catch {
				if (process.env.NODE_ENV === "development") {
					console.warn(
						"Failed to load pengikisan cash data, returning empty list as fallback",
					);
				}
				return [];
			}
		})(),
		(async () => {
			try {
				return await prisma.pemotongan.findMany({
					where: {
						...(startStr ? { date: { gte: start } } : {}),
						...(endStr ? { date: { lte: end } } : {}),
					},
				});
			} catch {
				if (process.env.NODE_ENV === "development") {
					console.warn(
						"Failed to load pemotongan cash data, returning empty list as fallback",
					);
				}
				return [];
			}
		})(),
		(async () => {
			try {
				return await prisma.penjemuran.findMany({
					where: {
						...(startStr ? { date: { gte: start } } : {}),
						...(endStr ? { date: { lte: end } } : {}),
					},
				});
			} catch {
				if (process.env.NODE_ENV === "development") {
					console.warn(
						"Failed to load penjemuran cash data, returning empty list as fallback",
					);
				}
				return [];
			}
		})(),
		(async () => {
			try {
				return await prisma.pengemasan.findMany({
					where: {
						...(startStr ? { date: { gte: start } } : {}),
						...(endStr ? { date: { lte: end } } : {}),
					},
				});
			} catch {
				if (process.env.NODE_ENV === "development") {
					console.warn(
						"Failed to load pengemasan cash data, returning empty list as fallback",
					);
				}
				return [];
			}
		})(),
		(async () => {
			try {
				return await prisma.pensortiran.findMany({
					where: {
						...(startStr ? { date: { gte: start } } : {}),
						...(endStr ? { date: { lte: end } } : {}),
					},
				});
			} catch {
				if (process.env.NODE_ENV === "development") {
					console.warn(
						"Failed to load pensortiran cash data, returning empty list as fallback",
					);
				}
				return [];
			}
		})(),
		(async () => {
			try {
				return await prisma.qcPotongSortir.findMany({
					where: {
						...(startStr ? { date: { gte: start } } : {}),
						...(endStr ? { date: { lte: end } } : {}),
					},
				});
			} catch {
				if (process.env.NODE_ENV === "development") {
					console.warn(
						"Failed to load qc_potong_sortir cash data, returning empty list as fallback",
					);
				}
				return [];
			}
		})(),
		(async () => {
			try {
				return await prisma.produksiLainnya.findMany({
					where: {
						...(startStr ? { date: { gte: start } } : {}),
						...(endStr ? { date: { lte: end } } : {}),
					},
				});
			} catch {
				if (process.env.NODE_ENV === "development") {
					console.warn(
						"Failed to load produksi_lainnya cash data, returning empty list as fallback",
					);
				}
				return [];
			}
		})(),
		anyPrisma.cashAdjustment?.findMany({
			where: {
				...(startStr ? { date: { gte: start } } : {}),
				...(endStr ? { date: { lte: end } } : {}),
			},
		}) ?? Promise.resolve([]),
	]);
	let totalExpense = 0;
	let totalExpenseDraft = 0;
	let postedExpenses: any[] = [];

	if (anyPrisma?.expense?.findMany) {
		const [posted, draft] = await Promise.all([
			prisma.expense.findMany({
				where: {
					status: "posted",
					...(start ? { date: { gte: start } } : {}),
					...(end ? { date: { lte: end } } : {}),
				},
				include: { items: true },
			}),
			prisma.expense.findMany({
				where: {
					status: "draft",
					...(start ? { date: { gte: start } } : {}),
					...(end ? { date: { lte: end } } : {}),
				},
				include: { items: true },
			}),
		]);
		postedExpenses = posted;
		const sumItems = (list: typeof posted) =>
			list.reduce((sum, e) => {
				const t = e.items.reduce((acc, it) => {
					const a = parseFloat(it.amount.toString());
					return acc + (isFinite(a) ? a : 0);
				}, 0);
				return sum + t;
			}, 0) || 0;
		totalExpense = sumItems(posted);
		totalExpenseDraft = sumItems(draft);
	} else {
		const toNum = (v: any) => {
			if (v == null) return 0;
			if (typeof v === "number") return v;
			const s = typeof v === "string" ? v : (v.toString?.() ?? "0");
			const n = parseFloat(s);
			return isFinite(n) ? n : 0;
		};
		const sumByStatus = async (status: "posted" | "draft") => {
			const paramsArr: any[] = [status];
			let whereSql = `WHERE e."status" = $1`;
			if (start) {
				paramsArr.push(start);
				whereSql += ` AND e."date" >= $${paramsArr.length}`;
			}
			if (end) {
				paramsArr.push(end);
				whereSql += ` AND e."date" <= $${paramsArr.length}`;
			}
			const rows = await prisma.$queryRawUnsafe<Array<{ total: any }>>(
				`
        SELECT COALESCE(SUM(i.amount), 0) AS total
        FROM "public"."expenses" e
        LEFT JOIN "public"."expense_items" i ON i."expense_id" = e."id"
        ${whereSql}
      `,
				...paramsArr,
			);
			return rows?.[0]?.total;
		};
		const postedTotal = await sumByStatus("posted");
		const draftTotal = await sumByStatus("draft");
		totalExpense = toNum(postedTotal);
		totalExpenseDraft = toNum(draftTotal);
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
		}, 0) + 
		cashAdjustments
			.filter((a: { type: string }) => a.type === "IN")
			.reduce((sum: number, a: { amount: number | string }) => sum + parseFloat(a.amount.toString()), 0) || 0;

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
		pengikisanList.reduce(
			(sum, p) => sum + parseFloat(p.totalUpah?.toString() || "0"),
			0,
		) || 0;
	const biayaUpahPemotongan =
		pemotonganList.reduce(
			(sum, p) => sum + parseFloat(p.totalUpah?.toString() || "0"),
			0,
		) || 0;
	const biayaUpahPenjemuran =
		penjemuranList.reduce(
			(sum, p) => sum + parseFloat(p.totalUpah?.toString() || "0"),
			0,
		) || 0;
	const biayaUpahPengemasan =
		pengemasanList.reduce(
			(sum, p) => sum + parseFloat(p.totalUpah?.toString() || "0"),
			0,
		) || 0;
	const biayaUpahPensortiran =
		pensortiranList.reduce(
			(sum, p) => sum + parseFloat(p.totalUpah?.toString() || "0"),
			0,
		) || 0;
	const biayaUpahQcPotongSortir =
		qcPotongSortirList.reduce(
			(sum, p) => sum + parseFloat(p.totalUpah?.toString() || "0"),
			0,
		) || 0;
	const biayaUpahProduksiLainnya =
		produksiLainnyaList.reduce(
			(sum, p) => sum + parseFloat(p.totalBiaya?.toString() || "0"),
			0,
		) || 0;

	const biayaProduksiDetails = [
		{ name: "Pengikisan", amount: biayaUpahPengikisan },
		{ name: "Pemotongan", amount: biayaUpahPemotongan },
		{ name: "Penjemuran", amount: biayaUpahPenjemuran },
		{ name: "Pensortiran", amount: biayaUpahPensortiran },
		{ name: "Pengemasan", amount: biayaUpahPengemasan },
		{ name: "QC Potong & Sortir", amount: biayaUpahQcPotongSortir },
		{ name: "Produksi Lainnya", amount: biayaUpahProduksiLainnya },
	].filter(d => d.amount > 0);

	const biayaProduksiTotal = biayaProduksiDetails.reduce((sum, d) => sum + d.amount, 0);

	const pengeluaran =
		pembelian +
		biayaProduksiTotal +
		totalExpense +
		cashAdjustments
			.filter((a: { type: string }) => a.type === "OUT")
			.reduce((sum: number, a: { amount: number | string }) => sum + parseFloat(a.amount.toString()), 0);

	const saldo = pendapatan - pengeluaran;

	// Buku Kas Umum Transactions Aggregation
	type CashTransaction = {
		date: Date;
		description: string;
		debit: number;
		credit: number;
		ref?: string;
	};

	let bukuKasTransactions: CashTransaction[] = [
		...sales.map(s => ({
			date: s.date,
			description: `Penjualan: ${s.customer || '-'}`,
			debit: s.saleItems.reduce((sum, it) => sum + (parseFloat(it.qty.toString()) * parseFloat(it.unitPrice.toString())), 0),
			credit: 0,
			ref: `/admin/ledger?type=sale&id=${s.id}`
		})),
		...purchases.map(p => ({
			date: p.date,
			description: `Pembelian: ${p.supplier || '-'}`,
			debit: 0,
			credit: p.purchaseItems.reduce((sum, it) => sum + (parseFloat(it.qty.toString()) * parseFloat(it.unitCost.toString())), 0),
			ref: `/admin/ledger?type=purchase&id=${p.id}`
		})),
		...productions.map(pr => ({
			date: pr.date,
			description: `Biaya Produksi: ${pr.productionType?.name || 'Input'}`,
			debit: 0,
			credit: pr.productionInputs.reduce((sum, it) => sum + (parseFloat(it.qty.toString()) * parseFloat(it.unitCost.toString())), 0),
			ref: `/admin/productions/${pr.id}`
		})),
		...pengikisanList.filter(p => parseFloat(p.totalUpah?.toString() || "0") > 0).map(p => ({
			date: p.date,
			description: "Upah Pengikisan",
			debit: 0,
			credit: parseFloat(p.totalUpah!.toString()),
		})),
		...pemotonganList.filter(p => parseFloat(p.totalUpah?.toString() || "0") > 0).map(p => ({
			date: p.date,
			description: "Upah Pemotongan",
			debit: 0,
			credit: parseFloat(p.totalUpah!.toString()),
		})),
		...penjemuranList.filter(p => parseFloat(p.totalUpah?.toString() || "0") > 0).map(p => ({
			date: p.date,
			description: "Upah Penjemuran",
			debit: 0,
			credit: parseFloat(p.totalUpah!.toString()),
		})),
		...pengemasanList.filter(p => parseFloat(p.totalUpah?.toString() || "0") > 0).map(p => ({
			date: p.date,
			description: "Upah Pengemasan",
			debit: 0,
			credit: parseFloat(p.totalUpah!.toString()),
		})),
		...pensortiranList.filter(p => parseFloat(p.totalUpah?.toString() || "0") > 0).map(p => ({
			date: p.date,
			description: "Upah Pensortiran",
			debit: 0,
			credit: parseFloat(p.totalUpah!.toString()),
		})),
		...qcPotongSortirList.filter(p => parseFloat(p.totalUpah?.toString() || "0") > 0).map(p => ({
			date: p.date,
			description: "Upah QC Potong & Sortir",
			debit: 0,
			credit: parseFloat(p.totalUpah!.toString()),
		})),
		...produksiLainnyaList.filter(p => parseFloat(p.totalBiaya?.toString() || "0") > 0).map(p => ({
			date: p.date,
			description: "Produksi Lainnya",
			debit: 0,
			credit: parseFloat(p.totalBiaya!.toString()),
		})),
		...postedExpenses.map((e: { id: string | number; date: Date; notes?: string | null; items: Array<{ amount: number | string; purpose?: string | null }> }) => ({
			date: e.date,
			description: `Expense: ${e.notes || e.items[0]?.purpose || 'Tanpa keterangan'}`,
			debit: 0,
			credit: e.items.reduce((sum: number, it: { amount: number | string }) => sum + parseFloat(it.amount.toString()), 0),
			ref: `/admin/ledger?type=invoice&id=${e.id}`
		})),
		...cashAdjustments.map((a: { date: Date; notes?: string | null; type: string; amount: number | string }) => ({
			date: a.date,
			description: `Penyesuaian: ${a.notes || (a.type === 'IN' ? 'Penambahan Saldo' : 'Pengurangan Saldo')}`,
			debit: a.type === "IN" ? parseFloat(a.amount.toString()) : 0,
			credit: a.type === "OUT" ? parseFloat(a.amount.toString()) : 0,
		}))
	].sort((a, b) => a.date.getTime() - b.date.getTime());

	// Safety filter: double check no Jan data leaks into Feb if filter is active
	if (start && end) {
		bukuKasTransactions = bukuKasTransactions.filter(tx => {
			const d = tx.date.getTime();
			return d >= start.getTime() && d <= end.getTime();
		});
	}

	// Normalize data for Client Component (convert Decimal/BigInt to serializable types)
	const normalizedPurchases = purchases.map(p => ({
		id: p.id.toString(),
		date: p.date,
		purchaseItems: p.purchaseItems.map(it => ({
			id: it.id.toString(),
			itemName: it.itemType?.name || "Unknown", // Assuming itemType is included or we need to handle it
			qty: parseFloat(it.qty.toString()),
			unitCost: parseFloat(it.unitCost.toString()),
		})),
	}));

	const normalizedExpenses = postedExpenses.map((e: { id: string | number; date: Date; notes?: string | null; items: Array<{ id: string | number; purpose: string | null; amount: number | string }> }) => ({
		id: e.id.toString(),
		date: e.date,
		description: e.notes || "",
		items: e.items.map((it: { id: string | number; purpose: string | null; amount: number | string }) => ({
			id: it.id.toString(),
			description: it.purpose || "",
			amount: parseFloat(it.amount.toString()),
		})),
	}));

	const hasFilter = !!params.month;
	const rangeLabel = !hasFilter
		? "Semua tanggal"
		: format(start!, "MMMM yyyy", { locale: id });

	const allowedTabs: CashTab[] = ["overview", "buku", "penyesuaian"];
	const activeTabParam = (params.tab as CashTab) || "overview";
	const activeTab: CashTab = allowedTabs.includes(activeTabParam)
		? activeTabParam
		: "overview";

	const buildUrl = (overrides?: Partial<CashSearchParams>) => {
		const base: CashSearchParams = {
			...params,
			...(overrides || {}),
		};
		const usp = new URLSearchParams();
		if (base.month) usp.set("month", base.month);
		if (base.tab) usp.set("tab", base.tab);
		const qs = usp.toString();
		return qs ? `/admin/cash?${qs}` : "/admin/cash";
	};

	const tabClass = (tab: CashTab) =>
		[
			"inline-flex items-center justify-center rounded-lg px-3 py-1.5 md:px-4 text-xs md:text-sm",
			activeTab === tab
				? "bg-white text-zinc-900 shadow-sm"
				: "text-zinc-500 hover:text-zinc-800",
		].join(" ");

	return (
		<main className="w-full px-4 py-6 md:py-8">
			<div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
					<div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
						<div className="space-y-2">
							<div>
								<h1 className="text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
									Kas & Saldo
								</h1>
							</div>
								<div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
									<span className="rounded-full bg-zinc-100 px-2 py-1" suppressHydrationWarning>
										Periode: {rangeLabel}
									</span>
									{start && (
										<span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-1 font-medium border border-emerald-100" suppressHydrationWarning>
											Saldo Awal: {toCurrency(saldoAwal)}
										</span>
									)}
								</div>
						</div>
						
					</div>

					<div className="border-b border-zinc-200 bg-zinc-50 px-4 pt-3 md:px-6">
						<div className="inline-flex rounded-t-xl bg-zinc-100 p-1">
							<a
								href={buildUrl({ tab: "overview" })}
								className={tabClass("overview")}
							>
								Overview
							</a>
							<a href={buildUrl({ tab: "buku" })} className={tabClass("buku")}>
								Buku Kas Umum
							</a>
							<a
								href={buildUrl({ tab: "penyesuaian" })}
								className={tabClass("penyesuaian")}
							>
								Penyesuaian Saldo
							</a>
						</div>
					</div>

					<div className="space-y-4 px-4 pb-5 pt-4 md:px-6 md:pb-6">
						<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
							<div className="flex items-center gap-3">
								
								
							</div>
							<form
								method="GET"
								className="flex flex-col gap-2 md:flex-row md:items-center"
							>
								<input type="hidden" name="tab" value={activeTab} />
								<div className="flex items-center gap-2">
									<label className="text-[11px] font-medium text-zinc-600">
										Bulan
									</label>
									<input
										type="month"
										name="month"
										defaultValue={params.month ?? ""}
										className="h-9 rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-700 shadow-sm focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
									/>
								</div>
								<div className="flex items-center gap-2 md:ml-2">
									<button
										type="submit"
										className="inline-flex items-center gap-1 rounded-lg bg-[var(--brand)] px-3 py-1.5 text-[11px] font-medium text-white shadow-sm hover:opacity-90"
									>
										Terapkan
									</button>
									{hasFilter && (
										<a
											href={buildUrl({ month: undefined })}
											className="text-[11px] font-medium text-zinc-600 hover:text-zinc-900"
										>
											Reset
										</a>
									)}
								</div>
								<CashExportClient
									rangeLabel={rangeLabel}
									pendapatan={pendapatan}
									pengeluaran={pengeluaran}
									saldo={saldo}
									pembelian={pembelian}
									biayaProduksiInputs={biayaProduksiInputs}
									biayaUpahPengikisan={biayaUpahPengikisan}
									biayaUpahPemotongan={biayaUpahPemotongan}
									biayaUpahPenjemuran={biayaUpahPenjemuran}
									biayaUpahPengemasan={biayaUpahPengemasan}
									biayaUpahPensortiran={biayaUpahPensortiran}
									biayaUpahQcPotongSortir={biayaUpahQcPotongSortir}
									totalExpense={totalExpense}
									totalExpenseDraft={totalExpenseDraft}
								/>
							</form>
						</div>

						{activeTab === "overview" && (
							<div className="space-y-4">
								<div className="grid gap-4 md:grid-cols-3">
									<div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white p-4 shadow-sm ring-1 ring-emerald-100">
										<div className="flex items-start justify-between">
											<div>
												<div className="text-[11px] font-medium uppercase tracking-wide text-emerald-700">
													Pendapatan
												</div>
												<div className="mt-2 text-xl font-semibold text-emerald-700 md:text-2xl">
													{toCurrency(pendapatan)}
												</div>
											</div>
											<div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
												<ArrowUpRight className="h-5 w-5" />
											</div>
										</div>
									</div>

									<div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-white p-4 shadow-sm ring-1 ring-rose-100">
										<CashSummaryClient
											pembelianTotal={pembelian}
											pembelianItems={normalizedPurchases}
											produksiTotal={biayaProduksiTotal}
											produksiDetails={biayaProduksiDetails}
											expensesTotal={totalExpense}
											expensesItems={normalizedExpenses}
											expensesDraftTotal={totalExpenseDraft}
										/>
									</div>

									<div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 p-4 text-white shadow-sm ring-1 ring-zinc-900/15">
										<div className="flex items-start justify-between">
											<div>
												<div className="text-[11px] font-medium uppercase tracking-wide text-zinc-300">
													Kas / Saldo
												</div>
												<div className="mt-2 text-xl font-semibold md:text-2xl">
													{toCurrency(saldo)}
												</div>
												<div className="mt-1 text-[11px] text-zinc-300" suppressHydrationWarning>
													Per{" "}
													{format(new Date(), "dd MMM yyyy", {
														locale: id,
													})}{" "}
												</div>
											</div>
											<div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-100">
												<Wallet className="h-5 w-5" />
											</div>
										</div>
									</div>
								</div>

								<div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-3 text-[11px] text-zinc-600 md:text-xs">
									<p>
										1. Pendapatan bersumber dari transaksi Penjualan barang
									</p>
									<p> 2. Pengeluaran diperoleh dari : </p>
									<ul>
										<li>- Pembelian</li>
										<li>- Biaya Produksi</li>
										<li>- Pengeluaran</li>
									</ul>
									<p>* Klik detail untuk melihat detail.</p>
								</div>
							</div>
						)}

						{activeTab === "buku" && (
							<div className="space-y-3">
								<div className="flex items-center justify-between text-[11px] text-zinc-600 md:text-xs">
									<div className="font-semibold">Buku Kas Umum</div>
									<div className="text-[11px] text-zinc-500" suppressHydrationWarning>
										Menampilkan {bukuKasTransactions.length} transaksi untuk periode ini.
									</div>
								</div>
								<div className="overflow-x-auto rounded-xl border border-zinc-200">
									<table className="min-w-full border-collapse text-[11px] md:text-xs" suppressHydrationWarning>
										<thead className="bg-zinc-50">
											<tr>
												<th className="border-b border-zinc-200 px-3 py-2 text-left font-semibold text-zinc-700 w-12">
													#
												</th>
												<th className="border-b border-zinc-200 px-3 py-2 text-left font-semibold text-zinc-700 w-28">
													Tanggal
												</th>
												<th className="border-b border-zinc-200 px-3 py-2 text-left font-semibold text-zinc-700">
													Keterangan
												</th>
												<th className="border-b border-zinc-200 px-3 py-2 text-right font-semibold text-zinc-700 w-32">
													Debit
												</th>
												<th className="border-b border-zinc-200 px-3 py-2 text-right font-semibold text-zinc-700 w-32">
													Kredit
												</th>
												<th className="border-b border-zinc-200 px-3 py-2 text-right font-semibold text-zinc-700 w-32">
													Saldo
												</th>
												<th className="border-b border-zinc-200 px-3 py-2 text-right font-semibold text-zinc-700 w-20">
													Ref
												</th>
											</tr>
										</thead>
										<tbody>
											{startStr && (
												<tr className="bg-zinc-100/50 font-medium">
													<td className="border-b border-zinc-200 px-3 py-2 text-center text-zinc-400">
														-
													</td>
													<td className="border-b border-zinc-200 px-3 py-2 text-zinc-500 italic" suppressHydrationWarning>
														{format(start!, "dd MMM yyyy", { locale: id })}
													</td>
													<td className="border-b border-zinc-200 px-3 py-2 text-zinc-700 italic" suppressHydrationWarning>
														Saldo Awal (Sebelum {format(start!, "MMMM yyyy", { locale: id })})
													</td>
													<td className="border-b border-zinc-200 px-3 py-2 text-right text-emerald-600" suppressHydrationWarning>
														{saldoAwal > 0 ? toCurrency(saldoAwal) : "-"}
													</td>
													<td className="border-b border-zinc-200 px-3 py-2 text-right text-rose-600" suppressHydrationWarning>
														{saldoAwal < 0 ? toCurrency(Math.abs(saldoAwal)) : "-"}
													</td>
													<td className="border-b border-zinc-200 px-3 py-2 text-right font-bold text-zinc-900" suppressHydrationWarning>
														{toCurrency(saldoAwal)}
													</td>
													<td className="border-b border-zinc-200 px-3 py-2 text-right" />
												</tr>
											)}
											{(() => {
												let runningBalance = saldoAwal;
												return bukuKasTransactions.map((tx, idx) => {
													runningBalance += (tx.debit - tx.credit);
													return (
														<tr key={idx} className="bg-white hover:bg-zinc-50 transition-colors">
															<td className="border-b border-zinc-200 px-3 py-2 text-center text-zinc-500">
																{idx + 1}
															</td>
															<td className="border-b border-zinc-200 px-3 py-2 text-zinc-600" suppressHydrationWarning>
																{format(tx.date, "dd MMM yyyy", { locale: id })}
															</td>
															<td className="border-b border-zinc-200 px-3 py-2 font-medium text-zinc-800">
																{tx.description}
															</td>
															<td className="border-b border-zinc-200 px-3 py-2 text-right text-emerald-600 font-medium" suppressHydrationWarning>
																{tx.debit > 0 ? toCurrency(tx.debit) : "-"}
															</td>
															<td className="border-b border-zinc-200 px-3 py-2 text-right text-rose-600 font-medium" suppressHydrationWarning>
																{tx.credit > 0 ? toCurrency(tx.credit) : "-"}
															</td>
															<td className="border-b border-zinc-200 px-3 py-2 text-right font-bold text-zinc-900" suppressHydrationWarning>
																{toCurrency(runningBalance)}
															</td>
															<td className="border-b border-zinc-200 px-3 py-2 text-right">
																{tx.ref && (
																	<a 
																		href={tx.ref} 
																		className="text-[var(--brand)] hover:underline font-medium"
																	>
																		Detail
																	</a>
																)}
															</td>
														</tr>
													);
												});
											})()}
											{bukuKasTransactions.length === 0 && (
												<tr>
													<td
														colSpan={7}
														className="bg-zinc-50 px-3 py-12 text-center text-[11px] text-zinc-500 italic"
													>
														Tidak ada transaksi pada periode ini.
													</td>
												</tr>
											)}
										</tbody>
										<tfoot className="bg-zinc-50/50">
											<tr className="font-bold text-zinc-900">
												<td colSpan={3} className="px-3 py-3 text-right">
													TOTAL PERIODE INI
												</td>
												<td className="px-3 py-3 text-right text-emerald-700" suppressHydrationWarning>
													{toCurrency(pendapatan)}
												</td>
												<td className="px-3 py-3 text-right text-rose-700" suppressHydrationWarning>
													{toCurrency(pengeluaran)}
												</td>
												<td className="px-3 py-3 text-right text-zinc-900 bg-zinc-100/50" suppressHydrationWarning>
													{toCurrency(saldo)}
												</td>
												<td className="px-3 py-3" />
											</tr>
										</tfoot>
									</table>
								</div>
							</div>
						)}

						{activeTab === "penyesuaian" && (
							<div className="space-y-4">
								<div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-3 text-[11px] text-zinc-600 md:text-xs">
									<p>
										Gunakan fitur ini untuk menyesuaikan saldo kas jika ada selisih atau saldo awal yang belum tercatat.
									</p>
								</div>
								<CashAdjustmentClient 
									adjustments={cashAdjustments.map((a: { id: string | number; date: Date; amount: number | string; type: string; notes?: string | null }) => ({
										id: a.id.toString(),
										date: a.date,
										amount: parseFloat(a.amount.toString()),
										type: a.type,
										notes: a.notes || ""
									}))} 
								/>
							</div>
						)}
					</div>
				</div>
		</main>
	);
}
