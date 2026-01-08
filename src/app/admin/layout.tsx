import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell from "./shell";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session) redirect("/login");
	if (session.user.role !== "SUPERADMIN") redirect("/");

	return (
		<AdminShell userEmail={session.user.email} role={session.user.role}>
			{children}
		</AdminShell>
	);
}
