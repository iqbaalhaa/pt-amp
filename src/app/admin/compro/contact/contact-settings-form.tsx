"use client";

import { useState } from "react";
import { updateContactInfo } from "@/actions/contact-info-actions";
import { 
  Button, TextField, Box, Typography, Snackbar, Alert, 
  InputAdornment, Paper, Stack,
  CircularProgress
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import BusinessIcon from "@mui/icons-material/Business";
import { ContactInfo } from "@prisma/client";

export function ContactSettingsForm({ initialData }: { initialData: ContactInfo | null }) {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    
    const result = await updateContactInfo(formData);
    
    setLoading(false);
    if (result.success) {
      setNotification({ open: true, message: "Informasi kontak berhasil disimpan", severity: "success" });
    } else {
      setNotification({ open: true, message: result.error || "Gagal menyimpan perubahan", severity: "error" });
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        
        {/* Header Section */}
        <Box sx={{ p: 3, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
             <BusinessIcon color="primary" />
             <Typography variant="h6" fontWeight="bold">
               Kontak Perusahaan
             </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Perbarui detail alamat, email, dan nomor telepon perusahaan.
          </Typography>
        </Box>

        <Box sx={{ p: 4 }}>
          <Stack spacing={4}>
            <TextField
              label="Alamat Lengkap"
              name="address"
              defaultValue={initialData?.address}
              multiline
              rows={3}
              fullWidth
              placeholder="Contoh: Jl. Sudirman No. 123, Jakarta Pusat..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mt: -2 }}>
                    <LocationOnIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
              helperText="Alamat ini akan muncul di footer dan halaman kontak."
            />

            <TextField
              label="Email Resmi"
              name="email"
              defaultValue={initialData?.email}
              fullWidth
              placeholder="info@perusahaan.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Telepon Kantor"
              name="phone"
              defaultValue={initialData?.phone}
              fullWidth
              placeholder="+62 21..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="WhatsApp Admin"
              name="whatsapp"
              defaultValue={initialData?.whatsapp}
              fullWidth
              placeholder="62812345678"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <WhatsAppIcon color="success" fontSize="small" />
                  </InputAdornment>
                ),
              }}
              helperText="Gunakan format internasional (62...)"
            />
          </Stack>
        </Box>

        {/* Footer Actions */}
        <Box sx={{ p: 3, bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{ minWidth: 150, borderRadius: 2 }}
          >
            {loading ? "Menyimpan..." : "Simpan Kontak"}
          </Button>
        </Box>

      </Paper>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
