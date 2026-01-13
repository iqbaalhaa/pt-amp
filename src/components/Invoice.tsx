import React, { forwardRef } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider } from "@mui/material";

export interface InvoiceItem {
  productName: string;
  qty: string;
  unit: string;
  price: string;
  total: string;
}

export interface InvoiceData {
  id: string;
  date: string;
  partyName: string | null;
  partyType: "Supplier" | "Customer";
  type: "Purchase Invoice" | "Sales Invoice";
  items: InvoiceItem[];
  totalAmount: string;
}

interface InvoiceProps {
  data: InvoiceData;
}

export const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(({ data }, ref) => {
  return (
    <Box ref={ref} sx={{ p: 4, bgcolor: "white", color: "black", maxWidth: "210mm", margin: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1a237e" }}>
          PT AURORA MITRA PRAKARSA (AMP)
        </Typography>
        <Typography variant="subtitle1" sx={{ color: "#555", fontStyle: "italic" }}>
          (General Contractor, Supplier, Infrastructure)
        </Typography>
        <Divider sx={{ my: 2, borderBottomWidth: 2, borderColor: "#1a237e" }} />
      </Box>

      {/* Invoice Details */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {data.type.toUpperCase()}
          </Typography>
          <Typography variant="body1">Invoice #: {data.id}</Typography>
          <Typography variant="body1">Date: {new Date(data.date).toLocaleDateString("id-ID")}</Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {data.partyType}:
          </Typography>
          <Typography variant="body1">{data.partyName || "-"}</Typography>
        </Box>
      </Box>

      {/* Items Table */}
      <TableContainer sx={{ mb: 4, border: "1px solid #e0e0e0" }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Product</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>Qty</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>Unit</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>Price</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.productName}</TableCell>
                <TableCell align="right">{parseFloat(item.qty).toLocaleString("id-ID")}</TableCell>
                <TableCell align="right">{item.unit}</TableCell>
                <TableCell align="right">Rp {parseFloat(item.price).toLocaleString("id-ID")}</TableCell>
                <TableCell align="right">Rp {parseFloat(item.total).toLocaleString("id-ID")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Total */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 8 }}>
        <Box sx={{ minWidth: 200 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid black", pt: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>Total:</Typography>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>Rp {parseFloat(data.totalAmount).toLocaleString("id-ID")}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Footer / Signatures */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 8 }}>
        <Box sx={{ textAlign: "center", width: 200 }}>
          <Typography variant="body1" sx={{ mb: 8 }}>Prepared By</Typography>
          <Divider sx={{ borderColor: "black" }} />
          <Typography variant="caption">(Staff)</Typography>
        </Box>
        <Box sx={{ textAlign: "center", width: 200 }}>
          <Typography variant="body1" sx={{ mb: 8 }}>Approved By</Typography>
          <Divider sx={{ borderColor: "black" }} />
          <Typography variant="caption">(Manager)</Typography>
        </Box>
      </Box>
    </Box>
  );
});

Invoice.displayName = "Invoice";
