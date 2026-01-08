"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { updateInquiryStatus, deleteInquiry } from "@/actions/inquiry-actions";
import { Inquiry, InquiryStatus } from "@prisma/client";

interface InquiryClientProps {
  initialInquiries: Inquiry[];
}

export default function InquiryClient({ initialInquiries }: InquiryClientProps) {
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
       // update local state temporarily for better UX if needed, but router.refresh handles it
       handleClose();
    }
  };

  const getStatusColor = (status: InquiryStatus) => {
    switch (status) {
      case "NEW": return "error";
      case "READ": return "warning";
      case "REPLIED": return "success";
      default: return "default";
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Inquiries
        </Typography>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inquiries.map((inquiry) => (
              <TableRow key={inquiry.id} hover sx={{ bgcolor: inquiry.status === "NEW" ? "action.hover" : "inherit" }}>
                <TableCell>{new Date(inquiry.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">{inquiry.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{inquiry.email}</Typography>
                </TableCell>
                <TableCell>{inquiry.subject}</TableCell>
                <TableCell>
                  <Chip 
                    label={inquiry.status} 
                    size="small" 
                    color={getStatusColor(inquiry.status)}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleView(inquiry)} color="primary">
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(inquiry.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {inquiries.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  No inquiries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!selectedInquiry} onClose={handleClose} maxWidth="sm" fullWidth>
        {selectedInquiry && (
          <>
            <DialogTitle>Message Details</DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">From</Typography>
                <Typography variant="body1">{selectedInquiry.name} ({selectedInquiry.email})</Typography>
                {selectedInquiry.phone && (
                   <Typography variant="body2" color="text.secondary">{selectedInquiry.phone}</Typography>
                )}
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Subject</Typography>
                <Typography variant="body1" fontWeight="medium">{selectedInquiry.subject}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Message</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="body2" style={{ whiteSpace: "pre-wrap" }}>{selectedInquiry.message}</Typography>
                </Paper>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                <Typography variant="caption">{new Date(selectedInquiry.createdAt).toLocaleString()}</Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleDelete(selectedInquiry.id)} color="error">
                Delete
              </Button>
              <Button onClick={handleClose}>Close</Button>
              {selectedInquiry.status !== "REPLIED" && (
                <Button 
                  variant="contained" 
                  startIcon={<CheckCircleIcon />} 
                  onClick={() => handleMarkReplied(selectedInquiry.id)}
                  sx={{ bgcolor: "var(--brand)" }}
                >
                  Mark as Replied
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
