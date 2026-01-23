import { getDashboardData } from "@/actions/dashboard-actions";
import DashboardView from "@/components/admin/DashboardView";

export default async function AdminDashboard() {
	const data = await getDashboardData();

	return <DashboardView data={data} />;
}
