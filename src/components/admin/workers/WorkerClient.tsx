"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  FormControlLabel,
  Checkbox,
  Stack,
  Alert,
  Snackbar,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { createWorker, updateWorker, deleteWorker } from "@/actions/worker-actions";
import { useRouter } from "next/navigation";
import type { WorkerDTO } from "@/actions/worker-actions";

interface WorkerClientProps {
  initialWorkers: WorkerDTO[];
}

export default function WorkerClient({ initialWorkers }: WorkerClientProps) {
  const router = useRouter();
  const [workers, setWorkers] = useState<WorkerDTO[]>(initialWorkers);
  const [open, setOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<WorkerDTO | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    setWorkers(initialWorkers);
  }, [initialWorkers]);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    isActive: true,
  });

  const handleOpen = (worker?: WorkerDTO) => {
    if (worker) {
      setEditingWorker(worker);
      setFormData({
        name: worker.name,
        role: worker.role || "",
        isActive: worker.isActive,
      });
    } else {
      setEditingWorker(null);
      setFormData({
        name: "",
        role: "",
        isActive: true,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingWorker(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("role", formData.role);
      data.append("isActive", String(formData.isActive));

      if (editingWorker) {
        await updateWorker(editingWorker.id, data);
        setSnack({ open: true, message: "Pekerja berhasil diperbarui", severity: "success" });
      } else {
        await createWorker(data);
        setSnack({ open: true, message: "Pekerja berhasil ditambahkan", severity: "success" });
      }
      
      handleClose();
      router.refresh();
    } catch {
      setSnack({ open: true, message: "Terjadi kesalahan", severity: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus pekerja ini?")) {
      try {
        await deleteWorker(id);
        setSnack({ open: true, message: "Pekerja berhasil dihapus", severity: "success" });
        router.refresh();
      } catch {
        setSnack({ open: true, message: "Gagal menghapus pekerja (mungkin sedang digunakan)", severity: "error" });
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Workers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manajemen data tenaga kerja
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ bgcolor: "var(--brand)" }}
        >
          Tambah Pekerja
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nama</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {workers.map((worker) => (
              <TableRow key={worker.id}>
                <TableCell sx={{ fontWeight: 500 }}>{worker.name}</TableCell>
                <TableCell>{worker.role || "-"}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    variant="outlined"
                    color={worker.isActive ? "success" : "default"}
                    label={worker.isActive ? "Aktif" : "Non-Aktif"}
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <IconButton size="small" onClick={() => handleOpen(worker)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(worker.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {workers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3, color: "text.secondary" }}>
                  Belum ada data pekerja.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingWorker ? "Edit Pekerja" : "Tambah Pekerja"}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Nama Lengkap"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Role / Jabatan"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="Contoh: Operator Mesin"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                    />
                  }
                  label="Status Aktif"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Batal</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: "var(--brand)" }}>
              Simpan
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
