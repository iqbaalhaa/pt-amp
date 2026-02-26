import { getItemTypes } from "@/actions/item-type-actions";
import ItemTypeClient from "@/components/admin/ItemTypeClient";

export default async function ItemTypesPage() {
	const itemTypes = await getItemTypes();

	return <ItemTypeClient initialItemTypes={itemTypes} />;
}
