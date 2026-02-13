import React from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Typography, 
    Box, 
    Stack 
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import GlassButton from '@/components/ui/GlassButton';

interface SuccessModalProps {
    open: boolean;
    onClose: () => void;
    onDownload: () => void;
    onNewPurchase: () => void;
}

export default function SuccessModal({ open, onClose, onDownload, onNewPurchase }: SuccessModalProps) {
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    p: 2,
                    minWidth: 400,
                    textAlign: 'center'
                }
            }}
        >
            <DialogContent>
                <Stack spacing={3} alignItems="center">
                    <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main' }} />
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                            Selamat!
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Pembelian berhasil disimpan ke dalam sistem.
                        </Typography>
                    </Box>
                    
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                        Silakan unduh invoice Anda atau mulai transaksi baru.
                    </Typography>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
                <GlassButton variant="secondary" onClick={onDownload}>
                    <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
                    Download Invoice
                </GlassButton>
                <GlassButton variant="primary" onClick={onNewPurchase}>
                    <AddCircleOutlineIcon sx={{ mr: 1 }} fontSize="small" />
                    Pembelian Baru
                </GlassButton>
            </DialogActions>
        </Dialog>
    );
}
