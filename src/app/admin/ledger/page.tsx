import { prisma } from "@/lib/prisma";
import { LedgerFilters } from "@/components/admin/ledger/LedgerFilters";
import { LedgerSection } from "@/components/admin/ledger/LedgerSection";
import { ProductionCostSummary } from "@/components/admin/ledger/ProductionCostSummary";
import { LedgerEntry } from "@/components/admin/ledger/types";
import {
	formatDateTime,
	toCurrency,
} from "@/components/admin/ledger/formatters";

type SearchParams = {
	start?: string;
	end?: string;
	type?: "purchase" | "sale" | "production";
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
	] = await Promise.all([
		prisma.purchase.findMany({
			where: {
				...(start ? { date: { gte: start } } : {}),
				...(end ? { date: { lte: end } } : {}),
				...(params.status ? { status: params.status } : {}),
				...(params.party
					? { supplier: { contains: params.party, mode: "insensitive" } }
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
					include: { itemType: true },
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
		prisma.pengikisan.findMany({
			where: {
				...(start ? { date: { gte: start } } : {}),
				...(end ? { date: { lte: end } } : {}),
				...(params.q
					? { OR: [{ notes: { contains: params.q, mode: "insensitive" } }] }
					: {}),
			},
			orderBy: { date: "desc" },
			include: { pengikisanItems: true },
		}),
		prisma.pemotongan.findMany({
			where: {
				...(start ? { date: { gte: start } } : {}),
				...(end ? { date: { lte: end } } : {}),
				...(params.q
					? { OR: [{ notes: { contains: params.q, mode: "insensitive" } }] }
					: {}),
			},
			orderBy: { date: "desc" },
			include: { pemotonganItems: true },
		}),
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
		prisma.pengemasan.findMany({
			where: {
				...(start ? { date: { gte: start } } : {}),
				...(end ? { date: { lte: end } } : {}),
				...(params.q
					? { OR: [{ notes: { contains: params.q, mode: "insensitive" } }] }
					: {}),
			},
			orderBy: { date: "desc" },
			include: { pengemasanItems: true },
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
			total: null,
			stockImpact: "NEUTRAL",
			notes: pr.notes,
			itemCount,
			productionCost: costValue,
			subType: pr.productionType?.name ?? "Production",
		};
	});

	const pengikisanEntries: LedgerEntry[] = pengikisanList.map((p) => ({
		id: `pengikisan-${p.id}`,
		type: "production",
		date: p.date.toISOString(),
		status: "completed" as any,
		reference: `PK-${p.id}`,
		counterparty: "-",
		total: null,
		stockImpact: "NEUTRAL",
		notes: p.notes,
		itemCount: p.pengikisanItems.length,
		productionCost: parseFloat(p.totalUpah?.toString() || "0"),
		subType: "Pengikisan",
	}));

	const pemotonganEntries: LedgerEntry[] = pemotonganList.map((p) => ({
		id: `pemotongan-${p.id}`,
		type: "production",
		date: p.date.toISOString(),
		status: "completed" as any,
		reference: `PM-${p.id}`,
		counterparty: "-",
		total: null,
		stockImpact: "NEUTRAL",
		notes: p.notes,
		itemCount: p.pemotonganItems.length,
		productionCost: parseFloat(p.totalUpah?.toString() || "0"),
		subType: "Pemotongan",
	}));

	const penjemuranEntries: LedgerEntry[] = penjemuranList.map((p) => ({
		id: `penjemuran-${p.id}`,
		type: "production",
		date: p.date.toISOString(),
		status: "completed" as any,
		reference: `PJ-${p.id}`,
		counterparty: "-",
		total: null,
		stockImpact: "NEUTRAL",
		notes: p.notes,
		itemCount: p.penjemuranItems.length,
		productionCost: parseFloat(p.totalUpah?.toString() || "0"),
		subType: "Penjemuran",
	}));

	const pengemasanEntries: LedgerEntry[] = pengemasanList.map((p) => ({
		id: `pengemasan-${p.id}`,
		type: "production",
		date: p.date.toISOString(),
		status: "completed" as any,
		reference: `PG-${p.id}`,
		counterparty: "-",
		total: null,
		stockImpact: "NEUTRAL",
		notes: p.notes,
		itemCount: p.pengemasanItems.length,
		productionCost: parseFloat(p.totalUpah?.toString() || "0"),
		subType: "Pengemasan",
	}));

	const allProductions = [
		...productionEntries,
		...pengikisanEntries,
		...pemotonganEntries,
		...penjemuranEntries,
		...pengemasanEntries,
	];

	let filteredPurchases: LedgerEntry[] = purchaseEntries;
	let filteredSales: LedgerEntry[] = saleEntries;
	let filteredProductions: LedgerEntry[] = allProductions;

	// Filter productions to only include known types
	const knownProductionTypes = [
		"Pengikisan",
		"Pemotongan",
		"Penjemuran",
		"Pengemasan",
	];
	filteredProductions = filteredProductions.filter((p) =>
		knownProductionTypes.includes(p.subType || ""),
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
	const saleNominal = sortedSales.reduce((sum, e) => sum + (e.total ?? 0), 0);
	const productionCostTotal = sortedProductions.reduce(
		(sum, e) => sum + (e.productionCost ?? 0),
		0,
	);

	// Group productions by subType
	const productionGroups: Record<string, LedgerEntry[]> = {};
	sortedProductions.forEach((p) => {
		const type = p.subType || "Lainnya";
		if (!productionGroups[type]) productionGroups[type] = [];
		productionGroups[type].push(p);
	});

	const allProductionTypes = Array.from(
		new Set([...knownProductionTypes, ...Object.keys(productionGroups)]),
	).sort((a, b) => {
		const idxA = knownProductionTypes.indexOf(a);
		const idxB = knownProductionTypes.indexOf(b);
		if (idxA !== -1 && idxB !== -1) return idxA - idxB;
		if (idxA !== -1) return -1;
		if (idxB !== -1) return 1;
		return a.localeCompare(b);
	});

	const totalCount = purchaseCount + saleCount + productionCount;
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

			<section className="mb-4">
				<LedgerSection
					title="Pembelian"
					type="purchase"
					entries={sortedPurchases}
					totalCount={purchaseCount}
					totalNominal={purchaseNominal}
				/>
			</section>

			<section className="mb-4">
				<LedgerSection
					title="Penjualan"
					type="sale"
					entries={sortedSales}
					totalCount={saleCount}
					totalNominal={saleNominal}
				/>
			</section>

			{allProductionTypes.map((type) => {
				const items = productionGroups[type] || [];
				const count = items.length;
				const nominal = items.reduce(
					(sum, e) => sum + (e.productionCost || 0),
					0,
				);

				return (
					<section key={type} className="mb-4">
						<LedgerSection
							title={type}
							type="production"
							entries={items}
							totalCount={count}
							totalNominal={nominal}
							extraHeaderContent={<ProductionCostSummary totalCost={nominal} />}
						/>
					</section>
				);
			})}

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
						<div className="space-y-2 text-xs" />
					</div>
				</section>
			)}
		</main>
	);
}
