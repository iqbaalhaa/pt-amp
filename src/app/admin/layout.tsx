import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import GlassAdminShell from "@/components/admin/GlassAdminShell";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");
  // Determine allowed paths for sidebar (hide menus for STAFF)
  const pivotRoles = await prisma.userRole.findMany({
    where: { userId: session.user.id },
    include: { role: true },
  });
  const roleNames = pivotRoles.map((r) => r.role.name);
  const isAdmin =
    roleNames.includes("ADMIN") ||
    roleNames.includes("SUPERADMIN") ||
    session.user.role === "SUPERADMIN";

  const allowedPaths = isAdmin
    ? null
    : [
        "/admin/purchases",
        "/admin/sales",
        "/admin/pengikisan",
        "/admin/pemotongan",
        "/admin/penjemuran",
        "/admin/pengemasan",
      ];

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isPrintPage = pathname.includes("/print-view");

  if (isPrintPage) {
    return <div className="bg-white min-h-screen">{children}</div>;
  }

  return (
    <GlassAdminShell allowedPaths={allowedPaths ?? undefined}>
      {children}
    </GlassAdminShell>
  );
}
