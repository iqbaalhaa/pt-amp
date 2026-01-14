export type LedgerEntryType = "purchase" | "sale" | "production";

export type LedgerStatus = "draft" | "posted" | "cancelled";

export type StockImpact = "IN" | "OUT" | "NEUTRAL";

export type LedgerEntry = {
  id: string;
  type: LedgerEntryType;
  date: string;
  status: LedgerStatus;
  reference: string;
  counterparty: string | null;
  total: number | null;
  stockImpact: StockImpact;
  notes: string | null;
  itemCount: number;
  productionCost?: number | null;
};

