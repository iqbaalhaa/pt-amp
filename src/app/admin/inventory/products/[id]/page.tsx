import { getInventoryItemSummary, getProductStockMovements } from "@/actions/inventory-actions";
import ProductDetailClient from "@/components/admin/inventory/ProductDetailClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const summary = await getInventoryItemSummary(id);
  
  if (!summary) {
    notFound();
  }

  const movements = await getProductStockMovements(id);

  return (
    <div className="p-6 w-full max-w-7xl mx-auto">
      <ProductDetailClient summary={summary} movements={movements} />
    </div>
  );
}
