"use client";

import { useState } from "react";
import { ArrowDownRight, X } from "lucide-react";

function toCurrency(n: number) {
	const rounded = Math.round(n || 0);
	return `Rp ${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

type PembelianItem = {
	id: string;
	date: Date;
	purchaseItems: {
		id: string;
		itemName: string;
		qty: number;
		unitCost: number;
	}[];
};

type ProduksiDetail = {
	name: string;
	amount: number;
};

type ExpenseItem = {
	id: string;
	date: Date;
	description?: string | null;
	items: {
		id: string;
		description: string;
		amount: number;
	}[];
};

interface CashSummaryClientProps {
	pembelianTotal: number;
	pembelianItems: PembelianItem[];
	produksiTotal: number;
	produksiDetails: ProduksiDetail[];
	expensesTotal: number;
	expensesItems: ExpenseItem[];
	expensesDraftTotal: number;
}

export default function CashSummaryClient({
	pembelianTotal,
	pembelianItems,
	produksiTotal,
	produksiDetails,
	expensesTotal,
	expensesItems,
	expensesDraftTotal,
}: CashSummaryClientProps) {
	const [activeModal, setActiveModal] = useState<"pembelian" | "produksi" | "expenses" | null>(null);

	const pengeluaranTotal = pembelianTotal + produksiTotal + expensesTotal;

	return (
		<>
			<div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-white p-4 shadow-sm ring-1 ring-rose-100">
				<div className="flex items-start justify-between">
					<div>
						<div className="text-[11px] font-medium uppercase tracking-wide text-rose-700">
							Pengeluaran
						</div>
						<div className="mt-2 text-xl font-semibold text-rose-700 md:text-2xl">
							{toCurrency(pengeluaranTotal)}
						</div>
					</div>
					<div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600">
						<ArrowDownRight className="h-5 w-5" />
					</div>
				</div>

				<div className="mt-3 grid grid-cols-1 gap-2 text-[11px] md:text-xs">
					<button
						onClick={() => setActiveModal("pembelian")}
						className="flex items-center justify-between rounded-lg border border-zinc-100 bg-white/60 p-3 text-left transition hover:bg-white hover:shadow-sm"
					>
						<div>
							<div className="text-[11px] text-zinc-500">1. Pembelian</div>
							<div className="font-semibold text-zinc-800">
								{toCurrency(pembelianTotal)}
							</div>
						</div>
						<div className="text-[10px] text-[var(--brand)] font-medium underline">Detail</div>
					</button>

					<button
						onClick={() => setActiveModal("produksi")}
						className="flex items-center justify-between rounded-lg border border-zinc-100 bg-white/60 p-3 text-left transition hover:bg-white hover:shadow-sm"
					>
						<div>
							<div className="text-[11px] text-zinc-500">2. Biaya Produksi</div>
							<div className="font-semibold text-zinc-800">
								{toCurrency(produksiTotal)}
							</div>
						</div>
						<div className="text-[10px] text-[var(--brand)] font-medium underline">Detail</div>
					</button>

					<button
						onClick={() => setActiveModal("expenses")}
						className="flex items-center justify-between rounded-lg border border-zinc-100 bg-white/60 p-3 text-left transition hover:bg-white hover:shadow-sm"
					>
						<div>
							<div className="text-[11px] text-zinc-500">3. Pengeluaran</div>
							<div className="font-semibold text-zinc-800">
								{toCurrency(expensesTotal)}
							</div>
							{expensesDraftTotal > 0 && (
								<div className="mt-1 text-[10px] text-zinc-500">
									Draft: {toCurrency(expensesDraftTotal)} (belum dihitung)
								</div>
							)}
						</div>
						<div className="text-[10px] text-[var(--brand)] font-medium underline">Detail</div>
					</button>
				</div>
			</div>

			{/* Modals */}
			{activeModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
					<div className="w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
						<div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
							<h3 className="text-lg font-semibold text-zinc-900">
								{activeModal === "pembelian" && "Detail Pembelian"}
								{activeModal === "produksi" && "Detail Biaya Produksi"}
								{activeModal === "expenses" && "Detail Pengeluaran (Expenses)"}
							</h3>
							<button
								onClick={() => setActiveModal(null)}
								className="rounded-full p-1 hover:bg-zinc-100 transition"
							>
								<X className="h-5 w-5 text-zinc-500" />
							</button>
						</div>

						<div className="overflow-y-auto p-6">
							{activeModal === "pembelian" && (
								<table className="w-full text-left text-[11px] md:text-xs">
									<thead>
										<tr className="border-b border-zinc-100 text-zinc-500">
											<th className="pb-2 font-medium">#</th>
											<th className="pb-2 font-medium">Nama Barang</th>
											<th className="pb-2 font-right font-medium text-right">Harga</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-zinc-50">
										{(() => {
											const grouped = pembelianItems.reduce((acc, p) => {
												p.purchaseItems.forEach((it) => {
													const existing = acc.get(it.itemName);
													if (existing) {
														existing.qty += it.qty;
														existing.total += it.qty * it.unitCost;
													} else {
														acc.set(it.itemName, {
															qty: it.qty,
															total: it.qty * it.unitCost,
														});
													}
												});
												return acc;
											}, new Map<string, { qty: number; total: number }>());

											let counter = 1;
											return Array.from(grouped.entries()).map(([name, data]) => (
												<tr key={name}>
													<td className="py-2 text-zinc-500">{counter++}</td>
													<td className="py-2 font-medium text-zinc-800">
														{name}
														<span className="ml-1 text-[10px] text-zinc-400 font-normal">
															({data.qty} unit)
														</span>
													</td>
													<td className="py-2 text-right text-zinc-800">
														{toCurrency(data.total)}
													</td>
												</tr>
											));
										})()}
									</tbody>
									<tfoot>
										<tr className="border-t border-zinc-200 font-bold">
											<td colSpan={2} className="pt-3 text-zinc-900">TOTAL</td>
											<td className="pt-3 text-right text-zinc-900">{toCurrency(pembelianTotal)}</td>
										</tr>
									</tfoot>
								</table>
							)}

							{activeModal === "produksi" && (
								<table className="w-full text-left text-[11px] md:text-xs">
									<thead>
										<tr className="border-b border-zinc-100 text-zinc-500">
											<th className="pb-2 font-medium">#</th>
											<th className="pb-2 font-medium">Jenis Pekerjaan</th>
											<th className="pb-2 font-right font-medium text-right">Upah</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-zinc-50">
										{produksiDetails.map((d, idx) => (
											<tr key={idx}>
												<td className="py-2 text-zinc-500">{idx + 1}</td>
												<td className="py-2 font-medium text-zinc-800">{d.name}</td>
												<td className="py-2 text-right text-zinc-800">{toCurrency(d.amount)}</td>
											</tr>
										))}
									</tbody>
									<tfoot>
										<tr className="border-t border-zinc-200 font-bold">
											<td colSpan={2} className="pt-3 text-zinc-900">TOTAL</td>
											<td className="pt-3 text-right text-zinc-900">{toCurrency(produksiTotal)}</td>
										</tr>
									</tfoot>
								</table>
							)}

							{activeModal === "expenses" && (
								<table className="w-full text-left text-[11px] md:text-xs">
									<thead>
										<tr className="border-b border-zinc-100 text-zinc-500">
											<th className="pb-2 font-medium">#</th>
											<th className="pb-2 font-medium">Pengeluaran</th>
											<th className="pb-2 font-right font-medium text-right">Biaya</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-zinc-50">
										{(() => {
											const grouped = expensesItems.reduce((acc, e) => {
												e.items.forEach((it) => {
													const name = it.description.trim();
													const existing = acc.get(name);
													if (existing) {
														existing.amount += it.amount;
													} else {
														acc.set(name, {
															amount: it.amount,
														});
													}
												});
												return acc;
											}, new Map<string, { amount: number }>());

											let counter = 1;
											return Array.from(grouped.entries()).map(([name, data]) => (
												<tr key={name}>
													<td className="py-2 text-zinc-500">{counter++}</td>
													<td className="py-2 font-medium text-zinc-800">
														{name}
													</td>
													<td className="py-2 text-right text-zinc-800">
														{toCurrency(data.amount)}
													</td>
												</tr>
											));
										})()}
									</tbody>
									<tfoot>
										<tr className="border-t border-zinc-200 font-bold">
											<td colSpan={2} className="pt-3 text-zinc-900">TOTAL</td>
											<td className="pt-3 text-right text-zinc-900">{toCurrency(expensesTotal)}</td>
										</tr>
									</tfoot>
								</table>
							)}
						</div>
					</div>
				</div>
			)}
		</>
	);
}
