import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress
} from '@mui/material';
import GlassButton from './GlassButton';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  content?: string; // Using content instead of message to be more generic, but keeping message for compatibility if needed
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger' | 'warning' | 'success';
  loading?: boolean;
}

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title = "Konfirmasi Simpan",
  content = "Apakah Anda yakin ingin menyimpan data ini?",
  confirmText = "Ya, Simpan",
  cancelText = "Batal",
  variant = "primary",
  loading = false,
}: ConfirmationDialogProps) {
  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)",
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
        }
      }}
    >
      <DialogTitle className="font-bold text-lg text-zinc-800 pb-2 border-b border-zinc-100">
        {title}
      </DialogTitle>
      <DialogContent className="py-6">
        <Typography variant="body1" className="text-zinc-600 leading-relaxed">
          {content}
        </Typography>
      </DialogContent>
      <DialogActions className="p-4 pt-2 gap-3 bg-zinc-50/50">
        <GlassButton
          variant="secondary"
          onClick={onClose}
          className="flex-1"
          disabled={loading}
        >
          {cancelText}
        </GlassButton>
        <GlassButton
          variant={variant}
          onClick={onConfirm}
          className="flex-1"
          disabled={loading}
        >
          {loading ? (
             <>
               <CircularProgress size={16} color="inherit" className="mr-2" />
               Memproses...
             </>
          ) : (
            <>
              {variant === "primary" && <SaveRoundedIcon className="mr-2 text-lg" />}
              {confirmText}
            </>
          )}
        </GlassButton>
      </DialogActions>
    </Dialog>
  );
}
