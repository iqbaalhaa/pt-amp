"use client";

import { useMemo, useRef, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Autocomplete,
  CircularProgress,
  Divider,
  createFilterOptions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { useRouter } from "next/navigation";
import { createSale } from "@/actions/sale-actions";
import { formatRupiah } from "@/lib/currency";
import { TransactionStatus } from "@prisma/client";
import GlassTable, { Column } from "@/components/ui/GlassTable";
import GlassButton from "@/components/ui/GlassButton";
import { Invoice, type InvoiceData } from "@/components/Invoice";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { quickCreateItemType } from "@/actions/item-type-actions";
import SuccessModal from "@/components/admin/purchases/SuccessModal";
import { authClient } from "@/lib/auth-client";

import type { ItemTypeDTO } from "@/actions/item-type-actions";

type Props = {
  itemTypes: ItemTypeDTO[];
};

type ItemRow = {
  id: string;
  itemTypeId: string;
  qty: string;
  unitPrice: string;
};

export default function SaleForm({ itemTypes }: Props) {
  const router = useRouter();

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const defaultDate = `${yyyy}-${mm}-${dd}`;

  const [customer, setCustomer] = useState<string>("");
  const [date, setDate] = useState<string>(defaultDate);
  const [status, setStatus] = useState<TransactionStatus>("draft");
  const [notes, setNotes] = useState<string>("");
  const [items, setItems] = useState<ItemRow[]>([
    { id: Math.random().toString(), itemTypeId: "", qty: "", unitPrice: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [creatingItemType, setCreatingItemType] = useState(false);
  const [localItemTypes, setLocalItemTypes] =
    useState<ItemTypeDTO[]>(itemTypes);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const filter = createFilterOptions<ItemTypeDTO>();
  const { data: session } = authClient.useSession();
  const A5_W_MM = 148;
  const A5_H_MM = 210;
  const PRINT_MARGIN_MM = 10;

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Math.random().toString(), itemTypeId: "", qty: "", unitPrice: "" },
    ]);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof ItemRow, value: string) => {
    setItems((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  };

  const findItemType = (id: string) => itemTypes.find((t) => t.id === id);

  const lineTotal = (row: ItemRow) => {
    const q = parseFloat(row.qty || "0");
    const p = parseFloat(row.unitPrice || "0");
    return isFinite(q * p) ? q * p : 0;
  };

  const grandTotal = items.reduce((sum, row) => sum + lineTotal(row), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const validItems = items.filter(
        (r) => r.itemTypeId && r.qty && r.unitPrice
      );
      if (validItems.length === 0) {
        setSnack({
          open: true,
          message: "Mohon isi minimal satu item dengan lengkap",
          severity: "error",
        });
        return;
      }
      const payload = {
        customer: customer || null,
        date,
        status,
        notes: notes || null,
        items: validItems.map(({ id, ...rest }) => rest),
      };

      const res = await createSale(payload);
      if (res && res.success) {
        setShowSuccessModal(true);
        router.refresh();
      } else {
        setSnack({
          open: true,
          message: "Gagal menyimpan penjualan",
          severity: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setSnack({
        open: true,
        message: "Terjadi kesalahan saat menyimpan penjualan",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<ItemRow>[] = [
    {
      header: "Nama Barang",
      cell: (row, idx) => (
        <Autocomplete
          value={localItemTypes.find((it) => it.id === row.itemTypeId) || null}
          onChange={async (_event, newValue) => {
            if (newValue && (newValue as any).inputValue) {
              setCreatingItemType(true);
              try {
                const newIt = await quickCreateItemType(
                  (newValue as any).inputValue
                );
                setLocalItemTypes((prev) => [...prev, newIt]);
                updateItem(idx, "itemTypeId", newIt.id);
                setSnack({
                  open: true,
                  message: `Barang "${newIt.name}" berhasil ditambahkan`,
                  severity: "success",
                });
              } catch {
                setSnack({
                  open: true,
                  message: "Gagal menambahkan barang baru",
                  severity: "error",
                });
              } finally {
                setCreatingItemType(false);
              }
            } else {
              updateItem(idx, "itemTypeId", (newValue as any)?.id || "");
            }
          }}
          filterOptions={(options, params) => {
            const filtered = filter(options, params);
            const { inputValue } = params;
            const isExisting = options.some(
              (option) => inputValue.toLowerCase() === option.name.toLowerCase()
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
          options={localItemTypes.filter((t) => t.isActive)}
          getOptionLabel={(option) => {
            if (typeof option === "string") return option;
            if ((option as any).inputValue) return (option as any).inputValue;
            return (option as ItemTypeDTO).name;
          }}
          renderOption={(props, option) => {
            const { key, ...optionProps } = props as any;
            return (
              <li key={key} {...optionProps}>
                {(option as ItemTypeDTO).name}
              </li>
            );
          }}
          size="small"
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Pilih/Cari Barang"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {creatingItemType ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      ),
      className: "min-w-[240px]",
    },
    {
      header: "Banyaknya",
      cell: (row, idx) => (
        <TextField
          type="number"
          inputProps={{ step: "0.01", style: { padding: "4px 8px" } }}
          placeholder="Qty"
          size="small"
          value={row.qty}
          onChange={(e) => updateItem(idx, "qty", e.target.value)}
          fullWidth
        />
      ),
      className: "min-w-[140px]",
    },
    {
      header: "Harga Satuan",
      cell: (row, idx) => (
        <TextField
          type="number"
          inputProps={{ step: "1", style: { padding: "4px 8px" } }}
          placeholder="Harga"
          size="small"
          value={row.unitPrice}
          onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
          fullWidth
        />
      ),
      className: "min-w-[160px]",
    },
    {
      header: "Jumlah",
      cell: (row) => (
        <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
          {formatRupiah(lineTotal(row), 0)}
        </Typography>
      ),
      className: "min-w-[160px]",
    },
    {
      header: "",
      cell: (_row, idx) => (
        <GlassButton
          variant="danger"
          size="sm"
          onClick={() => removeItem(idx)}
          className="min-w-0 p-1"
        >
          <DeleteIcon fontSize="small" />
        </GlassButton>
      ),
      className: "w-[40px]",
    },
  ];

  const invoiceItems = useMemo(() => {
    return items
      .map((item) => {
        const it = localItemTypes.find((t) => t.id === item.itemTypeId);
        const q = parseFloat(item.qty || "0");
        const c = parseFloat(item.unitPrice || "0");
        const total = isFinite(q * c) ? q * c : 0;
        return {
          productName: it ? it.name : "-",
          qty: item.qty || "0",
          unit: "-",
          price: item.unitPrice || "0",
          total: total.toString(),
        };
      })
      .filter((it) => parseFloat(it.qty) > 0 || parseFloat(it.price) > 0);
  }, [items, localItemTypes]);

  const invoiceData: InvoiceData = {
    id: "DRAFT",
    date: date || new Date().toISOString().split("T")[0],
    partyName: customer || "",
    partyType: "Customer",
    type: "Sales Invoice",
    notes: notes || null,
    items: invoiceItems,
    totalAmount: grandTotal.toString(),
    inputBy: session?.user?.name || "Admin",
  };

  const invoicePrintRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: invoicePrintRef,
  });

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
    pdf.save(`nota-penjualan-${date || "draft"}.pdf`);
  };

  const canExport = invoiceItems.length > 0;
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <SuccessModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onDownload={handleDownloadPdf}
        onNewPurchase={() => {
          setCustomer("");
          setNotes("");
          setItems([
            {
              id: Math.random().toString(),
              itemTypeId: "",
              qty: "",
              unitPrice: "",
            },
          ]);
          setShowSuccessModal(false);
        }}
        entity="Penjualan"
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack spacing={3}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="Nama Pembeli"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
              />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 2,
                }}
              >
                <TextField
                  type="date"
                  label="Tanggal"
                  fullWidth
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="Catatan"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Box>
            </Box>

            <Box>
              <Box sx={{ overflowX: "auto" }}>
                <GlassTable columns={columns} data={items} />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 2,
                }}
              >
                <GlassButton
                  type="button"
                  variant="secondary"
                  onClick={addItem}
                  size="sm"
                >
                  <AddIcon className="mr-1" fontSize="small" />
                  Tambah Baris
                </GlassButton>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Total: {formatRupiah(grandTotal, 0)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <GlassButton type="submit" variant="primary" disabled={saving}>
                <SaveIcon className="mr-2" fontSize="small" />
                Simpan Penjualan
              </GlassButton>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            flexShrink: 0,
            width: { md: 420 },
            minWidth: 0,
          }}
        >
          <Box sx={{ position: { md: "sticky" }, top: { md: 20 } }}>
            <Stack spacing={1.5}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Preview Nota (1/2 A4)
              </Typography>
              <Stack direction="row" spacing={1}>
                <GlassButton
                  type="button"
                  variant="secondary"
                  onClick={handleDownloadPdf}
                  disabled={!canExport}
                >
                  Download
                </GlassButton>
                <GlassButton
                  type="button"
                  variant="secondary"
                  onClick={handlePrint}
                  disabled={!canExport}
                >
                  Cetak
                </GlassButton>
              </Stack>
              <Divider />
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: `${A5_W_MM} / ${A5_H_MM}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "background.paper",
                  borderRadius: 2,
                  boxShadow: 1,
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    overflow: "auto",
                  }}
                >
                  <div ref={invoicePrintRef as any}>
                    <div
                      style={{
                        transformOrigin: "top left",
                        width: `${A5_W_MM}mm`,
                      }}
                    >
                      <Invoice data={invoiceData} />
                    </div>
                  </div>
                </Box>
              </Box>
              {!canExport && (
                <Typography variant="caption" color="text.secondary">
                  Lengkapi minimal satu baris Qty & Harga agar nota bisa
                  di-download atau dicetak.
                </Typography>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
