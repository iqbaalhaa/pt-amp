"use client";

import { useState } from "react";
import type { Inquiry, InquiryStatus } from "@/generated/prisma";
import { updateInquiryStatus, deleteInquiry } from "@/actions/inquiry-actions";
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  IconButton, Chip, Typography, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Tooltip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";

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
      setInquiries(prev => prev.map(item => 
        item.id === id ? { ...item, status } : item
      ));
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    
    try {
      await deleteInquiry(id);
      setInquiries(prev => prev.filter(item => item.id !== id));
      if (selectedInquiry?.id === id) {
        setOpenDialog(false);
      }
    } catch (error) {
      console.error("Failed to delete inquiry", error);
    }
  };

  const getStatusColor = (status: InquiryStatus) => {
    switch (status) {
      case "NEW": return "error";
      case "READ": return "info";
      case "REPLIED": return "success";
      default: return "default";
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Pesan Masuk ({inquiries.length})
      </Typography>
      
      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Tidak ada pesan masuk.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              inquiries.map((row) => (
                <TableRow 
                  key={row.id}
                  sx={{ 
                    "&:last-child td, &:last-child th": { border: 0 },
                    bgcolor: row.status === "NEW" ? "#fff8f8" : "inherit"
                  }}
                >
                  <TableCell>
                    {new Date(row.createdAt).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">{row.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.email}</Typography>
                  </TableCell>
                  <TableCell>{row.subject}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      color={getStatusColor(row.status)} 
                      size="small" 
                      variant={row.status === "NEW" ? "filled" : "outlined"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton onClick={() => handleView(row)} color="primary" size="small">
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDelete(row.id)} color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Detail Pesan</span>
          {selectedInquiry && (
            <Chip 
              label={selectedInquiry.status} 
              color={getStatusColor(selectedInquiry.status)} 
              size="small" 
            />
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedInquiry && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Dari</Typography>
                  <Typography variant="body1" fontWeight="medium">{selectedInquiry.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Waktu</Typography>
                  <Typography variant="body1">
                    {new Date(selectedInquiry.createdAt).toLocaleDateString("id-ID", { 
                      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" 
                    })}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{selectedInquiry.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Telepon</Typography>
                  <Typography variant="body1">{selectedInquiry.phone || "-"}</Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Subjek</Typography>
                <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>{selectedInquiry.subject}</Typography>
              </Box>

              <Box sx={{ bgcolor: "#f9f9f9", p: 3, rounded: 2, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>Isi Pesan:</Typography>
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>{selectedInquiry.message}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #eee" }}>
          {selectedInquiry?.status !== "REPLIED" && (
            <Button 
              onClick={() => selectedInquiry && handleStatusChange(selectedInquiry.id, "REPLIED")}
              variant="contained"
              color="success"
              startIcon={<MarkEmailReadIcon />}
            >
              Mark as Replied
            </Button>
          )}
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
