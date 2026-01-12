import { getCustomers } from "@/actions/customer-actions";
import CustomerClient from "@/components/admin/CustomerClient";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return <CustomerClient initialCustomers={customers} />;
}
