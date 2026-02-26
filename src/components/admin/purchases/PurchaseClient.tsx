"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Autocomplete,
  Button,
  CircularProgress,
  createFilterOptions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { createPurchase } from "@/actions/purchase-actions";
import { formatRupiah } from "@/lib/currency";
// Removed direct import of TransactionStatus from @prisma/client to avoid build errors in client components
// import { TransactionStatus } from "@prisma/client";
import PageHeader from "@/components/ui/PageHeader";
import {
  Invoice as InvoiceComponent,
  type InvoiceData,
} from "@/components/Invoice";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  type ItemTypeDTO,
  getItemTypes,
  quickCreateItemType,
} from "@/actions/item-type-actions";
import {
  type SupplierDTO,
  getSuppliers,
  quickCreateSupplier,
} from "@/actions/supplier-actions";
import SuccessModal from "./SuccessModal";
import { authClient } from "@/lib/auth-client";

// Icons
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import StickyNote2RoundedIcon from "@mui/icons-material/StickyNote2Rounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import NumbersRoundedIcon from "@mui/icons-material/NumbersRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import SummarizeRoundedIcon from "@mui/icons-material/SummarizeRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import StoreRoundedIcon from "@mui/icons-material/StoreRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const filter = createFilterOptions<ItemTypeDTO>();
const supplierFilter = createFilterOptions<SupplierDTO>();

type ItemRow = {
  id: string; // internal client-side id for keys
  itemTypeId: string;
  qty: string;
  unitCost: string;
};

// A5 (1/2 A4) portrait: 148mm × 210mm
const A5_W_MM = 148;
const A5_H_MM = 210;
const PRINT_MARGIN_MM = 10;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// Define local TransactionStatus to avoid importing from @prisma/client
const TransactionStatus = {
  draft: "draft",
  posted: "posted",
  cancelled: "cancelled",
} as const;

type TransactionStatus =
  (typeof TransactionStatus)[keyof typeof TransactionStatus];

export default function PurchaseClient() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  // Data State
  const [itemTypes, setItemTypes] = useState<ItemTypeDTO[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form State
  const [supplierId, setSupplierId] = useState<string>("");
  const [date, setDate] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<TransactionStatus>(
    TransactionStatus.posted
  );
  const [notes, setNotes] = useState<string>("");
  const [items, setItems] = useState<ItemRow[]>([
    {
      id: Math.random().toString(),
      itemTypeId: "",
      qty: "",
      unitCost: "",
    },
  ]);

  // UI State
  const [creatingItemType, setCreatingItemType] = useState(false);
  const [creatingSupplier, setCreatingSupplier] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Refs
  const invoicePrintRef = useRef<HTMLDivElement>(null);

  // Load Initial Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [it, s] = await Promise.all([getItemTypes(), getSuppliers()]);
        setItemTypes(it);
        setSuppliers(s);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // Derived State
  const activeItemTypes = useMemo(
    () => itemTypes.filter((t) => t.isActive),
    [itemTypes]
  );
  const activeSuppliers = useMemo(
    () => suppliers.filter((s) => s.isActive),
    [suppliers]
  );

  // Handlers
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        itemTypeId: "",
        qty: "",
        unitCost: "",
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) {
      setItems([
        {
          id: Math.random().toString(),
          itemTypeId: "",
          qty: "",
          unitCost: "",
        },
      ]);
      return;
    }
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const updateItem = (id: string, field: keyof ItemRow, value: string) => {
    setItems((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const lineTotal = (row: ItemRow) => {
    const q = parseFloat(row.qty || "0");
    const c = parseFloat(row.unitCost || "0");
    return isFinite(q * c) ? q * c : 0;
  };

  const grandTotal = useMemo(
    () => items.reduce((sum, row) => sum + lineTotal(row), 0),
    [items]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId) {
      alert("Nama Pemilik Barang (Supplier) wajib diisi");
      return;
    }

    if (!date) {
      alert("Tanggal wajib diisi");
      return;
    }

    setSaving(true);
    try {
      const validItems = items.filter(
        (r) => r.itemTypeId && r.qty && r.unitCost
      );

      if (validItems.length === 0) {
        alert("Mohon isi minimal satu item dengan lengkap");
        setSaving(false);
        return;
      }

      const payload = {
        supplier: suppliers.find((s) => s.id === supplierId)?.name || null,
        date,
        status,
        notes: notes || null,
        items: validItems.map(({ id, ...rest }) => rest),
      };

      const res = await createPurchase(payload);
      if (res && res.success) {
        setShowSuccessModal(true);
        router.refresh();
      } else {
        alert("Gagal membuat purchase");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const handleNewPurchase = () => {
    setSupplierId("");
    setNotes("");
    setItems([
      {
        id: Math.random().toString(),
        itemTypeId: "",
        qty: "",
        unitCost: "",
      },
    ]);
    setShowSuccessModal(false);
  };

  // Invoice Logic
  const invoiceItems = useMemo(() => {
    return items
      .map((item) => {
        const it = itemTypes.find((t) => t.id === item.itemTypeId);
        const q = parseFloat(item.qty || "0");
        const c = parseFloat(item.unitCost || "0");
        const total = isFinite(q * c) ? q * c : 0;

        return {
          productName: it ? it.name : "-",
          qty: item.qty || "0",
          unit: it?.unit || "-",
          price: item.unitCost || "0",
          total: total.toString(),
        };
      })
      .filter((it) => parseFloat(it.qty) > 0 || parseFloat(it.price) > 0);
  }, [items, itemTypes]);

  const invoiceData: InvoiceData = {
    id: "DRAFT",
    date: date || new Date().toISOString().split("T")[0],
    partyName: suppliers.find((s) => s.id === supplierId)?.name || "",
    partyType: "Supplier",
    type: "Purchase Invoice",
    notes: notes || null,
    items: invoiceItems,
    totalAmount: grandTotal.toString(),
    inputBy: session?.user?.name || "Admin",
  };

  // We need the Invoice component to be available in the scope for hidden rendering
  const InvoiceComponent = require("@/components/Invoice").Invoice;

  const handleDownloadPdf = async () => {
    if (!invoicePrintRef.current) return;

    const canvas = await html2canvas(invoicePrintRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: invoicePrintRef.current.scrollWidth,
      windowHeight: invoicePrintRef.current.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: [A5_W_MM, A5_H_MM],
    });

    const pageW = A5_W_MM;
    const pageH = A5_H_MM;
    const margin = PRINT_MARGIN_MM;

    const contentW = pageW - margin * 2;
    const contentH = pageH - margin * 2;

    const imgHeightMm = (canvas.height * contentW) / canvas.width;

    let heightLeft = imgHeightMm;
    let offsetY = 0;

    pdf.addImage(imgData, "PNG", margin, margin, contentW, imgHeightMm);
    heightLeft -= contentH;

    while (heightLeft > 0) {
      offsetY += contentH;
      pdf.addPage([pageW, pageH], "p");
      pdf.addImage(
        imgData,
        "PNG",
        margin,
        margin - offsetY,
        contentW,
        imgHeightMm
      );
      heightLeft -= contentH;
    }

    pdf.save(`nota-purchase-${date || "draft"}.pdf`);
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
        title="Pembelian"
        icon={
          <ShoppingCartRoundedIcon
            sx={{ fontSize: 24 }}
            className="text-[var(--brand)]"
          />
        }
        actions={
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
        }
      />

      <SuccessModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onDownload={handleDownloadPdf}
        onNewPurchase={handleNewPurchase}
        entity="Pembelian"
      />

      {/* Hidden Invoice for generating PDF */}
      <div className="absolute left-[-9999px] top-0">
        <div ref={invoicePrintRef}>
          <div
            style={{
              width: `${A5_W_MM}mm`,
              minHeight: `${A5_H_MM}mm`,
              padding: "20px",
              backgroundColor: "white",
            }}
          >
            <InvoiceComponent data={invoiceData} />
          </div>
        </div>
      </div>

      <div className="flex flex-col 2xl:flex-row gap-6 items-start">
        {/* Left Side: Form */}
        <div className="flex-1 w-full min-w-0">
          <form onSubmit={handleSubmit}>
            <div className="w-full border border-[var(--glass-border)] bg-white rounded-xl p-4 md:p-5">
              {/* Top Controls */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-3">
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

                <div className="md:col-span-4">
                  <label className="text-[11px] font-semibold text-black/70 flex items-center gap-1.5 mb-1">
                    <StoreRoundedIcon
                      sx={{ fontSize: 16 }}
                      className="text-[var(--brand)]"
                    />
                    Supplier <span className="text-red-500">*</span>
                  </label>
                  <Autocomplete
                    value={
                      activeSuppliers.find((s) => s.id === supplierId) || null
                    }
                    onChange={async (event, newValue) => {
                      if (newValue && (newValue as any).inputValue) {
                        setCreatingSupplier(true);
                        try {
                          const newSup = await quickCreateSupplier(
                            (newValue as any).inputValue
                          );
                          setSuppliers((prev) => [...prev, newSup]);
                          setSupplierId(newSup.id);
                        } catch (err) {
                          alert("Gagal menambahkan supplier");
                        } finally {
                          setCreatingSupplier(false);
                        }
                      } else {
                        setSupplierId(newValue?.id || "");
                      }
                    }}
                    filterOptions={(options, params) => {
                      const filtered = supplierFilter(options, params);
                      const { inputValue } = params;
                      const isExisting = options.some(
                        (option) =>
                          inputValue.toLowerCase() === option.name.toLowerCase()
                      );
                      if (inputValue !== "" && !isExisting) {
                        filtered.push({
                          inputValue,
                          name: `Tambah "${inputValue}"`,
                        } as any);
                      }
                      return filtered;
                    }}
                    selectOnFocus
                    clearOnBlur
                    handleHomeEndKeys
                    options={activeSuppliers}
                    getOptionLabel={(option) => {
                      if (typeof option === "string") return option;
                      if ((option as any).inputValue)
                        return (option as any).inputValue;
                      return option.name;
                    }}
                    renderOption={(props, option) => {
                      const { key, ...optionProps } = props as any;
                      return (
                        <li key={key} {...optionProps}>
                          {option.name}
                        </li>
                      );
                    }}
                    size="small"
                    fullWidth
                    sx={muiCompactInputSx}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Pilih Supplier"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {creatingSupplier ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
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
                    placeholder="Contoh: Pembelian stok bulanan"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--glass-border)] bg-transparent">
                <table className="w-full text-[12px] text-left">
                  <thead className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-[var(--glass-border)]">
                    <tr className="text-[11px] font-extrabold tracking-wide text-black/75 uppercase">
                      <th className="px-2 py-3 w-10 text-center">
                        <span className="inline-flex items-center justify-center gap-1">
                          <NumbersRoundedIcon
                            sx={{ fontSize: 16 }}
                            className="text-black/45"
                          />
                          No
                        </span>
                      </th>
                      <th className="px-2 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <InventoryRoundedIcon
                            sx={{ fontSize: 16 }}
                            className="text-black/45"
                          />
                          Nama Barang <span className="text-red-500">*</span>
                        </span>
                      </th>
                      <th className="px-2 py-3 w-[100px]">
                        <span className="inline-flex items-center gap-1.5">
                          <CategoryRoundedIcon
                            sx={{ fontSize: 16 }}
                            className="text-black/45"
                          />
                          Satuan
                        </span>
                      </th>
                      <th className="px-2 py-3 text-center w-[80px]">
                        <span className="inline-flex items-center gap-1.5 justify-center">
                          <NumbersRoundedIcon
                            sx={{ fontSize: 16 }}
                            className="text-black/45"
                          />
                          Qty <span className="text-red-500">*</span>
                        </span>
                      </th>
                      <th className="px-2 py-3 text-right w-[120px]">
                        <span className="inline-flex items-center gap-1.5 justify-end w-full">
                          <PaymentsRoundedIcon
                            sx={{ fontSize: 16 }}
                            className="text-black/45"
                          />
                          Harga (@) <span className="text-red-500">*</span>
                        </span>
                      </th>
                      <th className="px-2 py-3 text-right w-[130px]">
                        <span className="inline-flex items-center gap-1.5 justify-end w-full">
                          <SummarizeRoundedIcon
                            sx={{ fontSize: 16 }}
                            className="text-black/45"
                          />
                          Total
                        </span>
                      </th>
                      <th className="px-2 py-3 w-12 text-center">Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((row, idx) => {
                      const total = lineTotal(row);

                      return (
                        <tr
                          key={row.id}
                          className="border-b border-[var(--glass-border)] hover:bg-black/[0.02] transition-colors"
                        >
                          <td className="px-2 py-2 text-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-[var(--glass-border)] bg-white/70 text-[12px] font-semibold">
                              {idx + 1}
                            </span>
                          </td>

                          <td className="px-2 py-2">
                            <Autocomplete
                              value={
                                activeItemTypes.find(
                                  (it) => it.id === row.itemTypeId
                                ) || null
                              }
                              onChange={async (event, newValue) => {
                                if (newValue && (newValue as any).inputValue) {
                                  setCreatingItemType(true);
                                  try {
                                    const newIt = await quickCreateItemType(
                                      (newValue as any).inputValue
                                    );
                                    setItemTypes((prev) => [...prev, newIt]);
                                    updateItem(row.id, "itemTypeId", newIt.id);
                                  } catch (err) {
                                    alert("Gagal menambahkan barang");
                                  } finally {
                                    setCreatingItemType(false);
                                  }
                                } else {
                                  updateItem(
                                    row.id,
                                    "itemTypeId",
                                    newValue?.id || ""
                                  );
                                }
                              }}
                              filterOptions={(options, params) => {
                                const filtered = filter(options, params);
                                const { inputValue } = params;
                                const isExisting = options.some(
                                  (option) =>
                                    inputValue.toLowerCase() ===
                                    option.name.toLowerCase()
                                );
                                if (inputValue !== "" && !isExisting) {
                                  filtered.push({
                                    inputValue,
                                    name: `Tambah "${inputValue}"`,
                                  } as any);
                                }
                                return filtered;
                              }}
                              selectOnFocus
                              clearOnBlur
                              handleHomeEndKeys
                              options={activeItemTypes}
                              getOptionLabel={(option) => {
                                if (typeof option === "string") return option;
                                if ((option as any).inputValue)
                                  return (option as any).inputValue;
                                return option.name;
                              }}
                              renderOption={(props, option) => {
                                const { key, ...optionProps } = props as any;
                                return (
                                  <li key={key} {...optionProps}>
                                    {option.name}
                                  </li>
                                );
                              }}
                              size="small"
                              fullWidth
                              sx={muiCompactInputSx}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Pilih/Cari Barang"
                                />
                              )}
                            />
                          </td>

                          <td className="px-3 py-2">
                            <div
                              className={cx(
                                "w-full h-[38px] px-3 flex items-center rounded-lg",
                                "border border-[var(--glass-border)] bg-black/[0.03] text-[12px] text-black/60"
                              )}
                            >
                              {activeItemTypes.find(
                                (it) => it.id === row.itemTypeId
                              )?.unit || "-"}
                            </div>
                          </td>

                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={row.qty}
                              onChange={(e) =>
                                updateItem(row.id, "qty", e.target.value)
                              }
                              placeholder="0"
                              className={cx(
                                "w-full h-[38px] px-3 rounded-lg text-center",
                                "border border-[var(--glass-border)] bg-white/80 text-[12px]",
                                "outline-none focus:ring-2 focus:ring-[var(--brand)]/25 focus:border-[var(--brand)]"
                              )}
                            />
                          </td>

                          <td className="px-2 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={row.unitCost}
                              onChange={(e) =>
                                updateItem(row.id, "unitCost", e.target.value)
                              }
                              placeholder="0"
                              className={cx(
                                "w-full h-[38px] px-3 rounded-lg text-right",
                                "border border-[var(--glass-border)] bg-white/80 text-[12px]",
                                "outline-none focus:ring-2 focus:ring-[var(--brand)]/25 focus:border-[var(--brand)]"
                              )}
                            />
                          </td>

                          <td className="px-2 py-2">
                            <div
                              className={cx(
                                "w-full h-[38px] px-3 rounded-lg flex items-center justify-end text-[12px]",
                                "border border-transparent bg-black/[0.03] text-black/60 font-medium"
                              )}
                            >
                              {formatRupiah(total)}
                            </div>
                          </td>

                          <td className="px-2 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(row.id)}
                              className={cx(
                                "inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                                "text-red-500 hover:bg-red-50"
                              )}
                              title="Hapus baris"
                            >
                              <DeleteRoundedIcon fontSize="small" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Footer / Total Row */}
                    <tr className="border-t-2 border-[var(--glass-border)] bg-white/50">
                      <td
                        colSpan={5}
                        className="px-3 py-3 text-right font-bold"
                      >
                        Total Keseluruhan
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-[var(--brand)] text-sm">
                        {formatRupiah(grandTotal, 0)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={addItem}
                          className={cx(
                            "inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                            "bg-[var(--brand)] text-white hover:bg-[var(--brand)]/90 shadow-sm"
                          )}
                          title="Tambah baris"
                        >
                          <AddRoundedIcon fontSize="small" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className={cx(
                    "inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all",
                    "bg-gradient-to-r from-[var(--brand)] to-blue-600 hover:shadow-blue-500/25 active:scale-[0.98]",
                    saving ? "opacity-70 cursor-not-allowed" : ""
                  )}
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
                      <SummarizeRoundedIcon fontSize="small" />
                      Simpan Pembelian
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Side: Live Preview */}
        <div className="w-full 2xl:w-[400px] shrink-0 sticky top-6">
          <div className="bg-white rounded-xl border border-[var(--glass-border)] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-700 text-sm">
                Live Preview
              </h3>
              <div className="text-[10px] text-gray-400">A5 Portrait</div>
            </div>
            <div className="p-4 bg-gray-100/50 flex justify-center overflow-auto min-h-[300px] max-h-[calc(100vh-200px)]">
              <div
                className="bg-white shadow-lg origin-top"
                style={{
                  width: `${A5_W_MM}mm`,
                  minHeight: `${A5_H_MM}mm`,
                  padding: "20px",
                  transform: "scale(0.65)", // Scaled down for preview
                }}
              >
                <InvoiceComponent data={invoiceData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
