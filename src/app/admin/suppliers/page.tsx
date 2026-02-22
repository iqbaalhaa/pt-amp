import { getSuppliers } from "@/actions/supplier-actions";
import SupplierClient from "@/components/admin/SupplierClient";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
	const suppliers = await getSuppliers();

	return <SupplierClient initialSuppliers={suppliers} />;
}
