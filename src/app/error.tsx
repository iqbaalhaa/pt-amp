"use client";

import { Box, Paper, Stack, Typography, Button, Divider, Chip, Alert } from "@mui/material";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Box
      role="alert"
      aria-label="Terjadi kesalahan pada halaman"
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
          width: 320,
          height: 320,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 30% 30%, rgba(97,206,112,0.25), rgba(97,206,112,0.08) 60%, transparent 70%)",
          filter: "blur(42px)",
          opacity: 0.18,
          top: "12%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          animation: "pulse 7s ease-in-out infinite",
          "@keyframes pulse": {
            "0%": { transform: "translate(-50%, -50%) scale(1)" },
            "50%": { transform: "translate(-50%, -50%) scale(1.04)" },
            "100%": { transform: "translate(-50%, -50%) scale(1)" },
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
                  "linear-gradient(135deg, rgba(97,206,112,0.18), rgba(97,206,112,0.08))",
                color: "#61ce70",
              }}
            >
              <ErrorOutlineRoundedIcon />
            </Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
              Terjadi Kesalahan
            </Typography>
            <Chip
              label="Error"
              color="default"
              sx={{
                ml: "auto",
                fontWeight: 600,
                bgcolor: "rgba(97,206,112,0.12)",
                border: "1px solid rgba(97,206,112,0.35)",
                color: "#1a1a1a",
              }}
            />
          </Stack>

          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Maaf, sesuatu tidak berjalan sesuai rencana. Coba lagi atau kembali ke beranda.
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
              aria-label="Coba lagi"
              variant="contained"
              onClick={reset}
              sx={{
                flex: 1,
                py: 1.2,
                backgroundColor: "#61ce70",
                "&:hover": { backgroundColor: "#55c165" },
                "&:focus-visible": {
                  boxShadow: "0 0 0 3px rgba(97,206,112,0.35)",
                },
              }}
            >
              Coba lagi
            </Button>
            <Button
              aria-label="Ke beranda"
              variant="outlined"
              onClick={() => (window.location.href = "/")}
              sx={{
                flex: 1,
                py: 1.2,
                borderColor: "#61ce70",
                color: "#1a1a1a",
                "&:hover": { borderColor: "#55c165", bgcolor: "rgba(97,206,112,0.06)" },
                "&:focus-visible": {
                  boxShadow: "0 0 0 3px rgba(97,206,112,0.25)",
                },
              }}
            >
              Ke Beranda
            </Button>
            <Button
              aria-label="Hubungi support"
              component="a"
              href="/contact"
              variant="outlined"
              sx={{
                flex: 1,
                py: 1.2,
                borderColor: "#61ce70",
                color: "#1a1a1a",
                "&:hover": { borderColor: "#55c165", bgcolor: "rgba(97,206,112,0.06)" },
                "&:focus-visible": {
                  boxShadow: "0 0 0 3px rgba(97,206,112,0.25)",
                },
              }}
            >
              Hubungi Support
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
