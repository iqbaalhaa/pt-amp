import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../src/lib/prisma";

async function main() {
	const email = process.env.SUPERADMIN_EMAIL;
	const password = process.env.SUPERADMIN_PASSWORD;
	const name = process.env.SUPERADMIN_NAME ?? "Superadmin";

	if (!email || !password) {
		throw new Error(
			"SUPERADMIN_EMAIL dan SUPERADMIN_PASSWORD wajib diisi di .env"
		);
	}

	// Kalau sudah ada user email ini, cukup promote jadi SUPERADMIN
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) {
		if (existing.role !== "SUPERADMIN") {
			await prisma.user.update({
				where: { id: existing.id },
				data: { role: "SUPERADMIN" },
			});
			console.log("✅ User sudah ada, role dipromosikan ke SUPERADMIN");
		} else {
			console.log("✅ SUPERADMIN sudah ada");
		}
		return;
	}

	// Instance auth khusus untuk seeding (signup diizinkan)
	const seedAuth = betterAuth({
		emailAndPassword: { enabled: true, disableSignUp: false },
		user: {
			additionalFields: {
				role: {
					type: ["SUPERADMIN", "STAFF"],
					defaultValue: "STAFF",
					input: false,
				},
			},
		},
		database: prismaAdapter(prisma, { provider: "postgresql" }),
	});

	// Buat user + credential dengan cara resmi (hash/password dll di-handle Better Auth)
	await seedAuth.api.signUpEmail({
		body: { name, email, password },
	});

	// Set role SUPERADMIN
	const created = await prisma.user.findUnique({ where: { email } });
	if (!created)
		throw new Error("Gagal membuat user (cek error log Better Auth / DB)");

	await prisma.user.update({
		where: { id: created.id },
		data: { role: "SUPERADMIN" },
	});

	console.log("✅ SUPERADMIN dibuat:");
	console.log("   Email:", email);
	console.log("   Password:", password);
}

main()
	.catch((e) => {
		console.error("❌ Seed gagal:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
