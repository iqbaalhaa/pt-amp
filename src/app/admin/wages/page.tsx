"use client";

import { useEffect, useState } from "react";
import {
  Stack,
  Typography,
  Box,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";

type WageSettings = {
  pengikisanKa: number;
  pengikisanStik: number;
  pemotonganPerKg: number;
  penjemuranPerHari: number;
  penjemuranLemburPerJam: number;
  pengemasanPerBungkus: number;
};

const STORAGE_KEY = "upahSettings";

const defaultSettings: WageSettings = {
  pengikisanKa: 1000,
  pengikisanStik: 1200,
  pemotonganPerKg: 1500,
  penjemuranPerHari: 100000,
  penjemuranLemburPerJam: 15000,
  pengemasanPerBungkus: 500,
};

export default function WageSettingsPage() {
  const [settings, setSettings] = useState<WageSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setLoaded(true);
        return;
      }
      const parsed = JSON.parse(raw) as Partial<WageSettings>;
      setSettings({
        pengikisanKa:
          typeof parsed.pengikisanKa === "number"
            ? parsed.pengikisanKa
            : defaultSettings.pengikisanKa,
        pengikisanStik:
          typeof parsed.pengikisanStik === "number"
            ? parsed.pengikisanStik
            : defaultSettings.pengikisanStik,
        pemotonganPerKg:
          typeof parsed.pemotonganPerKg === "number"
            ? parsed.pemotonganPerKg
            : defaultSettings.pemotonganPerKg,
        penjemuranPerHari:
          typeof parsed.penjemuranPerHari === "number"
            ? parsed.penjemuranPerHari
            : defaultSettings.penjemuranPerHari,
        penjemuranLemburPerJam:
          typeof parsed.penjemuranLemburPerJam === "number"
            ? parsed.penjemuranLemburPerJam
            : defaultSettings.penjemuranLemburPerJam,
        pengemasanPerBungkus:
          typeof parsed.pengemasanPerBungkus === "number"
            ? parsed.pengemasanPerBungkus
            : defaultSettings.pengemasanPerBungkus,
      });
    } catch {
      setSettings(defaultSettings);
    } finally {
      setLoaded(true);
    }
  }, []);

  const handleChange =
    (field: keyof WageSettings) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = Number(e.target.value || "0");
      setSettings((prev) => ({
        ...prev,
        [field]: value >= 0 ? value : 0,
      }));
    };

  const handleSave = () => {
    if (typeof window === "undefined") return;
    setSaving(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setNotification({
        open: true,
        message: "Pengaturan upah berhasil disimpan",
        severity: "success",
      });
    } catch {
      setNotification({
        open: true,
        message: "Gagal menyimpan pengaturan upah",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Pengaturan Upah Produksi
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Atur nilai default upah yang akan digunakan di modul produksi.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard className="p-6">
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Pengikisan
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mb: 3 }}
            >
              Digunakan untuk menghitung upah KA dan Stik di modul
              pengikisan.
            </Typography>
            <div className="grid grid-cols-1 gap-3">
              <TextField
                label="Upah KA per Kg"
                type="number"
                value={loaded ? settings.pengikisanKa : ""}
                onChange={handleChange("pengikisanKa")}
                InputProps={{ startAdornment: "Rp " as any }}
                size="small"
              />
              <TextField
                label="Upah Stik per Kg"
                type="number"
                value={loaded ? settings.pengikisanStik : ""}
                onChange={handleChange("pengikisanStik")}
                InputProps={{ startAdornment: "Rp " as any }}
                size="small"
              />
            </div>
          </GlassCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard className="p-6">
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Pemotongan
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mb: 3 }}
            >
              Nilai default Upah/Kg di modul pemotongan.
            </Typography>
            <TextField
              label="Upah per Kg"
              type="number"
              value={loaded ? settings.pemotonganPerKg : ""}
              onChange={handleChange("pemotonganPerKg")}
              InputProps={{ startAdornment: "Rp " as any }}
              size="small"
            />
          </GlassCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard className="p-6">
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Penjemuran
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mb: 3 }}
            >
              Nilai default upah harian dan lembur untuk penjemuran.
            </Typography>
            <div className="grid grid-cols-1 gap-3">
              <TextField
                label="Upah per Hari"
                type="number"
                value={loaded ? settings.penjemuranPerHari : ""}
                onChange={handleChange("penjemuranPerHari")}
                InputProps={{ startAdornment: "Rp " as any }}
                size="small"
              />
              <TextField
                label="Upah Lembur per Jam"
                type="number"
                value={loaded ? settings.penjemuranLemburPerJam : ""}
                onChange={handleChange("penjemuranLemburPerJam")}
                InputProps={{ startAdornment: "Rp " as any }}
                size="small"
              />
            </div>
          </GlassCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard className="p-6">
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Pengemasan
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mb: 3 }}
            >
              Nilai default upah per bungkus di modul pengemasan.
            </Typography>
            <TextField
              label="Upah per Bungkus"
              type="number"
              value={loaded ? settings.pengemasanPerBungkus : ""}
              onChange={handleChange("pengemasanPerBungkus")}
              InputProps={{ startAdornment: "Rp " as any }}
              size="small"
            />
          </GlassCard>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end">
        <GlassButton
          variant="primary"
          onClick={handleSave}
          disabled={!loaded || saving}
        >
          {saving ? "Menyimpan..." : "Simpan Pengaturan"}
        </GlassButton>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() =>
          setNotification((prev) => ({
            ...prev,
            open: false,
          }))
        }
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() =>
            setNotification((prev) => ({
              ...prev,
              open: false,
            }))
          }
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
