import { getUnits } from "@/actions/unit-actions";
import UnitClient from "@/components/admin/UnitClient";

export const dynamic = "force-dynamic";

export default async function UnitsPage() {
	const units = await getUnits();

	return <UnitClient initialUnits={units} />;
}
