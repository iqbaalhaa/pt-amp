import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  IconButton,
  DialogProps,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type GlassDialogProps = DialogProps & {
  title?: string;
  actions?: React.ReactNode;
  onClose?: () => void;
};

export default function GlassDialog({
  title,
  children,
  actions,
  onClose,
  PaperProps,
  ...props
}: GlassDialogProps) {
  return (
    <Dialog
      onClose={onClose}
      {...props}
      PaperProps={{
        ...PaperProps,
        sx: {
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
          borderRadius: 4,
          ...PaperProps?.sx,
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(5px)",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
          },
        },
      }}
    >
      {title && (
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: "black" }}>
            {title}
          </Typography>
          {onClose && (
            <IconButton onClick={onClose} size="small" sx={{ color: "rgba(0,0,0,0.5)" }}>
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}
      <DialogContent dividers={!!title} sx={{ borderColor: "rgba(0,0,0,0.1)" }}>
        {children}
      </DialogContent>
      {actions && (
        <DialogActions sx={{ p: 2, borderTop: "1px solid rgba(0,0,0,0.05)" }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}
