import React from "react";
import { prisma } from "@/lib/prisma";
import { toCurrency } from "@/components/admin/ledger/formatters";

export const metadata = {
	title: " ", // Judul kosong untuk menghilangkan header browser
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

export default async function LaporanGajiPrintPage({
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
			const shiftKey: ShiftKey = (p as any).shift === "malam" ? "malam" : "siang";
			const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
			let rowWeekStart = getWeekStart(dateOnly);
			if (dateOnly.getDay() === 0 && shiftKey === "siang") {
				const prev = new Date(dateOnly);
				prev.setDate(prev.getDate() - 1);
				rowWeekStart = getWeekStart(prev);
			}
			if (!sameDay(rowWeekStart, weekStart)) continue;

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
						map.set(key, { nama: rawNama, ket: "KA", values: createEmptyValues(), jumlah: 0, upahPerUnit: 0 });
					}
					const row = map.get(key)!;
					addValue(row, d, ka, shiftKey);
					row.upahPerUnit = upahKa || row.upahPerUnit || 0;
				}
				if (stik > 0) {
					const key = `${keyNama}::Stik`;
					if (!map.has(key)) {
						map.set(key, { nama: rawNama, ket: "Stik", values: createEmptyValues(), jumlah: 0, upahPerUnit: 0 });
					}
					const row = map.get(key)!;
					addValue(row, d, stik, shiftKey);
					row.upahPerUnit = upahStik || row.upahPerUnit || 0;
				}
			}
		}
		return Array.from(map.values()).sort((a, b) => {
			if (a.nama === b.nama) return a.ket.localeCompare(b.ket, "id-ID");
			return a.nama.localeCompare(b.nama, "id-ID");
		});
	})();

  const pemotonganRows = (() => {
    const map = new Map<string, WeeklyRow>();
    for (const p of pemotonganList) {
      const d = new Date(p.date);
      const shiftKey: ShiftKey = (p as any).shift === "malam" ? "malam" : "siang";
      for (const it of p.pemotonganItems) {
        const nama = it.nama || "-";
        const total = Number(it.total ?? 0);
        if (!map.has(nama)) {
          map.set(nama, { nama, ket: "Kg", values: createEmptyValues(), jumlah: 0, upahPerUnit: 0 });
        }
        addValue(map.get(nama)!, d, total, shiftKey);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.nama.localeCompare(b.nama, "id-ID"));
  })();

	const penjemuranRows = (() => {
		const map = new Map<string, WeeklyRow>();
		for (const p of penjemuranList) {
			const d = new Date(p.date);
			for (const it of p.penjemuranItems) {
				const nama = it.nama || "-";
				const total = Number(it.total ?? 0);
				if (!map.has(nama)) {
					map.set(nama, { nama, ket: "Hadir+Lembur", values: createEmptyValues(), jumlah: 0, upahPerUnit: 0 });
				}
				addValue(map.get(nama)!, d, total, "siang");
			}
		}
		return Array.from(map.values()).sort((a, b) => a.nama.localeCompare(b.nama, "id-ID"));
	})();

  const pensortiranRows = (() => {
    const map = new Map<string, WeeklyRow>();
    for (const p of pensortiranList) {
      const d = new Date(p.date);
      for (const it of p.pensortiranItems) {
        const nama = it.nama || "-";
        const total = Number(it.total ?? 0);
        if (!map.has(nama)) {
          map.set(nama, { nama, ket: "Kg", values: createEmptyValues(), jumlah: 0, upahPerUnit: 0 });
        }
        const shiftRaw = ((it as any).shift as string | null) || "";
        const shiftKey: ShiftKey = shiftRaw.toUpperCase() === "MALAM" ? "malam" : "siang";
        addValue(map.get(nama)!, d, total, shiftKey);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.nama.localeCompare(b.nama, "id-ID"));
  })();

  const pengemasanRows = (() => {
    const map = new Map<string, WeeklyRow>();
    for (const p of pengemasanList) {
      const d = new Date(p.date);
      const shiftKey: ShiftKey = (p as any).shift === "malam" ? "malam" : "siang";
      for (const it of p.pengemasanItems) {
        const nama = it.nama || "-";
        const total = Number(it.total ?? 0);
        if (!map.has(nama)) {
          map.set(nama, { nama, ket: "Bungkus", values: createEmptyValues(), jumlah: 0, upahPerUnit: 0 });
        }
        addValue(map.get(nama)!, d, total, shiftKey);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.nama.localeCompare(b.nama, "id-ID"));
  })();

	const qcRows = (() => {
		const map = new Map<string, WeeklyRow>();
		for (const p of qcPotongSortirList) {
			const d = new Date(p.date);
			for (const it of p.qcPotongSortirItems) {
				const nama = it.nama || "-";
				const total = Number(it.total ?? 0);
				if (!map.has(nama)) {
					map.set(nama, { nama, ket: "Hadir+Lembur", values: createEmptyValues(), jumlah: 0, upahPerUnit: 0 });
				}
				addValue(map.get(nama)!, d, total, "siang");
			}
		}
		return Array.from(map.values()).sort((a, b) => a.nama.localeCompare(b.nama, "id-ID"));
	})();

	const produksiLainnyaRows = (() => {
		const map = new Map<string, WeeklyRow>();
		for (const p of produksiLainnyaList) {
			const d = new Date(p.date);
			for (const it of p.produksiLainnyaItems) {
				const nama = it.namaPekerja || "-";
				const total = Number(it.total ?? 0);
				if (!map.has(nama)) {
					map.set(nama, { nama, ket: it.namaPekerjaan || "-", values: createEmptyValues(), jumlah: 0, upahPerUnit: 0 });
				}
				addValue(map.get(nama)!, d, total, "siang");
			}
		}
		return Array.from(map.values()).sort((a, b) => a.nama.localeCompare(b.nama, "id-ID"));
	})();

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
					const totalKg = Object.values(row.values).reduce((sum, v) => sum + v.malam + v.siang, 0);
					const upah = row.upahPerUnit ?? 0;
					const jumlah = totalKg * upah;
					acc.set(row.nama, (acc.get(row.nama) ?? 0) + jumlah);
					return acc;
				}, new Map<string, number>())
			: null;

	const grandTotalJumlahUpah =
		activeTabKey === "pengikisan"
			? Array.from(totalUpahByNama?.values() ?? []).reduce((sum, v) => sum + v, 0)
			: rowsForActive.reduce((sum, row) => sum + row.jumlah, 0);

	const footerColSpan =
		activeTabKey === "pengikisan"
			? 20
			: activeTabKey === "pemotongan" || activeTabKey === "pengemasan" || activeTabKey === "pensortiran"
				? 17
				: 10;

	const pengikisanGroups: { nama: string; rows: WeeklyRow[] }[] | null =
		activeTabKey === "pengikisan"
			? rowsForActive.reduce((groups, row) => {
						const last = groups[groups.length - 1];
						if (last && last.nama === row.nama) last.rows.push(row);
						else groups.push({ nama: row.nama, rows: [row] });
						return groups;
					}, [] as { nama: string; rows: WeeklyRow[] }[])
			: null;

	return (
		<div className="p-0 m-0 bg-white">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 landscape;
            margin: 0 !important; /* HAPUS MARGIN BROWSER UNTUK MENGHILANGKAN HEADER/FOOTER */
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: 100% !important;
            width: 100% !important;
            background-color: white !important;
          }
          .no-print { display: none !important; }
        }
        body { margin: 0; padding: 0; background-color: white; }
        .printable-container { 
           padding: 5mm !important; 
           width: 100%; 
           box-sizing: border-box; 
           background-color: white;
         }
         table { border-collapse: collapse; width: 100%; font-size: 6.5pt; table-layout: auto; }
         th, td { border: 1px solid black; padding: 1px !important; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .uppercase { text-transform: uppercase; }
      `}} />

      <div className="printable-container">
        {/* STANDALONE HEADER */}
        <div className="mb-6 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold text-center uppercase">LAPORAN GAJI PT AMP</h1>
          <div className="flex justify-between mt-6 text-[10pt]">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 10px auto', alignItems: 'center' }} className="uppercase">
                <span className="font-bold">JENIS</span>
                <span>:</span>
                <span>{TABS.find(t => t.key === activeTabKey)?.label}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 10px auto', alignItems: 'center' }} className="uppercase">
                <span className="font-bold">PERIODE</span>
                <span>:</span>
                <span>{weekLabel}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', alignSelf: 'flex-end' }}>
              <p style={{ fontStyle: 'italic', fontSize: '8pt' }}>
                Dicetak pada: {new Date().toLocaleDateString("id-ID", { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <table>
          <thead>
            {activeTabKey === "pengikisan" ? (
              <>
                <tr className="bg-gray-100">
                  <th rowSpan={2}>#</th>
                  <th rowSpan={2}>Nama</th>
                  <th rowSpan={2}>Ket barang</th>
                  <th>Minggu</th>
                  <th colSpan={2}>Senin</th>
                  <th colSpan={2}>Selasa</th>
                  <th colSpan={2}>Rabu</th>
                  <th colSpan={2}>Kamis</th>
                  <th colSpan={2}>Jumat</th>
                  <th colSpan={2}>Sabtu</th>
                  <th>Minggu</th>
                  <th rowSpan={2}>Total</th>
                  <th rowSpan={2}>Upah</th>
                  <th rowSpan={2}>Jumlah</th>
                  <th rowSpan={2}>Jumlah Upah</th>
                </tr>
                <tr className="bg-gray-100">
                  <th>Malam</th>
                  {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map(l => (
                    <React.Fragment key={l}>
                      <th>Siang</th>
                      <th>Malam</th>
                    </React.Fragment>
                  ))}
                  <th>Siang</th>
                </tr>
              </>
            ) : activeTabKey === "pemotongan" || activeTabKey === "pengemasan" || activeTabKey === "pensortiran" ? (
              <>
                <tr className="bg-gray-100">
                  <th rowSpan={2}>#</th>
                  <th rowSpan={2}>Nama</th>
                  <th rowSpan={2}>Ket</th>
                  <th>Minggu</th>
                  <th colSpan={2}>Senin</th>
                  <th colSpan={2}>Selasa</th>
                  <th colSpan={2}>Rabu</th>
                  <th colSpan={2}>Kamis</th>
                  <th colSpan={2}>Jumat</th>
                  <th colSpan={2}>Sabtu</th>
                  <th>Minggu</th>
                  <th rowSpan={2}>Jumlah</th>
                </tr>
                <tr className="bg-gray-100">
                  <th>Malam</th>
                  {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map(l => (
                    <React.Fragment key={l}>
                      <th>Siang</th>
                      <th>Malam</th>
                    </React.Fragment>
                  ))}
                  <th>Siang</th>
                </tr>
              </>
            ) : (
              <tr className="bg-gray-100">
                <th>#</th>
                <th>Nama</th>
                <th>Ket</th>
                {DAY_LABELS.map(l => <th key={l}>{l}</th>)}
                <th>Jumlah</th>
              </tr>
            )}
          </thead>
          <tbody>
            {rowsForActive.length === 0 ? (
              <tr>
                <td colSpan={30} className="text-center p-4">Tidak ada data untuk minggu ini.</td>
              </tr>
            ) : activeTabKey === "pengikisan" && pengikisanGroups ? (
              pengikisanGroups.map((group, groupIdx) => {
                const rowSpan = group.rows.length;
                return group.rows.map((row, rowIdx) => (
                  <tr key={`${group.nama}-${row.ket}`}>
                    {rowIdx === 0 && (
                      <>
                        <td rowSpan={rowSpan} className="text-center">{groupIdx + 1}</td>
                        <td rowSpan={rowSpan}>{group.nama}</td>
                      </>
                    )}
                    <td>{row.ket}</td>
                    <td className="text-right">{row.values[0].malam || ""}</td>
                    {[1, 2, 3, 4, 5, 6].map(d => (
                      <React.Fragment key={d}>
                        <td className="text-right">{row.values[d].siang || ""}</td>
                        <td className="text-right">{row.values[d].malam || ""}</td>
                      </React.Fragment>
                    ))}
                    <td className="text-right">{row.values[0].siang || ""}</td>
                    <td className="text-right font-bold">
                      {Object.values(row.values).reduce((s, v) => s + v.malam + v.siang, 0) || ""}
                    </td>
                    <td className="text-right">{row.upahPerUnit ? toCurrency(row.upahPerUnit) : ""}</td>
                    <td className="text-right">
                      {(() => {
                        const totalKg = Object.values(row.values).reduce((s, v) => s + v.malam + v.siang, 0);
                        const j = totalKg * (row.upahPerUnit ?? 0);
                        return j ? toCurrency(j) : "";
                      })()}
                    </td>
                    {rowIdx === 0 && (
                      <td rowSpan={rowSpan} className="text-right font-bold">
                        {toCurrency(totalUpahByNama?.get(group.nama) ?? 0)}
                      </td>
                    )}
                  </tr>
                ));
              })
            ) : activeTabKey === "pemotongan" || activeTabKey === "pengemasan" || activeTabKey === "pensortiran" ? (
              rowsForActive.map((row, idx) => (
                <tr key={idx}>
                  <td className="text-center">{idx + 1}</td>
                  <td>{row.nama}</td>
                  <td>{row.ket}</td>
                  <td className="text-right">{row.values[0].malam || ""}</td>
                  {[1, 2, 3, 4, 5, 6].map(d => (
                    <React.Fragment key={d}>
                      <td className="text-right">{row.values[d].siang || ""}</td>
                      <td className="text-right">{row.values[d].malam || ""}</td>
                    </React.Fragment>
                  ))}
                  <td className="text-right">{row.values[0].siang || ""}</td>
                  <td className="text-right font-bold">{row.jumlah || ""}</td>
                </tr>
              ))
            ) : (
              rowsForActive.map((row, idx) => (
                <tr key={idx}>
                  <td className="text-center">{idx + 1}</td>
                  <td>{row.nama}</td>
                  <td>{row.ket}</td>
                  {DAY_LABELS.map((_, d) => (
                    <td key={d} className="text-right">
                      {(row.values[d]?.malam ?? 0) + (row.values[d]?.siang ?? 0) || ""}
                    </td>
                  ))}
                  <td className="text-right font-bold">{row.jumlah || ""}</td>
                </tr>
              ))
            )}
          </tbody>
          {grandTotalJumlahUpah > 0 && (
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td colSpan={footerColSpan} className="text-right">Total Jumlah Upah</td>
                <td className="text-right">{toCurrency(grandTotalJumlahUpah)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        window.onload = () => {
          document.title = " "; // HAPUS JUDUL UNTUK MENGHILANGKAN HEADER BROWSER
          setTimeout(() => {
            window.print();
          }, 500);
        };
      `}} />
    </div>
	);
}
