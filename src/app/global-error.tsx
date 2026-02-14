"use client";

import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  Divider,
  Chip,
  Alert,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Box
      role="alert"
      aria-label="Kesalahan global pada aplikasi"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, sm: 3 },
        position: "relative",
        background: "linear-gradient(135deg, #f7f9fc 0%, #eef2f6 100%)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 340,
          height: 340,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 70% 40%, rgba(213,14,12,0.22), rgba(213,14,12,0.08) 60%, transparent 70%)",
          filter: "blur(44px)",
          opacity: 0.2,
          bottom: "8%",
          left: "50%",
          transform: "translate(-50%, 50%)",
          animation: "shimmer 9s ease-in-out infinite",
          "@keyframes shimmer": {
            "0%": { opacity: 0.16 },
            "50%": { opacity: 0.28 },
            "100%": { opacity: 0.16 },
          },
        }}
      />

      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 640,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          bgcolor: "rgba(255,255,255,0.80)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              aria-hidden
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, rgba(213,14,12,0.18), rgba(213,14,12,0.08))",
                color: "var(--brand)",
              }}
            >
              <WarningAmberRoundedIcon />
            </Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
              Kesalahan Sistem
            </Typography>
            <Chip
              label="Global Error"
              color="default"
              sx={{
                ml: "auto",
                fontWeight: 600,
                bgcolor: "rgba(213,14,12,0.12)",
                border: "1px solid rgba(213,14,12,0.35)",
                color: "#1a1a1a",
              }}
            />
          </Stack>

          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Aplikasi mengalami kesalahan. Silakan muat ulang atau kembali ke
            beranda.
          </Typography>

          {error?.message && (
            <Alert
              severity="error"
              sx={{
                borderRadius: 2,
                bgcolor: "rgba(255,0,0,0.04)",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              {error.message}
            </Alert>
          )}

          {error?.digest && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Error ID: {error.digest}
            </Typography>
          )}

          <Divider sx={{ my: 1.5 }} />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ alignItems: "stretch" }}
          >
            <Button
              aria-label="Muat ulang aplikasi"
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{
                flex: 1,
                py: 1.2,
                backgroundColor: "var(--brand)",
                "&:hover": { opacity: 0.9 },
                "&:focus-visible": {
                  boxShadow: "0 0 0 3px rgba(213,14,12,0.35)",
                },
              }}
            >
              Reload
            </Button>
            <Button
              aria-label="Ke beranda"
              variant="outlined"
              onClick={() => (window.location.href = "/")}
              sx={{
                flex: 1,
                py: 1.2,
                borderColor: "var(--brand)",
                color: "#1a1a1a",
                "&:hover": {
                  borderColor: "var(--brand)",
                  bgcolor: "rgba(213,14,12,0.06)",
                },
                "&:focus-visible": {
                  boxShadow: "0 0 0 3px rgba(213,14,12,0.25)",
                },
              }}
            >
              Ke Beranda
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
