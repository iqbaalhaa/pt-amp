"use client";

import { useState } from "react";
import type { Inquiry, InquiryStatus } from "@/generated/prisma";
import { updateInquiryStatus, deleteInquiry } from "@/actions/inquiry-actions";
import { Box, Tooltip, Typography, Chip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import GlassTable, { Column } from "@/components/ui/GlassTable";
import GlassButton from "@/components/ui/GlassButton";
import StatusBadge from "@/components/ui/StatusBadge";
import GlassDialog from "@/components/ui/GlassDialog";

interface InquiryListProps {
	initialInquiries: Inquiry[];
}

export function InquiryList({ initialInquiries }: InquiryListProps) {
	const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
	const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
	const [openDialog, setOpenDialog] = useState(false);

	const handleView = async (inquiry: Inquiry) => {
		setSelectedInquiry(inquiry);
		setOpenDialog(true);

		if (inquiry.status === "NEW") {
			await handleStatusChange(inquiry.id, "READ");
		}
	};

	const handleStatusChange = async (id: string, status: InquiryStatus) => {
		try {
			await updateInquiryStatus(id, status);
			setInquiries((prev) =>
				prev.map((item) => (item.id === id ? { ...item, status } : item))
			);
		} catch (error) {
			console.error("Failed to update status", error);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this message?")) return;

		try {
			await deleteInquiry(id);
			setInquiries((prev) => prev.filter((item) => item.id !== id));
			if (selectedInquiry?.id === id) {
				setOpenDialog(false);
			}
		} catch (error) {
			console.error("Failed to delete inquiry", error);
		}
	};

	const getStatusColor = (status: InquiryStatus) => {
		switch (status) {
			case "NEW":
				return "danger";
			case "READ":
				return "info";
			case "REPLIED":
				return "success";
			default:
				return "neutral";
		}
	};

	const columns: Column<Inquiry>[] = [
		{
			header: "Date",
			cell: (row) =>
				new Date(row.createdAt).toLocaleString("id-ID", {
					day: "2-digit",
					month: "short",
					year: "numeric",
					hour: "2-digit",
					minute: "2-digit",
				}),
		},
		{
			header: "Name",
			cell: (row) => (
				<div>
					<div className="font-medium">{row.name}</div>
					<div className="text-xs text-[var(--text-secondary)]">
						{row.email}
					</div>
				</div>
			),
		},
		{ header: "Subject", accessorKey: "subject" },
		{
			header: "Status",
			cell: (row) => (
				<StatusBadge status={getStatusColor(row.status)}>
					{row.status}
				</StatusBadge>
			),
		},
	];

	return (
		<Box>
			<h1 className="text-xl font-bold mb-6 text-[var(--foreground)]">
				Pesan Masuk ({inquiries.length})
			</h1>

			<GlassTable
				columns={columns}
				data={inquiries}
				showNumber
				actions={(row) => (
					<>
						<Tooltip title="View Details">
							<span>
								<GlassButton
									variant="ghost"
									size="icon"
									onClick={() => handleView(row)}
								>
									<VisibilityIcon fontSize="small" />
								</GlassButton>
							</span>
						</Tooltip>
						<Tooltip title="Delete">
							<span>
								<GlassButton
									variant="danger"
									size="icon"
									onClick={() => handleDelete(row.id)}
								>
									<DeleteIcon fontSize="small" />
								</GlassButton>
							</span>
						</Tooltip>
					</>
				)}
			/>

			<GlassDialog
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				maxWidth="md"
				fullWidth
				title="Detail Pesan"
				actions={
					<>
						{selectedInquiry?.status !== "REPLIED" && (
							<GlassButton
								onClick={() =>
									selectedInquiry &&
									handleStatusChange(selectedInquiry.id, "REPLIED")
								}
								variant="success"
							>
								<MarkEmailReadIcon className="mr-2" fontSize="small" />
								Mark as Replied
							</GlassButton>
						)}
						<GlassButton variant="ghost" onClick={() => setOpenDialog(false)}>
							Close
						</GlassButton>
					</>
				}
			>
				{selectedInquiry && (
					<Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
						<Box
							sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
						>
							<Box>
								<Typography variant="caption" color="text.secondary">
									Dari
								</Typography>
								<Typography variant="body1" fontWeight="medium">
									{selectedInquiry.name}
								</Typography>
							</Box>
							<Box>
								<Typography variant="caption" color="text.secondary">
									Waktu
								</Typography>
								<Typography variant="body1">
									{new Date(selectedInquiry.createdAt).toLocaleDateString(
										"id-ID",
										{
											day: "numeric",
											month: "short",
											year: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										}
									)}
								</Typography>
							</Box>
							<Box>
								<Typography variant="caption" color="text.secondary">
									Email
								</Typography>
								<Typography variant="body1">{selectedInquiry.email}</Typography>
							</Box>
							<Box>
								<Typography variant="caption" color="text.secondary">
									Telepon
								</Typography>
								<Typography variant="body1">
									{selectedInquiry.phone || "-"}
								</Typography>
							</Box>
						</Box>

						<Box>
							<Typography variant="caption" color="text.secondary">
								Subjek
							</Typography>
							<Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
								{selectedInquiry.subject}
							</Typography>
						</Box>

						<Box sx={{ bgcolor: "#f9f9f9", p: 3, rounded: 2, borderRadius: 2 }}>
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{ display: "block", mb: 1 }}
							>
								Isi Pesan:
							</Typography>
							<Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
								{selectedInquiry.message}
							</Typography>
						</Box>
					</Box>
				)}
			</GlassDialog>
		</Box>
	);
}
