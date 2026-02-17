export type LedgerEntryType = "purchase" | "sale" | "production" | "invoice";

export type LedgerStatus = "draft" | "posted" | "cancelled";

export type StockImpact = "IN" | "OUT" | "NEUTRAL";

export type LedgerLine = {
  name: string;
  qty: number;
  unit?: string | null;
  price: number;
  subtotal: number;
};

export type LedgerEntry = {
  id: string;
  type: LedgerEntryType;
  date: string;
  status: LedgerStatus;
  reference: string;
  counterparty: string | null;
  createdByName?: string | null;
  total: number | null;
  stockImpact: StockImpact;
  notes: string | null;
  itemCount: number;
  productionCost?: number | null;
  subType?: string;
  lines?: LedgerLine[];
  pengikisanItems?: {
    nama: string;
    kaKg: number;
    stikKg: number;
    upahKa: number;
    upahStik: number;
    total: number;
  }[];
  pemotonganItems?: {
    nama: string;
    qty: number;
    total: number;
  }[];
  penjemuranItems?: {
    nama: string;
    hari: number;
    lemburJam: number;
    upahPerHari: number;
    upahLemburPerJam: number;
    total: number;
  }[];
  pengemasanItems?: {
    nama: string;
    bungkus: number;
    upahPerBungkus: number;
    total: number;
  }[];
  produksiLainnyaItems?: {
    namaPekerja: string;
    namaPekerjaan: string;
    qty: number;
    satuan: string;
    upah: number;
    total: number;
  }[];
};
