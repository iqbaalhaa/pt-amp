"use client";

import { useState } from "react";
import { Box, Stack, Typography, TextField, Button } from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

type ItemRow = {
  purpose: string;
  amount: string;
};

export default function ExpenseForm({ inputBy }: { inputBy: string | null }) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const defaultDate = `${yyyy}-${mm}-${dd}`;

  const [date, setDate] = useState(defaultDate);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemRow[]>([{ purpose: "", amount: "" }]);

  const addRow = () => setItems((rows) => [...rows, { purpose: "", amount: "" }]);
  const removeRow = (idx: number) =>
    setItems((rows) => rows.filter((_, i) => i !== idx));
  const updateRow = (idx: number, key: keyof ItemRow, value: string) =>
    setItems((rows) => rows.map((r, i) => (i === idx ? { ...r, [key]: value } : r)));

  const total = items.reduce((sum, r) => {
    const v = parseFloat(r.amount || "0");
    return sum + (isFinite(v) ? v : 0);
  }, 0);

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Dibuat oleh: {inputBy || "-"}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="Tanggal"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <TextField
            fullWidth
            label="Catatan"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Grid>
      </Grid>

      <Box>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>Rincian</Typography>
        <Stack spacing={1}>
          {items.map((row, idx) => (
            <Grid key={idx} container spacing={1} alignItems="center">
              <Grid size={{ xs: 12, md: 7 }}>
                <TextField
                  fullWidth
                  label="Keperluan"
                  value={row.purpose}
                  onChange={(e) => updateRow(idx, "purpose", e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 9, md: 3 }}>
                <TextField
                  fullWidth
                  label="Jumlah"
                  type="number"
                  value={row.amount}
                  onChange={(e) => updateRow(idx, "amount", e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 3, md: 2 }}>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => removeRow(idx)}
                  disabled={items.length === 1}
                  fullWidth
                >
                  <DeleteIcon fontSize="small" />
                </Button>
              </Grid>
            </Grid>
          ))}
          <div>
            <Button variant="outlined" onClick={addRow} startIcon={<AddIcon />}>
              Tambah Baris
            </Button>
          </div>
        </Stack>
      </Box>

      <Box className="flex items-center justify-between">
        <Typography>Total</Typography>
        <Typography sx={{ fontWeight: 800 }}>
          Rp {total.toLocaleString("id-ID")}
        </Typography>
      </Box>

      <div className="flex gap-2">
        <Button variant="contained" color="primary" disabled>
          Simpan
        </Button>
        <Button variant="outlined">Reset</Button>
      </div>
    </Stack>
  );
}
