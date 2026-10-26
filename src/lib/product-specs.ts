import type { ItemTypeDTO } from "@/actions/item-type-actions";

// Teks untuk kolom yang datanya belum ada. Jangan isi angka teknis karangan.
export const CONTACT_US = "Hubungi kami";

export type ProductSpecRow = {
  key: string;
  grade: string;
  form: string;
  moisture: string;
  size: string;
  packaging: string;
  moq: string;
};

export const PRODUCT_SPEC_COLUMNS: { key: keyof Omit<ProductSpecRow, "key">; label: string }[] = [
  { key: "grade", label: "Grade / Produk" },
  { key: "form", label: "Bentuk" },
  { key: "moisture", label: "Kadar Air" },
  { key: "size", label: "Ukuran" },
  { key: "packaging", label: "Kemasan" },
  { key: "moq", label: "MOQ" },
];

// Sama dengan kartu produk statis di beranda (dipakai bila katalog kosong).
const STATIC_SPECS: Pick<ProductSpecRow, "grade" | "packaging">[] = [
  { grade: "Cinnamon Grade A", packaging: "Ball 40–60 kg" },
  { grade: "Cinnamon Grade B", packaging: "Ball 40–60 kg" },
  { grade: "Cinnamon Broken", packaging: "Sack 25 kg" },
];

// Dari bagian "Jaminan Kualitas" halaman produk (berlaku semua grade).
const MOISTURE = "< 14%";

const TYPE_LABELS: Record<string, string> = {
  raw: "Bahan mentah",
  finished: "Produk jadi",
};

function row(key: string, data: Partial<ProductSpecRow>): ProductSpecRow {
  return {
    key,
    grade: data.grade || CONTACT_US,
    form: data.form || CONTACT_US,
    moisture: data.moisture || CONTACT_US,
    size: data.size || CONTACT_US,
    packaging: data.packaging || CONTACT_US,
    moq: data.moq || CONTACT_US,
  };
}

export function buildProductSpecRows(
  products: Pick<ItemTypeDTO, "id" | "name" | "type">[]
): ProductSpecRow[] {
  if (products.length === 0) {
    return STATIC_SPECS.map((s) => row(s.grade, { ...s, moisture: MOISTURE }));
  }
  return products.map((p) =>
    row(p.id, {
      grade: p.name,
      form: p.type ? TYPE_LABELS[p.type] : undefined,
      moisture: MOISTURE,
    })
  );
}
