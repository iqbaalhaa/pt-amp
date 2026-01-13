"use client";

import { useState, useEffect } from "react";
import {
	Box,
	Stack,
	Typography,
	TextField,
	MenuItem,
	Snackbar,
	Alert,
	Divider,
} from "@mui/material";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { useRouter } from "next/navigation";
import {
	createProduction,
	ProductionItemInput,
	ProductionWorkerInput,
} from "@/actions/production-actions";
import TagBadge from "@/components/TagBadge";
import { formatRupiah } from "@/lib/currency";
import { ProductionStatus } from "@/generated/prisma";
import GlassTable, { Column } from "@/components/ui/GlassTable";
import GlassButton from "@/components/ui/GlassButton";

type ProductOption = {
	id: string;
	name: string;
	unit: string;
	type: "raw" | "finished";
};
type WorkerOption = { id: string; name: string; role: string | null };
type TypeOption = { id: string; name: string };

type Props = {
	products: ProductOption[];
	workers: WorkerOption[];
	productionTypes: TypeOption[];
};

export default function ProductionForm({
	products,
	workers,
	productionTypes,
}: Props) {
	const router = useRouter();

	const [date, setDate] = useState<string>("");

	useEffect(() => {
		const today = new Date();
		const yyyy = today.getFullYear();
		const mm = String(today.getMonth() + 1).padStart(2, "0");
		const dd = String(today.getDate()).padStart(2, "0");
		setDate(`${yyyy}-${mm}-${dd}`);
	}, []);

	const [productionTypeId, setProductionTypeId] = useState<string>("");
	const [status, setStatus] = useState<ProductionStatus>("draft");
	const [notes, setNotes] = useState<string>("");

	const [inputs, setInputs] = useState<ProductionItemInput[]>([
		{ productId: "", qty: "", unitCost: "" },
	]);
	const [outputs, setOutputs] = useState<ProductionItemInput[]>([
		{ productId: "", qty: "", unitCost: "" },
	]);
	const [assignedWorkers, setAssignedWorkers] = useState<
		ProductionWorkerInput[]
	>([{ workerId: "", role: "", hours: "" }]);

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

	// Helper functions for lists
	const addItem = (
		setter: React.Dispatch<React.SetStateAction<ProductionItemInput[]>>
	) => {
		setter((prev) => [...prev, { productId: "", qty: "", unitCost: "" }]);
	};
	const removeItem = (
		setter: React.Dispatch<React.SetStateAction<ProductionItemInput[]>>,
		idx: number
	) => {
		setter((prev) => prev.filter((_, i) => i !== idx));
	};
	const updateItem = (
		setter: React.Dispatch<React.SetStateAction<ProductionItemInput[]>>,
		idx: number,
		field: keyof ProductionItemInput,
		value: string
	) => {
		setter((prev) =>
			prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
		);
	};

	const addWorker = () => {
		setAssignedWorkers((prev) => [
			...prev,
			{ workerId: "", role: "", hours: "" },
		]);
	};
	const removeWorker = (idx: number) => {
		setAssignedWorkers((prev) => prev.filter((_, i) => i !== idx));
	};
	const updateWorker = (
		idx: number,
		field: keyof ProductionWorkerInput,
		value: string
	) => {
		setAssignedWorkers((prev) =>
			prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
		);
	};

	const lineTotal = (row: ProductionItemInput) => {
		const q = parseFloat(row.qty || "0");
		const p = parseFloat(row.unitCost || "0");
		return isFinite(q * p) ? q * p : 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!productionTypeId) {
			setSnack({
				open: true,
				message: "Pilih Tipe Produksi",
				severity: "error",
			});
			return;
		}
		setSaving(true);
		try {
			const validInputs = inputs.filter(
				(r) => r.productId && r.qty && r.unitCost
			);
			const validOutputs = outputs.filter(
				(r) => r.productId && r.qty && r.unitCost
			);
			const validWorkers = assignedWorkers.filter((r) => r.workerId);

			const payload = {
				productionTypeId,
				date,
				status,
				notes: notes || null,
				inputs: validInputs,
				outputs: validOutputs,
				workers: validWorkers,
			};

			const res = await createProduction(payload);
			if (res && res.success) {
				setSnack({
					open: true,
					message: "Produksi berhasil dibuat",
					severity: "success",
				});
				// Reset form
				setProductionTypeId("");
				const today = new Date();
				const yyyy = today.getFullYear();
				const mm = String(today.getMonth() + 1).padStart(2, "0");
				const dd = String(today.getDate()).padStart(2, "0");
				setDate(`${yyyy}-${mm}-${dd}`);
				setStatus("draft");
				setNotes("");
				setInputs([{ productId: "", qty: "", unitCost: "" }]);
				setOutputs([{ productId: "", qty: "", unitCost: "" }]);
				setAssignedWorkers([{ workerId: "", role: "", hours: "" }]);
				router.refresh();
			} else {
				setSnack({
					open: true,
					message: "Gagal membuat produksi",
					severity: "error",
				});
			}
		} catch {
			setSnack({ open: true, message: "Terjadi kesalahan", severity: "error" });
		} finally {
			setSaving(false);
		}
	};

	const inputColumns: Column<ProductionItemInput>[] = [
		{
			header: "Produk",
			cell: (row, idx) => (
				<TextField
					select
					fullWidth
					size="small"
					value={row.productId}
					onChange={(e) =>
						updateItem(setInputs, idx, "productId", e.target.value)
					}
					SelectProps={{
						renderValue: (selected) => {
							const sel = products.find((pr) => pr.id === String(selected));
							return sel ? sel.name : "";
						},
					}}
				>
					{products
						.filter((p) => p.type === "raw")
						.map((pr) => (
							<MenuItem key={pr.id} value={pr.id}>
								<Stack direction="row" spacing={1} alignItems="center">
									<Typography>{pr.name}</Typography>
									<TagBadge label={pr.unit} color="info" />
								</Stack>
							</MenuItem>
						))}
				</TextField>
			),
			className: "min-w-[200px]",
		},
		{
			header: "Qty",
			cell: (row, idx) => (
				<TextField
					type="number"
					size="small"
					inputProps={{ step: "0.0001" }}
					value={row.qty}
					onChange={(e) => updateItem(setInputs, idx, "qty", e.target.value)}
				/>
			),
			className: "min-w-[100px]",
		},
		{
			header: "Unit Cost",
			cell: (row, idx) => (
				<TextField
					type="number"
					size="small"
					inputProps={{ step: "0.0001" }}
					value={row.unitCost}
					onChange={(e) => updateItem(setInputs, idx, "unitCost", e.target.value)}
				/>
			),
			className: "min-w-[120px]",
		},
		{
			header: "Total",
			cell: (row) => formatRupiah(lineTotal(row), 0),
		},
	];

	const outputColumns: Column<ProductionItemInput>[] = [
		{
			header: "Produk",
			cell: (row, idx) => (
				<TextField
					select
					fullWidth
					size="small"
					value={row.productId}
					onChange={(e) =>
						updateItem(setOutputs, idx, "productId", e.target.value)
					}
					SelectProps={{
						renderValue: (selected) => {
							const sel = products.find((pr) => pr.id === String(selected));
							return sel ? sel.name : "";
						},
					}}
				>
					{products
						.filter((p) => p.type === "finished")
						.map((pr) => (
							<MenuItem key={pr.id} value={pr.id}>
								<Stack direction="row" spacing={1} alignItems="center">
									<Typography>{pr.name}</Typography>
									<TagBadge label={pr.unit} color="info" />
								</Stack>
							</MenuItem>
						))}
				</TextField>
			),
			className: "min-w-[200px]",
		},
		{
			header: "Qty",
			cell: (row, idx) => (
				<TextField
					type="number"
					size="small"
					inputProps={{ step: "0.0001" }}
					value={row.qty}
					onChange={(e) => updateItem(setOutputs, idx, "qty", e.target.value)}
				/>
			),
			className: "min-w-[100px]",
		},
		{
			header: "Unit Cost",
			cell: (row, idx) => (
				<TextField
					type="number"
					size="small"
					inputProps={{ step: "0.0001" }}
					value={row.unitCost}
					onChange={(e) => updateItem(setOutputs, idx, "unitCost", e.target.value)}
				/>
			),
			className: "min-w-[120px]",
		},
		{
			header: "Total",
			cell: (row) => formatRupiah(lineTotal(row), 0),
		},
	];

	const workerColumns: Column<ProductionWorkerInput>[] = [
		{
			header: "Pekerja",
			cell: (row, idx) => (
				<TextField
					select
					fullWidth
					size="small"
					value={row.workerId}
					onChange={(e) => updateWorker(idx, "workerId", e.target.value)}
				>
					{workers.map((w) => (
						<MenuItem key={w.id} value={w.id}>
							{w.name} {w.role ? `(${w.role})` : ""}
						</MenuItem>
					))}
				</TextField>
			),
			className: "min-w-[200px]",
		},
		{
			header: "Role",
			cell: (row, idx) => (
				<TextField
					fullWidth
					size="small"
					value={row.role}
					placeholder="Role saat ini"
					onChange={(e) => updateWorker(idx, "role", e.target.value)}
				/>
			),
			className: "min-w-[150px]",
		},
		{
			header: "Jam Kerja",
			cell: (row, idx) => (
				<TextField
					type="number"
					size="small"
					value={row.hours}
					onChange={(e) => updateWorker(idx, "hours", e.target.value)}
				/>
			),
			className: "min-w-[100px]",
		},
	];

	return (
		<Box component="form" onSubmit={handleSubmit}>
			<Stack spacing={4}>
				{/* HEADER INFO */}
				<Grid container spacing={2}>
					<Grid size={{ xs: 12, md: 4 }}>
						<TextField
							select
							fullWidth
							label="Tipe Produksi"
							value={productionTypeId}
							onChange={(e) => setProductionTypeId(e.target.value)}
						>
							{productionTypes.map((t) => (
								<MenuItem key={t.id} value={t.id}>
									{t.name}
								</MenuItem>
							))}
						</TextField>
					</Grid>
					<Grid size={{ xs: 12, md: 4 }}>
						<TextField
							type="date"
							label="Tanggal"
							value={date}
							onChange={(e) => setDate(e.target.value)}
							InputLabelProps={{ shrink: true }}
							fullWidth
						/>
					</Grid>
					<Grid size={{ xs: 12, md: 4 }}>
						<ToggleButtonGroup
							exclusive
							value={status}
							onChange={(_e, val) => val && setStatus(val)}
							size="small"
							fullWidth
						>
							<ToggleButton value="draft">Draft</ToggleButton>
							<ToggleButton value="completed">Completed</ToggleButton>
							<ToggleButton value="cancelled">Cancelled</ToggleButton>
						</ToggleButtonGroup>
					</Grid>
				</Grid>

				<Divider />

				{/* INPUTS (RAW MATERIALS) */}
				<Box>
					<Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
						<Typography
							variant="h6"
							sx={{ fontWeight: 700, color: "warning.main" }}
						>
							Input Bahan (Raw)
						</Typography>
						<GlassButton onClick={() => addItem(setInputs)}>
							<AddIcon className="mr-2" fontSize="small" />
							Tambah Input
						</GlassButton>
					</Box>
					<GlassTable
						columns={inputColumns}
						data={inputs}
						actions={(row, idx) => (
							<GlassButton
								variant="danger"
								size="icon"
								onClick={() => removeItem(setInputs, idx)}
							>
								<DeleteIcon fontSize="small" />
							</GlassButton>
						)}
					/>
				</Box>

				{/* OUTPUTS (FINISHED GOODS) */}
				<Box>
					<Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
						<Typography
							variant="h6"
							sx={{ fontWeight: 700, color: "success.main" }}
						>
							Output Hasil (Finished)
						</Typography>
						<GlassButton onClick={() => addItem(setOutputs)}>
							<AddIcon className="mr-2" fontSize="small" />
							Tambah Output
						</GlassButton>
					</Box>
					<GlassTable
						columns={outputColumns}
						data={outputs}
						showNumber
						actions={(row, idx) => (
							<GlassButton
								variant="danger"
								size="icon"
								onClick={() => removeItem(setOutputs, idx)}
							>
								<DeleteIcon fontSize="small" />
							</GlassButton>
						)}
					/>
				</Box>

				{/* WORKERS */}
				<Box>
					<Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
						<Typography
							variant="h6"
							sx={{ fontWeight: 700, color: "info.main" }}
						>
							Tenaga Kerja
						</Typography>
						<GlassButton onClick={addWorker}>
							<AddIcon className="mr-2" fontSize="small" />
							Tambah Pekerja
						</GlassButton>
					</Box>
					<GlassTable
						columns={workerColumns}
						data={assignedWorkers}
						actions={(row, idx) => (
							<GlassButton
								variant="danger"
								size="icon"
								onClick={() => removeWorker(idx)}
							>
								<DeleteIcon fontSize="small" />
							</GlassButton>
						)}
					/>
				</Box>

				<TextField
					label="Catatan Produksi"
					multiline
					minRows={2}
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
				/>

				<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
					<GlassButton
						type="submit"
						variant="primary"
						disabled={saving || !productionTypeId}
					>
						<SaveIcon className="mr-2" fontSize="small" />
						Simpan Produksi
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
