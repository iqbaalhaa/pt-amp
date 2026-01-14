import { toCurrency } from "./formatters";

type Props = {
  totalCost: number;
};

export function ProductionCostSummary({ totalCost }: Props) {
  if (!totalCost || !Number.isFinite(totalCost)) {
    return null;
  }

  return (
    <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800 ring-1 ring-amber-100">
      Pembiayaan produksi: {toCurrency(totalCost)}
    </span>
  );
}

