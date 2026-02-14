"use client";

import { Stack, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import CollectionsIcon from "@mui/icons-material/Collections";
import RssFeedIcon from "@mui/icons-material/RssFeed";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import GlassButton from "@/components/ui/GlassButton";
import GlassCard from "@/components/ui/GlassCard";

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
          <GlassCard className="p-4">
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Daftar Halaman
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
              <GlassButton
                as={Link}
                href="/admin/cms/pages/home"
                variant="ghost"
                className="justify-start"
              >
                <HomeIcon className="mr-2" fontSize="small" />
                Beranda
              </GlassButton>
              <GlassButton
                as={Link}
                href="/admin/compro/about"
                variant="ghost"
                className="justify-start"
              >
                <InfoIcon className="mr-2" fontSize="small" />
                About Us
              </GlassButton>
              <GlassButton
                as={Link}
                href="/admin/compro/gallery"
                variant="ghost"
                className="justify-start"
              >
                <CollectionsIcon className="mr-2" fontSize="small" />
                Gallery
              </GlassButton>
              <GlassButton
                as={Link}
                href="/admin/compro/blog"
                variant="ghost"
                className="justify-start"
              >
                <RssFeedIcon className="mr-2" fontSize="small" />
                Blog
              </GlassButton>
              <GlassButton
                as={Link}
                href="/admin/compro/contact"
                variant="ghost"
                className="justify-start"
              >
                <ContactMailIcon className="mr-2" fontSize="small" />
                Contact
              </GlassButton>
            </Box>
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard className="p-4 bg-red-glass">
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Buat Halaman
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Placeholder: form pembuatan halaman singkat.
            </Typography>
            <GlassButton variant="primary">
              Buat Halaman
            </GlassButton>
          </GlassCard>
        </Grid>
      </Grid>
    </Stack>
  );
}
