import React, { forwardRef } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, Grid } from "@mui/material";

export interface ProductionReportData {
  id: string;
  date: string;
  productionType: string;
  status: string;
  notes: string | null;
  inputs: {
    productName: string;
    qty: string;
    unit: string;
    unitCost: string;
  }[];
  outputs: {
    productName: string;
    qty: string;
    unit: string;
    unitCost: string;
  }[];
  workers: {
    workerName: string;
    role: string | null;
    hours: string | null;
  }[];
}

interface ProductionReportProps {
  data: ProductionReportData;
}

export const ProductionReport = forwardRef<HTMLDivElement, ProductionReportProps>(({ data }, ref) => {
  const totalInputCost = data.inputs.reduce((sum, item) => sum + (parseFloat(item.qty) * parseFloat(item.unitCost)), 0);
  const totalOutputValue = data.outputs.reduce((sum, item) => sum + (parseFloat(item.qty) * parseFloat(item.unitCost)), 0);

  return (
    <Box ref={ref} sx={{ p: 4, bgcolor: "white", color: "black", maxWidth: "210mm", margin: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1a237e" }}>
          PT AURORA MITRA PRAKARSA (AMP)
        </Typography>
        <Typography variant="subtitle1" sx={{ color: "#555", fontStyle: "italic" }}>
          PRODUCTION REPORT
        </Typography>
        <Divider sx={{ my: 2, borderBottomWidth: 2, borderColor: "#1a237e" }} />
      </Box>

      {/* Details */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Box>
          <Typography variant="body1"><strong>ID:</strong> {data.id}</Typography>
          <Typography variant="body1"><strong>Date:</strong> {new Date(data.date).toLocaleDateString("id-ID")}</Typography>
          <Typography variant="body1"><strong>Type:</strong> {data.productionType}</Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography variant="body1"><strong>Status:</strong> {data.status.toUpperCase()}</Typography>
        </Box>
      </Box>

      {/* Inputs */}
      <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2, mb: 1, color: "warning.dark" }}>Input Materials (Raw)</Typography>
      <TableContainer sx={{ mb: 2, border: "1px solid #e0e0e0" }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#fff3e0" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Product</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>Qty</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>Unit</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>Cost</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.inputs.map((item, index) => {
              const total = parseFloat(item.qty) * parseFloat(item.unitCost);
              return (
                <TableRow key={index}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell align="right">{parseFloat(item.qty).toLocaleString("id-ID")}</TableCell>
                  <TableCell align="right">{item.unit}</TableCell>
                  <TableCell align="right">Rp {parseFloat(item.unitCost).toLocaleString("id-ID")}</TableCell>
                  <TableCell align="right">Rp {total.toLocaleString("id-ID")}</TableCell>
                </TableRow>
              );
            })}
             <TableRow>
              <TableCell colSpan={4} align="right" sx={{ fontWeight: "bold" }}>Total Input Cost</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>Rp {totalInputCost.toLocaleString("id-ID")}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Outputs */}
      <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2, mb: 1, color: "success.dark" }}>Output Goods (Finished)</Typography>
      <TableContainer sx={{ mb: 2, border: "1px solid #e0e0e0" }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#e8f5e9" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Product</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>Qty</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>Unit</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>Cost</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.outputs.map((item, index) => {
               const total = parseFloat(item.qty) * parseFloat(item.unitCost);
               return (
                <TableRow key={index}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell align="right">{parseFloat(item.qty).toLocaleString("id-ID")}</TableCell>
                  <TableCell align="right">{item.unit}</TableCell>
                  <TableCell align="right">Rp {parseFloat(item.unitCost).toLocaleString("id-ID")}</TableCell>
                  <TableCell align="right">Rp {total.toLocaleString("id-ID")}</TableCell>
                </TableRow>
              );
            })}
             <TableRow>
              <TableCell colSpan={4} align="right" sx={{ fontWeight: "bold" }}>Total Output Value</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>Rp {totalOutputValue.toLocaleString("id-ID")}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Workers */}
      <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2, mb: 1, color: "info.dark" }}>Workers</Typography>
      <TableContainer sx={{ mb: 4, border: "1px solid #e0e0e0" }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#e3f2fd" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Worker</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>Hours</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.workers.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.workerName}</TableCell>
                <TableCell>{item.role || "-"}</TableCell>
                <TableCell align="right">{item.hours || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {data.notes && (
        <Box sx={{ mt: 2, p: 2, border: "1px dashed #bdbdbd", borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>Notes:</Typography>
          <Typography variant="body2">{data.notes}</Typography>
        </Box>
      )}

      {/* Footer / Signatures */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 8 }}>
        <Box sx={{ textAlign: "center", width: 200 }}>
          <Typography variant="body1" sx={{ mb: 8 }}>Prepared By</Typography>
          <Divider sx={{ borderColor: "black" }} />
          <Typography variant="caption">(Production Staff)</Typography>
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

ProductionReport.displayName = "ProductionReport";
