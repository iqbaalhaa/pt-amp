import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import { ArrowDownRight, ArrowUpRight, Filter, Wallet } from "lucide-react";
import CashExportClient from "@/components/admin/cash/CashExportClient";

export const dynamic = "force-dynamic";

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

type CashTab = "overview" | "buku" | "penyesuaian";

type CashSearchParams = {
	start?: string;
	end?: string;
	tab?: CashTab;
};

export default async function CashPage({
	searchParams,
}: {
	searchParams: Promise<CashSearchParams>;
}) {
	const params = (await searchParams) ?? {};
	const start = params.start ? new Date(params.start) : undefined;
	const end = params.end ? new Date(params.end) : undefined;

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
	] = await Promise.all([
		prisma.sale.findMany({
			where: {
				status: "posted",
				...(start ? { date: { gte: start } } : {}),
				...(end ? { date: { lte: end } } : {}),
			},
			include: { saleItems: true },
		}),
		prisma.purchase.findMany({
			where: {
				status: "posted",
				...(start ? { date: { gte: start } } : {}),
				...(end ? { date: { lte: end } } : {}),
			},
			include: { purchaseItems: true },
		}),
		prisma.production.findMany({
			where: {
				...(start ? { date: { gte: start } } : {}),
				...(end ? { date: { lte: end } } : {}),
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
						...(start ? { date: { gte: start } } : {}),
						...(end ? { date: { lte: end } } : {}),
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
						...(start ? { date: { gte: start } } : {}),
						...(end ? { date: { lte: end } } : {}),
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
						...(start ? { date: { gte: start } } : {}),
						...(end ? { date: { lte: end } } : {}),
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
						...(start ? { date: { gte: start } } : {}),
						...(end ? { date: { lte: end } } : {}),
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
						...(start ? { date: { gte: start } } : {}),
						...(end ? { date: { lte: end } } : {}),
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
						...(start ? { date: { gte: start } } : {}),
						...(end ? { date: { lte: end } } : {}),
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
	]);
	const anyPrisma = prisma as any;
	let totalExpense = 0;
	let totalExpenseDraft = 0;
	if (anyPrisma?.expense?.findMany) {
		const [postedExpenses, draftExpenses] = await Promise.all([
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

	const pengeluaran =
		pembelian +
		biayaProduksiInputs +
		biayaUpahPengikisan +
		biayaUpahPemotongan +
		biayaUpahPenjemuran +
		biayaUpahPengemasan +
		biayaUpahPensortiran +
		biayaUpahQcPotongSortir +
		totalExpense;

	const saldo = pendapatan - pengeluaran;
	const hasFilter = !!(start || end);
	const rangeLabel = !hasFilter
		? "Semua tanggal"
		: [
				start ? format(start, "dd MMM yyyy", { locale: id }) : "Awal",
				end ? format(end, "dd MMM yyyy", { locale: id }) : "Sekarang",
			].join(" - ");

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
		if (base.start) usp.set("start", base.start);
		if (base.end) usp.set("end", base.end);
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
							<div className="text-[11px] font-medium text-zinc-500">
								Halaman Kas & Bank
							</div>
							<div>
								<h1 className="text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
									Kas & Saldo
								</h1>
								<p className="mt-1 text-xs text-zinc-600 md:text-sm">
									Ringkasan kas, buku kas umum, dan penyesuaian saldo.
								</p>
							</div>
							<div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
								<span className="rounded-full bg-zinc-100 px-2 py-1">
									Periode: {rangeLabel}
								</span>
							</div>
						</div>
						<div className="flex gap-2">
							<a
								href="/admin/expenses"
								className="inline-flex items-center justify-center rounded-lg bg-[var(--brand)] px-3 py-1.5 text-[11px] font-medium text-white shadow-sm transition hover:opacity-90"
							>
								Catat Expense
							</a>
							<a
								href="/admin/ledger?type=sale"
								className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-sm transition hover:bg-black"
							>
								Lihat Pembukuan
							</a>
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
								<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white">
									<Filter className="h-4 w-4" />
								</div>
								<div>
									<div className="text-xs font-semibold uppercase tracking-wide text-zinc-700">
										Rentang Tanggal
									</div>
									<div className="text-[11px] text-zinc-500">
										Pilih periode untuk perhitungan saldo dan buku kas.
									</div>
								</div>
							</div>
							<form
								method="GET"
								className="flex flex-col gap-2 md:flex-row md:items-center"
							>
								<input type="hidden" name="tab" value={activeTab} />
								<div className="flex items-center gap-2">
									<label className="text-[11px] font-medium text-zinc-600">
										Dari
									</label>
									<input
										type="date"
										name="start"
										defaultValue={params.start ?? ""}
										className="h-9 rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-700 shadow-sm focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
									/>
								</div>
								<div className="flex items-center gap-2">
									<label className="text-[11px] font-medium text-zinc-600">
										Sampai
									</label>
									<input
										type="date"
										name="end"
										defaultValue={params.end ?? ""}
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
											href={buildUrl({ start: undefined, end: undefined })}
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
												<div className="mt-2">
													<a
														className="text-[11px] font-medium text-[var(--brand)] hover:underline"
														href={`/admin/ledger?type=sale&status=posted`}
													>
														Lihat di Pembukuan
													</a>
												</div>
											</div>
											<div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
												<ArrowUpRight className="h-5 w-5" />
											</div>
										</div>
									</div>

									<div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-white p-4 shadow-sm ring-1 ring-rose-100">
										<div className="flex items-start justify-between">
											<div>
												<div className="text-[11px] font-medium uppercase tracking-wide text-rose-700">
													Pengeluaran
												</div>
												<div className="mt-2 text-xl font-semibold text-rose-700 md:text-2xl">
													{toCurrency(pengeluaran)}
												</div>
											</div>
											<div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600">
												<ArrowDownRight className="h-5 w-5" />
											</div>
										</div>
										<div className="mt-3 grid grid-cols-2 gap-2 text-[11px] md:text-xs">
											<div className="rounded-lg border border-zinc-100 bg-white/60 p-2">
												<div className="text-[11px] text-zinc-500">
													Pembelian
												</div>
												<div className="font-semibold text-zinc-800">
													{toCurrency(pembelian)}
												</div>
											</div>
											<div className="rounded-lg border border-zinc-100 bg-white/60 p-2">
												<div className="text-[11px] text-zinc-500">
													Biaya Produksi (Input)
												</div>
												<div className="font-semibold text-zinc-800">
													{toCurrency(biayaProduksiInputs)}
												</div>
											</div>
											<div className="rounded-lg border border-zinc-100 bg-white/60 p-2">
												<div className="text-[11px] text-zinc-500">
													Expense (posted)
												</div>
												<div className="font-semibold text-zinc-800">
													{toCurrency(totalExpense)}
												</div>
												{totalExpenseDraft > 0 && (
													<div className="mt-1 text-[10px] text-zinc-500">
														Draft: {toCurrency(totalExpenseDraft)} (belum
														dihitung)
													</div>
												)}
											</div>
											<div className="rounded-lg border border-zinc-100 bg-white/60 p-2">
												<div className="text-[11px] text-zinc-500">
													Upah Pengikisan
												</div>
												<div className="font-semibold text-zinc-800">
													{toCurrency(biayaUpahPengikisan)}
												</div>
											</div>
											<div className="rounded-lg border border-zinc-100 bg-white/60 p-2">
												<div className="text-[11px] text-zinc-500">
													Upah Pemotongan
												</div>
												<div className="font-semibold text-zinc-800">
													{toCurrency(biayaUpahPemotongan)}
												</div>
											</div>
											<div className="rounded-lg border border-zinc-100 bg-white/60 p-2">
												<div className="text-[11px] text-zinc-500">
													Upah Penjemuran
												</div>
												<div className="font-semibold text-zinc-800">
													{toCurrency(biayaUpahPenjemuran)}
												</div>
											</div>
											<div className="rounded-lg border border-zinc-100 bg-white/60 p-2">
												<div className="text-[11px] text-zinc-500">
													Upah Pengemasan
												</div>
												<div className="font-semibold text-zinc-800">
													{toCurrency(biayaUpahPengemasan)}
												</div>
											</div>
											<div className="rounded-lg border border-zinc-100 bg-white/60 p-2">
												<div className="text-[11px] text-zinc-500">
													Upah Pensortiran
												</div>
												<div className="font-semibold text-zinc-800">
													{toCurrency(biayaUpahPensortiran)}
												</div>
											</div>
											<div className="rounded-lg border border-zinc-100 bg-white/60 p-2">
												<div className="text-[11px] text-zinc-500">
													Upah QC Potong & Sortir
												</div>
												<div className="font-semibold text-zinc-800">
													{toCurrency(biayaUpahQcPotongSortir)}
												</div>
											</div>
										</div>
										<div className="mt-3 flex flex-wrap items-center gap-2">
											<a
												className="text-[11px] font-medium text-[var(--brand)] hover:underline"
												href={`/admin/ledger?type=purchase&status=posted`}
											>
												Lihat di Pembukuan
											</a>
											<span className="text-[10px] text-zinc-400">•</span>
											<a
												className="text-[11px] font-medium text-[var(--brand)] hover:underline"
												href={`/admin/ledger?type=invoice&status=posted`}
											>
												Lihat Invoice Expense
											</a>
											{totalExpenseDraft > 0 && (
												<>
													<span className="text-[10px] text-zinc-400">•</span>
													<a
														className="text-[11px] font-medium text-[var(--brand)] hover:underline"
														href={`/admin/ledger?type=invoice&status=draft`}
													>
														Lihat Draft Expense
													</a>
												</>
											)}
										</div>
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
												<div className="mt-1 text-[11px] text-zinc-300">
													Per{" "}
													{format(new Date(), "dd MMM yyyy, HH:mm", {
														locale: id,
													})}{" "}
													WIB
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
										Pendapatan bersumber dari transaksi Penjualan berstatus
										posted.
									</p>
									<p>
										Pengeluaran mencakup total Pembelian posted, biaya input
										produksi, upah proses produksi, dan Expense berstatus
										posted.
									</p>
								</div>
							</div>
						)}

						{activeTab === "buku" && (
							<div className="space-y-3">
								<div className="flex items-center justify-between text-[11px] text-zinc-600 md:text-xs">
									<div className="font-semibold">Buku Kas Umum</div>
									<div className="flex items-center gap-2">
										<span>Search:</span>
										<input
											type="text"
											className="h-8 w-32 rounded border border-zinc-300 px-2 text-[11px] text-zinc-700 focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]/30 md:w-40"
											placeholder=""
										/>
									</div>
								</div>
								<div className="overflow-x-auto rounded-xl border border-zinc-200">
									<table className="min-w-full border-collapse text-[11px] md:text-xs">
										<thead className="bg-zinc-50">
											<tr>
												<th className="border-b border-zinc-200 px-3 py-2 text-left font-semibold text-zinc-700">
													#
												</th>
												<th className="border-b border-zinc-200 px-3 py-2 text-left font-semibold text-zinc-700">
													Kas &amp; Bank
												</th>
												<th className="border-b border-zinc-200 px-3 py-2 text-left font-semibold text-zinc-700">
													Keterangan
												</th>
												<th className="border-b border-zinc-200 px-3 py-2 text-right font-semibold text-zinc-700">
													Debit
												</th>
												<th className="border-b border-zinc-200 px-3 py-2 text-right font-semibold text-zinc-700">
													Credit
												</th>
												<th className="border-b border-zinc-200 px-3 py-2 text-right font-semibold text-zinc-700">
													Saldo
												</th>
												<th className="border-b border-zinc-200 px-3 py-2 text-right font-semibold text-zinc-700">
													Action
												</th>
											</tr>
										</thead>
										<tbody>
											<tr className="bg-white">
												<td className="border-b border-zinc-200 px-3 py-2 text-center">
													1
												</td>
												<td className="border-b border-zinc-200 px-3 py-2">
													Semua Kas &amp; Bank
												</td>
												<td className="border-b border-zinc-200 px-3 py-2">
													Saldo Periode Ini
												</td>
												<td className="border-b border-zinc-200 px-3 py-2 text-right">
													{toCurrency(pendapatan)}
												</td>
												<td className="border-b border-zinc-200 px-3 py-2 text-right">
													{toCurrency(pengeluaran)}
												</td>
												<td className="border-b border-zinc-200 px-3 py-2 text-right">
													{toCurrency(saldo)}
												</td>
												<td className="border-b border-zinc-200 px-3 py-2 text-right text-[11px] text-[var(--brand)]">
													Detail
												</td>
											</tr>
											{pendapatan === 0 && pengeluaran === 0 && (
												<tr>
													<td
														colSpan={7}
														className="bg-zinc-50 px-3 py-6 text-center text-[11px] text-zinc-500"
													>
														No data available in table
													</td>
												</tr>
											)}
										</tbody>
										<tfoot>
											<tr className="bg-zinc-50">
												<td className="px-3 py-2" />
												<td className="px-3 py-2 text-left font-semibold text-zinc-700">
													Total
												</td>
												<td className="px-3 py-2" />
												<td className="px-3 py-2 text-right font-semibold text-zinc-800">
													{toCurrency(pendapatan)}
												</td>
												<td className="px-3 py-2 text-right font-semibold text-zinc-800">
													{toCurrency(pengeluaran)}
												</td>
												<td className="px-3 py-2 text-right font-semibold text-zinc-800">
													{toCurrency(saldo)}
												</td>
												<td className="px-3 py-2" />
											</tr>
										</tfoot>
									</table>
								</div>
								<div className="text-[11px] text-zinc-500">
									Menampilkan ringkasan buku kas umum untuk periode yang
									dipilih.
								</div>
							</div>
						)}

						{activeTab === "penyesuaian" && (
							<div className="space-y-3">
								<div className="text-[11px] font-semibold text-zinc-700 md:text-xs">
									Penyesuaian Saldo
								</div>
								<div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-[11px] text-zinc-600 md:text-xs">
									Fitur penyesuaian saldo belum diimplementasikan. Gunakan
									transaksi pembukuan dan expense untuk melakukan penyesuaian
									saldo kas.
								</div>
							</div>
						)}
					</div>
				</div>
		</main>
	);
}
