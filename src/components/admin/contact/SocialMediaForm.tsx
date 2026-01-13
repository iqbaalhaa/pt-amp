"use client";

import { useState } from "react";
import { Box, Button, TextField, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import type { SocialMedia } from "@/generated/prisma";
import {
	createSocialMedia,
	updateSocialMedia,
	deleteSocialMedia,
} from "@/actions/social-media-actions";
import GlassTable, { Column } from "@/components/ui/GlassTable";
import GlassButton from "@/components/ui/GlassButton";
import GlassDialog from "@/components/ui/GlassDialog";

export function SocialMediaForm({
	socialMedias,
}: {
	socialMedias: SocialMedia[];
}) {
	const [open, setOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	const [platform, setPlatform] = useState("");
	const [url, setUrl] = useState("");

	const handleOpen = (item?: SocialMedia) => {
		if (item) {
			setEditingId(item.id);
			setPlatform(item.platform);
			setUrl(item.url);
		} else {
			setEditingId(null);
			setPlatform("");
			setUrl("");
		}
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
		setEditingId(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append("platform", platform);
		formData.append("url", url);
		formData.append("isActive", "true");

		if (editingId) {
			await updateSocialMedia(editingId, formData);
		} else {
			await createSocialMedia(formData);
		}
		handleClose();
	};

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure you want to delete this link?")) {
			await deleteSocialMedia(id);
		}
	};

	const columns: Column<SocialMedia>[] = [
		{ header: "Platform", accessorKey: "platform", className: "font-medium" },
		{
			header: "URL",
			cell: (row) => (
				<a
					href={row.url}
					target="_blank"
					rel="noopener noreferrer"
					className="text-blue-500 hover:underline"
				>
					{row.url}
				</a>
			),
		},
	];

	return (
		<Box>
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-2">
					<LinkIcon className="text-[var(--brand)]" />
					<h2 className="text-xl font-bold text-[var(--foreground)]">
						Tautan Media Sosial
					</h2>
				</div>
				<GlassButton onClick={() => handleOpen()}>
					<AddIcon className="mr-2" fontSize="small" />
					Tambah Link
				</GlassButton>
			</div>

			<GlassTable
				columns={columns}
				data={socialMedias}
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
				fullWidth
				maxWidth="sm"
				title={editingId ? "Edit Link" : "Tambah Link Baru"}
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
				<form onSubmit={handleSubmit} id="social-media-form">
					<Stack spacing={3} sx={{ mt: 1 }}>
						<TextField
							label="Nama Platform"
							placeholder="Contoh: Facebook, Instagram, Shopee"
							fullWidth
							value={platform}
							onChange={(e) => setPlatform(e.target.value)}
							required
						/>
						<TextField
							label="URL / Link"
							placeholder="https://..."
							fullWidth
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							required
						/>
					</Stack>
				</form>
			</GlassDialog>
		</Box>
	);
}
