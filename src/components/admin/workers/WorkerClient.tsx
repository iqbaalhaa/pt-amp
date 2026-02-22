"use client";

import { useState, useEffect } from "react";
import {
	Box,
	TextField,
	FormControlLabel,
	Checkbox,
	Alert,
	Snackbar,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
	createWorker,
	updateWorker,
	deleteWorker,
} from "@/actions/worker-actions";
import { useRouter } from "next/navigation";
import type { WorkerDTO } from "@/actions/worker-actions";
import GlassTable, { Column } from "@/components/ui/GlassTable";
import GlassButton from "@/components/ui/GlassButton";
import StatusBadge from "@/components/ui/StatusBadge";
import GlassDialog from "@/components/ui/GlassDialog";

interface WorkerClientProps {
	initialWorkers: WorkerDTO[];
}

export default function WorkerClient({ initialWorkers }: WorkerClientProps) {
	const router = useRouter();
	const [workers, setWorkers] = useState<WorkerDTO[]>(initialWorkers);
	const [open, setOpen] = useState(false);
	const [editingWorker, setEditingWorker] = useState<WorkerDTO | null>(null);
	const [snack, setSnack] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error";
	}>({
		open: false,
		message: "",
		severity: "success",
	});

	useEffect(() => {
		setWorkers(initialWorkers);
	}, [initialWorkers]);

	const [formData, setFormData] = useState({
		name: "",
		isActive: true,
	});

	const handleOpen = (worker?: WorkerDTO) => {
		if (worker) {
			setEditingWorker(worker);
			setFormData({
				name: worker.name,
				isActive: worker.isActive,
			});
		} else {
			setEditingWorker(null);
			setFormData({
				name: "",
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
			data.append("isActive", String(formData.isActive));

			if (editingWorker) {
				await updateWorker(editingWorker.id, data);
				setSnack({
					open: true,
					message: "Pekerja berhasil diperbarui",
					severity: "success",
				});
			} else {
				await createWorker(data);
				setSnack({
					open: true,
					message: "Pekerja berhasil ditambahkan",
					severity: "success",
				});
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
				setSnack({
					open: true,
					message: "Pekerja berhasil dihapus",
					severity: "success",
				});
				router.refresh();
			} catch {
				setSnack({
					open: true,
					message: "Gagal menghapus pekerja (mungkin sedang digunakan)",
					severity: "error",
				});
			}
		}
	};

	const columns: Column<WorkerDTO>[] = [
		{ header: "Nama", accessorKey: "name", className: "font-medium" },
		{
			header: "Status",
			cell: (row) => (
				<StatusBadge status={row.isActive ? "success" : "neutral"}>
					{row.isActive ? "Aktif" : "Non-Aktif"}
				</StatusBadge>
			),
		},
	];

	return (
		<Box>
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-2xl font-bold text-[var(--foreground)]">
						Pekerja
					</h1>
					<p className="text-sm text-[var(--text-secondary)]">
						Manajemen data pekerja (hanya nama, tanpa akun login)
					</p>
				</div>
				<GlassButton onClick={() => handleOpen()}>
					<AddIcon className="mr-2" fontSize="small" />
					Tambah Pekerja
				</GlassButton>
			</div>

			<GlassTable
				columns={columns}
				data={workers}
				showNumber
				actions={(row) => (
					<>
						<GlassButton
							variant="ghost"
							size="icon"
							onClick={() => handleOpen(row)}
						>
							<EditIcon fontSize="small" />
						</GlassButton>
						<GlassButton
							variant="danger"
							size="icon"
							onClick={() => handleDelete(row.id)}
						>
							<DeleteIcon fontSize="small" />
						</GlassButton>
					</>
				)}
			/>

			<GlassDialog
				open={open}
				onClose={handleClose}
				maxWidth="sm"
				fullWidth
				title={editingWorker ? "Edit Pekerja" : "Tambah Pekerja"}
				actions={
					<>
						<GlassButton variant="ghost" onClick={handleClose}>
							Batal
						</GlassButton>
						<GlassButton variant="primary" onClick={handleSubmit}>
							Simpan
						</GlassButton>
					</>
				}
			>
				<form onSubmit={handleSubmit} id="worker-form">
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
				</form>
			</GlassDialog>

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
