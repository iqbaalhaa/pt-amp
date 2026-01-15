import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../src/lib/prisma";
import { ProductType } from "../src/generated/prisma";
import { seedContent } from "./seeds/content-seed";

async function main() {
	// ============================================================
	// 0. CLEANUP DATA (Sesuai Request)
	// ============================================================
	console.log("🗑️ Membersihkan data lama...");

	// Hapus transaksi & mutasi stok dulu (karena ada Foreign Key)
	await prisma.stockMovement.deleteMany();
	
	await prisma.productionInput.deleteMany();
	await prisma.productionOutput.deleteMany();
	await prisma.productionWorker.deleteMany();
	await prisma.production.deleteMany();
	
	await prisma.purchaseItem.deleteMany();
	await prisma.purchase.deleteMany();
	
	await prisma.saleItem.deleteMany();
	await prisma.sale.deleteMany();

	// Hapus Master Data
	await prisma.product.deleteMany();
	await prisma.productionType.deleteMany();
	await prisma.worker.deleteMany();
	// Customer model removed

    // Note: CMS Content tables are NOT cleared here to preserve them if needed, 
    // or you can add deleteMany here if you want a full reset.
    // For now, we rely on the check in seedContent.
	
	console.log("✅ Data lama berhasil dihapus.");

	// ============================================================
	// 1. SEED SUPERADMIN
	// ============================================================
	const email = process.env.SUPERADMIN_EMAIL;
	const password = process.env.SUPERADMIN_PASSWORD;
	const name = process.env.SUPERADMIN_NAME ?? "Superadmin";

	if (email && password) {
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
		} else {
			// Instance auth khusus untuk seeding
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

			await seedAuth.api.signUpEmail({
				body: { name, email, password },
			});

			const created = await prisma.user.findUnique({ where: { email } });
			if (created) {
				await prisma.user.update({
					where: { id: created.id },
					data: { role: "SUPERADMIN" },
				});
				console.log("✅ SUPERADMIN dibuat:", email);
			}
		}
	} else {
		console.warn(
			"⚠️ SUPERADMIN_EMAIL atau SUPERADMIN_PASSWORD belum di-set di .env"
		);
	}

	// ============================================================
	// 2. SEED MASTER DATA
	// ============================================================

	console.log("🌱 Seeding Master Data...");

	// --- Production Types ---
	const productionTypes = [
		{ name: "Pengolahan Sawit", description: "Proses TBS menjadi CPO & Kernel" },
		{ name: "Sortasi", description: "Sortasi buah masuk" },
	];

	for (const pt of productionTypes) {
		await prisma.productionType.create({
			data: { name: pt.name, description: pt.description },
		});
	}
	console.log("   - Production Types seeded");

	// --- Products ---
	// 1. Asahan, 2. Patahan, 3. AAA, 4. Reject, 5. Miss Cut
	// Each has raw and finished version.
	const productNames = ["Asahan", "Patahan", "AAA", "Reject", "Miss Cut"];
	const products = [];

	for (const name of productNames) {
		products.push({
			name: name,
			type: ProductType.raw,
			unit: "kg",
			description: `${name} (Bahan Baku)`,
		});
		products.push({
			name: name,
			type: ProductType.finished,
			unit: "kg",
			description: `${name} (Barang Jadi)`,
		});
	}

	for (const p of products) {
		await prisma.product.create({
			data: {
				name: p.name,
				type: p.type,
				unit: p.unit,
				description: p.description,
			},
		});
	}
	console.log("   - Products seeded (10 items: 5 names x 2 types)");

	// --- Workers ---
	const workers = [
		{ name: "Budi Santoso" },
		{ name: "Siti Aminah" },
		{ name: "Joko Anwar" },
	];

	for (const w of workers) {
		await prisma.worker.create({
			data: { name: w.name },
		});
	}
	console.log("   - Workers seeded");

	// --- Customers / Suppliers ---
	// Customer model removed; supplier/buyer now use manual string IDs
	console.log("   - Customers/Suppliers skipped (Customer model removed)");

	// ============================================================
	// 3. SEED CMS CONTENT
	// ============================================================
	await seedContent(prisma);

	console.log("✅ Seeding selesai!");
}

main()
	.catch((e) => {
		console.error("❌ Seed gagal:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
