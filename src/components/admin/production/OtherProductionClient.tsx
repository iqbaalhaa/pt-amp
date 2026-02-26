"use client";

import { useMemo, useState, useEffect } from "react";
import type { FormEvent } from "react";
import jsPDF from "jspdf";
import Link from "next/link";
import {
  Autocomplete,
  TextField,
  createFilterOptions,
  CircularProgress,
  InputAdornment,
  Tooltip,
} from "@mui/material";

import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import StickyNote2RoundedIcon from "@mui/icons-material/StickyNote2Rounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import NumbersRoundedIcon from "@mui/icons-material/NumbersRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import SummarizeRoundedIcon from "@mui/icons-material/SummarizeRounded";

import GlassButton from "@/components/ui/GlassButton";
import PageHeader from "@/components/ui/PageHeader";
import SafeModal from "@/components/ui/SafeModal";
import { createProduksiLainnya } from "@/actions/produksi-lainnya-actions";
import {
  getWorkers,
  WorkerDTO,
  createWorkerByName,
} from "@/actions/worker-actions";
import { getUnits, quickCreateUnit, UnitDTO } from "@/actions/unit-actions";
import { formatRupiah } from "@/lib/currency";

type Row = {
  id: number;
  namaPekerja: string;
  namaPekerjaan: string;
  qty: number;
  satuan: string;
  upah: number;
  tipeUpah?: "per_qty" | "per_hari";
};

const filter = createFilterOptions<WorkerDTO>();
const unitFilter = createFilterOptions<UnitDTO>();

const F4_W_MM = 210;
const F4_H_MM = 330;
const PRINT_MARGIN_MM = 10;

let logoImagePromise: Promise<HTMLImageElement | null> | null = null;

function loadLogoImage() {
  if (logoImagePromise) return logoImagePromise;

  logoImagePromise = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = "/logoAMP.png";
  });

  return logoImagePromise;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function OtherProductionClient() {
  const [tipeUpah, setTipeUpah] = useState<"per_qty" | "per_hari">("per_qty");
  const [rows, setRows] = useState<Row[]>([
    {
      id: 1,
      namaPekerja: "",
      namaPekerjaan: "",
      qty: 0,
      satuan: "",
      upah: 0,
    },
  ]);

  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const [openPreview, setOpenPreview] = useState(false);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);

  const [workerOptions, setWorkerOptions] = useState<WorkerDTO[]>([]);
  const [unitOptions, setUnitOptions] = useState<UnitDTO[]>([]);

  const [creatingWorkerId, setCreatingWorkerId] = useState<number | null>(null);
  const [creatingUnitId, setCreatingUnitId] = useState<number | null>(null);
  const [bulkWorkerModalOpen, setBulkWorkerModalOpen] = useState(false);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);

  useEffect(() => {
    getWorkers().then((data) =>
      setWorkerOptions(data.filter((w) => w.isActive))
    );
    getUnits().then((data) => {
      const activeUnits = data.filter((u) => u.isActive);
      if (activeUnits.length === 0) {
        setUnitOptions([
          {
            id: "pcs",
            name: "Pcs",
            isActive: true,
            description: null,
          },
          {
            id: "kg",
            name: "Kg",
            isActive: true,
            description: null,
          },
          {
            id: "ikat",
            name: "Ikat",
            isActive: true,
            description: null,
          },
          {
            id: "batang",
            name: "Batang",
            isActive: true,
            description: null,
          },
          {
            id: "lembar",
            name: "Lembar",
            isActive: true,
            description: null,
          },
        ]);
      } else {
        setUnitOptions(activeUnits);
      }
    });
  }, []);

  const addRow = () => {
    setRows((prev) => {
      const nextId = prev.length ? prev[prev.length - 1].id + 1 : 1;
      return [
        ...prev,
        {
          id: nextId,
          namaPekerja: "",
          namaPekerjaan: "",
          qty: 0,
          satuan: "",
          upah: 0,
        },
      ];
    });
  };

  const removeRow = (id: number) => {
    if (rows.length === 1) {
      setRows([
        {
          id: 1,
          namaPekerja: "",
          namaPekerjaan: "",
          qty: 0,
          satuan: "",
          upah: 0,
        },
      ]);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleChange = (id: number, field: keyof Row, value: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              [field]:
                field === "namaPekerja" ||
                field === "namaPekerjaan" ||
                field === "satuan"
                  ? value
                  : Number.isFinite(parseFloat(value))
                  ? parseFloat(value)
                  : 0,
            }
          : r
      )
    );
  };

  const getRowTotal = (row: Row) => {
    const q = Number.isFinite(row.qty) ? row.qty : 0;
    const u = Number.isFinite(row.upah) ? row.upah : 0;
    if (tipeUpah === "per_hari") {
      return u;
    }
    return q * u;
  };

  const totalSemua = useMemo(
    () => rows.reduce((sum, row) => sum + getRowTotal(row), 0),
    [rows]
  );

  const toggleWorkerSelection = (id: string) => {
    setSelectedWorkerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAddSelectedWorkers = () => {
    if (selectedWorkerIds.length === 0) return;
    setRows((prev) => {
      const existingNames = new Set(prev.map((r) => r.namaPekerja));
      const selectedWorkers = workerOptions.filter((w) =>
        selectedWorkerIds.includes(w.id)
      );
      const next = [...prev];
      selectedWorkers.forEach((w) => {
        if (existingNames.has(w.name)) return;
        const nextId = next.length ? next[next.length - 1].id + 1 : 1;
        next.push({
          id: nextId,
          namaPekerja: w.name,
          namaPekerjaan: "",
          qty: 0,
          satuan: "",
          upah: 0,
        });
      });
      return next;
    });
    setSelectedWorkerIds([]);
    setBulkWorkerModalOpen(false);
  };

  const activeRows = useMemo(
    () =>
      rows.filter(
        (r) => r.namaPekerja || r.namaPekerjaan || r.qty > 0 || r.upah > 0
      ),
    [rows]
  );

  const resetForm = () => {
    setRows([
      {
        id: 1,
        namaPekerja: "",
        namaPekerjaan: "",
        qty: 0,
        satuan: "",
        upah: 0,
        tipeUpah: "per_qty",
      },
    ]);
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!date) {
      alert("Tanggal harus diisi");
      return;
    }

    // Validation: Check if there are valid rows and if required fields are filled
    const validRows = rows.filter((r) => {
      const hasNames = r.namaPekerja && r.namaPekerjaan;
      const hasUpah = r.upah > 0;
      if (!hasNames || !hasUpah) return false;
      if (tipeUpah === "per_hari") {
        return true;
      }
      return r.qty > 0;
    });

    if (validRows.length === 0) {
      alert(
        "Mohon isi minimal satu baris data dengan lengkap (Pekerja, Pekerjaan, Qty, Upah)"
      );
      return;
    }

    // Check for partially filled rows that are not complete
    const incompleteRows = rows.filter((r) => {
      const hasAny =
        r.namaPekerja || r.namaPekerjaan || r.qty > 0 || r.upah > 0;
      if (!hasAny) return false;
      const hasNames = r.namaPekerja && r.namaPekerjaan;
      const hasUpah = r.upah > 0;
      if (!hasNames || !hasUpah) return true;
      if (tipeUpah === "per_hari") {
        return false;
      }
      return r.qty <= 0;
    });

    if (incompleteRows.length > 0) {
      alert(
        "Ada baris data yang belum lengkap. Mohon lengkapi atau hapus baris tersebut."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        date,
        notes: notes || null,
        items: validRows.map((r) => ({
          namaPekerja: r.namaPekerja,
          namaPekerjaan: r.namaPekerjaan,
          qty: String(r.qty),
          satuan: r.satuan,
          upah: String(r.upah),
          tipeUpah,
        })),
      };

      const res = await createProduksiLainnya(payload);
      if (res?.success) {
        setLastSavedId(res.id);
        setOpenPreview(true);
      } else {
        alert("Gagal menyimpan data");
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Terjadi kesalahan saat menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    const logo = await loadLogoImage();

    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: [F4_W_MM, F4_H_MM],
    });

    const margin = PRINT_MARGIN_MM;
    const pageW = F4_W_MM;

    let y = margin + 4;

    if (logo) {
      const logoW = 26;
      const ratio = logo.height / logo.width || 1;
      const logoH = logoW * ratio;

      pdf.addImage(logo, "PNG", margin, y, logoW, logoH);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text("PT AURORA MITRA PRAKARSA (AMP)", margin + logoW + 6, y + 5);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.text(
        "(General Contractor, Supplier, Infrastructure)",
        margin + logoW + 6,
        y + 11
      );

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text("REKAP PRODUKSI LAINNYA", pageW - margin, y + 5, {
        align: "right",
      });

      y += logoH + 6;

      pdf.setDrawColor(26, 35, 126);
      pdf.setLineWidth(0.4);
      pdf.line(margin, y, pageW - margin, y);
      y += 4;
    } else {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text("REKAP PRODUKSI LAINNYA", pageW / 2, y, { align: "center" });
      y += 8;
      pdf.setDrawColor(26, 35, 126);
      pdf.setLineWidth(0.4);
      pdf.line(margin, y, pageW - margin, y);
      y += 4;
    }

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(
      `Tanggal: ${date ? new Date(date).toLocaleDateString("id-ID") : "-"}`,
      margin,
      y
    );
    y += 5;

    if (notes) {
      pdf.text(`Catatan: ${notes}`, margin, y);
      y += 5;
    }

    y += 2;

    const colNoX = margin;
    const colPekerjaX = colNoX + 10;
    const colPekerjaanX = colPekerjaX + 40;
    const colQtyX = colPekerjaanX + 50;
    const colSatuanX = colQtyX + 20;
    const colUpahX = colSatuanX + 20;
    const colTotalX = colUpahX + 30;

    const rowHeight = 6;
    const tableTop = y;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("No", colNoX, y);
    pdf.text("Pekerja", colPekerjaX, y);
    pdf.text("Pekerjaan", colPekerjaanX, y);
    pdf.text(tipeUpah === "per_hari" ? "Hari" : "Qty", colQtyX, y);
    pdf.text(tipeUpah === "per_hari" ? "Lembur" : "Satuan", colSatuanX, y);
    pdf.text("Upah (Rp)", colUpahX, y);
    pdf.text("Total (Rp)", colTotalX, y);

    y += 2;

    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.2);

    const rowsForPrint = activeRows.length ? activeRows : rows;
    const tableBottomY = tableTop + rowHeight * (rowsForPrint.length + 2);

    pdf.line(colNoX - 2, tableTop - 3, pageW - margin, tableTop - 3);
    pdf.line(colNoX - 2, tableBottomY, pageW - margin, tableBottomY);
    pdf.line(colNoX - 2, y, pageW - margin, y);

    y += 4;
    pdf.setFont("helvetica", "normal");

    rowsForPrint.forEach((row, idx) => {
      const total = getRowTotal(row);

      pdf.text(String(idx + 1), colNoX, y);
      pdf.text(row.namaPekerja || "-", colPekerjaX, y);
      pdf.text(row.namaPekerjaan || "-", colPekerjaanX, y);
      pdf.text((row.qty || 0).toLocaleString("id-ID"), colQtyX, y);
      pdf.text(row.satuan || "-", colSatuanX, y);
      pdf.text((row.upah || 0).toLocaleString("id-ID"), colUpahX, y);
      pdf.text(total.toLocaleString("id-ID"), colTotalX, y, { align: "right" });

      y += rowHeight;
    });

    y += 4;

    pdf.setFont("helvetica", "bold");
    pdf.text("Total Semua", colUpahX, y);
    pdf.text(formatRupiah(totalSemua), colTotalX, y, { align: "right" });

    pdf.save(`nota-produksi-lainnya-${date || "draft"}.pdf`);
  };

  const muiCompactInputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      backgroundColor: "rgba(255,255,255,0.96)",
      fontSize: "12px",
      minHeight: 38,
      "& fieldset": { borderColor: "var(--glass-border)" },
      "&:hover fieldset": { borderColor: "rgba(0,0,0,0.18)" },
      "&.Mui-focused fieldset": { borderColor: "var(--brand)" },
    },
    "& .MuiInputBase-input": { padding: "9px 10px" },
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Produksi Lainnya"
        actions={
          <>
            <Link
              href="/admin/produksi-lainnya/riwayat"
              className={cx(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold",
                "border border-[var(--glass-border)] bg-white/70 backdrop-blur shadow-sm",
                "hover:bg-white/90 active:scale-[0.99] transition"
              )}
            >
              <HistoryRoundedIcon fontSize="small" className="text-black/70" />
              <span>Riwayat</span>
            </Link>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className={cx(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold",
                "border border-[var(--glass-border)] bg-white/70 backdrop-blur shadow-sm",
                "hover:bg-white/90 active:scale-[0.99] transition"
              )}
            >
              <PictureAsPdfRoundedIcon
                fontSize="small"
                className="text-red-600"
              />
              <span>PDF</span>
            </button>
          </>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="w-full border border-[var(--glass-border)] bg-transparent rounded-xl p-4 md:p-5">
          {/* Top Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-4">
              <label className="text-[11px] font-semibold text-black/70 flex items-center gap-1.5 mb-1">
                <EventRoundedIcon
                  sx={{ fontSize: 16 }}
                  className="text-[var(--brand)]"
                />
                Tanggal <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={cx(
                    "w-full h-[38px] px-3 rounded-lg",
                    "border border-[var(--glass-border)] bg-white/95 text-[12px]",
                    "outline-none focus:ring-2 focus:ring-[var(--brand)]/25 focus:border-[var(--brand)]"
                  )}
                />
              </div>
            </div>

            <div className="md:col-span-5">
              <label className="text-[11px] font-semibold text-black/70 flex items-center gap-1.5 mb-1">
                <StickyNote2RoundedIcon
                  sx={{ fontSize: 16 }}
                  className="text-[var(--brand)]"
                />
                Catatan
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={cx(
                  "w-full h-[38px] px-3 rounded-lg",
                  "border border-[var(--glass-border)] bg-white/95 text-[12px]",
                  "outline-none focus:ring-2 focus:ring-[var(--brand)]/25 focus:border-[var(--brand)]"
                )}
                placeholder="Contoh: kerja lembur / pekerjaan tambahan (opsional)"
              />
            </div>

            <div className="md:col-span-3">
              <label className="text-[11px] font-semibold text-black/70 flex items-center gap-1.5 mb-1">
                <PaymentsRoundedIcon
                  sx={{ fontSize: 16 }}
                  className="text-[var(--brand)]"
                />
                Mode Upah
              </label>
              <div className="flex rounded-lg border border-[var(--glass-border)] bg-white/95 overflow-hidden text-[11px]">
                <button
                  type="button"
                  onClick={() => setTipeUpah("per_qty")}
                  className={cx(
                    "flex-1 px-2 py-1.5 font-semibold transition-colors",
                    tipeUpah === "per_qty"
                      ? "bg-[var(--brand)] text-white"
                      : "bg-transparent text-black/60"
                  )}
                >
                  Per Qty
                </button>
                <button
                  type="button"
                  onClick={() => setTipeUpah("per_hari")}
                  className={cx(
                    "flex-1 px-2 py-1.5 font-semibold border-l border-[var(--glass-border)] transition-colors",
                    tipeUpah === "per_hari"
                      ? "bg-[var(--brand)] text-white"
                      : "bg-transparent text-black/60"
                  )}
                >
                  Per Hari
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--glass-border)] bg-transparent">
            <table className="w-full min-w-[980px] text-[12px] text-left">
              <thead className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-[var(--glass-border)]">
                <tr className="text-[11px] font-extrabold tracking-wide text-black/75 uppercase">
                  <th className="px-3 py-3 w-12 text-center">
                    <span className="inline-flex items-center justify-center gap-1">
                      <NumbersRoundedIcon
                        sx={{ fontSize: 16 }}
                        className="text-black/45"
                      />
                      No
                    </span>
                  </th>
                  <th className="px-3 py-3 min-w-[170px]">
                    <span className="inline-flex items-center gap-1.5">
                      <BadgeRoundedIcon
                        sx={{ fontSize: 16 }}
                        className="text-black/45"
                      />
                      Pekerja <span className="text-red-500">*</span>
                    </span>
                  </th>
                  <th className="px-3 py-3 min-w-[220px]">
                    <span className="inline-flex items-center gap-1.5">
                      <WorkOutlineRoundedIcon
                        sx={{ fontSize: 16 }}
                        className="text-black/45"
                      />
                      Pekerjaan <span className="text-red-500">*</span>
                    </span>
                  </th>
                  <th className="px-3 py-3 text-center min-w-[90px]">
                    <span className="inline-flex items-center gap-1.5 justify-center">
                      <NumbersRoundedIcon
                        sx={{ fontSize: 16 }}
                        className="text-black/45"
                      />
                      {tipeUpah === "per_hari" ? "Hari" : "Qty"}
                      {tipeUpah === "per_qty" && (
                        <span className="text-red-500">*</span>
                      )}
                    </span>
                  </th>
                  <th className="px-3 py-3 text-center min-w-[140px]">
                    <span className="inline-flex items-center gap-1.5 justify-center">
                      <CategoryRoundedIcon
                        sx={{ fontSize: 16 }}
                        className="text-black/45"
                      />
                      {tipeUpah === "per_hari" ? "Lembur" : "Satuan"}
                    </span>
                  </th>
                  <th className="px-3 py-3 text-right min-w-[150px]">
                    <span className="inline-flex items-center gap-1.5 justify-end w-full">
                      <PaymentsRoundedIcon
                        sx={{ fontSize: 16 }}
                        className="text-black/45"
                      />
                      Upah <span className="text-red-500">*</span>
                    </span>
                  </th>
                  <th className="px-3 py-3 text-right min-w-[160px]">
                    <span className="inline-flex items-center gap-1.5 justify-end w-full">
                      <SummarizeRoundedIcon
                        sx={{ fontSize: 16 }}
                        className="text-black/45"
                      />
                      Total
                    </span>
                  </th>
                  <th className="px-3 py-3 w-16 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, idx) => {
                  const total = getRowTotal(row);

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-[var(--glass-border)] hover:bg-black/[0.02] transition-colors"
                    >
                      <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-[var(--glass-border)] bg-white/70 text-[12px] font-semibold">
                          {idx + 1}
                        </span>
                      </td>

                      <td className="px-3 py-2">
                        <Autocomplete
                          value={
                            workerOptions.find(
                              (w) => w.name === row.namaPekerja
                            ) || null
                          }
                          onChange={async (_event, newValue) => {
                            if (newValue && (newValue as any).inputValue) {
                              setCreatingWorkerId(row.id);
                              try {
                                const newWorker = await createWorkerByName(
                                  (newValue as any).inputValue
                                );
                                if (newWorker) {
                                  setWorkerOptions((prev) => [
                                    ...prev,
                                    newWorker,
                                  ]);
                                  handleChange(
                                    row.id,
                                    "namaPekerja",
                                    newWorker.name
                                  );
                                }
                              } catch (err) {
                                console.error(err);
                              } finally {
                                setCreatingWorkerId(null);
                              }
                            } else if (typeof newValue === "string") {
                              handleChange(row.id, "namaPekerja", newValue);
                            } else {
                              handleChange(
                                row.id,
                                "namaPekerja",
                                newValue?.name || ""
                              );
                            }
                          }}
                          filterOptions={(options, params) => {
                            const filtered = filter(options, params);
                            const { inputValue } = params;
                            const isExisting = options.some(
                              (option) => inputValue === option.name
                            );
                            if (inputValue !== "" && !isExisting) {
                              filtered.push({
                                inputValue,
                                name: `Tambah "${inputValue}"`,
                                id: 0,
                                isActive: true,
                                role: "WORKER",
                                createdAt: new Date(),
                                updatedAt: new Date(),
                              } as any);
                            }
                            return filtered;
                          }}
                          selectOnFocus
                          clearOnBlur
                          handleHomeEndKeys
                          options={workerOptions}
                          getOptionLabel={(option) => {
                            if (typeof option === "string") return option;
                            if ((option as any).inputValue)
                              return (option as any).inputValue;
                            return option.name;
                          }}
                          renderOption={(props, option) => {
                            const { key, ...optionProps } = props;
                            return (
                              <li key={key} {...optionProps}>
                                {option.name}
                              </li>
                            );
                          }}
                          freeSolo
                          sx={muiCompactInputSx}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              required
                              placeholder="Pilih/Ketik..."
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {creatingWorkerId === row.id ? (
                                      <CircularProgress
                                        color="inherit"
                                        size={16}
                                      />
                                    ) : null}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                        />
                      </td>

                      <td className="px-3 py-2">
                        <TextField
                          fullWidth
                          required
                          placeholder="Nama pekerjaan..."
                          value={row.namaPekerjaan}
                          onChange={(e) =>
                            handleChange(
                              row.id,
                              "namaPekerjaan",
                              e.target.value
                            )
                          }
                          sx={muiCompactInputSx}
                        />
                      </td>

                      <td className="px-3 py-2 text-center">
                        <TextField
                          type="number"
                          required={tipeUpah === "per_qty"}
                          value={tipeUpah === "per_hari" ? 1 : row.qty || ""}
                          onChange={(e) =>
                            handleChange(row.id, "qty", e.target.value)
                          }
                          sx={{ ...muiCompactInputSx, width: "80px" }}
                          inputProps={{
                            min: 0,
                            step: "any",
                            readOnly: tipeUpah === "per_hari",
                          }}
                        />
                      </td>

                      <td className="px-3 py-2 text-center">
                        {tipeUpah === "per_hari" ? (
                          <TextField
                            type="number"
                            value={row.satuan || ""}
                            onChange={(e) =>
                              handleChange(row.id, "satuan", e.target.value)
                            }
                            sx={{ ...muiCompactInputSx, width: "120px" }}
                            inputProps={{ min: 0, step: "any" }}
                          />
                        ) : (
                          <Autocomplete
                            value={
                              unitOptions.find((u) => u.name === row.satuan) ||
                              null
                            }
                            onChange={async (_event, newValue) => {
                              if (newValue && (newValue as any).inputValue) {
                                setCreatingUnitId(row.id);
                                try {
                                  const newUnit = await quickCreateUnit(
                                    (newValue as any).inputValue
                                  );
                                  if (newUnit) {
                                    setUnitOptions((prev) => [
                                      ...prev,
                                      newUnit,
                                    ]);
                                    handleChange(
                                      row.id,
                                      "satuan",
                                      newUnit.name
                                    );
                                  }
                                } catch (err) {
                                  console.error(err);
                                } finally {
                                  setCreatingUnitId(null);
                                }
                              } else if (typeof newValue === "string") {
                                handleChange(row.id, "satuan", newValue);
                              } else {
                                handleChange(
                                  row.id,
                                  "satuan",
                                  newValue?.name || ""
                                );
                              }
                            }}
                            filterOptions={(options, params) => {
                              const filtered = unitFilter(options, params);
                              const { inputValue } = params;
                              const isExisting = options.some(
                                (option) => inputValue === option.name
                              );
                              if (inputValue !== "" && !isExisting) {
                                filtered.push({
                                  inputValue,
                                  name: `Tambah "${inputValue}"`,
                                  id: 0,
                                  isActive: true,
                                  createdAt: new Date(),
                                  updatedAt: new Date(),
                                } as any);
                              }
                              return filtered;
                            }}
                            selectOnFocus
                            clearOnBlur
                            handleHomeEndKeys
                            options={unitOptions}
                            getOptionLabel={(option) => {
                              if (typeof option === "string") return option;
                              if ((option as any).inputValue)
                                return (option as any).inputValue;
                              return option.name;
                            }}
                            renderOption={(props, option) => {
                              const { key, ...optionProps } = props;
                              return (
                                <li key={key} {...optionProps}>
                                  {option.name}
                                </li>
                              );
                            }}
                            freeSolo
                            sx={{ ...muiCompactInputSx, width: "120px" }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Satuan"
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <>
                                      {creatingUnitId === row.id ? (
                                        <CircularProgress
                                          color="inherit"
                                          size={16}
                                        />
                                      ) : null}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                          />
                        )}
                      </td>

                      <td className="px-3 py-2 text-right">
                        <TextField
                          fullWidth
                          type="number"
                          required
                          value={row.upah || ""}
                          onChange={(e) =>
                            handleChange(row.id, "upah", e.target.value)
                          }
                          sx={muiCompactInputSx}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span className="text-[10px] text-black/50">
                                  Rp
                                </span>
                              </InputAdornment>
                            ),
                          }}
                          inputProps={{ min: 0 }}
                        />
                      </td>

                      <td className="px-3 py-2 text-right font-semibold text-black/70">
                        {total.toLocaleString("id-ID")}
                      </td>

                      <td className="px-3 py-2 text-center">
                        <Tooltip title="Hapus baris">
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <DeleteRoundedIcon fontSize="small" />
                          </button>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-[var(--glass-border)] bg-black/[0.015]">
                  <td colSpan={6} className="px-3 py-3 text-right font-bold">
                    Total Semua:
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-[var(--brand)]">
                    {formatRupiah(totalSemua)}
                  </td>
                  <td className="px-3 py-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={addRow}
                className="flex items-center gap-2 text-[13px] font-semibold text-[var(--brand)] hover:text-[var(--brand-dark)] transition-colors"
              >
                <AddRoundedIcon fontSize="small" />
                Tambah Baris
              </button>
              <button
                type="button"
                onClick={() => setBulkWorkerModalOpen(true)}
                className="flex items-center gap-2 text-[13px] font-semibold text-[var(--brand)] hover:text-[var(--brand-dark)] transition-colors"
              >
                <AddRoundedIcon fontSize="small" />
                Tambah Pekerja (Banyak)
              </button>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <GlassButton
                type="button"
                variant="secondary"
                onClick={resetForm}
                disabled={saving}
                className="flex-1 md:flex-none justify-center"
              >
                Reset
              </GlassButton>
              <GlassButton
                type="submit"
                variant="primary"
                disabled={saving}
                className="flex-1 md:flex-none justify-center min-w-[120px]"
              >
                {saving ? (
                  <>
                    <CircularProgress
                      size={16}
                      color="inherit"
                      className="mr-2"
                    />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <SaveRoundedIcon fontSize="small" className="mr-2" />
                    Simpan
                  </>
                )}
              </GlassButton>
            </div>
          </div>
        </div>
      </form>

      <SafeModal
        open={bulkWorkerModalOpen}
        title="Pilih Pekerja"
        onClose={() => setBulkWorkerModalOpen(false)}
        footer={
          <div className="flex gap-2">
            <GlassButton
              variant="secondary"
              onClick={() => setBulkWorkerModalOpen(false)}
            >
              Batal
            </GlassButton>
            <GlassButton
              variant="primary"
              disabled={selectedWorkerIds.length === 0}
              onClick={handleAddSelectedWorkers}
            >
              Tambahkan
              {selectedWorkerIds.length > 0
                ? ` (${selectedWorkerIds.length})`
                : ""}
            </GlassButton>
          </div>
        }
      >
        <div className="max-h-80 w-full overflow-y-auto rounded-lg border border-[var(--glass-border)] bg-white/80">
          {workerOptions.length === 0 ? (
            <div className="px-4 py-6 text-center text-[12px] text-black/60">
              Belum ada data pekerja. Tambahkan pekerja terlebih dahulu di menu
              Master Data.
            </div>
          ) : (
            <ul className="divide-y divide-[var(--glass-border)]">
              {workerOptions.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between px-3 py-2 text-[13px]"
                >
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-black/20"
                      checked={selectedWorkerIds.includes(w.id)}
                      onChange={() => toggleWorkerSelection(w.id)}
                    />
                    <span>{w.name}</span>
                  </label>
                  {!w.isActive && (
                    <span className="text-[11px] text-black/40">Non-aktif</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </SafeModal>

      {/* Success/Preview Modal */}
      <SafeModal
        open={openPreview}
        title="Berhasil Disimpan"
        onClose={() => {
          setOpenPreview(false);
          // resetForm(); // Don't auto-reset to allow re-download
        }}
        footer={
          <div className="flex gap-2">
            <GlassButton
              variant="secondary"
              onClick={() => {
                setOpenPreview(false);
                // resetForm(); // Don't auto-reset to allow re-download
              }}
            >
              Tutup
            </GlassButton>
            <GlassButton variant="primary" onClick={handleDownloadPdf}>
              Download PDF
            </GlassButton>
          </div>
        }
      >
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <SaveRoundedIcon className="text-green-600 text-3xl" />
          </div>
          <h3 className="text-lg font-bold text-black mb-2">
            Data Produksi Tersimpan!
          </h3>
          <p className="text-black/60 text-sm mb-6 max-w-xs">
            Data produksi harian berhasil disimpan ke database. Anda dapat
            mengunduh PDF sebagai arsip.
          </p>
          <div className="bg-blue-50 text-blue-800 text-xs px-4 py-3 rounded-lg w-full text-left">
            <p className="font-semibold mb-1">ID Transaksi:</p>
            <code className="font-mono">{lastSavedId || "-"}</code>
          </div>
        </div>
      </SafeModal>
    </div>
  );
}
