import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toCurrency } from "@/components/admin/ledger/formatters";
import LaporanGajiHeaderWithDownload from "@/components/admin/laporan-gaji/HeaderWithDownload";

export const metadata = {
	title: "Laporan Gaji | PT AMP Dashboard",
	description: "Laporan gaji berdasarkan data produksi.",
};

type SearchParams = {
	jenis?: string;
	weekStart?: string;
};

const DAY_LABELS = [
	"Minggu",
	"Senin",
	"Selasa",
	"Rabu",
	"Kamis",
	"Jumat",
	"Sabtu",
] as const;

type ShiftKey = "malam" | "siang";

type WeeklyRow = {
	nama: string;
	ket: string;
	values: Record<number, Record<ShiftKey, number>>;
	jumlah: number;
	upahPerUnit?: number;
};

type TabKey =
	| "pengikisan"
	| "pemotongan"
	| "penjemuran"
	| "pensortiran"
	| "pengemasan"
	| "qc-potong-sortir"
	| "produksi-lainnya";

const TABS: { key: TabKey; label: string }[] = [
	{ key: "pengikisan", label: "Pengikisan" },
	{ key: "pemotongan", label: "Pemotongan" },
	{ key: "penjemuran", label: "Penjemuran" },
	{ key: "pensortiran", label: "Pensortiran" },
	{ key: "pengemasan", label: "Pengemasan" },
	{ key: "qc-potong-sortir", label: "QC Potong & Sortir" },
	{ key: "produksi-lainnya", label: "Produksi Lainnya" },
];

function getWeekStart(base: Date) {
	const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
	const day = d.getDay();
	d.setDate(d.getDate() - day);
	d.setHours(0, 0, 0, 0);
	return d;
}

function formatDateRangeLabel(start: Date, endInclusive: Date) {
	const fmt = (d: Date) =>
		d.toLocaleDateString("id-ID", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	return `${fmt(start)} - ${fmt(endInclusive)}`;
}

function createEmptyValues(): Record<number, Record<ShiftKey, number>> {
	const values: Record<number, Record<ShiftKey, number>> = {};
	for (let i = 0; i < 7; i++) {
		values[i] = { malam: 0, siang: 0 };
	}
	return values;
}

function addValue(row: WeeklyRow, date: Date, amount: number, shift: ShiftKey) {
  if (!Number.isFinite(amount) || amount === 0) return;
  const dayIdx = date.getDay();
  row.values[dayIdx][shift] += amount;
  row.jumlah += amount;
}

export default async function LaporanGajiPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>;
}) {
	const params = (await searchParams) ?? {};

  const today = new Date();
  let weekStart: Date;
  if (params.weekStart) {
    const parsed = new Date(params.weekStart);
    const base = Number.isNaN(parsed.getTime()) ? today : parsed;
    weekStart = getWeekStart(base);
  } else {
    const thisWeek = getWeekStart(today);
    weekStart = new Date(thisWeek);
    weekStart.setDate(thisWeek.getDate() - 7);
  }
  const weekEndExclusive = new Date(weekStart);
  weekEndExclusive.setDate(weekStart.getDate() + 8);
  const weekEndDisplay = new Date(weekStart);
  weekEndDisplay.setDate(weekStart.getDate() + 7);

	const weekLabel = formatDateRangeLabel(weekStart, weekEndDisplay);

	const activeTabKey: TabKey =
		(TABS.find((t) => t.key === params.jenis)?.key as TabKey) || "pengikisan";

	const anyPrisma = prisma as any;

	const [
		pengikisanList,
		pemotonganList,
		penjemuranList,
		pengemasanList,
		produksiLainnyaList,
		pensortiranList,
		qcPotongSortirList,
	] = await Promise.all([
		prisma.pengikisan.findMany({
			where: {
				date: { gte: weekStart, lt: weekEndExclusive },
			},
			orderBy: { date: "asc" },
			include: { pengikisanItems: true },
		}),
		prisma.pemotongan.findMany({
			where: {
				date: { gte: weekStart, lt: weekEndExclusive },
			},
			orderBy: { date: "asc" },
			include: { pemotonganItems: true },
		}),
		prisma.penjemuran.findMany({
			where: {
				date: { gte: weekStart, lt: weekEndExclusive },
			},
			orderBy: { date: "asc" },
			include: { penjemuranItems: true },
		}),
		prisma.pengemasan.findMany({
			where: {
				date: { gte: weekStart, lt: weekEndExclusive },
			},
			orderBy: { date: "asc" },
			include: { pengemasanItems: true },
		}),
		prisma.produksiLainnya.findMany({
			where: {
				date: { gte: weekStart, lt: weekEndExclusive },
			},
			orderBy: { date: "asc" },
			include: { produksiLainnyaItems: true },
		}),
		(async () => {
			try {
				if (!anyPrisma.pensortiran) return [];
				return await anyPrisma.pensortiran.findMany({
					where: {
						date: { gte: weekStart, lt: weekEndExclusive },
					},
					orderBy: { date: "asc" },
					include: { pensortiranItems: true },
				});
			} catch {
				if (process.env.NODE_ENV === "development") {
					console.warn(
						"Failed to load pensortiran weekly report data, returning empty list as fallback",
					);
				}
				return [];
			}
		})(),
		(async () => {
			try {
				if (!anyPrisma.qcPotongSortir) return [];
				return await anyPrisma.qcPotongSortir.findMany({
					where: {
						date: { gte: weekStart, lt: weekEndExclusive },
					},
					orderBy: { date: "asc" },
					include: { qcPotongSortirItems: true },
				});
			} catch {
				if (process.env.NODE_ENV === "development") {
					console.warn(
						"Failed to load qc_potong_sortir weekly report data, returning empty list as fallback",
					);
				}
				return [];
			}
		})(),
	]);

	const pengikisanRows = (() => {
		const map = new Map<string, WeeklyRow>();

		const sameDay = (a: Date, b: Date) =>
			a.getFullYear() === b.getFullYear() &&
			a.getMonth() === b.getMonth() &&
			a.getDate() === b.getDate();

		for (const p of pengikisanList) {
			const d = new Date(p.date);
			const shiftKey: ShiftKey =
				(p as any).shift === "malam" ? "malam" : "siang";

			const dateOnly = new Date(
				d.getFullYear(),
				d.getMonth(),
				d.getDate(),
			);

			let rowWeekStart = getWeekStart(dateOnly);

			if (dateOnly.getDay() === 0 && shiftKey === "siang") {
				const prev = new Date(dateOnly);
				prev.setDate(prev.getDate() - 1);
				rowWeekStart = getWeekStart(prev);
			}

			if (!sameDay(rowWeekStart, weekStart)) {
				continue;
			}

			for (const it of p.pengikisanItems) {
				const rawNama = it.nama || "-";
				const keyNama = rawNama.trim().toUpperCase();
				const ka = Number(it.kaKg ?? 0);
				const stik = Number(it.stikKg ?? 0);
				const upahKa = Number(it.upahKa ?? 0);
				const upahStik = Number(it.upahStik ?? 0);
				if (ka > 0) {
					const key = `${keyNama}::KA`;
					if (!map.has(key)) {
						map.set(key, {
							nama: rawNama,
							ket: "KA",
							values: createEmptyValues(),
							jumlah: 0,
							upahPerUnit: 0,
						});
					}
					const row = map.get(key)!;
					addValue(row, d, ka, shiftKey);
					row.upahPerUnit = upahKa || row.upahPerUnit || 0;
				}
				if (stik > 0) {
					const key = `${keyNama}::Stik`;
					if (!map.has(key)) {
						map.set(key, {
							nama: rawNama,
							ket: "Stik",
							values: createEmptyValues(),
							jumlah: 0,
							upahPerUnit: 0,
						});
					}
					const row = map.get(key)!;
					addValue(row, d, stik, shiftKey);
					row.upahPerUnit = upahStik || row.upahPerUnit || 0;
				}
			}
		}
		return Array.from(map.values()).sort((a, b) => {
			if (a.nama === b.nama) {
				return a.ket.localeCompare(b.ket, "id-ID");
			}
			return a.nama.localeCompare(b.nama, "id-ID");
		});
	})();

  const pemotonganRows = (() => {
    const map = new Map<string, WeeklyRow>();
    for (const p of pemotonganList) {
      const d = new Date(p.date);
      const shiftKey: ShiftKey =
        (p as any).shift === "malam" ? "malam" : "siang";
      for (const it of p.pemotonganItems) {
        const nama = it.nama || "-";
        const total = Number(it.total ?? 0);
        if (!map.has(nama)) {
          map.set(nama, {
            nama,
            ket: "Kg",
            values: createEmptyValues(),
            jumlah: 0,
            upahPerUnit: 0,
          });
        }
        addValue(map.get(nama)!, d, total, shiftKey);
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.nama.localeCompare(b.nama, "id-ID")
    );
  })();

	const penjemuranRows = (() => {
		const map = new Map<string, WeeklyRow>();
		for (const p of penjemuranList) {
			const d = new Date(p.date);
			for (const it of p.penjemuranItems) {
				const nama = it.nama || "-";
				const total = Number(it.total ?? 0);
				if (!map.has(nama)) {
					map.set(nama, {
						nama,
						ket: "Hadir+Lembur",
						values: createEmptyValues(),
						jumlah: 0,
						upahPerUnit: 0,
					});
				}
				addValue(map.get(nama)!, d, total, "siang");
			}
		}
		return Array.from(map.values()).sort((a, b) =>
			a.nama.localeCompare(b.nama, "id-ID"),
		);
	})();

  const pensortiranRows = (() => {
    const map = new Map<string, WeeklyRow>();
    for (const p of pensortiranList) {
      const d = new Date(p.date);
      for (const it of p.pensortiranItems) {
        const nama = it.nama || "-";
        const total = Number(it.total ?? 0);
        if (!map.has(nama)) {
          map.set(nama, {
            nama,
            ket: "Kg",
            values: createEmptyValues(),
            jumlah: 0,
            upahPerUnit: 0,
          });
        }
        const shiftRaw = ((it as any).shift as string | null) || "";
        const shiftKey: ShiftKey =
          shiftRaw.toUpperCase() === "MALAM" ? "malam" : "siang";
        addValue(map.get(nama)!, d, total, shiftKey);
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.nama.localeCompare(b.nama, "id-ID")
    );
  })();

  const pengemasanRows = (() => {
    const map = new Map<string, WeeklyRow>();
    for (const p of pengemasanList) {
      const d = new Date(p.date);
      const shiftKey: ShiftKey =
        (p as any).shift === "malam" ? "malam" : "siang";
      for (const it of p.pengemasanItems) {
        const nama = it.nama || "-";
        const total = Number(it.total ?? 0);
        if (!map.has(nama)) {
          map.set(nama, {
            nama,
            ket: "Bungkus",
            values: createEmptyValues(),
            jumlah: 0,
            upahPerUnit: 0,
          });
        }
        addValue(map.get(nama)!, d, total, shiftKey);
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.nama.localeCompare(b.nama, "id-ID")
    );
  })();

	const qcRows = (() => {
		const map = new Map<string, WeeklyRow>();
		for (const p of qcPotongSortirList) {
			const d = new Date(p.date);
			for (const it of p.qcPotongSortirItems) {
				const nama = it.nama || "-";
				const total = Number(it.total ?? 0);
				if (!map.has(nama)) {
					map.set(nama, {
						nama,
						ket: "Hadir+Lembur",
						values: createEmptyValues(),
						jumlah: 0,
						upahPerUnit: 0,
					});
				}
				addValue(map.get(nama)!, d, total, "siang");
			}
		}
		return Array.from(map.values()).sort((a, b) =>
			a.nama.localeCompare(b.nama, "id-ID"),
		);
	})();

	const produksiLainnyaRows = (() => {
		const map = new Map<string, WeeklyRow>();
		for (const p of produksiLainnyaList) {
			const d = new Date(p.date);
			for (const it of p.produksiLainnyaItems) {
				const nama = it.namaPekerja || "-";
				const total = Number(it.total ?? 0);
				if (!map.has(nama)) {
					map.set(nama, {
						nama,
						ket: it.namaPekerjaan || "-",
						values: createEmptyValues(),
						jumlah: 0,
						upahPerUnit: 0,
					});
				}
				addValue(map.get(nama)!, d, total, "siang");
			}
		}
		return Array.from(map.values()).sort((a, b) =>
			a.nama.localeCompare(b.nama, "id-ID"),
		);
	})();

	const prevWeekStart = new Date(weekStart);
	prevWeekStart.setDate(weekStart.getDate() - 7);
	const nextWeekStart = new Date(weekStart);
	nextWeekStart.setDate(weekStart.getDate() + 7);

	const fmtParamDate = (d: Date) => {
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, "0");
		const day = String(d.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	const buildTabHref = (key: TabKey) => {
		const usp = new URLSearchParams();
		usp.set("jenis", key);
		usp.set("weekStart", fmtParamDate(weekStart));
		return `/admin/laporan-gaji?${usp.toString()}`;
	};

	const buildWeekHref = (date: Date) => {
		const usp = new URLSearchParams();
		usp.set("jenis", activeTabKey);
		usp.set("weekStart", fmtParamDate(date));
		return `/admin/laporan-gaji?${usp.toString()}`;
	};

	const rowsForActive: WeeklyRow[] =
		activeTabKey === "pengikisan"
			? pengikisanRows
			: activeTabKey === "pemotongan"
				? pemotonganRows
				: activeTabKey === "penjemuran"
					? penjemuranRows
					: activeTabKey === "pensortiran"
						? pensortiranRows
						: activeTabKey === "pengemasan"
							? pengemasanRows
							: activeTabKey === "qc-potong-sortir"
								? qcRows
								: produksiLainnyaRows;

	const totalUpahByNama: Map<string, number> | null =
		activeTabKey === "pengikisan"
			? rowsForActive.reduce((acc, row) => {
					const totalKg = Object.values(row.values).reduce(
						(sum, v) => sum + v.malam + v.siang,
						0,
					);
					const upah = row.upahPerUnit ?? 0;
					const jumlah = totalKg * upah;
					acc.set(row.nama, (acc.get(row.nama) ?? 0) + jumlah);
					return acc;
				}, new Map<string, number>())
			: null;

	const grandTotalJumlahUpah =
		activeTabKey === "pengikisan"
			? Array.from(totalUpahByNama?.values() ?? []).reduce(
					(sum, v) => sum + v,
					0,
				)
			: rowsForActive.reduce((sum, row) => sum + row.jumlah, 0);

	const footerColSpan =
		activeTabKey === "pengikisan"
			? 20
			: activeTabKey === "pemotongan" ||
					activeTabKey === "pengemasan" ||
					activeTabKey === "pensortiran"
				? 17
				: 10;

	const pengikisanGroups:
		| {
				nama: string;
				rows: WeeklyRow[];
		  }[]
		| null =
		activeTabKey === "pengikisan"
			? rowsForActive.reduce(
					(groups, row) => {
						const last = groups[groups.length - 1];
						if (last && last.nama === row.nama) {
							last.rows.push(row);
						} else {
							groups.push({ nama: row.nama, rows: [row] });
						}
						return groups;
					},
					[] as { nama: string; rows: WeeklyRow[] }[],
				)
			: null;

	return (
		<main className="w-full px-4 py-6">
			<section className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-slate-900">
						Laporan Gaji
					</h1>
					<p className="text-sm text-slate-600">
						Weekly report upah pegawai berdasarkan data produksi.
					</p>
				</div>
				<div className="flex flex-col items-start gap-2 text-xs md:flex-row md:items-center">
					<div className="flex items-center gap-2">
						<Link
							href={buildWeekHref(prevWeekStart)}
							className="rounded-full border border-slate-300 px-2 py-1 text-slate-700 hover:bg-slate-50"
						>
							&larr; Minggu sebelumnya
						</Link>
						<span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white">
							Periode: {weekLabel}
						</span>
						<Link
							href={buildWeekHref(nextWeekStart)}
							className="rounded-full border border-slate-300 px-2 py-1 text-slate-700 hover:bg-slate-50"
						>
							Minggu berikutnya &rarr;
						</Link>
					</div>
					<form method="GET" className="flex items-center gap-2">
						<input type="hidden" name="jenis" value={activeTabKey} />
						<input
							type="date"
							name="weekStart"
							defaultValue={fmtParamDate(weekStart)}
							className="rounded-md border border-slate-300 px-2 py-1 text-xs"
						/>
						<button
							type="submit"
							className="rounded-md bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white hover:bg-slate-800"
						>
							Pilih minggu
						</button>
					</form>
				</div>
			</section>

			<section className="mb-4">
				<div className="flex flex-wrap gap-2">
					{TABS.map((t) => {
						const isActive = t.key === activeTabKey;
						return (
							<Link
								key={t.key}
								href={buildTabHref(t.key)}
								className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
									isActive
										? "bg-slate-900 text-white"
										: "bg-slate-100 text-slate-800 hover:bg-slate-200"
								}`}
							>
								{t.label}
							</Link>
						);
					})}
				</div>
			</section>

			<section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
				<div className="overflow-x-auto rounded-lg border border-slate-200">
					<table className="w-full min-w-[1200px] border-collapse text-[11px]">
						<thead>
							{activeTabKey === "pengikisan" ? (
								<>
									<tr className="bg-slate-50 text-slate-700">
										<th
											className="border border-slate-200 px-2 py-1"
											rowSpan={2}
										>
											#
										</th>
										<th
											className="border border-slate-200 px-2 py-1"
											rowSpan={2}
										>
											Nama
										</th>
										<th
											className="border border-slate-200 px-2 py-1"
											rowSpan={2}
										>
											<span>Ket</span>
											<span className="block text-[10px]">barang</span>
										</th>
										<th className="border border-slate-200 px-2 py-1 text-center">
											Minggu
										</th>
										<th
											className="border border-slate-200 px-2 py-1 text-center"
											colSpan={2}
										>
											Senin
										</th>
										<th
											className="border border-slate-200 px-2 py-1 text-center"
											colSpan={2}
										>
											Selasa
										</th>
										<th
											className="border border-slate-200 px-2 py-1 text-center"
											colSpan={2}
										>
											Rabu
										</th>
										<th
											className="border border-slate-200 px-2 py-1 text-center"
											colSpan={2}
										>
											Kamis
										</th>
										<th
											className="border border-slate-200 px-2 py-1 text-center"
											colSpan={2}
										>
											Jumat
										</th>
										<th
											className="border border-slate-200 px-2 py-1 text-center"
											colSpan={2}
										>
											Sabtu
										</th>
										<th className="border border-slate-200 px-2 py-1 text-center">
											Minggu
										</th>
										<th
											className="border border-slate-200 px-2 py-1"
											rowSpan={2}
										>
											Total
										</th>
										<th
											className="border border-slate-200 px-2 py-1"
											rowSpan={2}
										>
											Upah
										</th>
										<th
											className="border border-slate-200 px-2 py-1"
											rowSpan={2}
										>
											Jumlah
										</th>
										<th
											className="border border-slate-200 px-2 py-1"
											rowSpan={2}
										>
											Jumlah Upah
										</th>
									</tr>
									<tr className="bg-slate-50 text-slate-700">
										<th className="border border-slate-200 px-2 py-1 text-center">
											Malam
										</th>
										{["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map(
											(label) => (
												<React.Fragment key={label}>
													<th className="border border-slate-200 px-2 py-1 text-center">
														Siang
													</th>
													<th className="border border-slate-200 px-2 py-1 text-center">
														Malam
													</th>
												</React.Fragment>
											),
										)}
										<th className="border border-slate-200 px-2 py-1 text-center">
											Siang
										</th>
									</tr>
								</>
							) : activeTabKey === "pemotongan" || activeTabKey === "pengemasan" || activeTabKey === "pensortiran" ? (
								<>
									<tr className="bg-slate-50 text-slate-700">
										<th
											className="border border-slate-200 px-2 py-1"
											rowSpan={2}
										>
											#
										</th>
										<th
											className="border border-slate-200 px-2 py-1"
											rowSpan={2}
										>
											Nama
										</th>
										<th
											className="border border-slate-200 px-2 py-1"
											rowSpan={2}
										>
											Ket
										</th>
										<th className="border border-slate-200 px-2 py-1 text-center">
											Minggu
										</th>
										<th
											className="border border-slate-200 px-2 py-1 text-center"
											colSpan={2}
										>
											Senin
										</th>
										<th
											className="border border-slate-200 px-2 py-1 text-center"
											colSpan={2}
										>
											Selasa
										</th>
										<th
											className="border border-slate-200 px-2 py-1 text-center"
											colSpan={2}
										>
											Rabu
										</th>
										<th
											className="border border-slate-200 px-2 py-1 text-center"
											colSpan={2}
										>
											Kamis
										</th>
										<th
											className="border border-slate-200 px-2 py-1 text-center"
											colSpan={2}
										>
											Jumat
										</th>
										<th
											className="border border-slate-200 px-2 py-1 text-center"
											colSpan={2}
										>
											Sabtu
										</th>
										<th className="border border-slate-200 px-2 py-1 text-center">
											Minggu
										</th>
										<th
											className="border border-slate-200 px-2 py-1"
											rowSpan={2}
										>
											Jumlah
										</th>
									</tr>
									<tr className="bg-slate-50 text-slate-700">
										<th className="border border-slate-200 px-2 py-1 text-center">
											Malam
										</th>
										{["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map(
											(label) => (
												<React.Fragment key={label}>
													<th className="border border-slate-200 px-2 py-1 text-center">
														Siang
													</th>
													<th className="border border-slate-200 px-2 py-1 text-center">
														Malam
													</th>
												</React.Fragment>
											),
										)}
										<th className="border border-slate-200 px-2 py-1 text-center">
											Siang
										</th>
									</tr>
								</>
							) : (
								<>
									<tr className="bg-slate-50 text-slate-700">
										<th className="border border-slate-200 px-2 py-1">#</th>
										<th className="border border-slate-200 px-2 py-1">Nama</th>
										<th className="border border-slate-200 px-2 py-1">Ket</th>
										{DAY_LABELS.map((label) => (
											<th
												key={label}
												className="border border-slate-200 px-2 py-1 text-center"
											>
												{label}
											</th>
										))}
										<th className="border border-slate-200 px-2 py-1">
											Jumlah
										</th>
									</tr>
								</>
							)}
						</thead>
						<tbody>
							{rowsForActive.length === 0 ? (
								<tr>
									<td
										colSpan={
											activeTabKey === "pengikisan"
												? 21
												: activeTabKey === "pemotongan" || activeTabKey === "pengemasan" || activeTabKey === "pensortiran"
													? 3 + 7 * 2 + 1
													: 3 + DAY_LABELS.length + 1
										}
										className="px-3 py-4 text-center text-xs text-slate-500"
									>
										Tidak ada data untuk minggu ini.
									</td>
								</tr>
							) : activeTabKey === "pengikisan" && pengikisanGroups ? (
								pengikisanGroups.map((group, groupIdx) => {
									const firstRow = group.rows[0];
									const secondRow = group.rows[1];
									const jumlahGabungan = totalUpahByNama?.get(group.nama) ?? 0;
									const renderDayCells = (row: WeeklyRow) => (
										<>
											<td className="border border-slate-200 px-2 py-1 text-right">
												{row.values[0].malam
													? row.values[0].malam.toLocaleString("id-ID", {
															maximumFractionDigits: 2,
														})
													: ""}
											</td>
											{[1, 2, 3, 4, 5, 6].map((dayIdx) => (
												<React.Fragment key={dayIdx}>
													<td className="border border-slate-200 px-2 py-1 text-right">
														{row.values[dayIdx].siang
															? row.values[dayIdx].siang.toLocaleString(
																	"id-ID",
																	{ maximumFractionDigits: 2 },
																)
															: ""}
													</td>
													<td className="border border-slate-200 px-2 py-1 text-right">
														{row.values[dayIdx].malam
															? row.values[dayIdx].malam.toLocaleString(
																	"id-ID",
																	{ maximumFractionDigits: 2 },
																)
															: ""}
													</td>
												</React.Fragment>
											))}
											<td className="border border-slate-200 px-2 py-1 text-right">
												{row.values[0].siang
													? row.values[0].siang.toLocaleString("id-ID", {
															maximumFractionDigits: 2,
														})
													: ""}
											</td>
										</>
									);

									const renderSummaryCells = (
										row: WeeklyRow,
										showGabungan: boolean,
										rowSpan: number,
									) => {
										const totalKg = Object.values(row.values).reduce(
											(sum, v) => sum + v.malam + v.siang,
											0,
										);
										const upah = row.upahPerUnit ?? 0;
										const jumlah = totalKg * upah;
										return (
											<>
												<td className="border border-slate-200 px-2 py-1 text-right">
													{totalKg
														? totalKg.toLocaleString("id-ID", {
																maximumFractionDigits: 2,
															})
														: ""}
												</td>
												<td className="border border-slate-200 px-2 py-1 text-right">
													{upah ? toCurrency(upah) : ""}
												</td>
												<td className="border border-slate-200 px-2 py-1 text-right">
													{jumlah ? toCurrency(jumlah) : ""}
												</td>
												{showGabungan && (
													<td
														className="border border-slate-200 px-2 py-1 text-right align-middle"
														rowSpan={rowSpan}
													>
														{jumlahGabungan ? toCurrency(jumlahGabungan) : ""}
													</td>
												)}
											</>
										);
									};

									const rowSpan = group.rows.length;

									return (
										<React.Fragment key={group.nama}>
											<tr className="hover:bg-slate-50">
												<td
													className="border border-slate-200 px-2 py-1 text-center align-middle"
													rowSpan={rowSpan}
												>
													{groupIdx + 1}
												</td>
												<td
													className="border border-slate-200 px-2 py-1 align-middle"
													rowSpan={rowSpan}
												>
													{group.nama}
												</td>
												<td className="border border-slate-200 px-2 py-1">
													{firstRow.ket}
												</td>
												{renderDayCells(firstRow)}
												{renderSummaryCells(firstRow, true, rowSpan)}
											</tr>
											{secondRow && (
												<tr className="hover:bg-slate-50">
													<td className="border border-slate-200 px-2 py-1">
														{secondRow.ket}
													</td>
													{renderDayCells(secondRow)}
													{renderSummaryCells(secondRow, false, rowSpan)}
												</tr>
											)}
										</React.Fragment>
									);
								})
							) : activeTabKey === "pemotongan" || activeTabKey === "pengemasan" || activeTabKey === "pensortiran" ? (
								rowsForActive.map((row, idx) => (
									<tr
										key={`${row.nama}-${row.ket}-${idx}`}
										className="hover:bg-slate-50"
									>
										<td className="border border-slate-200 px-2 py-1 text-center">
											{idx + 1}
										</td>
										<td className="border border-slate-200 px-2 py-1">
											{row.nama}
										</td>
										<td className="border border-slate-200 px-2 py-1">
											{row.ket}
										</td>
										<td className="border border-slate-200 px-2 py-1 text-right">
											{row.values[0].malam
												? toCurrency(row.values[0].malam)
												: ""}
										</td>
										{[1, 2, 3, 4, 5, 6].map((dayIdx) => (
											<React.Fragment key={dayIdx}>
												<td className="border border-slate-200 px-2 py-1 text-right">
													{row.values[dayIdx].siang
														? toCurrency(row.values[dayIdx].siang)
														: ""}
												</td>
												<td className="border border-slate-200 px-2 py-1 text-right">
													{row.values[dayIdx].malam
														? toCurrency(row.values[dayIdx].malam)
														: ""}
												</td>
											</React.Fragment>
										))}
										<td className="border border-slate-200 px-2 py-1 text-right">
											{row.values[0].siang
												? toCurrency(row.values[0].siang)
												: ""}
										</td>
										<td className="border border-slate-200 px-2 py-1 text-right font-semibold">
											{toCurrency(row.jumlah)}
										</td>
									</tr>
								))
							) : (
								rowsForActive.map((row, idx) => (
									<tr
										key={`${row.nama}-${row.ket}-${idx}`}
										className="hover:bg-slate-50"
									>
										<td className="border border-slate-200 px-2 py-1 text-center">
											{idx + 1}
										</td>
										<td className="border border-slate-200 px-2 py-1">
											{row.nama}
										</td>
										<td className="border border-slate-200 px-2 py-1">
											{row.ket}
										</td>
										{DAY_LABELS.map((_, dayIdx) => {
											const totalValue =
												(row.values[dayIdx]?.malam ?? 0) +
												(row.values[dayIdx]?.siang ?? 0);
											return (
												<td
													key={dayIdx}
													className="border border-slate-200 px-2 py-1 text-right"
												>
													{totalValue ? toCurrency(totalValue) : ""}
												</td>
											);
										})}
										<td className="border border-slate-200 px-2 py-1 text-right font-semibold">
											{toCurrency(row.jumlah)}
										</td>
									</tr>
								))
							)}
						</tbody>
						{grandTotalJumlahUpah > 0 && (
							<tfoot>
								<tr className="bg-slate-50 text-slate-800 font-semibold">
									<td
										className="border border-slate-200 px-2 py-1 text-right"
										colSpan={footerColSpan}
									>
										Total Jumlah Upah
									</td>
									<td className="border border-slate-200 px-2 py-1 text-right">
										{toCurrency(grandTotalJumlahUpah)}
									</td>
								</tr>
							</tfoot>
						)}
					</table>
				</div>
			</section>
		</main>
	);
}
