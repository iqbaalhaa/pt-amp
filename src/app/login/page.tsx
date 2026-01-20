import LoginPage from "@/components/pages/auth/LoginPage";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Login | PT AMP Dashboard",
  description: "Masuk ke dashboard admin PT AMP.",
};

export default async function Page() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session) {
		redirect("/admin");
	}

	return <LoginPage />;
}
