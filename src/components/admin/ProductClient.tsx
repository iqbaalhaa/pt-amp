"use client";

import { useState, useEffect } from "react";
import {
	Box,
	Button, // Keep for Dialog
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	MenuItem,
	FormControlLabel,
	Checkbox,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
	createProduct,
	updateProduct,
	deleteProduct,
} from "@/actions/product-actions";

import { useRouter } from "next/navigation";
import type { ProductDTO } from "@/actions/product-actions";
import GlassTable, { Column } from "@/components/ui/GlassTable";
import GlassButton from "@/components/ui/GlassButton";
import StatusBadge from "@/components/ui/StatusBadge";

interface ProductClientProps {
	initialProducts: ProductDTO[];
}

export default function ProductClient({ initialProducts }: ProductClientProps) {
	const router = useRouter();
	const [products, setProducts] = useState<ProductDTO[]>(initialProducts);
	const [open, setOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);

	useEffect(() => {
		setProducts(initialProducts);
	}, [initialProducts]);

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		type: "raw",
		unit: "kg",
		image: "",
		isActive: true,
	});

	const handleOpen = (product?: ProductDTO) => {
		if (product) {
			setEditingProduct(product);
			setFormData({
				name: product.name,
				description: product.description || "",
				type: product.type,
				unit: product.unit,
				image: product.image || "",
				isActive: product.isActive,
			});
		} else {
			setEditingProduct(null);
			setFormData({
				name: "",
				description: "",
				type: "raw",
				unit: "kg",
				image: "",
				isActive: true,
			});
		}
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
		setEditingProduct(null);
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const data = new FormData();
		Object.entries(formData).forEach(([key, value]) =>
			data.append(key, String(value))
		);

		if (editingProduct) {
			await updateProduct(editingProduct.id, data);
		} else {
			await createProduct(data);
		}

		setOpen(false);
		setEditingProduct(null);
		router.refresh();
	};

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure you want to delete this product?")) {
			await deleteProduct(id);
			router.refresh();
		}
	};

	const columns: Column<ProductDTO>[] = [
		{ header: "Name", accessorKey: "name" },
		{
			header: "Type",
			cell: (row) => (
				<StatusBadge status={row.type === "raw" ? "warning" : "success"}>
					{row.type === "raw" ? "Raw" : "Finished"}
				</StatusBadge>
			),
		},
		{ header: "Unit", accessorKey: "unit" },
		{ header: "Stock", cell: (row) => `${row.stock} ${row.unit}` },
		{
			header: "Status",
			cell: (row) => (
				<StatusBadge status={row.isActive ? "success" : "neutral"}>
					{row.isActive ? "Active" : "Inactive"}
				</StatusBadge>
			),
		},
	];

	return (
		<Box>
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold text-[var(--foreground)]">
					Products
				</h1>
				<GlassButton onClick={() => handleOpen()}>
					<AddIcon className="mr-2" fontSize="small" />
					Add Product
				</GlassButton>
			</div>

			<GlassTable
				columns={columns}
				data={products}
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

			<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
				<form onSubmit={handleSubmit}>
					<DialogTitle>
						{editingProduct ? "Edit Product" : "Add Product"}
					</DialogTitle>
					<DialogContent>
						<Grid container spacing={2} sx={{ mt: 1 }}>
							<Grid size={{ xs: 12 }}>
								<TextField
									fullWidth
									label="Product Name"
									name="name"
									value={formData.name}
									onChange={handleChange}
									required
								/>
							</Grid>
							<Grid size={{ xs: 12, sm: 6 }}>
								<TextField
									fullWidth
									select
									label="Type"
									name="type"
									value={formData.type}
									onChange={handleChange}
								>
									<MenuItem value="raw">Raw</MenuItem>
									<MenuItem value="finished">Finished</MenuItem>
								</TextField>
							</Grid>
							<Grid size={{ xs: 12, sm: 6 }}>
								<TextField
									fullWidth
									label="Unit"
									name="unit"
									value={formData.unit}
									onChange={handleChange}
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
									label="Active"
								/>
							</Grid>
							<Grid size={{ xs: 12 }}>
								<TextField
									fullWidth
									label="Image URL"
									name="image"
									value={formData.image}
									onChange={handleChange}
									placeholder="https://..."
								/>
							</Grid>
							<Grid size={{ xs: 12 }}>
								<TextField
									fullWidth
									label="Description"
									name="description"
									multiline
									rows={3}
									value={formData.description}
									onChange={handleChange}
								/>
							</Grid>
						</Grid>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleClose}>Cancel</Button>
						<Button
							type="submit"
							variant="contained"
							sx={{ bgcolor: "var(--brand)" }}
						>
							Save
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</Box>
	);
}
