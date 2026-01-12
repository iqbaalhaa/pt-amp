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
import { revokePurchase } from "@/actions/purchase-actions";

type Purchase = {
  id: string;
  supplier: string | null;
  date: string;
  status: string;
  notes: string | null;
  items: {
    id: string;
    productName: string;
    qty: string;
    unitCost: string;
    unit: string;
  }[];
};

export default function PurchaseHistory({ purchases }: { purchases: Purchase[] }) {
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [open, setOpen] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
  });

  const handleView = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setOpen(true);
  };

  const handleRevoke = async (id: string) => {
    if (confirm("Are you sure you want to revoke this invoice? This will set status to CANCELLED.")) {
      await revokePurchase(id);
    }
  };

  const getInvoiceData = (purchase: Purchase): InvoiceData => {
    const items = purchase.items.map(item => ({
      productName: item.productName,
      qty: item.qty,
      unit: item.unit,
      price: item.unitCost,
      total: (parseFloat(item.qty) * parseFloat(item.unitCost)).toString()
    }));

    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.total), 0).toString();

    return {
      id: purchase.id,
      date: purchase.date,
      partyName: purchase.supplier,
      partyType: "Supplier",
      type: "Purchase Invoice",
      items,
      totalAmount
    };
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        Purchase History
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Items</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                <TableCell>{purchase.supplier || "-"}</TableCell>
                <TableCell>
                  <Chip 
                    label={purchase.status} 
                    color={purchase.status === "cancelled" ? "error" : purchase.status === "posted" ? "success" : "default"} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>{purchase.items.length} items</TableCell>
                <TableCell align="right">
                  <Tooltip title="View Invoice">
                    <IconButton size="small" onClick={() => handleView(purchase)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Revoke">
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleRevoke(purchase.id)}
                      disabled={purchase.status === "cancelled"}
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {purchases.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">No purchases found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Invoice Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogContent>
          {selectedPurchase && (
            <Invoice ref={invoiceRef} data={getInvoiceData(selectedPurchase)} />
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
