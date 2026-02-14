import React from "react";
import { toCurrency } from "./formatters";

export function ProductionCostSummary({ totalCost }: { totalCost: number }) {
  return (
    <div className="text-xs text-slate-600">
      Biaya Produksi: <span className="font-semibold">{toCurrency(totalCost)}</span>
    </div>
  );
}

