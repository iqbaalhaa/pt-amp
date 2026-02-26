"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function updateCurrentUserProfile(data: {
	name: string;
	email: string;
}) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session) {
			return { success: false, error: "Tidak terautentikasi" };
		}

		await prisma.user.update({
			where: { id: session.user.id },
			data: {
				name: data.name,
				email: data.email,
			},
		});

		return { success: true };
	} catch (error: any) {
		if (error?.code === "P2002") {
			return { success: false, error: "Email sudah digunakan" };
		}
		console.error("Error updating current user profile:", error);
		return {
			success: false,
			error: "Gagal memperbarui profil akun",
		};
	}
}
