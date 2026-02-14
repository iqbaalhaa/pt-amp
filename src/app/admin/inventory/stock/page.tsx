import { getInventorySummary } from "@/actions/inventory-actions";
import InventoryClient from "@/components/admin/inventory/InventoryClient";

export const dynamic = "force-dynamic";

export default async function InventoryProductsPage() {
  const summary = await getInventorySummary();

  return (
    <div className="p-6 w-full">
      <InventoryClient initialData={summary} />
    </div>
  );
}
