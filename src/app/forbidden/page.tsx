"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import Link from "next/link";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Divider,
  Chip,
} from "@mui/material";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";

export default function ForbiddenPage() {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: 4,
        background:
          "radial-gradient(1200px 600px at 20% 10%, rgba(97,206,112,.18), transparent 60%), radial-gradient(900px 500px at 80% 70%, rgba(33,150,243,.14), transparent 55%), linear-gradient(180deg, rgba(0,0,0,.02), rgba(0,0,0,.00))",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 560,
          borderRadius: 4,
          p: { xs: 3, sm: 4 },
          border: "1px solid",
          borderColor: "divider",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(255,255,255,.92), rgba(255,255,255,.84))",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            width: 280,
            height: 280,
            right: -120,
            top: -120,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 30% 30%, rgba(213,14,12,.28), transparent 55%)",
            filter: "blur(2px)",
            pointerEvents: "none",
          }}
        />

        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                border: "1px solid",
                borderColor: "divider",
                background:
                  "linear-gradient(135deg, rgba(213,14,12,.18), rgba(213,14,12,.10))",
                color: "var(--brand)",
              }}
            >
              <LockRoundedIcon />
            </Box>

            <Box>
              <Chip
                label="403"
                size="small"
                sx={{
                  mb: 0.5,
                  fontWeight: 700,
                  bgcolor: "rgba(213,14,12,0.12)",
                  border: "1px solid rgba(213,14,12,0.35)",
                }}
              />
              <Typography variant="h5" fontWeight={800} lineHeight={1.1}>
                Akses ditolak
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Kamu tidak punya izin untuk membuka halaman ini.
              </Typography>
            </Box>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="body1" fontWeight={700}>
              Kenapa ini bisa terjadi?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Biasanya karena role kamu belum punya permission yang diperlukan
              (misalnya <b>view-dashboard</b>), atau kamu belum login dengan
              akun yang benar.
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.2}
            sx={{ pt: 0.5 }}
          >
            <Button
              variant="contained"
              startIcon={<HomeRoundedIcon />}
              component={Link}
              href="/"
              sx={{
                borderRadius: 2.5,
                py: 1.1,
                fontWeight: 800,
                backgroundColor: "var(--brand)",
                "&:hover": { opacity: 0.9 },
                "&:focus-visible": {
                  boxShadow: "0 0 0 3px rgba(213,14,12,0.35)",
                },
              }}
              fullWidth
            >
              Kembali ke Beranda
            </Button>

            <Button
              variant="outlined"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => history.back()}
              sx={{
                borderRadius: 2.5,
                py: 1.1,
                fontWeight: 800,
                borderColor: "var(--brand)",
                "&:hover": {
                  borderColor: "var(--brand)",
                  bgcolor: "rgba(213,14,12,0.06)",
                },
                "&:focus-visible": {
                  boxShadow: "0 0 0 3px rgba(213,14,12,0.25)",
                },
              }}
              fullWidth
            >
              Halaman Sebelumnya
            </Button>
          </Stack>

          <Button
            variant="text"
            startIcon={<SupportAgentRoundedIcon />}
            component={Link}
            href="/contact"
            sx={{
              borderRadius: 2.5,
              fontWeight: 800,
              color: "var(--brand)",
              "&:hover": { bgcolor: "rgba(213,14,12,0.06)" },
            }}
          >
            Hubungi Admin / Support
          </Button>

          <Box
            sx={{
              mt: 0.5,
              p: 2,
              borderRadius: 3,
              border: "1px dashed",
              borderColor: "divider",
              bgcolor: "rgba(0,0,0,.02)",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Tips cepat: kalau ini halaman dashboard, pastikan akun kamu punya
              role <b>ADMIN</b> dan permission <b>view-dashboard</b>.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
