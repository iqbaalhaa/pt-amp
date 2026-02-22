"use client";

import { useEffect, useState } from "react";
import {
  Stack,
  Typography,
  Box,
  TextField,
  Snackbar,
  Alert,
  Autocomplete,
  CircularProgress,
  Tooltip,
  IconButton,
  createFilterOptions,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { ItemTypeDTO, getItemTypes, quickCreateItemType } from "@/actions/item-type-actions";

type PemotonganRate = {
  id: string;
  name: string;
  unit: string;
  rate: number;
  itemTypeId?: string;
};

type WageSettings = {
  pengikisanKa: number;
  pengikisanStik: number;
  pemotonganPerKg: number;
  pemotonganRates: PemotonganRate[];
  penjemuranPerHari: number;
  penjemuranLemburPerJam: number;
  pengemasanPerBungkus: number;
};

const STORAGE_KEY = "upahSettings";

type WageTabKey =
  | "pengikisan"
  | "pemotongan"
  | "penjemuran"
  | "pengemasan"
  | "pensortiran"
  | "qcPotongSortir";

const WAGE_TABS: { key: WageTabKey; label: string }[] = [
  { key: "pengikisan", label: "Pengikisan" },
  { key: "pemotongan", label: "Pemotongan" },
  { key: "penjemuran", label: "Penjemuran" },
  { key: "pengemasan", label: "Pengemasan" },
  { key: "pensortiran", label: "Pensortiran" },
  { key: "qcPotongSortir", label: "QC Potong & Sortir" },
];

const defaultSettings: WageSettings = {
  pengikisanKa: 1000,
  pengikisanStik: 1200,
  pemotonganPerKg: 1500,
  pemotonganRates: [
    { id: "stik25", name: "Stik 25", unit: "Kg", rate: 1500 },
    { id: "aaa8", name: "Aaa (8 cm)", unit: "Kg", rate: 1500 },
    { id: "aa8", name: "Aa (8 cm)", unit: "Kg", rate: 1500 },
    { id: "reject8", name: "Reject (8)", unit: "Kg", rate: 1500 },
    { id: "reject6", name: "Reject (6)", unit: "Kg", rate: 1500 },
    { id: "campuran8", name: "Campuran (8 cm)", unit: "Kg", rate: 1500 },
  ],
  penjemuranPerHari: 100000,
  penjemuranLemburPerJam: 15000,
  pengemasanPerBungkus: 500,
};

export default function WageSettingsPage() {
  const [settings, setSettings] = useState<WageSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<WageTabKey>("pengikisan");
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const itemTypeFilter = createFilterOptions<ItemTypeDTO & { inputValue?: string }>();
  const [itemTypeOptions, setItemTypeOptions] = useState<ItemTypeDTO[]>([]);
  const [creatingItemTypeFor, setCreatingItemTypeFor] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setLoaded(true);
        return;
      }
      const parsed = JSON.parse(raw) as any;
      const pemotonganRates: PemotonganRate[] = Array.isArray(
        parsed.pemotonganRates,
      )
        ? parsed.pemotonganRates.map((r: any, idx: number) => ({
            id: r.id || `rate-${idx}`,
            name: String(r.name ?? "").trim() || `Jenis ${idx + 1}`,
            unit: String(r.unit ?? "Kg"),
            rate:
              typeof r.rate === "number" && !Number.isNaN(r.rate)
                ? r.rate
                : 0,
            itemTypeId:
              typeof r.itemTypeId === "string" && r.itemTypeId.length > 0
                ? r.itemTypeId
                : undefined,
          }))
        : [
            {
              id: "stik25",
              name: "Stik 25",
              unit: "Kg",
              rate:
                typeof parsed.pemotonganStik25 === "number"
                  ? parsed.pemotonganStik25
                  : 1500,
            },
            {
              id: "aaa8",
              name: "Aaa (8 cm)",
              unit: "Kg",
              rate:
                typeof parsed.pemotonganAaa8 === "number"
                  ? parsed.pemotonganAaa8
                  : 1500,
            },
            {
              id: "aa8",
              name: "Aa (8 cm)",
              unit: "Kg",
              rate:
                typeof parsed.pemotonganAa8 === "number"
                  ? parsed.pemotonganAa8
                  : 1500,
            },
            {
              id: "reject8",
              name: "Reject (8)",
              unit: "Kg",
              rate:
                typeof parsed.pemotonganReject8 === "number"
                  ? parsed.pemotonganReject8
                  : 1500,
            },
            {
              id: "reject6",
              name: "Reject (6)",
              unit: "Kg",
              rate:
                typeof parsed.pemotonganReject6 === "number"
                  ? parsed.pemotonganReject6
                  : 1500,
            },
            {
              id: "campuran8",
              name: "Campuran (8 cm)",
              unit: "Kg",
              rate:
                typeof parsed.pemotonganCampuran8 === "number"
                  ? parsed.pemotonganCampuran8
                  : 1500,
            },
          ];

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
        pemotonganRates,
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

  useEffect(() => {
    getItemTypes().then((data) =>
      setItemTypeOptions(data.filter((it) => it.isActive)),
    );
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

  const handlePemotonganRateChange =
    (id: string, field: keyof Omit<PemotonganRate, "id" | "itemTypeId">) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const raw = e.target.value;
      setSettings((prev) => ({
        ...prev,
        pemotonganRates: prev.pemotonganRates.map((r) =>
          r.id === id
            ? {
                ...r,
                [field]:
                  field === "rate"
                    ? Math.max(0, Number(raw || "0"))
                    : raw,
              }
            : r,
        ),
      }));
    };

  const handleAddPemotonganRate = () => {
    setSettings((prev) => {
      const nextIndex = prev.pemotonganRates.length + 1;
      const id = `rate-${Date.now()}-${nextIndex}`;
      return {
        ...prev,
        pemotonganRates: [
          ...prev.pemotonganRates,
          {
            id,
            name: "",
            unit: "Kg",
            rate: 0,
          },
        ],
      };
    });
  };

  const handleRemovePemotonganRate = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      pemotonganRates: prev.pemotonganRates.filter((r) => r.id !== id),
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

      <Box>
        <div className="flex flex-wrap gap-2">
          {WAGE_TABS.map((t) => {
            const isActive = t.key === activeTab;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </Box>

      {activeTab === "pengikisan" && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 12 }}>
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
        </Grid>
      )}

      {activeTab === "pemotongan" && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 12 }}>
            <GlassCard className="p-6">
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Pemotongan
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mb: 3 }}
              >
                Atur upah pemotongan per jenis barang.
              </Typography>
              <Box className="mb-4">
                <TextField
                  label="Upah per Kg (Default)"
                  type="number"
                  value={loaded ? settings.pemotonganPerKg ?? "" : ""}
                  onChange={handleChange("pemotonganPerKg")}
                  InputProps={{ startAdornment: "Rp " as any }}
                  size="small"
                />
              </Box>
              <Box className="overflow-x-auto rounded-lg border border-[var(--glass-border)] bg-transparent">
                <table className="w-full min-w-[600px] text-[12px] text-left">
                  <thead className="bg-white/80 backdrop-blur border-b border-[var(--glass-border)]">
                    <tr className="text-[11px] font-extrabold tracking-wide text-black/75 uppercase">
                      <th className="px-3 py-2 w-10 text-center">#</th>
                      <th className="px-3 py-2">Jenis Barang</th>
                      <th className="px-3 py-2 w-32">Satuan</th>
                      <th className="px-3 py-2 w-48">Upah</th>
                      <th className="px-3 py-2 w-12 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.pemotonganRates.map((r, idx) => {
                      const currentItemType =
                        r.itemTypeId &&
                        itemTypeOptions.find((it) => it.id === r.itemTypeId);
                      return (
                        <tr
                          key={r.id}
                          className="border-b border-[var(--glass-border)]"
                        >
                          <td className="px-3 py-2 text-center">{idx + 1}</td>
                          <td className="px-3 py-2">
                            <Autocomplete
                              size="small"
                              fullWidth
                              value={currentItemType || null}
                              onChange={async (_event, newValue) => {
                                if (newValue && (newValue as any).inputValue) {
                                  const inputValue = (newValue as any)
                                    .inputValue as string;
                                  setCreatingItemTypeFor(r.id);
                                  try {
                                    const created = await quickCreateItemType(
                                      inputValue,
                                    );
                                    if (created) {
                                      setItemTypeOptions((prev) => [
                                        ...prev,
                                        created,
                                      ]);
                                      setSettings((prev) => ({
                                        ...prev,
                                        pemotonganRates:
                                          prev.pemotonganRates.map((rate) =>
                                            rate.id === r.id
                                              ? {
                                                  ...rate,
                                                  itemTypeId: created.id,
                                                  name: created.name,
                                                  unit:
                                                    created.unit ||
                                                    rate.unit ||
                                                    "Kg",
                                                }
                                              : rate,
                                          ),
                                      }));
                                    }
                                  } finally {
                                    setCreatingItemTypeFor(null);
                                  }
                                } else if (!newValue) {
                                  setSettings((prev) => ({
                                    ...prev,
                                    pemotonganRates:
                                      prev.pemotonganRates.map((rate) =>
                                        rate.id === r.id
                                          ? {
                                              ...rate,
                                              itemTypeId: undefined,
                                              name: "",
                                            }
                                          : rate,
                                      ),
                                  }));
                                } else if (typeof newValue !== "string") {
                                  const it = newValue as ItemTypeDTO;
                                  setSettings((prev) => ({
                                    ...prev,
                                    pemotonganRates:
                                      prev.pemotonganRates.map((rate) =>
                                        rate.id === r.id
                                          ? {
                                              ...rate,
                                              itemTypeId: it.id,
                                              name: it.name,
                                              unit:
                                                it.unit || rate.unit || "Kg",
                                            }
                                          : rate,
                                      ),
                                  }));
                                }
                              }}
                              filterOptions={(options, params) => {
                                const filtered = itemTypeFilter(
                                  options,
                                  params,
                                );
                                const { inputValue } = params;
                                const isExisting = options.some(
                                  (option) =>
                                    option.name.toLowerCase() ===
                                    inputValue.toLowerCase(),
                                );
                                if (inputValue !== "" && !isExisting) {
                                  filtered.push({
                                    inputValue,
                                    id: "",
                                    name: `Tambah "${inputValue}"`,
                                    description: null,
                                    type: null,
                                    image: null,
                                    unit: "Kg",
                                    isPublic: true,
                                    isActive: true,
                                  } as any);
                                }
                                return filtered;
                              }}
                              selectOnFocus
                              clearOnBlur
                              handleHomeEndKeys
                              options={itemTypeOptions}
                              getOptionLabel={(option) => {
                                if (typeof option === "string") return option;
                                if ((option as any).inputValue)
                                  return (option as any).inputValue;
                                return option.name;
                              }}
                              renderOption={(props, option) => {
                                const { key, ...optionProps } = props;
                                return (
                                  <li key={key} {...optionProps}>
                                    {option.name}
                                  </li>
                                );
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Pilih / ketik jenis barang"
                                  InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                      <>
                                        {creatingItemTypeFor === r.id ? (
                                          <CircularProgress
                                            color="inherit"
                                            size={16}
                                          />
                                        ) : null}
                                        {params.InputProps.endAdornment}
                                      </>
                                    ),
                                  }}
                                />
                              )}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Satuan"
                              value={r.unit}
                              onChange={handlePemotonganRateChange(
                                r.id,
                                "unit",
                              )}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              placeholder="Upah"
                              value={r.rate || ""}
                              onChange={handlePemotonganRateChange(
                                r.id,
                                "rate",
                              )}
                              InputProps={{ startAdornment: "Rp " as any }}
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <Tooltip title="Hapus baris">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleRemovePemotonganRate(r.id)
                                }
                              >
                                <DeleteRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Box>
              <Box mt={2}>
                <GlassButton
                  variant="secondary"
                  onClick={handleAddPemotonganRate}
                >
                  Tambah baris
                </GlassButton>
              </Box>
            </GlassCard>
          </Grid>
        </Grid>
      )}

      {activeTab === "penjemuran" && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 12 }}>
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
        </Grid>
      )}

      {activeTab === "pengemasan" && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 12 }}>
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
      )}

      {activeTab === "pensortiran" && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 12 }}>
            <GlassCard className="p-6">
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Pensortiran
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mb: 3 }}
              >
                Pengaturan upah pensortiran menggunakan angka yang sama dengan
                pemotongan.
              </Typography>
              <Box className="mb-4">
                <TextField
                  label="Upah per Kg (Default)"
                  type="number"
                  value={loaded ? settings.pemotonganPerKg ?? "" : ""}
                  onChange={handleChange("pemotonganPerKg")}
                  InputProps={{ startAdornment: "Rp " as any }}
                  size="small"
                />
              </Box>
              <Box className="overflow-x-auto rounded-lg border border-[var(--glass-border)] bg-transparent">
                <table className="w-full min-w-[600px] text-[12px] text-left">
                  <thead className="bg-white/80 backdrop-blur border-b border-[var(--glass-border)]">
                    <tr className="text-[11px] font-extrabold tracking-wide text-black/75 uppercase">
                      <th className="px-3 py-2 w-10 text-center">#</th>
                      <th className="px-3 py-2">Jenis Barang</th>
                      <th className="px-3 py-2 w-32">Satuan</th>
                      <th className="px-3 py-2 w-48">Upah</th>
                      <th className="px-3 py-2 w-12 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.pemotonganRates.map((r, idx) => {
                      const currentItemType =
                        r.itemTypeId &&
                        itemTypeOptions.find((it) => it.id === r.itemTypeId);
                      return (
                        <tr
                          key={r.id}
                          className="border-b border-[var(--glass-border)]"
                        >
                          <td className="px-3 py-2 text-center">{idx + 1}</td>
                          <td className="px-3 py-2">
                            <Autocomplete
                              size="small"
                              fullWidth
                              value={currentItemType || null}
                              onChange={async (_event, newValue) => {
                                if (newValue && (newValue as any).inputValue) {
                                  const inputValue = (newValue as any)
                                    .inputValue as string;
                                  setCreatingItemTypeFor(r.id);
                                  try {
                                    const created = await quickCreateItemType(
                                      inputValue,
                                    );
                                    if (created) {
                                      setItemTypeOptions((prev) => [
                                        ...prev,
                                        created,
                                      ]);
                                      setSettings((prev) => ({
                                        ...prev,
                                        pemotonganRates:
                                          prev.pemotonganRates.map((rate) =>
                                            rate.id === r.id
                                              ? {
                                                  ...rate,
                                                  itemTypeId: created.id,
                                                  name: created.name,
                                                  unit:
                                                    created.unit ||
                                                    rate.unit ||
                                                    "Kg",
                                                }
                                              : rate,
                                          ),
                                      }));
                                    }
                                  } finally {
                                    setCreatingItemTypeFor(null);
                                  }
                                } else if (!newValue) {
                                  setSettings((prev) => ({
                                    ...prev,
                                    pemotonganRates:
                                      prev.pemotonganRates.map((rate) =>
                                        rate.id === r.id
                                          ? {
                                              ...rate,
                                              itemTypeId: undefined,
                                              name: "",
                                            }
                                          : rate,
                                      ),
                                  }));
                                } else if (typeof newValue !== "string") {
                                  const it = newValue as ItemTypeDTO;
                                  setSettings((prev) => ({
                                    ...prev,
                                    pemotonganRates:
                                      prev.pemotonganRates.map((rate) =>
                                        rate.id === r.id
                                          ? {
                                              ...rate,
                                              itemTypeId: it.id,
                                              name: it.name,
                                              unit:
                                                it.unit || rate.unit || "Kg",
                                            }
                                          : rate,
                                      ),
                                  }));
                                }
                              }}
                              filterOptions={(options, params) => {
                                const filtered = itemTypeFilter(
                                  options,
                                  params,
                                );
                                const { inputValue } = params;
                                const isExisting = options.some(
                                  (option) =>
                                    option.name.toLowerCase() ===
                                    inputValue.toLowerCase(),
                                );
                                if (inputValue !== "" && !isExisting) {
                                  filtered.push({
                                    inputValue,
                                    id: "",
                                    name: `Tambah "${inputValue}"`,
                                    description: null,
                                    type: null,
                                    image: null,
                                    unit: "Kg",
                                    isPublic: true,
                                    isActive: true,
                                  } as any);
                                }
                                return filtered;
                              }}
                              selectOnFocus
                              clearOnBlur
                              handleHomeEndKeys
                              options={itemTypeOptions}
                              getOptionLabel={(option) => {
                                if (typeof option === "string") return option;
                                if ((option as any).inputValue)
                                  return (option as any).inputValue;
                                return option.name;
                              }}
                              renderOption={(props, option) => {
                                const { key, ...optionProps } = props;
                                return (
                                  <li key={key} {...optionProps}>
                                    {option.name}
                                  </li>
                                );
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Pilih / ketik jenis barang"
                                  InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                      <>
                                        {creatingItemTypeFor === r.id ? (
                                          <CircularProgress
                                            color="inherit"
                                            size={16}
                                          />
                                        ) : null}
                                        {params.InputProps.endAdornment}
                                      </>
                                    ),
                                  }}
                                />
                              )}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Satuan"
                              value={r.unit}
                              onChange={handlePemotonganRateChange(
                                r.id,
                                "unit",
                              )}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              placeholder="Upah"
                              value={r.rate || ""}
                              onChange={handlePemotonganRateChange(
                                r.id,
                                "rate",
                              )}
                              InputProps={{ startAdornment: "Rp " as any }}
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <Tooltip title="Hapus baris">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleRemovePemotonganRate(r.id)
                                }
                              >
                                <DeleteRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Box>
              <Box mt={2}>
                <GlassButton
                  variant="secondary"
                  onClick={handleAddPemotonganRate}
                >
                  Tambah baris
                </GlassButton>
              </Box>
            </GlassCard>
          </Grid>
        </Grid>
      )}

      {activeTab === "qcPotongSortir" && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 12 }}>
            <GlassCard className="p-6">
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                QC Potong & Sortir
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mb: 3 }}
              >
                Pengaturan upah QC Potong & Sortir menggunakan angka yang sama
                dengan penjemuran.
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
        </Grid>
      )}

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
