"use client";

import { useState, useMemo } from "react";
import {
  bulkCreatePenjemuran,
  PenjemuranInput,
  PenjemuranItemInput,
} from "@/actions/penjemuran-actions";
import SafeModal from "@/components/ui/SafeModal";
import GlassButton from "@/components/ui/GlassButton";
import { TextField, CircularProgress, Alert } from "@mui/material";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";

const MONTHS: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  Mei: "05",
  May: "05",
  Jun: "06",
  Jul: "07",
  Agu: "08",
  Aug: "08",
  Sep: "09",
  Okt: "10",
  Oct: "10",
  Nov: "11",
  Des: "12",
  Dec: "12",
};

export default function PenjemuranBulkImport() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [upahPerHari, setUpahPerHari] = useState("50000");
  const [upahLemburPerJam, setUpahLemburPerJam] = useState("10000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const parsedData = useMemo(() => {
    if (!text.trim()) return [];

    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const currentYear = new Date().getFullYear();

    // Strategy 1: Tab separated lines (Excel copy-paste row by row)
    // Format: Date \t Name \t Hari \t Lembur
    const isTabSeparated = lines.some((l) => l.includes("\t"));

    let rawItems: { date: string; name: string; hari: string; lembur: string }[] = [];

    if (isTabSeparated) {
      lines.forEach((line) => {
        const parts = line.split("\t");
        if (parts.length >= 4) {
          rawItems.push({
            date: parts[0],
            name: parts[1],
            hari: parts[2],
            lembur: parts[3],
          });
        }
      });
    } else {
      // Strategy 2: Block format (4 lines per record)
      // Date
      // Name
      // Hari
      // Lembur
      for (let i = 0; i < lines.length; i += 4) {
        if (i + 3 < lines.length) {
          rawItems.push({
            date: lines[i],
            name: lines[i + 1],
            hari: lines[i + 2],
            lembur: lines[i + 3],
          });
        }
      }
    }

    // Group by Date
    const groups: Record<string, PenjemuranItemInput[]> = {};

    for (const item of rawItems) {
      // Parse Date: dd-MMM -> YYYY-MM-DD
      const dateParts = item.date.split("-");
      if (dateParts.length !== 2) continue;

      const day = dateParts[0].padStart(2, "0");
      const monthStr = dateParts[1];
      const month = MONTHS[monthStr];

      if (!month) continue;

      const isoDate = `${currentYear}-${month}-${day}`;

      if (!groups[isoDate]) {
        groups[isoDate] = [];
      }

      groups[isoDate].push({
        nama: item.name,
        hari: item.hari.replace(",", "."),
        lemburJam: item.lembur.replace(",", "."),
      });
    }

    // Convert to PenjemuranInput array
    return Object.entries(groups).map(([date, items]) => ({
      date,
      items,
      upahPerHari,
      upahLemburPerJam,
      notes: "Bulk Import",
    }));
  }, [text, upahPerHari, upahLemburPerJam]);

  const handleImport = async () => {
    if (parsedData.length === 0) {
      setError("Tidak ada data yang valid untuk diimport.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await bulkCreatePenjemuran(parsedData);
      if (res.success) {
        setSuccessMsg(
          `Berhasil mengimport ${res.count} data tanggal. ${
            res.errors && res.errors.length > 0
              ? `Warning: ${res.errors.join(", ")}`
              : ""
          }`
        );
        setText("");
      } else {
        setError("Gagal import data.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlassButton onClick={() => setOpen(true)}>
        <UploadFileRoundedIcon className="mr-2 h-5 w-5" />
        Import Data
      </GlassButton>

      <SafeModal
        open={open}
        onClose={() => setOpen(false)}
        title="Import Data Penjemuran (Bulk)"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Upah Per Hari"
              type="number"
              value={upahPerHari}
              onChange={(e) => setUpahPerHari(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Upah Lembur/Jam"
              type="number"
              value={upahLemburPerJam}
              onChange={(e) => setUpahLemburPerJam(e.target.value)}
              fullWidth
              size="small"
            />
          </div>

          <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
            <p className="font-semibold">Format Data:</p>
            <p>Paste data dari Excel atau format teks berikut:</p>
            <pre className="mt-2 bg-white p-2 rounded border text-xs">
              01-Feb{'\n'}
              NAMA PEKERJA{'\n'}
              HARI{'\n'}
              LEMBUR (JAM){'\n'}
              ...
            </pre>
            <p className="mt-1">
              Atau copy-paste langsung dari Excel (tab separated).
            </p>
          </div>

          <TextField
            label="Paste Data Disini"
            multiline
            rows={10}
            fullWidth
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`01-Feb\nM. REFKI\n1\n2\n...`}
            disabled={loading}
          />

          {parsedData.length > 0 && (
            <div className="bg-green-50 p-3 rounded text-sm text-green-800">
              <p>Terdeteksi: {parsedData.length} Tanggal</p>
              <ul className="list-disc list-inside mt-1 max-h-32 overflow-auto">
                {parsedData.map((d, i) => (
                  <li key={i}>
                    {d.date}: {d.items.length} pekerja
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && <Alert severity="error">{error}</Alert>}
          {successMsg && <Alert severity="success">{successMsg}</Alert>}

          <div className="flex justify-end gap-2 mt-4">
            <GlassButton onClick={() => setOpen(false)} variant="secondary">
              Tutup
            </GlassButton>
            <GlassButton onClick={handleImport} disabled={loading || parsedData.length === 0}>
              {loading ? <CircularProgress size={20} /> : "Import Sekarang"}
            </GlassButton>
          </div>
        </div>
      </SafeModal>
    </>
  );
}
