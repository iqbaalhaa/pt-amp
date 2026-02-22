import { getDashboardData } from "@/actions/dashboard-actions";
import DashboardView from "@/components/admin/DashboardView";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/login");

	if (session.user.role !== "SUPERADMIN") {
		const canView = await prisma.rolePermission.findFirst({
			where: {
				permission: { name: "view-dashboard" },
				role: { userRoles: { some: { userId: session.user.id } } },
			},
		});
		if (!canView) {
			redirect("/forbidden");
		}
	}

	const data = await getDashboardData();

	const currentUser = {
		name: (session as any)?.user?.name ?? null,
		email: (session as any)?.user?.email ?? null,
	};

	return <DashboardView data={data} currentUser={currentUser} />;
}
