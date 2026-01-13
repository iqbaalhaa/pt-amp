"use client";

import { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
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
import { createSale } from "@/actions/sale-actions";
import TagBadge from "@/components/TagBadge";
import { formatRupiah } from "@/lib/currency";
import { TransactionStatus } from "@/generated/prisma";

type ProductOption = { id: string; name: string; unit: string; type: "raw" | "finished" };

type Props = {
  products: ProductOption[];
};

type ItemRow = {
  productId: string;
  qty: string;
  unitPrice: string;
};

export default function SaleForm({ products }: Props) {
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
    { productId: "", qty: "", unitPrice: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const addItem = () => {
    setItems((prev) => [...prev, { productId: "", qty: "", unitPrice: "" }]);
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
    const p = parseFloat(row.unitPrice || "0");
    return isFinite(q * p) ? q * p : 0;
  };

  const grandTotal = items.reduce((sum, row) => sum + lineTotal(row), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const validItems = items.filter((r) => r.productId && r.qty && r.unitPrice);
      const payload = {
        customer: customer || null,
        date,
        status,
        notes,
        items: validItems,
      };

      await createSale(payload);
      setSnack({ open: true, message: "Sale saved successfully!", severity: "success" });
      
      // Reset form
      setCustomer("");
      setDate(defaultDate);
      setStatus("draft");
      setNotes("");
      setItems([{ productId: "", qty: "", unitPrice: "" }]);
      router.refresh();
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: "Error saving sale", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Customer Name"
              fullWidth
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              helperText="Optional (e.g. Walk-in Customer)"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              type="date"
              label="Date"
              fullWidth
              value={date}
              onChange={(e) => setDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              required
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
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addItem}
              sx={{ backgroundColor: "var(--brand)" }}
            >
              Tambah Item
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Produk</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Unit Price</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell align="right">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((row, idx) => {
                  const total = lineTotal(row);
                  return (
                    <TableRow key={idx}>
                      <TableCell sx={{ minWidth: 240 }}>
                        <TextField
                          select
                          fullWidth
                          value={row.productId}
                          onChange={(e) =>
                            updateItem(idx, "productId", e.target.value)
                          }
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
                      </TableCell>
                      <TableCell sx={{ minWidth: 140 }}>
                        <TextField
                          type="number"
                          inputProps={{ step: "0.0001" }}
                          label="Qty"
                          value={row.qty}
                          onChange={(e) => updateItem(idx, "qty", e.target.value)}
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 160 }}>
                        <TextField
                          type="number"
                          inputProps={{ step: "0.0001" }}
                          label="Unit Price"
                          value={row.unitPrice}
                          onChange={(e) =>
                            updateItem(idx, "unitPrice", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 160 }}>
                        <Typography>{formatRupiah(total, 0)}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton color="error" onClick={() => removeItem(idx)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Total: {formatRupiah(grandTotal, 0)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={
              saving ||
              items.filter((r) => r.productId && r.qty && r.unitPrice).length === 0
            }
            sx={{ backgroundColor: "var(--brand)" }}
          >
            Simpan Sale
          </Button>
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
