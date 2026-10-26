// "Dari kebun ke ekspor" steps: CMS section key + default content (seed & fallback when CMS is empty).
export const PROCESS_SECTION = "HOME_PROCESS";

export const DEFAULT_PROCESS_STEPS = [
  {
    title: "Panen",
    description: "Kulit manis dipanen dari kebun petani mitra dan dibeli langsung di sumbernya.",
    icon: "Sprout",
  },
  {
    title: "Pengeringan",
    description: "Kulit dibersihkan, dikikis lalu dijemur di bawah matahari hingga kadar air sesuai standar.",
    icon: "Sun",
  },
  {
    title: "Sortir & Grading",
    description: "Disortir per mutu dan ukuran menjadi Grade A, Grade B dan Broken.",
    icon: "ListChecks",
  },
  {
    title: "Pengemasan",
    description: "Dikemas rapi dalam ball 40–60 kg, siap simpan dan siap kirim.",
    icon: "Package",
  },
  {
    title: "Pengiriman",
    description: "Dikirim ke pembeli lokal maupun ekspor sesuai jadwal dan dokumen pesanan.",
    icon: "Ship",
  },
].map((step, i) => ({ ...step, order: i + 1, image: null as string | null }));

// CMS steps win; empty CMS falls back to the defaults (icons, no photos).
export function resolveProcessSteps<T>(cmsSteps: T[]) {
  return cmsSteps.length > 0 ? cmsSteps : DEFAULT_PROCESS_STEPS;
}
