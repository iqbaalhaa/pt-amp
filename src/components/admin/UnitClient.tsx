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
	Checkbox,
	IconButton,
	Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import StraightenIcon from "@mui/icons-material/Straighten";
import {
	createUnit,
	updateUnit,
	deleteUnit,
	deleteUnits,
} from "@/actions/unit-actions";
import type { UnitDTO } from "@/actions/unit-actions";
import GlassTable, { Column } from "@/components/ui/GlassTable";
import GlassButton from "@/components/ui/GlassButton";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface UnitClientProps {
	initialUnits: UnitDTO[];
}

export default function UnitClient({ initialUnits }: UnitClientProps) {
	const router = useRouter();
	const [units, setUnits] = useState<UnitDTO[]>(initialUnits);
	const [open, setOpen] = useState(false);
	const [editingUnit, setEditingUnit] = useState<UnitDTO | null>(null);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [confirmConfig, setConfirmConfig] = useState<{
		title: string;
		message: string;
		onConfirm: () => Promise<void>;
	} | null>(null);

	useEffect(() => {
		setUnits(initialUnits);
	}, [initialUnits]);

	const handleSelectAll = () => {
		if (selectedIds.length === units.length) {
			setSelectedIds([]);
		} else {
			setSelectedIds(units.map((u) => u.id));
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
			message: `Apakah Anda yakin ingin menghapus ${selectedIds.length} satuan terpilih?`,
			onConfirm: async () => {
				await deleteUnits(selectedIds);
				setSelectedIds([]);
			}
		});
		setConfirmOpen(true);
	};

	const [formData, setFormData] = useState({
		name: "",
	});

	const handleOpen = (unit?: UnitDTO) => {
		if (unit) {
			setEditingUnit(unit);
			setFormData({
				name: unit.name,
			});
		} else {
			setEditingUnit(null);
			setFormData({
				name: "",
			});
		}
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
		setEditingUnit(null);
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const data = new FormData();
		data.append("name", formData.name);

		if (editingUnit) {
			await updateUnit(editingUnit.id, data);
		} else {
			await createUnit(data);
		}
		handleClose();
		router.refresh();
	};

	const handleDelete = (id: string) => {
		setConfirmConfig({
			title: "Hapus Satuan",
			message: "Apakah Anda yakin ingin menghapus satuan ini?",
			onConfirm: async () => {
				await deleteUnit(id);
			}
		});
		setConfirmOpen(true);
	};

	const columns: Column<UnitDTO>[] = [
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
			header: "Nama Satuan", 
			accessorKey: "name",
			className: "w-full px-4",
			cell: (row) => (
				<div className="flex items-center gap-4 py-1">
					<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50 flex-shrink-0">
						<StraightenIcon sx={{ fontSize: 20 }} />
					</div>
					<span className="font-black text-zinc-900 tracking-tight text-lg uppercase truncate">
						{row.name}
					</span>
				</div>
			)
		},
	];

	const actions = (row: UnitDTO) => (
		<div className="flex items-center justify-end gap-2 px-2">
			<Tooltip title="Ubah Nama">
				<IconButton
					size="medium"
					onClick={(e) => {
						e.stopPropagation();
						handleOpen(row);
					}}
					className="bg-white shadow-md border border-zinc-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-300 rounded-xl p-2"
				>
					<EditIcon sx={{ fontSize: 20 }} />
				</IconButton>
			</Tooltip>
			<Tooltip title="Hapus Satuan">
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
	const countPerColumn = Math.ceil(units.length / 3);
	const column1 = units.slice(0, countPerColumn);
	const column2 = units.slice(countPerColumn, countPerColumn * 2);
	const column3 = units.slice(countPerColumn * 2);

	return (
		<div className="p-2 md:p-4 w-full mx-auto min-h-screen">
			<motion.div 
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8 px-4"
			>
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-4">
						<div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white shadow-xl shadow-blue-200 ring-4 ring-blue-50">
							<StraightenIcon fontSize="large" />
						</div>
						<div className="flex flex-col">
							<h1 className="text-4xl font-black text-zinc-900 tracking-tight">
								Master Satuan
							</h1>
							<p className="text-zinc-500 font-bold text-sm uppercase tracking-widest opacity-70">
								Pengaturan Unit Ukuran
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
						{selectedIds.length === units.length ? "Batal Semua" : "Pilih Semua"}
					</GlassButton>
					<GlassButton
						onClick={() => handleOpen()}
						className="shadow-2xl hover:scale-105 transition-all duration-300 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-wider flex items-center gap-2"
					>
						<AddIcon sx={{ fontSize: 22 }} />
						Tambah Satuan Baru
					</GlassButton>
				</div>
			</motion.div>

			{/* Custom Confirmation Dialog */}
			<Dialog
				open={confirmOpen}
				onClose={() => setConfirmOpen(false)}
				PaperProps={{
					className: "rounded-[1.5rem] p-4 bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl",
					style: { width: '100%', maxWidth: '400px' }
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
						<div className="absolute -inset-2 bg-gradient-to-tr from-blue-50/50 to-indigo-50/50 rounded-[2rem] -z-10 blur-2xl opacity-50" />
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
						{editingUnit ? "Edit Satuan" : "Tambah Satuan"}
					</DialogTitle>
					<DialogContent dividers className="border-none py-6">
						<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
							<TextField
								name="name"
								label="Nama Satuan"
								fullWidth
								required
								value={formData.name}
								onChange={handleChange}
								placeholder="Contoh: KG, GRAM, BUAH, dll."
								variant="outlined"
								InputProps={{
									sx: { borderRadius: 3, bgcolor: "rgba(0,0,0,0.02)" }
								}}
							/>
						</Box>
					</DialogContent>
					<DialogActions className="p-4 bg-zinc-50 border-t border-zinc-100">
						<Button onClick={handleClose} className="text-zinc-500 font-semibold px-6 hover:bg-zinc-100 rounded-xl">
							Batal
						</Button>
						<Button 
							type="submit" 
							variant="contained" 
							className="bg-blue-600 hover:bg-blue-700 px-8 py-2 rounded-xl shadow-lg shadow-blue-200 normal-case font-bold"
						>
							Simpan Data
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</div>
	);
}
