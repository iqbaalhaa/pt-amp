import LoginPage from "@/components/pages/auth/LoginPage";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Login | PT AMP Dashboard",
  description: "Masuk ke dashboard admin PT AMP.",
};

export const dynamic = "force-dynamic";

export default async function Page() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session) {
		// Redirect ke halaman default sesuai role
		const pivotRoles = await prisma.userRole.findMany({
			where: { userId: session.user.id },
			include: { role: true },
		});
		const roleNames = pivotRoles.map((r) => r.role.name);
		const isAdmin =
			roleNames.includes("ADMIN") ||
			roleNames.includes("SUPERADMIN") ||
			session.user.role === "SUPERADMIN";

		if (isAdmin) {
			redirect("/admin");
		} else {
			redirect("/admin/sales");
		}
	}

	return <LoginPage />;
}
