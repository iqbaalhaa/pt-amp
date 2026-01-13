"use client";

import { useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
  Box,
  Typography
} from "@mui/material";
import { Visibility, Print, Cancel as CancelIcon } from "@mui/icons-material";
import { useReactToPrint } from "react-to-print";
import { Invoice, InvoiceData } from "@/components/Invoice";
import { revokeSale } from "@/actions/sale-actions";

type Sale = {
  id: string;
  customer: string | null;
  date: string;
  status: string;
  notes: string | null;
  items: {
    id: string;
    productName: string;
    qty: string;
    unitPrice: string;
    unit: string;
  }[];
};

export default function SaleHistory({ sales }: { sales: Sale[] }) {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [open, setOpen] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
  });

  const handleView = (sale: Sale) => {
    setSelectedSale(sale);
    setOpen(true);
  };

  const handleRevoke = async (id: string) => {
    if (confirm("Are you sure you want to revoke this invoice? This will set status to CANCELLED.")) {
      await revokeSale(id);
    }
  };

  const getInvoiceData = (sale: Sale): InvoiceData => {
    const items = sale.items.map(item => ({
      productName: item.productName,
      qty: item.qty,
      unit: item.unit,
      price: item.unitPrice,
      total: (parseFloat(item.qty) * parseFloat(item.unitPrice)).toString()
    }));

    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.total), 0).toString();

    return {
      id: sale.id,
      date: sale.date,
      partyName: sale.customer,
      partyType: "Customer",
      type: "Sales Invoice",
      items,
      totalAmount
    };
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        Sales History
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Items</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                <TableCell>{sale.customer || "-"}</TableCell>
                <TableCell>
                  <Chip 
                    label={sale.status} 
                    color={sale.status === "cancelled" ? "error" : sale.status === "posted" ? "success" : "default"} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>{sale.items.length} items</TableCell>
                <TableCell align="right">
                  <Tooltip title="View Invoice">
                    <IconButton size="small" onClick={() => handleView(sale)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Revoke">
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleRevoke(sale.id)}
                      disabled={sale.status === "cancelled"}
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {sales.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">No sales found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Invoice Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogContent>
          {selectedSale && (
            <Invoice ref={invoiceRef} data={getInvoiceData(selectedSale)} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<Print />} onClick={() => handlePrint()}>
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
