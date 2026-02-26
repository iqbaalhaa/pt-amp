"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
  Tooltip,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  createItemType,
  updateItemType,
  deleteItemType,
  deleteItemTypes,
} from "@/actions/item-type-actions";
import type { ItemTypeDTO } from "@/actions/item-type-actions";
import GlassTable, { Column } from "@/components/ui/GlassTable";
import GlassButton from "@/components/ui/GlassButton";
import StatusBadge from "@/components/ui/StatusBadge";
import { useRouter } from "next/navigation";

import CategoryIcon from "@mui/icons-material/Category";
import { motion } from "framer-motion";

interface ItemTypeClientProps {
  initialItemTypes: ItemTypeDTO[];
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
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  useEffect(() => {
    setItemTypes(initialItemTypes);
  }, [initialItemTypes]);

  const handleSelectAll = () => {
    if (selectedIds.length === itemTypes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(itemTypes.map((it) => it.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    setConfirmConfig({
      title: "Hapus Masal",
      message: `Apakah Anda yakin ingin menghapus ${selectedIds.length} jenis barang terpilih?`,
      onConfirm: async () => {
        await deleteItemTypes(selectedIds);
        setSelectedIds([]);
      },
    });
    setConfirmOpen(true);
  };

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    type: string;
    unit: string;
    image: string | File;
    isPublic: boolean;
    isActive: boolean;
  }>({
    name: "",
    description: "",
    type: "",
    unit: "kg",
    image: "",
    isPublic: false,
    isActive: true,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
      setPreviewImage(itemType.image);
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
      setPreviewImage(null);
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
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
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
  };

  const handleDelete = (id: string) => {
    setConfirmConfig({
      title: "Hapus Label",
      message: "Apakah Anda yakin ingin menghapus jenis barang ini?",
      onConfirm: async () => {
        await deleteItemType(id);
      },
    });
    setConfirmOpen(true);
  };

  const columns: Column<ItemTypeDTO>[] = [
    {
      header: "Select",
      className: "w-16 text-center px-4",
      cell: (row) => (
        <Checkbox
          size="medium"
          checked={selectedIds.includes(row.id)}
          onChange={() => handleToggleSelect(row.id)}
          onClick={(e) => e.stopPropagation()}
          sx={{ p: 1 }}
        />
      ),
    },
    {
      header: "Nama Jenis",
      accessorKey: "name",
      className: "w-full px-4",
      cell: (row) => (
        <div className="flex items-center gap-4 py-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center text-red-600 shadow-sm border border-red-100/50 flex-shrink-0 overflow-hidden relative">
            {row.image ? (
              <img
                src={row.image}
                alt={row.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement
                    ?.querySelector(".fallback-icon")
                    ?.classList.remove("hidden");
                }}
              />
            ) : null}
            <div
              className={`fallback-icon ${
                row.image ? "hidden" : ""
              } absolute inset-0 flex items-center justify-center`}
            >
              <CategoryIcon sx={{ fontSize: 20 }} />
            </div>
          </div>
          <span className="font-black text-zinc-900 tracking-tight text-lg uppercase truncate">
            {row.name}
          </span>
        </div>
      ),
    },
  ];

  const actions = (row: ItemTypeDTO) => (
    <div className="flex items-center justify-end gap-2 px-2">
      <Tooltip title="Ubah Nama">
        <IconButton
          size="medium"
          onClick={(e) => {
            e.stopPropagation();
            handleOpen(row);
          }}
          className="bg-white shadow-md border border-zinc-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300 rounded-xl p-2"
        >
          <EditIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Hapus Jenis">
        <IconButton
          size="medium"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(row.id);
          }}
          className="bg-white shadow-md border border-zinc-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300 rounded-xl p-2"
        >
          <DeleteIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Tooltip>
    </div>
  );

  // Split data into three columns for 3-column layout
  const countPerColumn = Math.ceil(itemTypes.length / 3);
  const column1 = itemTypes.slice(0, countPerColumn);
  const column2 = itemTypes.slice(countPerColumn, countPerColumn * 2);
  const column3 = itemTypes.slice(countPerColumn * 2);

  return (
    <div className="p-2 md:p-4 w-full mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8 px-4"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[var(--brand)] to-red-700 rounded-2xl text-white shadow-xl shadow-red-200 ring-4 ring-red-50">
              <CategoryIcon fontSize="large" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-4xl font-black text-zinc-900 tracking-tight">
                Jenis Barang
              </h1>
              <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest opacity-70">
                Master Data Label
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <GlassButton
              onClick={handleBulkDelete}
              variant="danger"
              className="shadow-xl hover:scale-105 transition-all duration-300 px-6 py-4 rounded-2xl font-black uppercase tracking-wider flex items-center gap-2"
            >
              <DeleteIcon sx={{ fontSize: 20 }} />
              Hapus ({selectedIds.length})
            </GlassButton>
          )}
          <GlassButton
            onClick={handleSelectAll}
            variant="secondary"
            className="shadow-xl hover:scale-105 transition-all duration-300 px-6 py-4 rounded-2xl font-black uppercase tracking-wider flex items-center gap-2"
          >
            {selectedIds.length === itemTypes.length
              ? "Batal Semua"
              : "Pilih Semua"}
          </GlassButton>
          <GlassButton
            onClick={() => handleOpen()}
            className="shadow-2xl hover:scale-105 transition-all duration-300 bg-[var(--brand)] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-wider flex items-center gap-2"
          >
            <AddIcon sx={{ fontSize: 22 }} />
            Tambah Label Baru
          </GlassButton>
        </div>
      </motion.div>

      {/* Custom Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{
          className:
            "rounded-[1.5rem] p-4 bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl",
          style: { width: "100%", maxWidth: "400px" },
        }}
      >
        <DialogTitle className="text-2xl font-black text-zinc-900 flex items-center gap-3">
          <div className="p-2 bg-red-100 text-red-600 rounded-xl">
            <DeleteIcon />
          </div>
          {confirmConfig?.title}
        </DialogTitle>
        <DialogContent className="py-4">
          <p className="text-zinc-600 font-medium leading-relaxed">
            {confirmConfig?.message}
          </p>
        </DialogContent>
        <DialogActions className="p-4 gap-2">
          <GlassButton
            onClick={() => setConfirmOpen(false)}
            variant="secondary"
            className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm flex-1"
          >
            Batal
          </GlassButton>
          <GlassButton
            onClick={async () => {
              if (confirmConfig) {
                await confirmConfig.onConfirm();
                setConfirmOpen(false);
              }
            }}
            variant="danger"
            className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm flex-1"
          >
            Ya, Hapus
          </GlassButton>
        </DialogActions>
      </Dialog>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4"
      >
        {[column1, column2, column3].map((columnData, colIdx) => (
          <div key={colIdx} className="relative">
            <div className="absolute -inset-2 bg-gradient-to-tr from-red-50/50 to-orange-50/50 rounded-[2rem] -z-10 blur-2xl opacity-50" />
            <GlassTable
              columns={columns}
              data={columnData}
              actions={actions}
              showNumber
              startIndex={colIdx * countPerColumn}
              className="border-none shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden rounded-[1.25rem] bg-white/90 backdrop-blur-xl"
              onRowClick={(row) => handleToggleSelect(row.id)}
            />
          </div>
        ))}
      </motion.div>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle className="font-bold text-xl text-zinc-800 border-b border-zinc-100">
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
                label="Deskripsi"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Deskripsi produk..."
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 3, bgcolor: "rgba(0,0,0,0.02)" },
                }}
              />

              <div className="grid grid-cols-2 gap-4">
                <TextField
                  select
                  name="type"
                  label="Tipe Produk"
                  fullWidth
                  value={formData.type}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 3, bgcolor: "rgba(0,0,0,0.02)" },
                  }}
                >
                  <MenuItem value="RAW_MATERIAL">Bahan Baku</MenuItem>
                  <MenuItem value="WORK_IN_PROGRESS">
                    Barang Setengah Jadi
                  </MenuItem>
                  <MenuItem value="FINISHED_GOOD">Barang Jadi</MenuItem>
                </TextField>

                <TextField
                  name="unit"
                  label="Satuan"
                  fullWidth
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="kg, pcs, ball, dll"
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 3, bgcolor: "rgba(0,0,0,0.02)" },
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">
                  Gambar Produk
                </label>
                <div className="flex items-center gap-4">
                  {previewImage && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 relative">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement
                            ?.querySelector(".preview-fallback")
                            ?.classList.remove("hidden");
                        }}
                      />
                      <div className="preview-fallback hidden absolute inset-0 flex items-center justify-center bg-zinc-100 text-zinc-400">
                        <CategoryIcon sx={{ fontSize: 24 }} />
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 50 * 1024 * 1024) {
                          alert("File size exceeds 50MB");
                          e.target.value = "";
                          return;
                        }
                        setFormData({ ...formData, image: file });
                        setPreviewImage(URL.createObjectURL(file));
                      }
                    }}
                    className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200"
                  />
                </div>
                <p className="text-xs text-zinc-400">Max file size: 50MB</p>
              </div>

              <div className="flex gap-4">
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleChange}
                      color="primary"
                    />
                  }
                  label="Tampilkan di Katalog Publik"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      color="primary"
                    />
                  }
                  label="Aktif"
                />
              </div>
            </Box>
          </DialogContent>
          <DialogActions className="p-4 bg-zinc-50 border-t border-zinc-100">
            <Button
              onClick={handleClose}
              className="text-zinc-500 font-semibold px-6 hover:bg-zinc-100 rounded-xl"
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
