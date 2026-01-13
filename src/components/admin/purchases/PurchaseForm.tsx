"use client";

import { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { useRouter } from "next/navigation";
import { createPurchase } from "@/actions/purchase-actions";
import TagBadge from "@/components/TagBadge";
import { formatRupiah } from "@/lib/currency";
import { TransactionStatus } from "@/generated/prisma";
import GlassTable, { Column } from "@/components/ui/GlassTable";
import GlassButton from "@/components/ui/GlassButton";

type ProductOption = { id: string; name: string; unit: string; type: "raw" | "finished" };

type Props = {
  products: ProductOption[];
};

type ItemRow = {
  productId: string;
  qty: string;
  unitCost: string;
};

export default function PurchaseForm({ products }: Props) {
  const router = useRouter();

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const defaultDate = `${yyyy}-${mm}-${dd}`;

  const [supplier, setSupplier] = useState<string>("");
  const [date, setDate] = useState<string>(defaultDate);
  const [status, setStatus] = useState<TransactionStatus>("draft");
  const [notes, setNotes] = useState<string>("");
  const [items, setItems] = useState<ItemRow[]>([
    { productId: "", qty: "", unitCost: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const addItem = () => {
    setItems((prev) => [...prev, { productId: "", qty: "", unitCost: "" }]);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof ItemRow, value: string) => {
    setItems((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  };

  const findProduct = (id: string) => products.find((p) => p.id === id);

  const lineTotal = (row: ItemRow) => {
    const q = parseFloat(row.qty || "0");
    const c = parseFloat(row.unitCost || "0");
    return isFinite(q * c) ? q * c : 0;
  };

  const grandTotal = items.reduce((sum, row) => sum + lineTotal(row), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const validItems = items.filter((r) => r.productId && r.qty && r.unitCost);
      const payload = {
        supplier: supplier || null,
        date,
        status,
        notes: notes || null,
        items: validItems,
      };
      const res = await createPurchase(payload);
      if (res && res.success) {
        setSnack({ open: true, message: "Purchase berhasil dibuat", severity: "success" });
        setSupplier("");
        setDate(defaultDate);
        setStatus("draft");
        setNotes("");
        setItems([{ productId: "", qty: "", unitCost: "" }]);
        router.refresh();
      } else {
        setSnack({ open: true, message: "Gagal membuat purchase", severity: "error" });
      }
    } catch {
      setSnack({ open: true, message: "Terjadi kesalahan", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<ItemRow>[] = [
    {
      header: "Produk",
      cell: (row, idx) => (
        <TextField
          select
          fullWidth
          value={row.productId}
          onChange={(e) => updateItem(idx, "productId", e.target.value)}
          label="Produk"
          SelectProps={{
            renderValue: (selected) => {
              const sel = products.find((pr) => pr.id === String(selected));
              if (!sel) return "";
              return (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ mr: 1 }}>{sel.name}</Typography>
                  <TagBadge label={sel.unit} color="info" />
                  <TagBadge
                    label={sel.type === "raw" ? "Raw" : "Finished"}
                    color={sel.type === "raw" ? "warning" : "success"}
                  />
                </Stack>
              );
            },
          }}
        >
          {products.map((pr) => (
            <MenuItem key={pr.id} value={pr.id}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ mr: 1 }}>{pr.name}</Typography>
                <TagBadge label={pr.unit} color="info" />
                <TagBadge
                  label={pr.type === "raw" ? "Raw" : "Finished"}
                  color={pr.type === "raw" ? "warning" : "success"}
                />
              </Stack>
            </MenuItem>
          ))}
        </TextField>
      ),
      className: "min-w-[240px]",
    },
    {
      header: "Qty",
      cell: (row, idx) => (
        <TextField
          type="number"
          inputProps={{ step: "0.0001" }}
          label="Qty"
          value={row.qty}
          onChange={(e) => updateItem(idx, "qty", e.target.value)}
        />
      ),
      className: "min-w-[140px]",
    },
    {
      header: "Unit Cost",
      cell: (row, idx) => (
        <TextField
          type="number"
          inputProps={{ step: "0.0001" }}
          label="Unit Cost"
          value={row.unitCost}
          onChange={(e) => updateItem(idx, "unitCost", e.target.value)}
        />
      ),
      className: "min-w-[160px]",
    },
    {
      header: "Total",
      cell: (row) => formatRupiah(lineTotal(row), 0),
      className: "min-w-[160px]",
    },
  ];

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Supplier (ID/Nama manual)"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              type="date"
              label="Tanggal"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <ToggleButtonGroup
              exclusive
              value={status}
              onChange={(_e, val) => val && setStatus(val)}
              size="small"
              sx={{ mt: { xs: 1, md: 0 } }}
            >
              <ToggleButton value="draft">Draft</ToggleButton>
              <ToggleButton value="posted">Posted</ToggleButton>
              <ToggleButton value="cancelled">Cancelled</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>

        <TextField
          label="Catatan"
          multiline
          minRows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Items
            </Typography>
            <GlassButton onClick={addItem}>
              <AddIcon className="mr-2" fontSize="small" />
              Tambah Item
            </GlassButton>
          </Box>

          <GlassTable
            columns={columns}
            data={items}
            actions={(row, idx) => (
              <GlassButton variant="danger" size="icon" onClick={() => removeItem(idx)}>
                <DeleteIcon fontSize="small" />
              </GlassButton>
            )}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Total: {formatRupiah(grandTotal, 0)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <GlassButton
            type="submit"
            variant="primary"
            disabled={
              saving ||
              items.filter((r) => r.productId && r.qty && r.unitCost).length === 0
            }
          >
            <SaveIcon className="mr-2" fontSize="small" />
            Simpan Purchase
          </GlassButton>
        </Box>
      </Stack>

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
