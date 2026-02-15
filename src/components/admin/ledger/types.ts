export type LedgerEntryType =
  | "purchase"
  | "sale"
  | "production"
  | "pengeluaran";

export type LedgerStatus = "draft" | "posted" | "cancelled";

export type StockImpact = "IN" | "OUT" | "NEUTRAL";

export type LedgerLine = {
  name: string;
  qty: number;
  unit?: string | null;
  price: number;
  subtotal: number;
  // Production specific fields
  kaKg?: number;
  stikKg?: number;
  pemotonganQty?: number; // Kg
  penjemuranHari?: number;
  penjemuranLembur?: number; // Jam
  pengemasanBungkus?: number;
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
};
