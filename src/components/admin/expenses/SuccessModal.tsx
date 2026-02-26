"use client";

import { Dialog, DialogContent, DialogActions, Typography, Stack, Box } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DownloadIcon from "@mui/icons-material/Download";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import GlassButton from "@/components/ui/GlassButton";

type Props = {
  open: boolean;
  onClose: () => void;
  onDownload: () => void;
  onNewInvoice: () => void;
};

export default function SuccessModal({ open, onClose, onDownload, onNewInvoice }: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 2,
          minWidth: 400,
          textAlign: "center",
        },
      }}
    >
      <DialogContent>
        <Stack spacing={3} alignItems="center">
          <CheckCircleOutlineIcon sx={{ fontSize: 80, color: "success.main" }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              Berhasil!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Expense berhasil disimpan ke dalam sistem.
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary" }}>
            Silakan unduh faktur atau buat invoice baru.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 3, gap: 2 }}>
        <GlassButton variant="secondary" onClick={onDownload}>
          <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
          Download Faktur
        </GlassButton>
        <GlassButton variant="primary" onClick={onNewInvoice}>
          <AddCircleOutlineIcon sx={{ mr: 1 }} fontSize="small" />
          Invoice Baru
        </GlassButton>
      </DialogActions>
    </Dialog>
  );
}
