"use client";

import { useState } from "react";
import { 
  Box, Button, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, Stack
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import { SocialMedia } from "@prisma/client";
import { createSocialMedia, updateSocialMedia, deleteSocialMedia } from "@/actions/social-media-actions";

export function SocialMediaForm({ socialMedias }: { socialMedias: SocialMedia[] }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [platform, setPlatform] = useState("");
  const [url, setUrl] = useState("");

  const handleOpen = (item?: SocialMedia) => {
    if (item) {
      setEditingId(item.id);
      setPlatform(item.platform);
      setUrl(item.url);
    } else {
      setEditingId(null);
      setPlatform("");
      setUrl("");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("platform", platform);
    formData.append("url", url);
    formData.append("isActive", "true");

    if (editingId) {
      await updateSocialMedia(editingId, formData);
    } else {
      await createSocialMedia(formData);
    }
    handleClose();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this link?")) {
      await deleteSocialMedia(id);
    }
  };

  return (
    <Box>
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ p: 3, bgcolor: "grey.50", borderBottom: 1, borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <LinkIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Tautan Media Sosial
            </Typography>
          </Stack>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpen()}
          >
            Tambah Link
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Platform</TableCell>
                <TableCell>URL</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {socialMedias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    Belum ada link sosial media.
                  </TableCell>
                </TableRow>
              ) : (
                socialMedias.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell sx={{ fontWeight: 500 }}>{item.platform}</TableCell>
                    <TableCell>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: "#1976d2", textDecoration: "none" }}>
                        {item.url}
                      </a>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpen(item)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingId ? "Edit Link" : "Tambah Link Baru"}</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Nama Platform"
                placeholder="Contoh: Facebook, Instagram, Shopee"
                fullWidth
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                required
              />
              <TextField
                label="URL / Link"
                placeholder="https://..."
                fullWidth
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleClose}>Batal</Button>
            <Button type="submit" variant="contained">Simpan</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

