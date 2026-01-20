import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Blog Posts...");

  // Find an author
  let author = await prisma.user.findFirst();
  if (!author) {
    console.log("Creating default user for blog posts...");
    // Try to create, but if ID conflicts (unlikely with findFirst returning null), handle it.
    // Actually if findFirst is null, table is likely empty or no user exists.
    try {
        author = await prisma.user.create({
        data: {
            id: "default-admin",
            name: "Admin",
            email: "admin@example.com",
            role: "SUPERADMIN",
        },
        });
    } catch (e) {
        // Fallback if create fails (e.g. email unique constraint but findFirst didn't match?)
        // Should not happen if findFirst returned null unless concurrency.
        // But maybe there are users but findFirst returned null? No, findFirst returns first record.
        console.error("Error creating user:", e);
        // try finding by email
        author = await prisma.user.findUnique({ where: { email: "admin@example.com" } });
    }
  }

  if (!author) {
      console.error("Could not find or create author. Aborting.");
      return;
  }

  // Blog Post 1: With Table
  const slug1 = "laporan-produksi-kulit-manis-2025";
  const existing1 = await prisma.post.findUnique({ where: { slug: slug1 } });
  if (!existing1) {
    await prisma.post.create({
        data: {
        title: "Laporan Produksi Kulit Manis 2025",
        slug: slug1,
        content: `
            <p>Berikut adalah data produksi kulit manis kami selama tahun 2025:</p>
            <table>
            <thead>
                <tr>
                <th>Bulan</th>
                <th>Produksi (Ton)</th>
                <th>Ekspor (Ton)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td>Januari</td>
                <td>50</td>
                <td>45</td>
                </tr>
                <tr>
                <td>Februari</td>
                <td>55</td>
                <td>50</td>
                </tr>
                <tr>
                <td>Maret</td>
                <td>60</td>
                <td>55</td>
                </tr>
            </tbody>
            </table>
            <p>Produksi terus meningkat seiring dengan permintaan pasar.</p>
        `,
        published: true,
        authorId: author.id,
        image: null,
        },
    });
    console.log("   - Created post: Laporan Produksi");
  } else {
    console.log("   - Post already exists: Laporan Produksi");
  }

  // Blog Post 2: General
  const slug2 = "manfaat-kesehatan-kayu-manis";
  const existing2 = await prisma.post.findUnique({ where: { slug: slug2 } });
  if (!existing2) {
    await prisma.post.create({
        data: {
        title: "Manfaat Kesehatan Kayu Manis",
        slug: slug2,
        content: `
            <p>Kayu manis bukan hanya rempah penyedap, tetapi juga memiliki banyak manfaat kesehatan.</p>
            <ul>
            <li>Mengontrol gula darah</li>
            <li>Kaya antioksidan</li>
            <li>Anti-inflamasi</li>
            </ul>
            <p>Kami memastikan kualitas terbaik untuk setiap batang kulit manis yang kami proses.</p>
        `,
        published: true,
        authorId: author.id,
        image: null,
        },
    });
    console.log("   - Created post: Manfaat Kesehatan");
  } else {
    console.log("   - Post already exists: Manfaat Kesehatan");
  }

  console.log("✅ Blog Posts seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
