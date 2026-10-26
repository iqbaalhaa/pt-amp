// Pengaturan upah yang disimpan halaman /admin/wages di localStorage.
// Nilai berasal dari JSON tersimpan (tidak divalidasi) — pemakai tetap
// memeriksa tipe tiap field seperti sebelumnya.

export const UPAH_SETTINGS_KEY = "upahSettings";

export type StoredPemotonganRate = {
  id?: string;
  name?: string;
  unit?: string;
  rate?: number;
  itemTypeId?: string;
};

export type StoredUpahSettings = Partial<{
  pengikisanKa: number;
  pengikisanStik: number;
  pemotonganPerKg: number;
  pemotonganRates: StoredPemotonganRate[];
  penjemuranPerHari: number;
  penjemuranLemburPerJam: number;
  pengemasanPerBungkus: number;
  qcPotongSortirPerHari: number;
  qcPotongSortirLemburPerJam: number;
  defaultPerHari: number;
  defaultLemburPerJam: number;
  // Format lama (sebelum pemotonganRates)
  pemotonganStik25: number;
  pemotonganAaa8: number;
  pemotonganAa8: number;
  pemotonganReject8: number;
  pemotonganReject6: number;
  pemotonganCampuran8: number;
}>;

/** Parse JSON tersimpan; null bila kosong, JSON rusak, atau bukan objek. */
export function parseUpahSettings(
  raw: string | null | undefined,
): StoredUpahSettings | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as StoredUpahSettings)
      : null;
  } catch {
    return null;
  }
}

/** Baca pengaturan upah dari localStorage (null di server / bila tidak ada). */
export function readUpahSettings(): StoredUpahSettings | null {
  if (typeof window === "undefined") return null;
  try {
    return parseUpahSettings(window.localStorage.getItem(UPAH_SETTINGS_KEY));
  } catch {
    return null;
  }
}
