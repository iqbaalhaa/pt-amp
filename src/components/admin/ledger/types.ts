export type LedgerLine = {
  name: string;
  qty: number;
  unit: string | null;
  price: number;
  subtotal: number;
};

export type LedgerEntry = {
  id: string;
  type: "purchase" | "sale" | "production" | "invoice";
  date: string;
  status: any;
  reference: string;
  counterparty: string | null;
  createdByName?: string | null;
  total: number | null;
  stockImpact: "IN" | "OUT" | "NEUTRAL";
  notes?: string | null;
  itemCount?: number;
  lines?: LedgerLine[];
  productionCost?: number | null;
  subType?: string | null;
};

