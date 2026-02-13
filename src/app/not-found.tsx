"use client";

import { useEffect, useState } from "react";
import { Box, Paper, Stack, Typography, Button, Divider, Chip } from "@mui/material";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

export default function NotFound() {
  const [hasSearch, setHasSearch] = useState(false);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const res = await fetch("/search", { method: "HEAD" });
        if (!canceled) setHasSearch(res.ok);
      } catch {
        if (!canceled) setHasSearch(false);
      }
    })();
    return () => {
      canceled = true;
    };
  }, []);

  return (
    <Box
      role="main"
      aria-label="Halaman tidak ditemukan"
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
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 30% 30%, rgba(97,206,112,0.25), rgba(97,206,112,0.08) 60%, transparent 70%)",
          filter: "blur(40px)",
          opacity: 0.18,
          top: "10%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          animation: "float 8s ease-in-out infinite",
          "@keyframes float": {
            "0%": { transform: "translate(-50%, -50%) translateY(0)" },
            "50%": { transform: "translate(-50%, -50%) translateY(-12px)" },
            "100%": { transform: "translate(-50%, -50%) translateY(0)" },
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
              <TravelExploreRoundedIcon />
            </Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
              Halaman Tidak Ditemukan
            </Typography>
            <Chip
              label="404"
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
            Maaf, halaman yang Anda cari tidak tersedia atau sudah dipindahkan.
          </Typography>

          <Divider sx={{ my: 1.5 }} />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ alignItems: "stretch" }}
          >
            <Button
              aria-label="Kembali ke beranda"
              variant="contained"
              onClick={() => (window.location.href = "/")}
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
              Ke Beranda
            </Button>
            <Button
              aria-label="Kembali ke halaman sebelumnya"
              variant="outlined"
              onClick={() => window.history.back()}
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
              Kembali
            </Button>
            <Button
              aria-label="Cari halaman"
              variant="outlined"
              disabled={!hasSearch}
              href={hasSearch ? "/search" : undefined}
              startIcon={<SearchRoundedIcon />}
              sx={{
                flex: 1,
                py: 1.2,
                borderColor: hasSearch ? "#61ce70" : "rgba(0,0,0,0.18)",
                color: hasSearch ? "#1a1a1a" : "text.disabled",
                "&:hover": hasSearch
                  ? { borderColor: "#55c165", bgcolor: "rgba(97,206,112,0.06)" }
                  : undefined,
                "&:focus-visible": hasSearch
                  ? { boxShadow: "0 0 0 3px rgba(97,206,112,0.25)" }
                  : undefined,
              }}
            >
              Cari
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
