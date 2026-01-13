"use client";

import { Paper, Stack, Typography, Button, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import CollectionsIcon from "@mui/icons-material/Collections";
import RssFeedIcon from "@mui/icons-material/RssFeed";
import ContactMailIcon from "@mui/icons-material/ContactMail";

export default function CmsPagesPage() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          CMS Pages
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Kelola halaman konten dan navigasi
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Daftar Halaman
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
              <Button
                component={Link}
                href="/admin/cms/pages/home"
                variant="outlined"
                startIcon={<HomeIcon />}
                sx={{ justifyContent: "flex-start" }}
              >
                Beranda
              </Button>
              <Button
                component={Link}
                href="/admin/compro/about"
                variant="outlined"
                startIcon={<InfoIcon />}
                sx={{ justifyContent: "flex-start" }}
              >
                About Us
              </Button>
              <Button
                component={Link}
                href="/admin/compro/gallery"
                variant="outlined"
                startIcon={<CollectionsIcon />}
                sx={{ justifyContent: "flex-start" }}
              >
                Gallery
              </Button>
              <Button
                component={Link}
                href="/admin/compro/blog"
                variant="outlined"
                startIcon={<RssFeedIcon />}
                sx={{ justifyContent: "flex-start" }}
              >
                Blog
              </Button>
              <Button
                component={Link}
                href="/admin/compro/contact"
                variant="outlined"
                startIcon={<ContactMailIcon />}
                sx={{ justifyContent: "flex-start" }}
              >
                Contact
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid rgba(213,14,12,0.2)",
              background:
                "linear-gradient(180deg, rgba(213,14,12,0.06), rgba(255,138,0,0.04))",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Buat Halaman
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Placeholder: form pembuatan halaman singkat.
            </Typography>
            <Button variant="contained" sx={{ backgroundColor: "var(--brand)" }}>
              Buat Halaman
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
