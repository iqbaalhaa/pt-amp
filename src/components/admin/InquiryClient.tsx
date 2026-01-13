"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Paper, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { updateInquiryStatus, deleteInquiry } from "@/actions/inquiry-actions";
import type { Inquiry, InquiryStatus } from "@/generated/prisma";
import GlassTable, { Column } from "@/components/ui/GlassTable";
import GlassButton from "@/components/ui/GlassButton";
import StatusBadge from "@/components/ui/StatusBadge";
import GlassDialog from "@/components/ui/GlassDialog";

interface InquiryClientProps {
	initialInquiries: Inquiry[];
}

export default function InquiryClient({
	initialInquiries,
}: InquiryClientProps) {
	const router = useRouter();
	const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
	const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

	useEffect(() => {
		setInquiries(initialInquiries);
	}, [initialInquiries]);

	const handleView = async (inquiry: Inquiry) => {
		setSelectedInquiry(inquiry);
		if (inquiry.status === "NEW") {
			await updateInquiryStatus(inquiry.id, "READ");
			router.refresh();
		}
	};

	const handleClose = () => {
		setSelectedInquiry(null);
	};

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure you want to delete this message?")) {
			await deleteInquiry(id);
			router.refresh();
			if (selectedInquiry?.id === id) {
				handleClose();
			}
		}
	};

	const handleMarkReplied = async (id: string) => {
		await updateInquiryStatus(id, "REPLIED");
		router.refresh();
		if (selectedInquiry?.id === id) {
			handleClose();
		}
	};

	const getStatusVariant = (status: InquiryStatus) => {
		switch (status) {
			case "NEW":
				return "danger";
			case "READ":
				return "warning";
			case "REPLIED":
				return "success";
			default:
				return "default";
		}
	};

	const columns: Column<Inquiry>[] = [
		{
			header: "Date",
			accessorKey: "createdAt",
			cell: (row) => new Date(row.createdAt).toLocaleDateString(),
		},
		{
			header: "Name",
			cell: (row) => (
				<Box>
					<Typography variant="body2" fontWeight="medium">
						{row.name}
					</Typography>
					<Typography variant="caption" color="text.secondary">
						{row.email}
					</Typography>
				</Box>
			),
		},
		{
			header: "Subject",
			accessorKey: "subject",
		},
		{
			header: "Status",
			cell: (row) => (
				<StatusBadge
					status={row.status}
					variant={getStatusVariant(row.status)}
				/>
			),
		},
	];

	return (
		<Box>
			<Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
				<Typography variant="h4" component="h1" fontWeight="bold">
					Inquiries
				</Typography>
			</Box>

			<GlassTable
				columns={columns}
				data={inquiries}
				showNumber
				actions={(row) => (
					<>
						<GlassButton
							variant="primary"
							size="icon"
							onClick={() => handleView(row)}
						>
							<VisibilityIcon fontSize="small" />
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
				open={!!selectedInquiry}
				onClose={handleClose}
				maxWidth="sm"
				fullWidth
				title="Message Details"
				actions={
					selectedInquiry && (
						<>
							<GlassButton
								variant="danger"
								onClick={() => handleDelete(selectedInquiry.id)}
							>
								Delete
							</GlassButton>
							<GlassButton variant="ghost" onClick={handleClose}>
								Close
							</GlassButton>
							{selectedInquiry.status !== "REPLIED" && (
								<GlassButton
									variant="success"
									onClick={() => handleMarkReplied(selectedInquiry.id)}
								>
									<CheckCircleIcon className="mr-2" fontSize="small" />
									Mark as Replied
								</GlassButton>
							)}
						</>
					)
				}
			>
				{selectedInquiry && (
					<>
						<Box sx={{ mb: 2 }}>
							<Typography variant="subtitle2" color="text.secondary">
								From
							</Typography>
							<Typography variant="body1">
								{selectedInquiry.name} ({selectedInquiry.email})
							</Typography>
							{selectedInquiry.phone && (
								<Typography variant="body2" color="text.secondary">
									{selectedInquiry.phone}
								</Typography>
							)}
						</Box>
						<Box sx={{ mb: 2 }}>
							<Typography variant="subtitle2" color="text.secondary">
								Subject
							</Typography>
							<Typography variant="body1" fontWeight="medium">
								{selectedInquiry.subject}
							</Typography>
						</Box>
						<Box sx={{ mb: 2 }}>
							<Typography variant="subtitle2" color="text.secondary">
								Message
							</Typography>
							<Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
								<Typography variant="body2" style={{ whiteSpace: "pre-wrap" }}>
									{selectedInquiry.message}
								</Typography>
							</Paper>
						</Box>
						<Box>
							<Typography variant="subtitle2" color="text.secondary">
								Date
							</Typography>
							<Typography variant="caption">
								{new Date(selectedInquiry.createdAt).toLocaleString()}
							</Typography>
						</Box>
					</>
				)}
			</GlassDialog>
		</Box>
	);
}
