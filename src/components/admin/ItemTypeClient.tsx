"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  Tooltip,
  MenuItem,
  Button,
  Chip,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import NumbersRoundedIcon from "@mui/icons-material/NumbersRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import ToggleOnRoundedIcon from "@mui/icons-material/ToggleOnRounded";
import ScaleRoundedIcon from "@mui/icons-material/ScaleRounded";

import { useRouter } from "next/navigation";

import {
  createItemType,
  updateItemType,
  deleteItemType,
  deleteItemTypes,
} from "@/actions/item-type-actions";
import type { ItemTypeDTO } from "@/actions/item-type-actions";

import PageHeader from "@/components/ui/PageHeader";
import GlassButton from "@/components/ui/GlassButton";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";

interface ItemTypeClientProps {
  initialItemTypes: ItemTypeDTO[];
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function ItemTypeClient({
  initialItemTypes,
}: ItemTypeClientProps) {
  const router = useRouter();

  const [itemTypes, setItemTypes] = useState<ItemTypeDTO[]>(initialItemTypes);
  const [open, setOpen] = useState(false);
  const [editingItemType, setEditingItemType] = useState<ItemTypeDTO | null>(
    null
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
    variant?: "danger" | "primary";
    confirmText?: string;
  } | null>(null);

  useEffect(() => {
    setItemTypes(initialItemTypes);
  }, [initialItemTypes]);

  // Bersihin selectedIds kalau data berubah (misal row terhapus)
  useEffect(() => {
    const alive = new Set(itemTypes.map((x) => x.id));
    setSelectedIds((prev) => prev.filter((id) => alive.has(id)));
  }, [itemTypes]);

  const isAllSelected =
    itemTypes.length > 0 && selectedIds.length === itemTypes.length;

  const handleSelectAll = () => {
    if (isAllSelected) setSelectedIds([]);
    else setSelectedIds(itemTypes.map((it) => it.id));
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const openConfirm = (cfg: {
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
    variant?: "danger" | "primary";
    confirmText?: string;
  }) => {
    setConfirmConfig(cfg);
    setConfirmOpen(true);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    openConfirm({
      title: "Hapus Masal",
      message: `Apakah Anda yakin ingin menghapus ${selectedIds.length} jenis barang terpilih?`,
      variant: "danger",
      onConfirm: async () => {
        // optimistic update
        const toDelete = new Set(selectedIds);
        setItemTypes((prev) => prev.filter((x) => !toDelete.has(x.id)));
        setSelectedIds([]);

        await deleteItemTypes(Array.from(toDelete));
        router.refresh();
      },
    });
  };

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    unit: "kg",
    image: "",
    isPublic: false,
    isActive: true,
  });

  const handleOpen = (itemType?: ItemTypeDTO) => {
    if (itemType) {
      setEditingItemType(itemType);
      setFormData({
        name: itemType.name,
        description: itemType.description || "",
        type: itemType.type || "",
        unit: itemType.unit || "kg",
        image: itemType.image || "",
        isPublic: itemType.isPublic,
        isActive: itemType.isActive,
      });
    } else {
      setEditingItemType(null);
      setFormData({
        name: "",
        description: "",
        type: "",
        unit: "kg",
        image: "",
        isPublic: false,
        isActive: true,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingItemType(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    openConfirm({
      title: editingItemType ? "Simpan Perubahan" : "Simpan Data",
      message: editingItemType
        ? "Apakah Anda yakin ingin menyimpan perubahan pada jenis barang ini?"
        : "Apakah Anda yakin ingin menambahkan jenis barang baru?",
      variant: "primary",
      confirmText: "Simpan",
      onConfirm: async () => {
        const data = new FormData();
        data.append("name", formData.name.trim());
        data.append("description", formData.description);
        data.append("type", formData.type);
        data.append("unit", formData.unit);
        data.append("image", formData.image);
        data.append("isPublic", String(formData.isPublic));
        data.append("isActive", String(formData.isActive));

        if (editingItemType) {
          await updateItemType(editingItemType.id, data);
        } else {
          await createItemType(data);
        }

        handleClose();
        router.refresh();
      },
    });
  };

  const handleDelete = (id: string) => {
    openConfirm({
      title: "Hapus Jenis",
      message: "Apakah Anda yakin ingin menghapus jenis barang ini?",
      variant: "danger",
      onConfirm: async () => {
        // optimistic update
        setItemTypes((prev) => prev.filter((x) => x.id !== id));
        setSelectedIds((prev) => prev.filter((x) => x !== id));

        await deleteItemType(id);
        router.refresh();
      },
    });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Jenis Barang"
        subtitle="Master data label untuk barang produksi, bahan baku, atau hasil olahan."
        actions={
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                className={cx(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold",
                  "border border-red-200 bg-red-50 text-red-700 shadow-sm",
                  "hover:bg-red-100 active:scale-[0.99] transition"
                )}
              >
                <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                <span>Hapus ({selectedIds.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSelectAll}
              disabled={itemTypes.length === 0}
              className={cx(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold",
                "border border-[var(--glass-border)] bg-white/70 backdrop-blur shadow-sm",
                "hover:bg-white/90 active:scale-[0.99] transition disabled:opacity-50"
              )}
            >
              <span>{isAllSelected ? "Batal Pilih" : "Pilih Semua"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpen()}
              className={cx(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold",
                "bg-[var(--brand)] text-white shadow-sm shadow-red-200",
                "hover:bg-red-700 active:scale-[0.99] transition"
              )}
            >
              <AddRoundedIcon sx={{ fontSize: 18 }} />
              <span>Tambah Label</span>
            </button>
          </div>
        }
      />

      <div className="w-full border border-[var(--glass-border)] bg-transparent rounded-xl p-4 md:p-5">
        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-[var(--glass-border)] bg-transparent">
          <table className="w-full min-w-[800px] text-[12px] text-left">
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
                <th className="px-3 py-3 w-12 text-center">
                  <Checkbox
                    size="small"
                    checked={isAllSelected && itemTypes.length > 0}
                    indeterminate={
                      selectedIds.length > 0 &&
                      selectedIds.length < itemTypes.length
                    }
                    onChange={handleSelectAll}
                    sx={{ p: 0 }}
                  />
                </th>
                <th className="px-3 py-3">
                  <span className="inline-flex items-center gap-1.5">
                    <CategoryRoundedIcon
                      sx={{ fontSize: 16 }}
                      className="text-black/45"
                    />
                    Nama Jenis
                  </span>
                </th>
                <th className="px-3 py-3 w-32">
                  <span className="inline-flex items-center gap-1.5">
                    <ScaleRoundedIcon
                      sx={{ fontSize: 16 }}
                      className="text-black/45"
                    />
                    Satuan
                  </span>
                </th>
                <th className="px-3 py-3 w-32 text-center">
                  <span className="inline-flex items-center gap-1.5 justify-center">
                    <ToggleOnRoundedIcon
                      sx={{ fontSize: 16 }}
                      className="text-black/45"
                    />
                    Status
                  </span>
                </th>
                <th className="px-3 py-3 w-32 text-center">
                  <span className="inline-flex items-center gap-1.5 justify-center">
                    <PublicRoundedIcon
                      sx={{ fontSize: 16 }}
                      className="text-black/45"
                    />
                    Akses
                  </span>
                </th>
                <th className="px-3 py-3 w-24 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {itemTypes.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-zinc-400 italic"
                  >
                    Belum ada data jenis barang.
                  </td>
                </tr>
              ) : (
                itemTypes.map((row, idx) => (
                  <tr
                    key={row.id}
                    onClick={() => handleToggleSelect(row.id)}
                    className="border-b border-[var(--glass-border)] hover:bg-black/[0.02] transition-colors cursor-pointer"
                  >
                    <td className="px-3 py-2 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-[var(--glass-border)] bg-white/70 text-[12px] font-semibold">
                        {idx + 1}
                      </span>
                    </td>
                    <td
                      className="px-3 py-2 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        size="small"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => handleToggleSelect(row.id)}
                        sx={{ p: 0 }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-bold text-zinc-800 uppercase">
                        {row.name}
                      </div>
                      {row.description && (
                        <div className="text-[10px] text-zinc-500 truncate max-w-[200px]">
                          {row.description}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Chip
                        size="small"
                        label={row.unit || "kg"}
                        variant="outlined"
                        sx={{
                          height: 24,
                          fontSize: "10px",
                          fontWeight: 600,
                          borderRadius: "6px",
                        }}
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Chip
                        size="small"
                        label={row.isActive ? "Aktif" : "Nonaktif"}
                        color={row.isActive ? "success" : "default"}
                        variant={row.isActive ? "filled" : "outlined"}
                        sx={{
                          height: 24,
                          fontSize: "10px",
                          fontWeight: 600,
                          borderRadius: "6px",
                        }}
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Chip
                        size="small"
                        label={row.isPublic ? "Publik" : "Privat"}
                        color={row.isPublic ? "primary" : "default"}
                        variant={row.isPublic ? "filled" : "outlined"}
                        sx={{
                          height: 24,
                          fontSize: "10px",
                          fontWeight: 600,
                          borderRadius: "6px",
                        }}
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Tooltip title="Ubah">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpen(row);
                            }}
                            className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-[var(--brand)] transition-colors"
                          >
                            <EditRoundedIcon sx={{ fontSize: 16 }} />
                          </button>
                        </Tooltip>
                        <Tooltip title="Hapus">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(row.id);
                            }}
                            className="p-1.5 rounded-lg text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm dialog */}
      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => (confirmBusy ? null : setConfirmOpen(false))}
        onConfirm={async () => {
          if (!confirmConfig) return;
          try {
            setConfirmBusy(true);
            await confirmConfig.onConfirm();
            setConfirmOpen(false);
          } finally {
            setConfirmBusy(false);
          }
        }}
        loading={confirmBusy}
        title={confirmConfig?.title}
        content={confirmConfig?.message}
        variant={confirmConfig?.variant}
        confirmText={
          confirmConfig?.confirmText ||
          (confirmConfig?.variant === "danger" ? "Ya, Hapus" : "Ya, Simpan")
        }
      />

      {/* Add/Edit dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle className="font-black text-xl text-zinc-800 border-b border-zinc-100">
            {editingItemType ? "Edit Jenis Barang" : "Tambah Jenis Barang"}
          </DialogTitle>

          <DialogContent dividers className="border-none py-6">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                name="name"
                label="Nama Jenis Barang"
                fullWidth
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Contoh: ASALAN, PATAHAN, dll."
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 3, bgcolor: "rgba(0,0,0,0.02)" },
                }}
              />

              <TextField
                name="description"
                label="Deskripsi (opsional)"
                fullWidth
                value={formData.description}
                onChange={handleChange}
                multiline
                minRows={3}
                placeholder="Catatan singkat biar operator makin paham."
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 3, bgcolor: "rgba(0,0,0,0.02)" },
                }}
              />

              <TextField
                name="unit"
                label="Satuan"
                select
                fullWidth
                value={formData.unit}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 3, bgcolor: "rgba(0,0,0,0.02)" },
                }}
              >
                <MenuItem value="kg">kg</MenuItem>
                <MenuItem value="pcs">pcs</MenuItem>
                <MenuItem value="liter">liter</MenuItem>
                <MenuItem value="gram">gram</MenuItem>
                <MenuItem value="ton">ton</MenuItem>
              </TextField>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <Checkbox
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    sx={{ p: 0.5 }}
                  />
                  <span className="font-bold text-zinc-800">Aktif</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <Checkbox
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleChange}
                    sx={{ p: 0.5 }}
                  />
                  <span className="font-bold text-zinc-800">Publik</span>
                </label>
              </div>
            </Box>
          </DialogContent>

          <DialogActions className="p-4 bg-zinc-50 border-t border-zinc-100">
            <Button
              onClick={handleClose}
              className="text-zinc-600 font-semibold px-6 hover:bg-zinc-100 rounded-xl"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="contained"
              className="bg-[var(--brand)] hover:bg-red-700 px-8 py-2 rounded-xl shadow-lg shadow-red-200 normal-case font-bold"
            >
              Simpan Data
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
