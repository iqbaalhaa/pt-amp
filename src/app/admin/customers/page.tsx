import { getCustomers } from "@/actions/customer-actions";
import CustomerClient from "./customer-client";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return <CustomerClient initialCustomers={customers} />;
}
