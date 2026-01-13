import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import GlassAdminShell from "@/components/admin/GlassAdminShell";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session) redirect("/login");
	if (session.user.role !== "SUPERADMIN") redirect("/");

	return (
		<GlassAdminShell>
			{children}
		</GlassAdminShell>
	);
}
